'use client';

import React from 'react';
import { useTRF } from '@/context/TRFContext';
import { formatPKR, formatDate } from '@/lib/utils';
import { Receipt, ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';

interface RecentTransactionsWidgetProps {
  onNavigateToLedger: () => void;
  onOpenNewTransaction: () => void;
}

export function RecentTransactionsWidget({
  onNavigateToLedger,
  onOpenNewTransaction,
}: RecentTransactionsWidgetProps) {
  const { transactions, isManager } = useTRF();
  const recent = transactions.slice(0, 5);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg backdrop-blur-xl">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2 text-emerald-400">
          <Receipt className="h-4 w-4" />
          <h3 className="text-sm font-bold text-white tracking-wide">Recent Fund Movements</h3>
        </div>
        <div className="flex items-center gap-3">
          {isManager && (
            <button
              onClick={onOpenNewTransaction}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              + Log
            </button>
          )}
          <button
            onClick={onNavigateToLedger}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 font-medium transition-colors"
          >
            <span>Full Ledger</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="mt-4 divide-y divide-slate-800/60">
        {recent.map((tx) => {
          const isInflow = tx.type === 'inflow';
          return (
            <div
              key={tx.id}
              className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`p-2 rounded-xl flex-shrink-0 ${
                    isInflow
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {isInflow ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-200 truncate">
                    {tx.title}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-2">
                    <span>{formatDate(tx.date)}</span>
                    <span>•</span>
                    <span className="capitalize">{tx.category.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <div
                  className={`text-xs font-bold ${
                    isInflow ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isInflow ? '+' : '-'}
                  {formatPKR(tx.amount)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  by {tx.loggedBy}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
