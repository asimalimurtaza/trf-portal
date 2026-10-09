'use client';

import React from 'react';
import { useTRF } from '@/context/TRFContext';
import { formatPKR, formatDate } from '@/lib/utils';
import { Users, UserPlus, CheckCircle2, Clock, ShieldCheck, User } from 'lucide-react';

interface MembersViewProps {
  onOpenAddMember: () => void;
}

export function MembersView({ onOpenAddMember }: MembersViewProps) {
  const { members, isManager, updateMemberJoiningFee, activeHeadcount } = useTRF();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Team Roster & Joining Fees
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {activeHeadcount} active team members. Joining fee is 1,000 PKR per new member.
          </p>
        </div>

        {isManager && (
          <button
            onClick={onOpenAddMember}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-xs transition-all flex items-center gap-2 self-start sm:self-auto"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Member</span>
          </button>
        )}
      </div>

      {/* Clean Members Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/70 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Member</th>
                <th className="px-5 py-3.5 font-semibold">Department</th>
                <th className="px-5 py-3.5 font-semibold">Role</th>
                <th className="px-5 py-3.5 font-semibold">Birthday</th>
                <th className="px-5 py-3.5 font-semibold">Joining Fee</th>
                {isManager && <th className="px-5 py-3.5 font-semibold text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              {members.map((member) => {
                const isPaid = member.joiningFeeStatus === 'paid';
                const isPending = member.joiningFeeStatus === 'pending';

                return (
                  <tr key={member.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                    {/* Member */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={member.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={member.name}
                          className="h-8 w-8 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                        />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{member.name}</div>
                          <div className="text-[11px] text-slate-500">{member.designation}</div>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-slate-500 dark:text-slate-400">
                      {member.department}
                    </td>

                    {/* Role */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        member.role === 'manager'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
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
                    </td>

                    {/* Birthday */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-slate-500 dark:text-slate-400">
                      {formatDate(member.birthDate)}
                    </td>

                    {/* Joining Fee Status */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {isPaid ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Paid (1,000 PKR)
                        </span>
                      ) : isPending ? (
                        <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                          <Clock className="h-3.5 w-3.5 animate-pulse" /> Pending (1,000 PKR)
                        </span>
                      ) : (
                        <span className="text-slate-400">Waived</span>
                      )}
                    </td>

                    {/* Action */}
                    {isManager && (
                      <td className="px-5 py-3.5 whitespace-nowrap text-right">
                        {isPending && (
                          <button
                            onClick={() => updateMemberJoiningFee(member.id, 'paid')}
                            className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-2.5 py-1 text-xs font-bold text-white shadow-xs transition-colors"
                          >
                            Mark Paid
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
