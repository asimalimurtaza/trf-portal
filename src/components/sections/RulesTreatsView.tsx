'use client';

import React from 'react';
import { useTRF } from '@/context/TRFContext';
import { formatPKR, formatDate } from '@/lib/utils';
import {
  Gift,
  Plus,
  Smartphone,
  TrendingUp,
  Heart,
  Award,
  AlertCircle,
  CheckCircle2,
  Clock,
  UserPlus
} from 'lucide-react';

interface RulesTreatsViewProps {
  onOpenNewTreat: () => void;
}

export function RulesTreatsView({ onOpenNewTreat }: RulesTreatsViewProps) {
  const { rules, treatEvents, isManager, collectTreatPayment, pendingMemberDuesAmount } = useTRF();

  const getRuleIcon = (iconName: string) => {
    switch (iconName) {
      case 'Smartphone':
        return <Smartphone className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
      case 'TrendingUp':
        return <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      case 'Heart':
        return <Heart className="h-4 w-4 text-rose-600 dark:text-rose-400" />;
      case 'Award':
        return <Award className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
      case 'UserPlus':
        return <UserPlus className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Gift className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            Contribution Rules & Treat Registry
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Milestone treats (smartphones, appraisals, weddings) and penalty contributions.
          </p>
        </div>

        <button
          onClick={onOpenNewTreat}
          className="rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2 text-xs font-bold text-white shadow-xs transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Declare Treat</span>
        </button>
      </div>

      {/* Rules Catalog Grid */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Guidelines
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                    {getRuleIcon(rule.icon)}
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                      rule.isMandatory
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
                        : 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20'
                    }`}
                  >
                    {rule.isMandatory ? 'Mandatory' : 'Treat'}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2.5">{rule.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {rule.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Suggested:</span>
                <span className="font-extrabold text-purple-600 dark:text-purple-300">
                  {formatPKR(rule.suggestedAmount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Logged Treat Contributions Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Recent Treat Declarations
          </h3>
          {pendingMemberDuesAmount > 0 && (
            <div className="rounded-full bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 text-xs text-purple-600 dark:text-purple-300 font-semibold">
              Pending: {formatPKR(pendingMemberDuesAmount)}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/70 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Member</th>
                  <th className="px-5 py-3.5 font-semibold">Occasion</th>
                  <th className="px-5 py-3.5 font-semibold">Amount (PKR)</th>
                  <th className="px-5 py-3.5 font-semibold">Date</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  {isManager && <th className="px-5 py-3.5 font-semibold text-right">Collection</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {treatEvents.map((treat) => (
                  <tr key={treat.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap font-bold text-slate-900 dark:text-white">
                      {treat.memberName}
                    </td>

                    <td className="px-5 py-3.5 max-w-sm">
                      <div className="font-semibold text-purple-600 dark:text-purple-300">
                        {treat.ruleTitle}
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">
                        {treat.details}
                      </div>
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap font-bold text-emerald-600 dark:text-emerald-400">
                      +{formatPKR(treat.amount)}
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap text-slate-500 dark:text-slate-400">
                      {formatDate(treat.date)}
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {treat.status === 'collected' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="h-3 w-3" /> Collected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse">
                          <Clock className="h-3 w-3" /> Pending
                        </span>
                      )}
                    </td>

                    {isManager && (
                      <td className="px-5 py-3.5 whitespace-nowrap text-right">
                        {treat.status === 'pending' ? (
                          <button
                            onClick={() => collectTreatPayment(treat.id)}
                            className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-2.5 py-1 text-xs font-bold text-white shadow-xs transition-colors"
                          >
                            Mark Collected
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">Received ✓</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
