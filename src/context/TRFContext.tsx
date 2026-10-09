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
  monthlyPerHeadRate: number; // 1400
  activeHeadcount: number;

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
  updateClaimStatus: (claimId: string, status: ClaimStatus) => void;
  addMember: (data: {
    name: string;
    email: string;
    role: 'manager' | 'member';
    department: string;
    designation: string;
    birthDate: string;
    phone?: string;
    joiningFeeAmount?: number;
  }) => void;
  updateMemberJoiningFee: (memberId: string, status: 'paid' | 'pending' | 'waived') => void;
  logTreatEvent: (data: {
    memberId: string;
    ruleTitle: string;
    details: string;
    amount: number;
  }) => void;
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
const MONTHLY_RATE = 1400; // 1400 PKR per head per month

export function TRFProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [members, setMembers] = useState<UserProfile[]>(INITIAL_MEMBERS);
  const [claims, setClaims] = useState<AuditClaim[]>(INITIAL_CLAIMS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [rules, setRules] = useState<ContributionRule[]>(INITIAL_RULES);
  const [treatEvents, setTreatEvents] = useState<MemberTreatEvent[]>(INITIAL_TREAT_EVENTS);
  const [venues, setVenues] = useState<VenuePlace[]>(INITIAL_VENUES);
  const [plannedActivities, setPlannedActivities] = useState<PlannedActivity[]>(INITIAL_PLANNED_ACTIVITIES);
  const [currentUserId, setCurrentUserId] = useState<string>('user-1'); // Default Asim Khan (Manager)
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
        }

        // Try Supabase fetch if configured
        if (isSupabaseConfigured && supabase) {
          try {
            const [claimsRes, txRes, venuesRes] = await Promise.all([
              supabase.from('audit_claims').select('*'),
              supabase.from('transactions').select('*'),
              supabase.from('venues').select('*'),
            ]);

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
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.warn('Failed to save to local storage:', e);
    }
  }, [isLoaded, members, claims, transactions, rules, treatEvents, venues, plannedActivities, currentUserId]);

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
    const totalAmount = data.headcount * MONTHLY_RATE;
    const newClaim: AuditClaim = {
      id: `claim-${Date.now()}`,
      monthYear: data.monthYear,
      headcount: data.headcount,
      ratePerHead: MONTHLY_RATE,
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
          rate_per_head: MONTHLY_RATE,
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

  const addMember = (data: {
    name: string;
    email: string;
    role: 'manager' | 'member';
    department: string;
    designation: string;
    birthDate: string;
    phone?: string;
    joiningFeeAmount?: number;
  }) => {
    const newMemberId = `user-${Date.now()}`;
    const newMember: UserProfile = {
      id: newMemberId,
      name: data.name,
      email: data.email,
      role: data.role,
      department: data.department || 'Engineering',
      designation: data.designation || 'Team Member',
      joiningDate: new Date().toISOString().split('T')[0],
      birthDate: data.birthDate,
      phone: data.phone,
      joiningFeeStatus: 'pending',
      joiningFeeAmount: data.joiningFeeAmount || 1000,
      isActive: true,
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
    };

    setMembers((prev) => [...prev, newMember]);

    setTreatEvents((prev) => [
      {
        id: `treat-${Date.now()}`,
        memberId: newMemberId,
        memberName: data.name,
        ruleTitle: 'New Member Joining Fee',
        details: 'Initial TRF pool entry contribution',
        amount: data.joiningFeeAmount || 1000,
        date: new Date().toISOString().split('T')[0],
        status: 'pending',
      },
      ...prev,
    ]);
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
        monthlyPerHeadRate: MONTHLY_RATE,
        activeHeadcount,
        switchUser,
        toggleRole,
        addTransaction,
        deleteTransaction,
        createAuditClaim,
        updateClaimStatus,
        addMember,
        updateMemberJoiningFee,
        logTreatEvent,
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
