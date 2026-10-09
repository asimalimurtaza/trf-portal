'use client';

import React from 'react';
import { StatCards } from '@/components/dashboard/StatCards';
import { AuditClaimBanner } from '@/components/dashboard/AuditClaimBanner';
import { UpcomingBirthdaysWidget } from '@/components/dashboard/UpcomingBirthdaysWidget';
import { PopularVenuesWidget } from '@/components/dashboard/PopularVenuesWidget';
import { RecentTransactionsWidget } from '@/components/dashboard/RecentTransactionsWidget';
import { NavTab } from '@/components/layout/Sidebar';
import { useTRF } from '@/context/TRFContext';
import { formatPKR } from '@/lib/utils';
import { ShieldAlert, Sparkles, Building2, Gift } from 'lucide-react';

interface OverviewViewProps {
  onNavigateTab: (tab: NavTab) => void;
  onOpenNewTransaction: () => void;
  onOpenNewClaim: () => void;
  onOpenNewTreat: () => void;
  onOpenAddVenue: () => void;
}

export function OverviewView({
  onNavigateTab,
  onOpenNewTransaction,
  onOpenNewClaim,
  onOpenNewTreat,
  onOpenAddVenue,
}: OverviewViewProps) {
  const { isManager, pendingMemberDuesAmount, pendingAuditAmount } = useTRF();

  return (
    <div className="space-y-6">
      {/* Page Title & Manager Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Team Recreational Funds Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time pool tracking, monthly audit claims, birthday celebrations & team outings.
          </p>
        </div>

        {/* Manager Mode Indicator */}
        {isManager ? (
          <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 text-xs text-amber-300">
            <ShieldAlert className="h-4 w-4" />
            <span>You have <strong>TRF Manager Admin</strong> privileges.</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-1.5 text-xs text-slate-400">
            <span>Viewing as <strong>Team Member</strong> (Read-only financials).</span>
          </div>
        )}
      </div>

      {/* High impact financial stat cards */}
      <StatCards />

      {/* Monthly Audit Claim status banner */}
      <AuditClaimBanner
        onOpenNewClaim={onOpenNewClaim}
        onNavigateToClaims={() => onNavigateTab('audit-claims')}
      />

      {/* Quick Action Cards Grid for Members & Managers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={onOpenNewTreat}
          className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-slate-900/90 to-purple-950/20 p-4 text-left hover:border-purple-500/40 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="p-2 rounded-xl bg-purple-500/20 text-purple-300 group-hover:scale-105 transition-transform">
              <Gift className="h-5 w-5" />
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400">
              Contribute
            </span>
          </div>
          <h4 className="text-sm font-bold text-white mt-3">Treat Declaration</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Bought a phone, car, or got promoted? Declare your treat pool share.
          </p>
        </button>

        <button
          onClick={onOpenAddVenue}
          className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/90 to-cyan-950/20 p-4 text-left hover:border-cyan-500/40 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400">
              Hangouts
            </span>
          </div>
          <h4 className="text-sm font-bold text-white mt-3">Suggest Hangout Spot</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Propose restaurants, gaming arcades or retreats for team voting.
          </p>
        </button>

        <button
          onClick={() => onNavigateTab('audit-claims')}
          className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-slate-900/90 to-emerald-950/20 p-4 text-left hover:border-emerald-500/40 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 group-hover:scale-105 transition-transform">
              <Building2 className="h-5 w-5" />
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
              Audit Pipeline
            </span>
          </div>
          <h4 className="text-sm font-bold text-white mt-3">Monthly Audit Claims</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Track 1,400 PKR/head allowance status submitted to internal audit.
          </p>
        </button>
      </div>

      {/* 2-Column Split: Widgets and Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols on lg): Recent Transactions Ledger */}
        <div className="lg:col-span-2 space-y-6">
          <RecentTransactionsWidget
            onNavigateToLedger={() => onNavigateTab('ledger')}
            onOpenNewTransaction={onOpenNewTransaction}
          />
        </div>

        {/* Right Column (1 Col on lg): Upcoming Birthdays & Venues */}
        <div className="space-y-6">
          <UpcomingBirthdaysWidget
            onNavigateToBirthdays={() => onNavigateTab('birthdays')}
          />
          <PopularVenuesWidget
            onNavigateToVenues={() => onNavigateTab('activities-venues')}
            onOpenAddVenue={onOpenAddVenue}
          />
        </div>
      </div>
    </div>
  );
}
