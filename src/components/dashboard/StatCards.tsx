'use client';

import React from 'react';
import { useTRF } from '@/context/TRFContext';
import { formatPKR } from '@/lib/utils';
import { Wallet, Building2, Clock } from 'lucide-react';

export function StatCards() {
  const { 
    currentBalance, 
    totalInflow, 
    totalOutflow, 
    activeHeadcount, 
    monthlyPerHeadRate,
    pendingAuditAmount,
    pendingMemberDuesAmount 
  } = useTRF();

  const monthlyAllowancePool = activeHeadcount * monthlyPerHeadRate;
  const totalPending = pendingAuditAmount + pendingMemberDuesAmount;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* 1. Collective Pool Balance */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">Total Collective Balance</span>
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Wallet className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {formatPKR(currentBalance)}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
            <span className="text-emerald-400 font-semibold">+{formatPKR(totalInflow, false)} in</span>
            <span>•</span>
            <span className="text-rose-400 font-semibold">-{formatPKR(totalOutflow, false)} out</span>
          </div>
        </div>
      </div>

      {/* 2. Monthly Company Allowance */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">Monthly Company Fund</span>
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Building2 className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {formatPKR(monthlyAllowancePool)}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {activeHeadcount} Active Heads × {formatPKR(monthlyPerHeadRate)} / month
          </div>
        </div>
      </div>

      {/* 3. Pending Inflows */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">Pending Inflows</span>
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
            <Clock className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 tracking-tight">
            {formatPKR(totalPending)}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
            <span>Audit: <strong className="text-slate-300">{formatPKR(pendingAuditAmount, false)}</strong></span>
            <span>•</span>
            <span>Dues: <strong className="text-slate-300">{formatPKR(pendingMemberDuesAmount, false)}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
