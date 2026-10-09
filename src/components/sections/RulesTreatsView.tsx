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
  Sparkles,
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
        return <Smartphone className="h-5 w-5 text-purple-400" />;
      case 'TrendingUp':
        return <TrendingUp className="h-5 w-5 text-emerald-400" />;
      case 'Heart':
        return <Heart className="h-5 w-5 text-rose-400" />;
      case 'Award':
        return <Award className="h-5 w-5 text-amber-400" />;
      case 'UserPlus':
        return <UserPlus className="h-5 w-5 text-cyan-400" />;
      default:
        return <AlertCircle className="h-5 w-5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Gift className="h-6 w-6 text-purple-400" />
            Contribution Rules & Treat Registry
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Rules governing milestone treats (new phones, promotions, weddings) and penalty contributions.
          </p>
        </div>

        <button
          onClick={onOpenNewTreat}
          className="rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2 text-xs font-bold text-white shadow-lg transition-all flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>Declare Treat / Contribution</span>
        </button>
      </div>

      {/* Rules Catalog Grid */}
      <div>
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
          Established Team Guidelines
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 hover:border-purple-500/30 transition-all shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60">
                    {getRuleIcon(rule.icon)}
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                      rule.isMandatory
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                        : 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                    }`}
                  >
                    {rule.isMandatory ? 'Mandatory Rule' : 'Celebratory Treat'}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white mt-3">{rule.title}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {rule.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500">Suggested Contribution:</span>
                <span className="font-extrabold text-purple-300">
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
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Recent Treat Declarations
            </h3>
            <p className="text-xs text-slate-400">
              Contributions declared by teammates awaiting TRF Manager collection.
            </p>
          </div>
          {pendingMemberDuesAmount > 0 && (
            <div className="rounded-full bg-purple-500/10 border border-purple-500/30 px-3 py-1 text-xs text-purple-300 font-semibold">
              Pending Collection: {formatPKR(pendingMemberDuesAmount)}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Member</th>
                  <th className="px-5 py-3.5 font-semibold">Occasion & Details</th>
                  <th className="px-5 py-3.5 font-semibold">Amount (PKR)</th>
                  <th className="px-5 py-3.5 font-semibold">Date</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  {isManager && <th className="px-5 py-3.5 font-semibold text-right">Collection</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {treatEvents.map((treat) => (
                  <tr key={treat.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Member */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="font-bold text-white">{treat.memberName}</span>
                    </td>

                    {/* Occasion & Details */}
                    <td className="px-5 py-4 max-w-sm">
                      <div className="font-semibold text-purple-300">
                        {treat.ruleTitle}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                        {treat.details}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="font-bold text-sm text-emerald-400">
                        +{formatPKR(treat.amount)}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 whitespace-nowrap text-slate-400">
                      {formatDate(treat.date)}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      {treat.status === 'collected' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="h-3 w-3" /> Collected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-400 border border-amber-500/20 animate-pulse">
                          <Clock className="h-3 w-3" /> Pending Payment
                        </span>
                      )}
                    </td>

                    {/* Manager Collection Action */}
                    {isManager && (
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        {treat.status === 'pending' ? (
                          <button
                            onClick={() => collectTreatPayment(treat.id)}
                            className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors"
                            title="Confirm cash or transfer received and credit pool"
                          >
                            Mark Collected
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-500">Received</span>
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
