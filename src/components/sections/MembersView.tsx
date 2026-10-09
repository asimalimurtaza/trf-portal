'use client';

import React from 'react';
import { useTRF } from '@/context/TRFContext';
import { formatPKR, formatDate } from '@/lib/utils';
import {
  Users,
  UserPlus,
  ShieldCheck,
  User,
  CheckCircle2,
  Clock,
  Cake,
  Mail,
  Phone,
  CreditCard
} from 'lucide-react';

interface MembersViewProps {
  onOpenAddMember: () => void;
}

export function MembersView({ onOpenAddMember }: MembersViewProps) {
  const { members, isManager, updateMemberJoiningFee, activeHeadcount } = useTRF();

  const pendingJoiningCount = members.filter((m) => m.joiningFeeStatus === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Title & Add Member */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Users className="h-6 w-6 text-emerald-400" />
            Team Roster & Joining Fees
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {activeHeadcount} active team members contributing to the monthly TRF pool allowance.
          </p>
        </div>

        {isManager && (
          <button
            onClick={onOpenAddMember}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-lg transition-all flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Team Member</span>
          </button>
        )}
      </div>

      {/* Joining Fee Policy Banner */}
      <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-slate-900 via-emerald-950/20 to-slate-900 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">New Member Joining Fee Requirement</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Standard joining contribution is <strong>PKR 1,000</strong> per new teammate upon onboarding.
            </p>
          </div>
        </div>

        {pendingJoiningCount > 0 && (
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 text-xs text-amber-300 font-bold flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>{pendingJoiningCount} Pending Joining Dues</span>
          </div>
        )}
      </div>

      {/* Members Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {members.map((member) => {
          const isPendingFee = member.joiningFeeStatus === 'pending';
          const isPaidFee = member.joiningFeeStatus === 'paid';

          return (
            <div
              key={member.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={member.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={member.name}
                      className="h-12 w-12 rounded-xl object-cover border border-slate-700 shadow-md"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white">{member.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{member.designation}</p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold border flex items-center gap-1 ${
                      member.role === 'manager'
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {member.role === 'manager' ? (
                      <>
                        <ShieldCheck className="h-3 w-3" /> TRF Manager
                      </>
                    ) : (
                      <>
                        <User className="h-3 w-3" /> Member
                      </>
                    )}
                  </span>
                </div>

                {/* Details list */}
                <div className="mt-4 space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3 text-slate-500" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Cake className="h-3 w-3 text-pink-400" />
                    <span>Birthday: {formatDate(member.birthDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-mono uppercase">Joined:</span>
                    <span>{formatDate(member.joiningDate)}</span>
                  </div>
                </div>
              </div>

              {/* Joining Fee Status Footer */}
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">
                    Joining Fee (1,000 PKR)
                  </div>
                  <div className="mt-1">
                    {isPaidFee ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Paid & Verified
                      </span>
                    ) : isPendingFee ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400">
                        <Clock className="h-3.5 w-3.5 animate-pulse" /> Pending Payment
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">Waived</span>
                    )}
                  </div>
                </div>

                {/* Manager Action to Verify Joining Fee */}
                {isManager && isPendingFee && (
                  <button
                    onClick={() => updateMemberJoiningFee(member.id, 'paid')}
                    className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-colors"
                    title="Mark joining fee collected into TRF pool"
                  >
                    Mark Paid
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
