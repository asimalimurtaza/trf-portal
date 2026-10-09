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
  InAppNotification,
  NotificationType,
  NotificationTargetTab,
  DirectMessage,
} from '@/types/trf';
import {
  INITIAL_MEMBERS,
  INITIAL_CLAIMS,
  INITIAL_TRANSACTIONS,
  INITIAL_RULES,
  INITIAL_TREAT_EVENTS,
  INITIAL_VENUES,
  INITIAL_PLANNED_ACTIVITIES,
  INITIAL_DIRECT_MESSAGES,
} from '@/lib/mock-data';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getBirthdayCountdown, formatPKR, formatDate } from '@/lib/utils';
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
  
  // Direct Messages
  directMessages: DirectMessage[];
  activeChatUserId: string | null;
  setActiveChatUserId: (userId: string | null) => void;
  sendDirectMessage: (receiverId: string, content: string) => Promise<{ success: boolean; error?: string }>;
  markDirectMessagesAsRead: (partnerId: string) => Promise<void>;
  unreadDirectMessagesCount: number;

  // In-App Notifications
  notifications: InAppNotification[];
  unreadNotificationsCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  addNotification: (data: {
    title: string;
    message: string;
    type: NotificationType;
    targetTab?: NotificationTargetTab;
    actionLabel?: string;
  }) => void;
  
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
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;

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
    employeeId: string;
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
  }) => Promise<void>;
  updateVenue: (
    venueId: string,
    data: {
      name?: string;
      category?: VenuePlace['category'];
      location?: string;
      estimatedCostPerHead?: number;
      description?: string;
      status?: 'wishlist' | 'planned' | 'visited';
      rating?: number;
    }
  ) => Promise<void>;
  deleteVenue: (venueId: string) => Promise<void>;
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
  }) => Promise<void>;
  updatePlannedActivity: (
    activityId: string,
    data: {
      title?: string;
      venueName?: string;
      venueId?: string;
      date?: string;
      time?: string;
      estimatedTotalBudget?: number;
      trfContributionShare?: number;
      status?: 'voting' | 'confirmed' | 'completed' | 'cancelled';
      description?: string;
    }
  ) => Promise<void>;
  completePlannedActivity: (data: {
    activityId: string;
    finalBillAmount: number;
    splitShortfallWithMembers?: boolean;
  }) => Promise<{ success: boolean; shortfall?: number; perMemberShare?: number }>;
  deletePlannedActivity: (activityId: string) => Promise<void>;
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
  const [currentUserId, setCurrentUserId] = useState<string>('user-1');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('trf_is_authenticated') === 'true';
      } catch {
        return false;
      }
    }
    return false;
  });
  const [isSupabaseLive, setIsSupabaseLive] = useState(isSupabaseConfigured);

  const NOTIF_STORAGE_KEY = 'trf_notifications_v1';
  const [notifications, setNotifications] = useState<InAppNotification[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(NOTIF_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  const DM_STORAGE_KEY = 'trf_direct_messages_v1';
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(DM_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_DIRECT_MESSAGES;
  });
  const [activeChatUserId, setActiveChatUserId] = useState<string | null>(null);

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
          if (parsed.isAuthenticated !== undefined) setIsAuthenticated(Boolean(parsed.isAuthenticated));
        }

        // Direct Supabase fetch if configured (Supabase is single source of truth)
        if (isSupabaseConfigured && supabase) {
          try {
            // Check real Supabase Auth session
            const { data: sessionData } = await supabase.auth.getSession();
            const sessionUser = sessionData?.session?.user;
            if (sessionUser) {
              setIsAuthenticated(true);
              try {
                localStorage.setItem('trf_is_authenticated', 'true');
              } catch {}
            } else {
              const localAuth = localStorage.getItem('trf_is_authenticated') === 'true';
              if (!localAuth) {
                setIsAuthenticated(false);
              }
            }
            const [
              claimsRes,
              txRes,
              venuesRes,
              profilesRes,
              rulesRes,
              treatsRes,
              activitiesRes,
              dmsRes,
            ] = await Promise.all([
              supabase.from('audit_claims').select('*').order('created_at', { ascending: false }),
              supabase.from('transactions').select('*').order('date', { ascending: false }),
              supabase.from('venues').select('*'),
              supabase.from('profiles').select('*'),
              supabase.from('contribution_rules').select('*'),
              supabase.from('member_treat_events').select('*').order('date', { ascending: false }),
              supabase.from('planned_activities').select('*').order('date', { ascending: false }),
              supabase.from('direct_messages').select('*').order('created_at', { ascending: true }),
            ]);

            // 1. Transactions
            const mappedTx: Transaction[] = (txRes.data || []).map((t) => ({
              id: t.id,
              date: t.date,
              title: t.title,
              description: t.description || '',
              amount: Number(t.amount || 0),
              type: t.type,
              category: t.category,
              loggedBy: 'TRF Custodian',
              relatedMemberId: t.related_member_id || undefined,
              createdAt: t.created_at,
            }));
            setTransactions(mappedTx);

            // 2. Profiles / Members
            let mappedProfiles: UserProfile[] = [];
            if (profilesRes.data && profilesRes.data.length > 0) {
              mappedProfiles = profilesRes.data.map((p) => {
                // Reconcile joining fee status: if a joining fee transaction already exists for this member, it is paid!
                const hasPaidTx = mappedTx.some(
                  (tx) =>
                    tx.category === 'joining_fee' &&
                    (tx.relatedMemberId === p.id ||
                      tx.title.toLowerCase().includes(p.name.toLowerCase()))
                );

                const finalJoiningStatus = hasPaidTx ? 'paid' : (p.joining_fee_status || 'pending');

                // If DB was out of sync with funds transaction, update DB
                if (supabase && p.joining_fee_status !== 'paid' && hasPaidTx) {
                  supabase.from('profiles').update({ joining_fee_status: 'paid' }).eq('id', p.id).then();
                }

                return {
                  id: p.id,
                  employeeId: p.employee_id || (p.role === 'manager' ? 'TL-1001' : `TL-${1000 + (p.name.length * 37) % 899}`),
                  name: p.name,
                  email: p.email,
                  role: p.role,
                  avatarUrl: p.avatar_url || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100`,
                  department: p.department || 'Engineering',
                  designation: p.designation || 'Team Member',
                  joiningDate: p.joining_date || new Date().toISOString().split('T')[0],
                  birthDate: p.birth_date || '2000-01-01',
                  joiningFeeStatus: finalJoiningStatus as 'paid' | 'pending' | 'waived',
                  joiningFeeAmount: Number(p.joining_fee_amount || 1000),
                  phone: p.phone,
                  isActive: p.is_active ?? true,
                };
              });

              setMembers(mappedProfiles);

              // Set current active user to authenticated user or first profile
              if (sessionUser) {
                const uEmail = sessionUser.email?.toLowerCase();
                const uId = sessionUser.id;
                const matched = mappedProfiles.find((m) => m.id === uId || m.email.toLowerCase() === uEmail);
                if (matched) {
                  setCurrentUserId(matched.id);
                } else {
                  const manager = mappedProfiles.find((m) => m.role === 'manager');
                  setCurrentUserId(manager ? manager.id : mappedProfiles[0].id);
                }
              } else {
                setCurrentUserId((prevId) => {
                  if (mappedProfiles.some((m) => m.id === prevId)) return prevId;
                  const manager = mappedProfiles.find((m) => m.role === 'manager');
                  return manager ? manager.id : mappedProfiles[0].id;
                });
              }

              // Listen to Supabase Auth state changes reactively
              supabase.auth.onAuthStateChange((_event, session) => {
                if (session?.user) {
                  setIsAuthenticated(true);
                  const uEmail = session.user.email?.toLowerCase();
                  const uId = session.user.id;
                  setCurrentUserId((prev) => {
                    const matched = mappedProfiles.find((m) => m.id === uId || m.email.toLowerCase() === uEmail);
                    return matched ? matched.id : prev;
                  });
                } else {
                  setIsAuthenticated(false);
                }
              });
            }

            // 3. Claims
            if (claimsRes.data !== null) {
              const mappedClaims: AuditClaim[] = claimsRes.data.map((c) => ({
                id: c.id,
                monthYear: c.month_year,
                headcount: c.headcount,
                ratePerHead: Number(c.rate_per_head || 1400),
                totalAmount: Number(c.total_amount || c.headcount * (c.rate_per_head || 1400)),
                status: c.status,
                submissionDate: c.submission_date,
                disbursedDate: c.disbursed_date,
                claimRefNumber: c.claim_ref_number,
                auditNotes: c.audit_notes,
                submittedBy: 'TRF Manager',
              }));
              setClaims(mappedClaims);
            }

            // 4. Venues
            if (venuesRes.data !== null) {
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

            // 5. Contribution Rules
            if (rulesRes.data !== null) {
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

            // 6. Member Treat Events
            if (treatsRes.data !== null) {
              const mappedTreats: MemberTreatEvent[] = treatsRes.data.map((t) => {
                const matchedMember = mappedProfiles.find((m) => m.id === t.member_id);
                return {
                  id: t.id,
                  memberId: t.member_id,
                  memberName: matchedMember ? matchedMember.name : 'Team Member',
                  ruleTitle: t.rule_title,
                  details: t.details || '',
                  amount: Number(t.amount || 0),
                  date: t.date || new Date().toISOString().split('T')[0],
                  status: t.status || 'pending',
                  collectedDate: t.collected_date,
                };
              });
              setTreatEvents(mappedTreats);
            }

            // 7. Planned Activities
            if (activitiesRes.data !== null) {
              const mappedActivities: PlannedActivity[] = activitiesRes.data.map((a) => ({
                id: a.id,
                title: a.title,
                venueName: a.venue_name,
                venueId: a.venue_id,
                date: a.date,
                time: a.time,
                estimatedTotalBudget: Number(a.estimated_total_budget || 0),
                trfContributionShare: Number(a.trf_contribution_share || 0),
                personalContributionPerHead: Number(a.personal_contribution_per_head || 0),
                status: a.status || 'voting',
                rsvps: [],
                description: a.description || '',
              }));
              setPlannedActivities(mappedActivities);
            }

            // 8. Direct Messages
            if (dmsRes.data && dmsRes.data.length > 0) {
              const mappedDMs: DirectMessage[] = dmsRes.data.map((d) => ({
                id: d.id,
                senderId: d.sender_id,
                receiverId: d.receiver_id,
                content: d.content,
                isRead: Boolean(d.is_read),
                createdAt: d.created_at,
              }));
              setDirectMessages(mappedDMs);
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
        isAuthenticated,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.warn('Failed to save to local storage:', e);
    }
  }, [isLoaded, members, claims, transactions, rules, treatEvents, venues, plannedActivities, currentUserId, monthlyPerHeadRate, defaultJoiningFee, isAuthenticated]);

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

  // Save notifications to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(notifications));
    } catch (e) {
      console.warn('Failed to save notifications to storage:', e);
    }
  }, [isLoaded, notifications]);

  // Save direct messages to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(DM_STORAGE_KEY, JSON.stringify(directMessages));
    } catch (e) {
      console.warn('Failed to save direct messages to storage:', e);
    }
  }, [isLoaded, directMessages]);

  // Supabase Realtime for Direct Messages
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const channel = supabase
      .channel('trf_direct_messages_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
        },
        (payload) => {
          const row = payload.new;
          if (!row) return;

          const incomingMsg: DirectMessage = {
            id: row.id,
            senderId: row.sender_id,
            receiverId: row.receiver_id,
            content: row.content,
            isRead: Boolean(row.is_read),
            createdAt: row.created_at,
          };

          setDirectMessages((prev) => {
            if (prev.some((m) => m.id === incomingMsg.id)) return prev;
            return [...prev, incomingMsg];
          });

          // Trigger in-app notification if message is addressed to currentUser
          if (incomingMsg.receiverId === currentUser.id && incomingMsg.senderId !== currentUser.id) {
            const senderObj = members.find((m) => m.id === incomingMsg.senderId);
            addNotification({
              title: `New Message from ${senderObj?.name || 'Teammate'}`,
              message:
                incomingMsg.content.length > 60
                  ? incomingMsg.content.substring(0, 60) + '...'
                  : incomingMsg.content,
              type: 'message',
              targetTab: 'messages',
              actionLabel: 'Open Chat',
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'direct_messages',
        },
        (payload) => {
          const row = payload.new;
          if (!row) return;
          setDirectMessages((prev) =>
            prev.map((m) =>
              m.id === row.id ? { ...m, isRead: Boolean(row.is_read) } : m
            )
          );
        }
      )
      .subscribe();

    return () => {
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [isSupabaseConfigured, currentUser.id, members]);

  // Dynamic system notifications synchronization
  useEffect(() => {
    if (!isLoaded) return;

    setNotifications((prev) => {
      const existingIds = new Set(prev.map((n) => n.id));
      const newItems: InAppNotification[] = [];

      // 1. Upcoming Birthdays (within next 7 days)
      members.forEach((m) => {
        if (!m.birthDate || !m.isActive) return;
        const countdown = getBirthdayCountdown(m.birthDate);
        if (countdown.daysLeft <= 7) {
          const notifId = `notif-bday-${m.id}`;
          if (!existingIds.has(notifId)) {
            newItems.push({
              id: notifId,
              title: `Upcoming Birthday: ${m.name}`,
              message: countdown.daysLeft === 0
                ? `Today is ${m.name}'s birthday! Wish them a happy birthday.`
                : `${m.name}'s birthday is in ${countdown.daysLeft} day${countdown.daysLeft === 1 ? '' : 's'}. Funded via TRF.`,
              timestamp: new Date().toISOString(),
              type: 'birthday',
              isRead: false,
              targetTab: 'birthdays',
              actionLabel: 'View Birthday',
            });
            existingIds.add(notifId);
          }
        }
      });

      // 2. Pending Joining Fees
      members.forEach((m) => {
        if (m.joiningFeeStatus === 'pending' && m.isActive) {
          const notifId = `notif-joining-${m.id}`;
          if (!existingIds.has(notifId)) {
            newItems.push({
              id: notifId,
              title: `Pending Joining Fee: ${m.name}`,
              message: `${m.name} (${m.employeeId || 'ID Pending'}) has an outstanding initial entry contribution of ${formatPKR(m.joiningFeeAmount || 1000)}.`,
              timestamp: new Date().toISOString(),
              type: 'due',
              isRead: false,
              targetTab: 'members',
              actionLabel: 'Collect Dues',
            });
            existingIds.add(notifId);
          }
        }
      });

      // 3. Pending Treat Declarations
      treatEvents.forEach((t) => {
        if (t.status === 'pending') {
          const notifId = `notif-treat-${t.id}`;
          if (!existingIds.has(notifId)) {
            newItems.push({
              id: notifId,
              title: `Pending Treat Dues: ${t.memberName}`,
              message: `${t.ruleTitle} - ${formatPKR(t.amount)} pending contribution to the pool.`,
              timestamp: t.date ? new Date(t.date).toISOString() : new Date().toISOString(),
              type: 'due',
              isRead: false,
              targetTab: 'rules-treats',
              actionLabel: 'View Treats',
            });
            existingIds.add(notifId);
          }
        }
      });

      // 4. Submitted Audit Claims awaiting reimbursement
      claims.forEach((c) => {
        if (c.status === 'submitted') {
          const notifId = `notif-claim-${c.id}`;
          if (!existingIds.has(notifId)) {
            newItems.push({
              id: notifId,
              title: `Audit Claim Submitted: ${c.monthYear}`,
              message: `Monthly claim for ${formatPKR(c.totalAmount)} is submitted and awaiting company audit disbursement.`,
              timestamp: new Date().toISOString(),
              type: 'claim',
              isRead: false,
              targetTab: 'audit-claims',
              actionLabel: 'Track Claim',
            });
            existingIds.add(notifId);
          }
        }
      });

      if (newItems.length === 0) return prev;
      return [...newItems, ...prev];
    });
  }, [isLoaded, members, treatEvents, claims]);

  const addNotification = (data: {
    title: string;
    message: string;
    type: NotificationType;
    targetTab?: NotificationTargetTab;
    actionLabel?: string;
  }) => {
    const item: InAppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: data.title,
      message: data.message,
      type: data.type,
      isRead: false,
      timestamp: new Date().toISOString(),
      targetTab: data.targetTab,
      actionLabel: data.actionLabel,
    };
    setNotifications((prev) => [item, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

  // Direct Messaging Methods
  const sendDirectMessage = async (
    receiverId: string,
    content: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!content || !content.trim()) {
      return { success: false, error: 'Message cannot be empty.' };
    }

    const trimmed = content.trim();
    const newMsg: DirectMessage = {
      id: `dm-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      senderId: currentUser.id,
      receiverId,
      content: trimmed,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    setDirectMessages((prev) => [...prev, newMsg]);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('direct_messages').insert([
          {
            sender_id: currentUser.id,
            receiver_id: receiverId,
            content: trimmed,
            is_read: false,
          },
        ]);
        if (error) {
          console.warn('Supabase DM insert note:', error);
        }
      } catch (err) {
        console.warn('Supabase DM sync error:', err);
      }
    }

    return { success: true };
  };

  const markDirectMessagesAsRead = async (partnerId: string): Promise<void> => {
    setDirectMessages((prev) =>
      prev.map((m) =>
        m.senderId === partnerId && m.receiverId === currentUser.id && !m.isRead
          ? { ...m, isRead: true }
          : m
      )
    );

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('direct_messages')
          .update({ is_read: true })
          .eq('sender_id', partnerId)
          .eq('receiver_id', currentUser.id);
      } catch (e) {
        console.warn('Supabase mark read DM note:', e);
      }
    }
  };

  const unreadDirectMessagesCount = directMessages.filter(
    (m) => m.receiverId === currentUser.id && !m.isRead
  ).length;

  // Authentication Methods
  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    if (!email || !email.trim()) {
      return { success: false, error: 'Please enter your corporate email address.' };
    }
    if (!password || !password.trim()) {
      return { success: false, error: 'Password is required to sign in.' };
    }

    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Authentication service is currently unavailable.' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data?.user && data?.session) {
        setIsAuthenticated(true);
        try {
          localStorage.setItem('trf_is_authenticated', 'true');
        } catch {}
        const userEmail = data.user.email?.toLowerCase();
        const userId = data.user.id;
        const matched = members.find((m) => m.id === userId || m.email.toLowerCase() === userEmail);
        if (matched) {
          setCurrentUserId(matched.id);
        }
        return { success: true };
      }

      return { success: false, error: 'Invalid login credentials.' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Authentication error.' };
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('trf_is_authenticated');
    } catch {}
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (!email || !email.trim()) {
      return { success: false, error: 'Please enter your corporate email address.' };
    }
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Database service is unavailable.' };
    }
    try {
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        (typeof window !== 'undefined' && window.location.origin ? window.location.origin : '');

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: siteUrl ? `${siteUrl.replace(/\/$/, '')}/` : undefined,
      });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to send reset link.' };
    }
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
        if (data.employeeId !== undefined) updatePayload.employee_id = data.employeeId;
        if (data.phone !== undefined) updatePayload.phone = data.phone;
        if (data.department) updatePayload.department = data.department;
        if (data.designation) updatePayload.designation = data.designation;
        if (data.birthDate) updatePayload.birth_date = data.birthDate;
        if (data.avatarUrl) updatePayload.avatar_url = data.avatarUrl;
        const { error: updErr } = await supabase.from('profiles').update(updatePayload).eq('id', userId);
        if (updErr && updErr.message?.includes('employee_id')) {
          delete updatePayload.employee_id;
          await supabase.from('profiles').update(updatePayload).eq('id', userId);
        }
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

    // If joining fee transaction is added, automatically mark the member as paid in state and Supabase profiles!
    if (data.category === 'joining_fee') {
      const targetMember = data.relatedMemberId
        ? members.find((m) => m.id === data.relatedMemberId)
        : members.find((m) => data.title.toLowerCase().includes(m.name.toLowerCase()));
      if (targetMember) {
        setMembers((prev) =>
          prev.map((m) => (m.id === targetMember.id ? { ...m, joiningFeeStatus: 'paid' } : m))
        );
        if (isSupabaseConfigured && supabase) {
          supabase
            .from('profiles')
            .update({ joining_fee_status: 'paid' })
            .eq('id', targetMember.id)
            .then();
        }
      }
    }

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
          related_member_id: data.relatedMemberId || (members.find((m) => data.title.toLowerCase().includes(m.name.toLowerCase()))?.id || null),
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
    employeeId: string;
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
        const siteUrl =
          process.env.NEXT_PUBLIC_SITE_URL ||
          (typeof window !== 'undefined' && window.location.origin ? window.location.origin : '');

        const { data: authData, error: authErr } = await supabase.auth.signUp({
          email: data.email.trim(),
          password: data.password,
          options: {
            emailRedirectTo: siteUrl ? `${siteUrl.replace(/\/$/, '')}/` : undefined,
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
      employeeId: data.employeeId.trim(),
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
        const profilePayload: Record<string, any> = {
          id: createdId,
          employee_id: data.employeeId ? data.employeeId.trim() : null,
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
        };

        const { error: insErr } = await supabase.from('profiles').insert([profilePayload]);
        if (insErr && insErr.message?.includes('employee_id')) {
          delete profilePayload.employee_id;
          await supabase.from('profiles').insert([profilePayload]);
        }
      } catch (e) {
        console.warn('Supabase profile sync note:', e);
      }
    }

    addNotification({
      title: 'New Member Provisioned',
      message: `${data.name} (${data.employeeId}) added as ${data.designation}.`,
      type: 'system',
      targetTab: 'members',
      actionLabel: 'View Team',
    });

    return { success: true };
  };

  const updateMemberJoiningFee = (memberId: string, status: 'paid' | 'pending' | 'waived') => {
    if (!isManager) return;
    const member = members.find((m) => m.id === memberId);
    if (!member) return;

    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, joiningFeeStatus: status } : m))
    );

    // Persist status change to Supabase profiles table
    if (isSupabaseConfigured && supabase) {
      supabase
        .from('profiles')
        .update({ joining_fee_status: status })
        .eq('id', memberId)
        .then(({ error }) => {
          if (error) console.log('Supabase profile joining fee sync note:', error.message);
        });
    }

    if (status === 'paid' && member.joiningFeeStatus !== 'paid') {
      const alreadyHasTx = transactions.some(
        (t) =>
          t.category === 'joining_fee' &&
          (t.relatedMemberId === memberId || t.title.toLowerCase().includes(member.name.toLowerCase()))
      );
      if (!alreadyHasTx) {
        addTransaction({
          title: `${member.name} - Joining Fee Contribution`,
          description: 'Mandatory initial TRF pool entry contribution',
          amount: member.joiningFeeAmount || 1000,
          type: 'inflow',
          category: 'joining_fee',
          date: new Date().toISOString().split('T')[0],
          relatedMemberId: memberId,
        });
      }

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
          member_id: member.id,
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

    const collectedDate = new Date().toISOString().split('T')[0];

    setTreatEvents((prev) =>
      prev.map((t) =>
        t.id === treatId
          ? { ...t, status: 'collected', collectedDate }
          : t
      )
    );

    if (isSupabaseConfigured && supabase) {
      supabase
        .from('member_treat_events')
        .update({ status: 'collected', collected_date: collectedDate })
        .eq('id', treatId)
        .then();
    }

    addTransaction({
      title: `${treat.ruleTitle} - ${treat.memberName}`,
      description: treat.details,
      amount: treat.amount,
      type: 'inflow',
      category: treat.ruleTitle.includes('Joining') ? 'joining_fee' : 'treat_event',
      date: collectedDate,
      relatedMemberId: treat.memberId,
    });

    addNotification({
      title: 'Contribution Collected',
      message: `Collected ${formatPKR(treat.amount)} for ${treat.ruleTitle} from ${treat.memberName}.`,
      type: 'due',
      targetTab: 'ledger',
      actionLabel: 'View Funds',
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

  const addVenue = async (data: {
    name: string;
    category: VenuePlace['category'];
    location: string;
    estimatedCostPerHead: number;
    description: string;
  }) => {
    let newId = `venue-${Date.now()}`;
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: inserted, error } = await supabase.from('venues').insert([
          {
            name: data.name,
            category: data.category,
            location: data.location,
            estimated_cost_per_head: data.estimatedCostPerHead,
            description: data.description,
            status: 'wishlist',
          }
        ]).select();
        if (inserted && inserted[0]) {
          newId = inserted[0].id;
        }
        if (error) console.log('Supabase venue insert note:', error.message);
      } catch (err) {
        console.warn('Supabase venue insert error:', err);
      }
    }

    const newVenue: VenuePlace = {
      id: newId,
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
  };

  const updateVenue = async (
    venueId: string,
    data: {
      name?: string;
      category?: VenuePlace['category'];
      location?: string;
      estimatedCostPerHead?: number;
      description?: string;
      status?: 'wishlist' | 'planned' | 'visited';
      rating?: number;
    }
  ) => {
    setVenues((prev) =>
      prev.map((v) => {
        if (v.id === venueId) {
          return {
            ...v,
            name: data.name !== undefined ? data.name : v.name,
            category: data.category !== undefined ? data.category : v.category,
            location: data.location !== undefined ? data.location : v.location,
            estimatedCostPerHead: data.estimatedCostPerHead !== undefined ? data.estimatedCostPerHead : v.estimatedCostPerHead,
            description: data.description !== undefined ? data.description : v.description,
            status: data.status !== undefined ? data.status : v.status,
            rating: data.rating !== undefined ? data.rating : v.rating,
          };
        }
        return v;
      })
    );

    if (isSupabaseConfigured && supabase) {
      try {
        const payload: Record<string, any> = {};
        if (data.name !== undefined) payload.name = data.name;
        if (data.category !== undefined) payload.category = data.category;
        if (data.location !== undefined) payload.location = data.location;
        if (data.estimatedCostPerHead !== undefined) payload.estimated_cost_per_head = data.estimatedCostPerHead;
        if (data.description !== undefined) payload.description = data.description;
        if (data.status !== undefined) payload.status = data.status;
        if (data.rating !== undefined) payload.rating = data.rating;
        await supabase.from('venues').update(payload).eq('id', venueId);
      } catch (err) {
        console.warn('Supabase venue update note:', err);
      }
    }
  };

  const deleteVenue = async (venueId: string) => {
    setVenues((prev) => prev.filter((v) => v.id !== venueId));
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('venues').delete().eq('id', venueId);
      } catch (err) {
        console.warn('Supabase venue delete note:', err);
      }
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

  const createPlannedActivity = async (data: {
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

    let newId = `act-${Date.now()}`;
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: inserted, error } = await supabase.from('planned_activities').insert([
          {
            title: data.title,
            venue_name: data.venueName,
            venue_id: data.venueId || null,
            date: data.date,
            time: data.time || '7:30 PM',
            estimated_total_budget: data.estimatedTotalBudget,
            trf_contribution_share: data.trfContributionShare,
            personal_contribution_per_head: personalShare,
            status: 'voting',
            description: data.description,
          }
        ]).select();
        if (inserted && inserted[0]) {
          newId = inserted[0].id;
        }
        if (error) console.log('Supabase activity insert note:', error.message);
      } catch (err) {
        console.warn('Supabase activity insert note:', err);
      }
    }

    const newActivity: PlannedActivity = {
      id: newId,
      title: data.title,
      venueName: data.venueName,
      venueId: data.venueId,
      date: data.date,
      time: data.time || '7:30 PM',
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

  const updatePlannedActivity = async (
    activityId: string,
    data: {
      title?: string;
      venueName?: string;
      venueId?: string;
      date?: string;
      time?: string;
      estimatedTotalBudget?: number;
      trfContributionShare?: number;
      status?: 'voting' | 'confirmed' | 'completed' | 'cancelled';
      description?: string;
    }
  ) => {
    setPlannedActivities((prev) =>
      prev.map((act) => {
        if (act.id === activityId) {
          const newTotal = data.estimatedTotalBudget !== undefined ? data.estimatedTotalBudget : act.estimatedTotalBudget;
          const newTrf = data.trfContributionShare !== undefined ? data.trfContributionShare : act.trfContributionShare;
          const remainingBudget = Math.max(0, newTotal - newTrf);
          const personalShare = activeHeadcount > 0 ? Math.round(remainingBudget / activeHeadcount) : 0;

          return {
            ...act,
            title: data.title !== undefined ? data.title : act.title,
            venueName: data.venueName !== undefined ? data.venueName : act.venueName,
            venueId: data.venueId !== undefined ? data.venueId : act.venueId,
            date: data.date !== undefined ? data.date : act.date,
            time: data.time !== undefined ? data.time : act.time,
            estimatedTotalBudget: newTotal,
            trfContributionShare: newTrf,
            personalContributionPerHead: personalShare,
            status: data.status !== undefined ? data.status : act.status,
            description: data.description !== undefined ? data.description : act.description,
          };
        }
        return act;
      })
    );

    if (isSupabaseConfigured && supabase) {
      try {
        const payload: Record<string, any> = {};
        if (data.title !== undefined) payload.title = data.title;
        if (data.venueName !== undefined) payload.venue_name = data.venueName;
        if (data.venueId !== undefined) payload.venue_id = data.venueId || null;
        if (data.date !== undefined) payload.date = data.date;
        if (data.time !== undefined) payload.time = data.time;
        if (data.estimatedTotalBudget !== undefined) payload.estimated_total_budget = data.estimatedTotalBudget;
        if (data.trfContributionShare !== undefined) payload.trf_contribution_share = data.trfContributionShare;
        if (data.status !== undefined) payload.status = data.status;
        if (data.description !== undefined) payload.description = data.description;
        if (data.estimatedTotalBudget !== undefined || data.trfContributionShare !== undefined) {
          const act = plannedActivities.find((a) => a.id === activityId);
          const total = data.estimatedTotalBudget !== undefined ? data.estimatedTotalBudget : (act?.estimatedTotalBudget || 0);
          const trf = data.trfContributionShare !== undefined ? data.trfContributionShare : (act?.trfContributionShare || 0);
          const rem = Math.max(0, total - trf);
          payload.personal_contribution_per_head = activeHeadcount > 0 ? Math.round(rem / activeHeadcount) : 0;
        }

        await supabase.from('planned_activities').update(payload).eq('id', activityId);
      } catch (err) {
        console.warn('Supabase activity update note:', err);
      }
    }
  };

  const completePlannedActivity = async (data: {
    activityId: string;
    finalBillAmount: number;
    splitShortfallWithMembers?: boolean;
  }): Promise<{ success: boolean; shortfall?: number; perMemberShare?: number }> => {
    const act = plannedActivities.find((a) => a.id === data.activityId);
    if (!act) return { success: false };

    const bill = Math.max(0, Number(data.finalBillAmount || 0));
    const previousBalance = currentBalance;
    const hasShortfall = bill > previousBalance;
    const shortfall = hasShortfall ? bill - previousBalance : 0;

    const activeMembers = members.filter((m) => m.isActive);
    const memberCount = Math.max(1, activeMembers.length);
    const perMemberShare = hasShortfall && data.splitShortfallWithMembers
      ? Math.ceil(shortfall / memberCount)
      : undefined;

    // 1. Deduct bill amount from pool by recording an Outflow Transaction
    const txId = `tx-outing-${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];
    const newTx: Transaction = {
      id: txId,
      title: `Outing Settlement: ${act.title}`,
      description: `Settled outing bill at ${act.venueName}. Total bill: PKR ${bill.toLocaleString()}${hasShortfall && data.splitShortfallWithMembers ? ` (Shortfall of PKR ${shortfall.toLocaleString()} split among ${memberCount} members @ PKR ${perMemberShare?.toLocaleString()}/head)` : ''}`,
      amount: bill,
      type: 'outflow',
      category: 'activity_outing',
      date: today,
      loggedBy: currentUser.name || 'TRF Custodian',
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [newTx, ...prev]);

    if (isSupabaseConfigured && supabase) {
      try {
        supabase.from('transactions').insert([{
          id: txId,
          title: newTx.title,
          description: newTx.description,
          amount: newTx.amount,
          type: 'outflow',
          category: 'activity_outing',
          date: today,
        }]).then();
      } catch (e) {
        console.warn('Supabase outing tx note:', e);
      }
    }

    // 2. If shortfall and option checked, equally divide remaining amount to all members as pending dues
    if (hasShortfall && data.splitShortfallWithMembers && perMemberShare) {
      const newDues: MemberTreatEvent[] = activeMembers.map((m, idx) => ({
        id: `due-outing-${Date.now()}-${idx}`,
        memberId: m.id,
        memberName: m.name,
        ruleTitle: `Outing Shortfall Share: ${act.title}`,
        details: `Shortfall recovery for ${act.venueName} (Pool was: PKR ${previousBalance.toLocaleString()}, Bill: PKR ${bill.toLocaleString()})`,
        amount: perMemberShare,
        date: today,
        status: 'pending',
      }));

      setTreatEvents((prev) => [...newDues, ...prev]);

      if (isSupabaseConfigured && supabase) {
        try {
          const duesPayload = newDues.map((d) => ({
            id: d.id,
            member_id: d.memberId,
            member_name: d.memberName,
            rule_title: d.ruleTitle,
            details: d.details,
            amount: d.amount,
            date: d.date,
            status: 'pending',
          }));
          supabase.from('member_treat_events').insert(duesPayload).then();
        } catch (e) {
          console.warn('Supabase outing dues note:', e);
        }
      }
    }

    // 3. Update activity status to 'completed'
    setPlannedActivities((prev) =>
      prev.map((a) =>
        a.id === data.activityId
          ? {
              ...a,
              status: 'completed',
              actualBillAmount: bill,
              shortfallPerHead: perMemberShare,
            }
          : a
      )
    );

    if (isSupabaseConfigured && supabase) {
      try {
        supabase.from('planned_activities').update({
          status: 'completed',
        }).eq('id', data.activityId).then();
      } catch (e) {
        console.warn('Supabase outing status note:', e);
      }
    }

    addNotification({
      title: `Outing Settled: ${act.title}`,
      message: `Bill of ${formatPKR(bill)} settled and deducted from TRF pool.${hasShortfall && data.splitShortfallWithMembers ? ` Remaining ${formatPKR(shortfall)} divided across active members (${formatPKR(perMemberShare || 0)}/head).` : ''}`,
      type: 'outing',
      targetTab: 'activities-venues',
      actionLabel: 'View Outing',
    });

    triggerCelebration();

    return {
      success: true,
      shortfall: hasShortfall ? shortfall : 0,
      perMemberShare,
    };
  };

  const deletePlannedActivity = async (activityId: string) => {
    setPlannedActivities((prev) => prev.filter((act) => act.id !== activityId));
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('planned_activities').delete().eq('id', activityId);
      } catch (err) {
        console.warn('Supabase activity delete note:', err);
      }
    }
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
    setDirectMessages(INITIAL_DIRECT_MESSAGES);
    setCurrentUserId('user-1');
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(DM_STORAGE_KEY);
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
        resetPassword,
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
        updateVenue,
        deleteVenue,
        toggleVenueVote,
        createPlannedActivity,
        updatePlannedActivity,
        completePlannedActivity,
        deletePlannedActivity,
        updateRSVP,
        // Direct Messages
        directMessages,
        activeChatUserId,
        setActiveChatUserId,
        sendDirectMessage,
        markDirectMessagesAsRead,
        unreadDirectMessagesCount,
        // Notifications
        notifications,
        unreadNotificationsCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        clearAllNotifications,
        addNotification,
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
