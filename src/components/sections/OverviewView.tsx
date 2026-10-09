'use client';

import React from 'react';
import { StatCards } from '@/components/dashboard/StatCards';
import { NavTab } from '@/components/layout/Sidebar';
import { useTRF } from '@/context/TRFContext';
import { formatPKR, formatDate } from '@/lib/utils';
import { 
  FileCheck2, 
  ArrowRight, 
  Cake, 
  Compass, 
  Gift, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles
} from 'lucide-react';
import { useCurrentDate } from '@/hooks/useCurrentDate';
import { getBirthdayCountdown } from '@/lib/utils';

interface OverviewViewProps {
  onNavigateTab: (tab: NavTab) => void;
  onOpenNewTransaction: () => void;
  onOpenNewClaim: () => void;
  onOpenNewTreat: () => void;
}

export function OverviewView({
  onNavigateTab,
  onOpenNewTransaction,
  onOpenNewClaim,
  onOpenNewTreat,
}: OverviewViewProps) {
  const { 
    claims, 
    transactions, 
    members, 
    venues, 
    treatEvents, 
    isManager, 
    updateClaimStatus,
    triggerCelebration 
  } = useTRF();

  const currentDate = useCurrentDate();
  const latestClaim = claims[0];
  const recentTransactions = transactions.slice(0, 5);

  // Find next upcoming birthday
  const sortedMembers = [...members]
    .map((m) => ({ member: m, countdown: getBirthdayCountdown(m.birthDate, currentDate) }))
    .sort((a, b) => a.countdown.daysLeft - b.countdown.daysLeft);
  const nextBirthday = sortedMembers[0];

  // Top voted venue
  const topVenue = [...venues].sort((a, b) => b.votes.length - a.votes.length)[0];

  // Latest treat
  const latestTreat = treatEvents[0];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Dashboard</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Team Recreational Funds summary & audit claim status
          </p>
        </div>
      </div>

      {/* 3 Core Metric Cards */}
      <StatCards />

      {/* Active Monthly Audit Claim Status Banner */}
      {latestClaim && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${
              latestClaim.status === 'submitted'
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            }`}>
              <FileCheck2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {latestClaim.monthYear} Claim: {formatPKR(latestClaim.totalAmount)}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  latestClaim.status === 'submitted'
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                }`}>
                  {latestClaim.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {latestClaim.headcount} team heads @ 1,400 PKR • {latestClaim.claimRefNumber || 'TRF-AUD'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {isManager && latestClaim.status === 'submitted' && (
              <button
                onClick={() => updateClaimStatus(latestClaim.id, 'approved_disbursed')}
                className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white transition-colors"
              >
                Mark Disbursed
              </button>
            )}
            <button
              onClick={() => onNavigateTab('audit-claims')}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 font-medium px-2 py-1"
            >
              <span>View Claims</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Recent Activity & Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Recent Ledger Activity */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Transactions</h3>
            <button
              onClick={() => onNavigateTab('ledger')}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-medium flex items-center gap-1"
            >
              <span>Full Ledger</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/60 mt-2">
            {recentTransactions.map((tx) => {
              const isInflow = tx.type === 'inflow';
              return (
                <div key={tx.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-1.5 rounded-lg flex-shrink-0 ${
                      isInflow ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    }`}>
                      {isInflow ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{tx.title}</div>
                      <div className="text-[10px] text-slate-500">{formatDate(tx.date)} • by {tx.loggedBy}</div>
                    </div>
                  </div>
                  <div className={`text-xs font-bold whitespace-nowrap ${
                    isInflow ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {isInflow ? '+' : '-'}{formatPKR(tx.amount)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (1 Col): Focused Quick Highlights */}
        <div className="space-y-4">
          {/* Next Birthday */}
          {nextBirthday && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="flex items-center gap-1.5 font-semibold text-pink-500 dark:text-pink-400">
                  <Cake className="h-3.5 w-3.5" /> Next Birthday
                </span>
                <button
                  onClick={() => onNavigateTab('birthdays')}
                  className="text-[11px] text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  All
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{nextBirthday.member.name}</div>
                  <div className="text-[11px] text-pink-600 dark:text-pink-300">
                    {nextBirthday.countdown.isToday ? 'Today! 🎉' : `In ${nextBirthday.countdown.daysLeft} days`}
                  </div>
                </div>
                <button
                  onClick={triggerCelebration}
                  className="p-1.5 rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400 hover:bg-pink-500/20 transition-colors"
                  title="Celebrate!"
                >
                  <Sparkles className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Top Voted Venue */}
          {topVenue && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="flex items-center gap-1.5 font-semibold text-cyan-600 dark:text-cyan-400">
                  <Compass className="h-3.5 w-3.5" /> Top Voted Place
                </span>
                <button
                  onClick={() => onNavigateTab('activities-venues')}
                  className="text-[11px] text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  Vote
                </button>
              </div>
              <div className="mt-3">
                <div className="text-xs font-bold text-slate-900 dark:text-white">{topVenue.name}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {topVenue.votes.length} Votes • ~{formatPKR(topVenue.estimatedCostPerHead)} / head
                </div>
              </div>
            </div>
          )}

          {/* Latest Milestone Treat */}
          {latestTreat && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="flex items-center gap-1.5 font-semibold text-purple-600 dark:text-purple-400">
                  <Gift className="h-3.5 w-3.5" /> Latest Treat
                </span>
                <button
                  onClick={() => onNavigateTab('rules-treats')}
                  className="text-[11px] text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  Treats
                </button>
              </div>
              <div className="mt-3">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {latestTreat.memberName}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {latestTreat.ruleTitle} ({formatPKR(latestTreat.amount)})
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
