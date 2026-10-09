'use client';

import React from 'react';
import { useTRF } from '@/context/TRFContext';
import { formatPKR } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

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
    <motion.div 
      initial={{ opacity: 0, y: 6 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.2 }}
      className="grid grid-cols-1 sm:grid-cols-3 gap-4"
    >
      {/* 1. Collective Balance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Collective Balance
          </CardTitle>
          <span className="text-[11px] font-mono text-zinc-400">LIVE</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight font-mono">
            {formatPKR(currentBalance)}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span>+{formatPKR(totalInflow, false)} in</span>
            <span>•</span>
            <span>-{formatPKR(totalOutflow, false)} out</span>
          </div>
        </CardContent>
      </Card>

      {/* 2. Monthly Company Allowance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Monthly Company TRF
          </CardTitle>
          <span className="text-[11px] font-mono text-zinc-400">1,400 / HEAD</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight font-mono">
            {formatPKR(monthlyAllowancePool)}
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {activeHeadcount} Active Heads × {formatPKR(monthlyPerHeadRate)}
          </p>
        </CardContent>
      </Card>

      {/* 3. Pending Inflows */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Pending Inflows
          </CardTitle>
          <span className="text-[11px] font-mono text-zinc-400">DUE</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight font-mono">
            {formatPKR(totalPending)}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span>Audit: {formatPKR(pendingAuditAmount, false)}</span>
            <span>•</span>
            <span>Dues: {formatPKR(pendingMemberDuesAmount, false)}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
