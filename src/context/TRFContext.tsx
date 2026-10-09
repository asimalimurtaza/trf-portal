'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  Transaction,
  AuditClaim,
  ContributionRule,
  MemberTreatEvent,
  VenuePlace,
  PlannedActivity,
  ClaimStatus,
  TransactionCategory,
} from '@/types/trf';
import {
  INITIAL_MEMBERS,
  INITIAL_CLAIMS,
  INITIAL_TRANSACTIONS,
  INITIAL_RULES,
  INITIAL_TREAT_EVENTS,
  INITIAL_VENUES,
  INITIAL_PLANNED_ACTIVITIES,
} from '@/lib/mock-data';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import confetti from 'canvas-confetti';

interface TRFContextType {
  currentUser: UserProfile;
  isManager: boolean;
  members: UserProfile[];
  claims: AuditClaim[];
  transactions: Transaction[];
  rules: ContributionRule[];
  treatEvents: MemberTreatEvent[];
  venues: VenuePlace[];
  plannedActivities: PlannedActivity[];
  isSupabaseLive: boolean;
  
  // Computed values
  currentBalance: number;
  totalInflow: number;
  totalOutflow: number;
  pendingAuditAmount: number;
  pendingMemberDuesAmount: number;
  monthlyPerHeadRate: number; // e.g. 1400 PKR
  defaultJoiningFee: number; // e.g. 1000 PKR
  activeHeadcount: number;

  // Authentication & Session
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;

  // Profile Management
  updateProfile: (userId: string, data: Partial<Omit<UserProfile, 'id' | 'role'>>) => Promise<void>;

  // RBAC & User Management (Manager only)
  updateUserRole: (userId: string, newRole: 'manager' | 'member') => Promise<void>;
  toggleUserActive: (userId: string) => Promise<void>;
  deleteMember: (userId: string) => Promise<void>;

  // Contribution Rules & System Rates
  addRule: (data: {
    title: string;
    description: string;
    suggestedAmount: number;
    icon?: string;
    isMandatory: boolean;
  }) => void;
  updateRule: (
    ruleId: string,
    data: {
      title?: string;
      description?: string;
      suggestedAmount?: number;
      icon?: string;
      isMandatory?: boolean;
    }
  ) => void;
  deleteRule: (ruleId: string) => void;
  updateSystemRates: (rates: {
    monthlyPerHeadRate?: number;
    defaultJoiningFee?: number;
  }) => void;

  // Actions
  switchUser: (userId: string) => void;
  toggleRole: () => void;
  addTransaction: (data: {
    title: string;
    description?: string;
    amount: number;
    type: 'inflow' | 'outflow';
    category: TransactionCategory;
    date: string;
    relatedMemberId?: string;
  }) => void;
  deleteTransaction: (id: string) => void;
  createAuditClaim: (data: {
    monthYear: string;
    headcount: number;
    claimRefNumber?: string;
    auditNotes?: string;
  }) => void;
  updateClaim: (
    claimId: string,
    data: {
      monthYear?: string;
      headcount?: number;
      claimRefNumber?: string;
      auditNotes?: string;
      status?: ClaimStatus;
    }
  ) => void;
  deleteClaim: (claimId: string) => void;
  updateClaimStatus: (claimId: string, status: ClaimStatus) => void;
  addMember: (data: {
    name: string;
    email: string;
    role: 'manager' | 'member';
    department: string;
    designation: string;
    birthDate: string;
    phone?: string;
    password?: string;
    joiningFeeAmount?: number;
  }) => Promise<{ success: boolean; error?: string }>;
  updateMemberJoiningFee: (memberId: string, status: 'paid' | 'pending' | 'waived') => void;
  logTreatEvent: (data: {
    memberId: string;
    ruleTitle: string;
    details: string;
    amount: number;
  }) => void;
  updateTreatEvent: (
    treatId: string,
    data: {
      memberId?: string;
      ruleTitle?: string;
      details?: string;
      amount?: number;
      status?: 'pending' | 'collected';
      date?: string;
    }
  ) => void;
  deleteTreatEvent: (treatId: string) => void;
  collectTreatPayment: (treatId: string) => void;
  addVenue: (data: {
    name: string;
    category: VenuePlace['category'];
    location: string;
    estimatedCostPerHead: number;
    description: string;
  }) => void;
  toggleVenueVote: (venueId: string) => void;
  createPlannedActivity: (data: {
    title: string;
    venueName: string;
    venueId?: string;
    date: string;
    time?: string;
    estimatedTotalBudget: number;
    trfContributionShare: number;
    description: string;
  }) => void;
  updateRSVP: (activityId: string, status: 'going' | 'maybe' | 'not_going') => void;
  triggerCelebration: () => void;
  resetToDemoData: () => void;
}

const TRFContext = createContext<TRFContextType | undefined>(undefined);

const STORAGE_KEY = 'trf_portal_state_v2';
const DEFAULT_MONTHLY_RATE = 1400; // 1400 PKR per head per month
const DEFAULT_JOINING_FEE = 1000;  // 1000 PKR

export function TRFProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [members, setMembers] = useState<UserProfile[]>(INITIAL_MEMBERS);
  const [claims, setClaims] = useState<AuditClaim[]>(INITIAL_CLAIMS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [rules, setRules] = useState<ContributionRule[]>(INITIAL_RULES);
  const [treatEvents, setTreatEvents] = useState<MemberTreatEvent[]>(INITIAL_TREAT_EVENTS);
  const [venues, setVenues] = useState<VenuePlace[]>(INITIAL_VENUES);
  const [plannedActivities, setPlannedActivities] = useState<PlannedActivity[]>(INITIAL_PLANNED_ACTIVITIES);
  const [monthlyPerHeadRate, setMonthlyPerHeadRate] = useState<number>(DEFAULT_MONTHLY_RATE);
  const [defaultJoiningFee, setDefaultJoiningFee] = useState<number>(DEFAULT_JOINING_FEE);
  const [currentUserId, setCurrentUserId] = useState<string>('user-1'); // Default Asim Khan (Manager)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [isSupabaseLive, setIsSupabaseLive] = useState(isSupabaseConfigured);

  // 1. Initial Load: LocalStorage & Supabase Hydration
  useEffect(() => {
    async function loadData() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.members) setMembers(parsed.members);
          if (parsed.claims) setClaims(parsed.claims);
          if (parsed.transactions) setTransactions(parsed.transactions);
          if (parsed.rules) setRules(parsed.rules);
          if (parsed.treatEvents) setTreatEvents(parsed.treatEvents);
          if (parsed.venues) setVenues(parsed.venues);
          if (parsed.plannedActivities) setPlannedActivities(parsed.plannedActivities);
          if (parsed.currentUserId) setCurrentUserId(parsed.currentUserId);
          if (parsed.monthlyPerHeadRate) setMonthlyPerHeadRate(Number(parsed.monthlyPerHeadRate));
          if (parsed.defaultJoiningFee) setDefaultJoiningFee(Number(parsed.defaultJoiningFee));
        }

        const savedAuth = localStorage.getItem('trf_is_authenticated');
        if (savedAuth !== null) {
          setIsAuthenticated(savedAuth === 'true');
        }

        // Try Supabase fetch if configured
        if (isSupabaseConfigured && supabase) {
          try {
            const [claimsRes, txRes, venuesRes, profilesRes, rulesRes] = await Promise.all([
              supabase.from('audit_claims').select('*'),
              supabase.from('transactions').select('*'),
              supabase.from('venues').select('*'),
              supabase.from('profiles').select('*'),
              supabase.from('contribution_rules').select('*'),
            ]);

            if (profilesRes.data && profilesRes.data.length > 0) {
              const mappedProfiles: UserProfile[] = profilesRes.data.map((p) => ({
                id: p.id,
                name: p.name,
                email: p.email,
                role: p.role,
                avatarUrl: p.avatar_url || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100`,
                department: p.department || 'Engineering',
                designation: p.designation || 'Team Member',
                joiningDate: p.joining_date || new Date().toISOString().split('T')[0],
                birthDate: p.birth_date || '2000-01-01',
                joiningFeeStatus: p.joining_fee_status || 'pending',
                joiningFeeAmount: Number(p.joining_fee_amount || 1000),
                phone: p.phone,
                isActive: p.is_active ?? true,
              }));
              setMembers(mappedProfiles);
            }

            if (claimsRes.data && claimsRes.data.length > 0) {
              const mappedClaims: AuditClaim[] = claimsRes.data.map((c) => ({
                id: c.id,
                monthYear: c.month_year,
                headcount: c.headcount,
                ratePerHead: c.rate_per_head,
                totalAmount: c.headcount * c.rate_per_head,
                status: c.status,
                submissionDate: c.submission_date,
                disbursedDate: c.disbursed_date,
                claimRefNumber: c.claim_ref_number,
                auditNotes: c.audit_notes,
                submittedBy: 'TRF Manager',
              }));
              setClaims(mappedClaims);
            }

            if (txRes.data && txRes.data.length > 0) {
              const mappedTx: Transaction[] = txRes.data.map((t) => ({
                id: t.id,
                date: t.date,
                title: t.title,
                description: t.description,
                amount: Number(t.amount),
                type: t.type,
                category: t.category,
                loggedBy: 'TRF Custodian',
                createdAt: t.created_at,
              }));
              setTransactions(mappedTx);
            }

            if (venuesRes.data && venuesRes.data.length > 0) {
              const mappedVenues: VenuePlace[] = venuesRes.data.map((v) => ({
                id: v.id,
                name: v.name,
                category: v.category,
                location: v.location,
                estimatedCostPerHead: Number(v.estimated_cost_per_head || 1500),
                rating: Number(v.rating || 4.5),
                votes: [],
                suggestedBy: 'Team',
                description: v.description || '',
                status: v.status || 'wishlist',
              }));
              setVenues(mappedVenues);
            }

            if (rulesRes.data && rulesRes.data.length > 0) {
              const mappedRules: ContributionRule[] = rulesRes.data.map((r) => ({
                id: r.id,
                title: r.title,
                description: r.description || '',
                suggestedAmount: Number(r.suggested_amount || 0),
                icon: r.icon || 'Gift',
                isMandatory: Boolean(r.is_mandatory),
              }));
              setRules(mappedRules);
            }

            setIsSupabaseLive(true);
          } catch (err) {
            console.log('Supabase sync note:', err);
          }
        }
      } catch (e) {
        console.warn('Failed to load storage:', e);
      } finally {
        setIsLoaded(true);
      }
    }

    loadData();
  }, []);

  // 2. Save to localStorage on changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const stateToSave = {
        members,
        claims,
        transactions,
        rules,
        treatEvents,
        venues,
        plannedActivities,
        currentUserId,
        monthlyPerHeadRate,
        defaultJoiningFee,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.warn('Failed to save to local storage:', e);
    }
  }, [isLoaded, members, claims, transactions, rules, treatEvents, venues, plannedActivities, currentUserId, monthlyPerHeadRate, defaultJoiningFee]);

  const currentUser = members.find((m) => m.id === currentUserId) || members[0] || INITIAL_MEMBERS[0];
  const isManager = currentUser.role === 'manager';

  // Computed Financials
  const totalInflow = transactions
    .filter((t) => t.type === 'inflow')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalOutflow = transactions
    .filter((t) => t.type === 'outflow')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const currentBalance = totalInflow - totalOutflow;

  const pendingAuditAmount = claims
    .filter((c) => c.status === 'submitted')
    .reduce((sum, c) => sum + Number(c.totalAmount || 0), 0);

  const pendingJoiningDues = members
    .filter((m) => m.joiningFeeStatus === 'pending')
    .reduce((sum, m) => sum + Number(m.joiningFeeAmount || 1000), 0);

  const pendingTreatDues = treatEvents
    .filter((t) => t.status === 'pending')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const pendingMemberDuesAmount = pendingJoiningDues + pendingTreatDues;
  const activeHeadcount = members.filter((m) => m.isActive).length;

  // Authentication Methods
  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    // 1. Check Supabase auth if configured
    if (isSupabaseConfigured && supabase && password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (data?.user) {
          const matched = members.find((m) => m.email.toLowerCase() === email.trim().toLowerCase());
          if (matched) setCurrentUserId(matched.id);
          setIsAuthenticated(true);
          try { localStorage.setItem('trf_is_authenticated', 'true'); } catch {}
          return { success: true };
        }
        if (error) console.warn('Supabase auth signIn error:', error.message);
      } catch (err: any) {
        console.warn('Supabase auth catch:', err);
      }
    }

    // 2. Demo / Team member lookup fallback
    const matched = members.find((m) => m.email.toLowerCase() === email.trim().toLowerCase());
    if (matched) {
      setCurrentUserId(matched.id);
      setIsAuthenticated(true);
      try { localStorage.setItem('trf_is_authenticated', 'true'); } catch {}
      return { success: true };
    }

    return { success: false, error: 'No active profile found for this email. Contact your TRF Manager.' };
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }
    setIsAuthenticated(false);
    try {
      localStorage.setItem('trf_is_authenticated', 'false');
    } catch {}
  };

  // Profile Management (For all users on their own profile)
  const updateProfile = async (userId: string, data: Partial<Omit<UserProfile, 'id' | 'role'>>) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === userId ? { ...m, ...data } : m))
    );

    if (isSupabaseConfigured && supabase) {
      try {
        const updatePayload: Record<string, any> = {};
        if (data.name) updatePayload.name = data.name;
        if (data.phone !== undefined) updatePayload.phone = data.phone;
        if (data.department) updatePayload.department = data.department;
        if (data.designation) updatePayload.designation = data.designation;
        if (data.birthDate) updatePayload.birth_date = data.birthDate;
        if (data.avatarUrl) updatePayload.avatar_url = data.avatarUrl;
        await supabase.from('profiles').update(updatePayload).eq('id', userId);
      } catch (e) {
        console.warn('Supabase profile update note:', e);
      }
    }
  };

  // RBAC User Management (Manager only)
  const updateUserRole = async (userId: string, newRole: 'manager' | 'member') => {
    if (!isManager) return;
    setMembers((prev) =>
      prev.map((m) => (m.id === userId ? { ...m, role: newRole } : m))
    );
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
      } catch {}
    }
  };

  const toggleUserActive = async (userId: string) => {
    if (!isManager) return;
    const target = members.find((m) => m.id === userId);
    if (!target) return;
    const nextState = !target.isActive;

    setMembers((prev) =>
      prev.map((m) => (m.id === userId ? { ...m, isActive: nextState } : m))
    );
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('profiles').update({ is_active: nextState }).eq('id', userId);
      } catch {}
    }
  };

  const deleteMember = async (userId: string) => {
    if (!isManager || userId === currentUser.id) return;
    setMembers((prev) => prev.filter((m) => m.id !== userId));
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('profiles').delete().eq('id', userId);
      } catch {}
    }
  };

  // Actions
  const switchUser = (userId: string) => {
    setCurrentUserId(userId);
  };

  const toggleRole = () => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === currentUser.id
          ? { ...m, role: m.role === 'manager' ? 'member' : 'manager' }
          : m
      )
    );
  };

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b'],
      });
    } catch (e) {
      console.error(e);
    }
  };

  const addTransaction = (data: {
    title: string;
    description?: string;
    amount: number;
    type: 'inflow' | 'outflow';
    category: TransactionCategory;
    date: string;
    relatedMemberId?: string;
  }) => {
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      date: data.date,
      title: data.title,
      description: data.description || '',
      amount: data.amount,
      type: data.type,
      category: data.category,
      loggedBy: currentUser.name,
      relatedMemberId: data.relatedMemberId,
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [newTx, ...prev]);

    // Async push to Supabase
    if (isSupabaseConfigured && supabase) {
      supabase.from('transactions').insert([
        {
          title: data.title,
          description: data.description || '',
          amount: data.amount,
          type: data.type,
          category: data.category,
          date: data.date,
        }
      ]).then(({ error }) => {
        if (error) console.log('Supabase sync note:', error.message);
      });
    }
  };

  const deleteTransaction = (id: string) => {
    if (!isManager) return;
    setTransactions((prev) => prev.filter((t) => t.id !== id));

    if (isSupabaseConfigured && supabase) {
      supabase.from('transactions').delete().eq('id', id).then();
    }
  };

  const createAuditClaim = (data: {
    monthYear: string;
    headcount: number;
    claimRefNumber?: string;
    auditNotes?: string;
  }) => {
    const totalAmount = data.headcount * monthlyPerHeadRate;
    const newClaim: AuditClaim = {
      id: `claim-${Date.now()}`,
      monthYear: data.monthYear,
      headcount: data.headcount,
      ratePerHead: monthlyPerHeadRate,
      totalAmount,
      status: 'submitted',
      submissionDate: new Date().toISOString().split('T')[0],
      claimRefNumber: data.claimRefNumber || `TRF-AUD-${Date.now().toString().slice(-4)}`,
      auditNotes: data.auditNotes || `Monthly claim for ${data.headcount} active heads.`,
      submittedBy: currentUser.name,
    };
    setClaims((prev) => [newClaim, ...prev]);

    if (isSupabaseConfigured && supabase) {
      supabase.from('audit_claims').insert([
        {
          month_year: data.monthYear,
          headcount: data.headcount,
          rate_per_head: monthlyPerHeadRate,
          status: 'submitted',
          claim_ref_number: newClaim.claimRefNumber,
          audit_notes: newClaim.auditNotes,
        }
      ]).then(({ error }) => {
        if (error) console.log('Supabase sync note:', error.message);
      });
    }
  };

  const updateClaimStatus = (claimId: string, status: ClaimStatus) => {
    if (!isManager) return;

    setClaims((prev) =>
      prev.map((c) => {
        if (c.id === claimId) {
          const updated: AuditClaim = {
            ...c,
            status,
            disbursedDate: status === 'approved_disbursed' ? new Date().toISOString().split('T')[0] : c.disbursedDate,
          };

          // If changing to approved_disbursed, automatically create an inflow transaction!
          if (status === 'approved_disbursed' && c.status !== 'approved_disbursed') {
            addTransaction({
              title: `Company TRF Allowance - ${c.monthYear}`,
              description: `${c.headcount} team heads @ 1,400 PKR disbursed via Audit`,
              amount: c.totalAmount,
              type: 'inflow',
              category: 'company_claim',
              date: new Date().toISOString().split('T')[0],
            });
            triggerCelebration();
          }

          return updated;
        }
        return c;
      })
    );

    if (isSupabaseConfigured && supabase) {
      supabase.from('audit_claims').update({
        status,
        disbursed_date: status === 'approved_disbursed' ? new Date().toISOString().split('T')[0] : null,
      }).eq('id', claimId).then();
    }
  };

  const updateClaim = (
    claimId: string,
    data: {
      monthYear?: string;
      headcount?: number;
      claimRefNumber?: string;
      auditNotes?: string;
      status?: ClaimStatus;
    }
  ) => {
    if (!isManager) return;
    setClaims((prev) =>
      prev.map((c) => {
        if (c.id === claimId) {
          const newHeadcount = data.headcount !== undefined ? data.headcount : c.headcount;
          const newStatus = data.status || c.status;
          const updated: AuditClaim = {
            ...c,
            monthYear: data.monthYear || c.monthYear,
            headcount: newHeadcount,
            totalAmount: newHeadcount * c.ratePerHead,
            claimRefNumber: data.claimRefNumber !== undefined ? data.claimRefNumber : c.claimRefNumber,
            auditNotes: data.auditNotes !== undefined ? data.auditNotes : c.auditNotes,
            status: newStatus,
            disbursedDate: newStatus === 'approved_disbursed' ? (c.disbursedDate || new Date().toISOString().split('T')[0]) : c.disbursedDate,
          };

          if (newStatus === 'approved_disbursed' && c.status !== 'approved_disbursed') {
            addTransaction({
              title: `Company TRF Allowance - ${updated.monthYear}`,
              description: `${updated.headcount} team heads @ 1,400 PKR disbursed via Audit`,
              amount: updated.totalAmount,
              type: 'inflow',
              category: 'company_claim',
              date: new Date().toISOString().split('T')[0],
            });
            triggerCelebration();
          }

          return updated;
        }
        return c;
      })
    );

    if (isSupabaseConfigured && supabase) {
      const payload: Record<string, any> = {};
      if (data.monthYear) payload.month_year = data.monthYear;
      if (data.headcount !== undefined) payload.headcount = data.headcount;
      if (data.claimRefNumber !== undefined) payload.claim_ref_number = data.claimRefNumber;
      if (data.auditNotes !== undefined) payload.audit_notes = data.auditNotes;
      if (data.status) payload.status = data.status;
      supabase.from('audit_claims').update(payload).eq('id', claimId).then();
    }
  };

  const deleteClaim = (claimId: string) => {
    if (!isManager) return;
    setClaims((prev) => prev.filter((c) => c.id !== claimId));
    if (isSupabaseConfigured && supabase) {
      supabase.from('audit_claims').delete().eq('id', claimId).then();
    }
  };

  const addMember = async (data: {
    name: string;
    email: string;
    role: 'manager' | 'member';
    department: string;
    designation: string;
    birthDate: string;
    phone?: string;
    password?: string;
    joiningFeeAmount?: number;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!isManager) {
      return { success: false, error: 'Only TRF Manager can create new members' };
    }

    if (members.some((m) => m.email.toLowerCase() === data.email.trim().toLowerCase())) {
      return { success: false, error: 'A member with this email already exists' };
    }

    let createdId = `user-${Date.now()}`;

    // 1. If Supabase configured and password given, create in Supabase Auth
    if (isSupabaseConfigured && supabase && data.password) {
      try {
        const { data: authData, error: authErr } = await supabase.auth.signUp({
          email: data.email.trim(),
          password: data.password,
          options: {
            data: {
              name: data.name,
              role: data.role,
              department: data.department,
            },
          },
        });
        if (authData?.user?.id) {
          createdId = authData.user.id;
        } else if (authErr) {
          console.warn('Supabase auth signup warning:', authErr.message);
        }
      } catch (err: any) {
        console.warn('Supabase signup catch:', err);
      }
    }

    const newMember: UserProfile = {
      id: createdId,
      name: data.name.trim(),
      email: data.email.trim(),
      role: data.role,
      department: data.department || 'Engineering',
      designation: data.designation || 'Team Member',
      joiningDate: new Date().toISOString().split('T')[0],
      birthDate: data.birthDate,
      phone: data.phone,
      joiningFeeStatus: 'pending',
      joiningFeeAmount: data.joiningFeeAmount !== undefined ? data.joiningFeeAmount : defaultJoiningFee,
      isActive: true,
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100`,
    };

    setMembers((prev) => [...prev, newMember]);

    setTreatEvents((prev) => [
      {
        id: `treat-${Date.now()}`,
        memberId: createdId,
        memberName: data.name,
        ruleTitle: 'New Member Joining Fee',
        details: 'Initial TRF pool entry contribution',
        amount: data.joiningFeeAmount !== undefined ? data.joiningFeeAmount : defaultJoiningFee,
        date: new Date().toISOString().split('T')[0],
        status: 'pending',
      },
      ...prev,
    ]);

    // 2. Sync to Supabase profiles table
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('profiles').insert([
          {
            id: createdId,
            name: data.name.trim(),
            email: data.email.trim(),
            role: data.role,
            department: data.department || 'Engineering',
            designation: data.designation || 'Team Member',
            joining_date: new Date().toISOString().split('T')[0],
            birth_date: data.birthDate,
            phone: data.phone,
            joining_fee_status: 'pending',
            joining_fee_amount: data.joiningFeeAmount || 1000,
            is_active: true,
          },
        ]);
      } catch (e) {
        console.warn('Supabase profile sync note:', e);
      }
    }

    return { success: true };
  };

  const updateMemberJoiningFee = (memberId: string, status: 'paid' | 'pending' | 'waived') => {
    if (!isManager) return;
    const member = members.find((m) => m.id === memberId);
    if (!member) return;

    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, joiningFeeStatus: status } : m))
    );

    if (status === 'paid' && member.joiningFeeStatus !== 'paid') {
      addTransaction({
        title: `${member.name} - Joining Fee Contribution`,
        description: 'Mandatory initial TRF pool entry contribution',
        amount: member.joiningFeeAmount || 1000,
        type: 'inflow',
        category: 'joining_fee',
        date: new Date().toISOString().split('T')[0],
        relatedMemberId: memberId,
      });

      setTreatEvents((prev) =>
        prev.map((t) =>
          t.memberId === memberId && t.ruleTitle.includes('Joining')
            ? { ...t, status: 'collected', collectedDate: new Date().toISOString().split('T')[0] }
            : t
        )
      );

      triggerCelebration();
    }
  };

  const logTreatEvent = (data: {
    memberId: string;
    ruleTitle: string;
    details: string;
    amount: number;
  }) => {
    const member = members.find((m) => m.id === data.memberId) || currentUser;
    const newEvent: MemberTreatEvent = {
      id: `treat-${Date.now()}`,
      memberId: member.id,
      memberName: member.name,
      ruleTitle: data.ruleTitle,
      details: data.details,
      amount: data.amount,
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
    };
    setTreatEvents((prev) => [newEvent, ...prev]);

    if (isSupabaseConfigured && supabase) {
      supabase.from('member_treat_events').insert([
        {
          rule_title: data.ruleTitle,
          details: data.details,
          amount: data.amount,
          date: newEvent.date,
          status: 'pending',
        }
      ]).then(({ error }) => {
        if (error) console.log('Supabase sync note:', error.message);
      });
    }
  };

  const collectTreatPayment = (treatId: string) => {
    if (!isManager) return;
    const treat = treatEvents.find((t) => t.id === treatId);
    if (!treat || treat.status === 'collected') return;

    setTreatEvents((prev) =>
      prev.map((t) =>
        t.id === treatId
          ? { ...t, status: 'collected', collectedDate: new Date().toISOString().split('T')[0] }
          : t
      )
    );

    addTransaction({
      title: `${treat.ruleTitle} - ${treat.memberName}`,
      description: treat.details,
      amount: treat.amount,
      type: 'inflow',
      category: treat.ruleTitle.includes('Joining') ? 'joining_fee' : 'treat_event',
      date: new Date().toISOString().split('T')[0],
      relatedMemberId: treat.memberId,
    });

    triggerCelebration();
  };

  const updateTreatEvent = (
    treatId: string,
    data: {
      memberId?: string;
      ruleTitle?: string;
      details?: string;
      amount?: number;
      status?: 'pending' | 'collected';
      date?: string;
    }
  ) => {
    setTreatEvents((prev) =>
      prev.map((t) => {
        if (t.id === treatId) {
          const targetMember = data.memberId ? members.find((m) => m.id === data.memberId) : null;
          const updated: MemberTreatEvent = {
            ...t,
            memberId: data.memberId || t.memberId,
            memberName: targetMember ? targetMember.name : t.memberName,
            ruleTitle: data.ruleTitle || t.ruleTitle,
            details: data.details !== undefined ? data.details : t.details,
            amount: data.amount !== undefined ? data.amount : t.amount,
            status: data.status || t.status,
            date: data.date || t.date,
            collectedDate: data.status === 'collected' ? (t.collectedDate || new Date().toISOString().split('T')[0]) : t.collectedDate,
          };

          if (data.status === 'collected' && t.status !== 'collected') {
            addTransaction({
              title: `${updated.ruleTitle} - ${updated.memberName}`,
              description: updated.details,
              amount: updated.amount,
              type: 'inflow',
              category: updated.ruleTitle.includes('Joining') ? 'joining_fee' : 'treat_event',
              date: new Date().toISOString().split('T')[0],
              relatedMemberId: updated.memberId,
            });
            triggerCelebration();
          }

          return updated;
        }
        return t;
      })
    );

    if (isSupabaseConfigured && supabase) {
      const payload: Record<string, any> = {};
      if (data.ruleTitle) payload.rule_title = data.ruleTitle;
      if (data.details !== undefined) payload.details = data.details;
      if (data.amount !== undefined) payload.amount = data.amount;
      if (data.status) payload.status = data.status;
      if (data.date) payload.date = data.date;
      supabase.from('member_treat_events').update(payload).eq('id', treatId).then();
    }
  };

  const deleteTreatEvent = (treatId: string) => {
    setTreatEvents((prev) => prev.filter((t) => t.id !== treatId));
    if (isSupabaseConfigured && supabase) {
      supabase.from('member_treat_events').delete().eq('id', treatId).then();
    }
  };

  const addRule = (data: {
    title: string;
    description: string;
    suggestedAmount: number;
    icon?: string;
    isMandatory: boolean;
  }) => {
    const newRule: ContributionRule = {
      id: `rule-${Date.now()}`,
      title: data.title,
      description: data.description,
      suggestedAmount: data.suggestedAmount,
      icon: data.icon || 'Gift',
      isMandatory: data.isMandatory,
    };
    setRules((prev) => [...prev, newRule]);

    if (isSupabaseConfigured && supabase) {
      supabase.from('contribution_rules').insert([
        {
          title: data.title,
          description: data.description,
          suggested_amount: data.suggestedAmount,
          icon: data.icon || 'Gift',
          is_mandatory: data.isMandatory,
        }
      ]).then(({ error }) => {
        if (error) console.log('Supabase rule insert note:', error.message);
      });
    }
  };

  const updateRule = (
    ruleId: string,
    data: {
      title?: string;
      description?: string;
      suggestedAmount?: number;
      icon?: string;
      isMandatory?: boolean;
    }
  ) => {
    setRules((prev) =>
      prev.map((r) => {
        if (r.id === ruleId) {
          return {
            ...r,
            title: data.title !== undefined ? data.title : r.title,
            description: data.description !== undefined ? data.description : r.description,
            suggestedAmount: data.suggestedAmount !== undefined ? data.suggestedAmount : r.suggestedAmount,
            icon: data.icon !== undefined ? data.icon : r.icon,
            isMandatory: data.isMandatory !== undefined ? data.isMandatory : r.isMandatory,
          };
        }
        return r;
      })
    );

    if (isSupabaseConfigured && supabase) {
      const payload: Record<string, any> = {};
      if (data.title !== undefined) payload.title = data.title;
      if (data.description !== undefined) payload.description = data.description;
      if (data.suggestedAmount !== undefined) payload.suggested_amount = data.suggestedAmount;
      if (data.icon !== undefined) payload.icon = data.icon;
      if (data.isMandatory !== undefined) payload.is_mandatory = data.isMandatory;
      supabase.from('contribution_rules').update(payload).eq('id', ruleId).then();
    }
  };

  const deleteRule = (ruleId: string) => {
    setRules((prev) => prev.filter((r) => r.id !== ruleId));
    if (isSupabaseConfigured && supabase) {
      supabase.from('contribution_rules').delete().eq('id', ruleId).then();
    }
  };

  const updateSystemRates = (rates: {
    monthlyPerHeadRate?: number;
    defaultJoiningFee?: number;
  }) => {
    if (rates.monthlyPerHeadRate !== undefined) {
      setMonthlyPerHeadRate(rates.monthlyPerHeadRate);
    }
    if (rates.defaultJoiningFee !== undefined) {
      setDefaultJoiningFee(rates.defaultJoiningFee);
    }
  };

  const addVenue = (data: {
    name: string;
    category: VenuePlace['category'];
    location: string;
    estimatedCostPerHead: number;
    description: string;
  }) => {
    const newVenue: VenuePlace = {
      id: `venue-${Date.now()}`,
      name: data.name,
      category: data.category,
      location: data.location,
      estimatedCostPerHead: data.estimatedCostPerHead,
      rating: 4.5,
      votes: [currentUser.id],
      suggestedBy: currentUser.name,
      description: data.description,
      status: 'wishlist',
    };
    setVenues((prev) => [newVenue, ...prev]);

    if (isSupabaseConfigured && supabase) {
      supabase.from('venues').insert([
        {
          name: data.name,
          category: data.category,
          location: data.location,
          estimated_cost_per_head: data.estimatedCostPerHead,
          description: data.description,
          status: 'wishlist',
        }
      ]).then(({ error }) => {
        if (error) console.log('Supabase sync note:', error.message);
      });
    }
  };

  const toggleVenueVote = (venueId: string) => {
    setVenues((prev) =>
      prev.map((v) => {
        if (v.id === venueId) {
          const hasVoted = v.votes.includes(currentUser.id);
          const newVotes = hasVoted
            ? v.votes.filter((id) => id !== currentUser.id)
            : [...v.votes, currentUser.id];
          return { ...v, votes: newVotes };
        }
        return v;
      })
    );
  };

  const createPlannedActivity = (data: {
    title: string;
    venueName: string;
    venueId?: string;
    date: string;
    time?: string;
    estimatedTotalBudget: number;
    trfContributionShare: number;
    description: string;
  }) => {
    const remainingBudget = Math.max(0, data.estimatedTotalBudget - data.trfContributionShare);
    const personalShare = activeHeadcount > 0 ? Math.round(remainingBudget / activeHeadcount) : 0;

    const newActivity: PlannedActivity = {
      id: `act-${Date.now()}`,
      title: data.title,
      venueName: data.venueName,
      venueId: data.venueId,
      date: data.date,
      time: data.time || '7:00 PM',
      estimatedTotalBudget: data.estimatedTotalBudget,
      trfContributionShare: data.trfContributionShare,
      personalContributionPerHead: personalShare,
      status: 'voting',
      description: data.description,
      rsvps: members.map((m) => ({
        userId: m.id,
        userName: m.name,
        status: m.id === currentUser.id ? 'going' : 'maybe',
      })),
    };
    setPlannedActivities((prev) => [newActivity, ...prev]);
  };

  const updateRSVP = (activityId: string, status: 'going' | 'maybe' | 'not_going') => {
    setPlannedActivities((prev) =>
      prev.map((act) => {
        if (act.id === activityId) {
          const updatedRSVPs = act.rsvps.map((r) =>
            r.userId === currentUser.id ? { ...r, status } : r
          );
          return { ...act, rsvps: updatedRSVPs };
        }
        return act;
      })
    );
  };

  const resetToDemoData = () => {
    setMembers(INITIAL_MEMBERS);
    setClaims(INITIAL_CLAIMS);
    setTransactions(INITIAL_TRANSACTIONS);
    setRules(INITIAL_RULES);
    setTreatEvents(INITIAL_TREAT_EVENTS);
    setVenues(INITIAL_VENUES);
    setPlannedActivities(INITIAL_PLANNED_ACTIVITIES);
    setCurrentUserId('user-1');
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <TRFContext.Provider
      value={{
        currentUser,
        isManager,
        members,
        claims,
        transactions,
        rules,
        treatEvents,
        venues,
        plannedActivities,
        isSupabaseLive,
        currentBalance,
        totalInflow,
        totalOutflow,
        pendingAuditAmount,
        pendingMemberDuesAmount,
        monthlyPerHeadRate,
        defaultJoiningFee,
        activeHeadcount,
        isAuthenticated,
        login,
        logout,
        updateProfile,
        updateUserRole,
        toggleUserActive,
        deleteMember,
        addRule,
        updateRule,
        deleteRule,
        updateSystemRates,
        switchUser,
        toggleRole,
        addTransaction,
        deleteTransaction,
        createAuditClaim,
        updateClaim,
        deleteClaim,
        updateClaimStatus,
        addMember,
        updateMemberJoiningFee,
        logTreatEvent,
        updateTreatEvent,
        deleteTreatEvent,
        collectTreatPayment,
        addVenue,
        toggleVenueVote,
        createPlannedActivity,
        updateRSVP,
        triggerCelebration,
        resetToDemoData,
      }}
    >
      {children}
    </TRFContext.Provider>
  );
}

export function useTRF() {
  const context = useContext(TRFContext);
  if (!context) {
    throw new Error('useTRF must be used within a TRFProvider');
  }
  return context;
}
