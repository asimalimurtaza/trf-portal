'use client';

import React from 'react';
import { useTRF } from '@/context/TRFContext';
import { formatPKR } from '@/lib/utils';
import { 
  Wallet, 
  Building2, 
  ArrowDownRight, 
  Clock, 
  TrendingUp, 
  Users,
  AlertCircle
} from 'lucide-react';

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

  const currentMonthlyAllowancePool = activeHeadcount * monthlyPerHeadRate;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Current Collective Pool Balance */}
      <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-emerald-950/20 p-5 shadow-lg backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Wallet className="h-16 w-16 text-emerald-400" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Collective Balance</span>
          <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="h-3 w-3" /> Live Pool
          </span>
        </div>
        <div className="mt-3">
          <div className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            {formatPKR(currentBalance)}
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
            <span className="text-emerald-400 font-semibold">+{formatPKR(totalInflow, false)} in</span>
            <span>•</span>
            <span className="text-rose-400 font-semibold">-{formatPKR(totalOutflow, false)} out</span>
          </div>
        </div>
      </div>

      {/* 2. Monthly Company Allowance */}
      <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-cyan-950/20 p-5 shadow-lg backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Building2 className="h-16 w-16 text-cyan-400" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Monthly Company TRF</span>
          <span className="flex items-center gap-1 rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-500/20">
            <Users className="h-3 w-3" /> {activeHeadcount} Heads
          </span>
        </div>
        <div className="mt-3">
          <div className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            {formatPKR(currentMonthlyAllowancePool)}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Rate: <strong className="text-cyan-300 font-medium">{formatPKR(monthlyPerHeadRate)}</strong> / head / month
          </div>
        </div>
      </div>

      {/* 3. Total Outflows / Spending */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <ArrowDownRight className="h-16 w-16 text-rose-400" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Total Spent</span>
          <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-400 border border-rose-500/20">
            Recreational
          </span>
        </div>
        <div className="mt-3">
          <div className="text-2xl lg:text-3xl font-extrabold text-rose-300 tracking-tight">
            {formatPKR(totalOutflow)}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Dinners, bowling, cakes & outings
          </div>
        </div>
      </div>

      {/* 4. Pending Claims & Dues */}
      <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-amber-950/20 p-5 shadow-lg backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Clock className="h-16 w-16 text-amber-400" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Pending Inflows</span>
          <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/20">
            <AlertCircle className="h-3 w-3" /> Audit & Dues
          </span>
        </div>
        <div className="mt-3">
          <div className="text-2xl lg:text-3xl font-extrabold text-amber-300 tracking-tight">
            {formatPKR(pendingAuditAmount + pendingMemberDuesAmount)}
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
            <span>Audit: <strong className="text-amber-300">{formatPKR(pendingAuditAmount, false)}</strong></span>
            <span>•</span>
            <span>Dues: <strong className="text-purple-300">{formatPKR(pendingMemberDuesAmount, false)}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
