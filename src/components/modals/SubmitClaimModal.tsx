'use client';

import React, { useState } from 'react';
import { useTRF } from '@/context/TRFContext';
import { formatPKR } from '@/lib/utils';
import { X, FileCheck2, Calculator, Info } from 'lucide-react';

interface SubmitClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubmitClaimModal({ isOpen, onClose }: SubmitClaimModalProps) {
  const { createAuditClaim, activeHeadcount, monthlyPerHeadRate } = useTRF();

  const [monthYear, setMonthYear] = useState('November 2026');
  const [headcount, setHeadcount] = useState<number>(activeHeadcount);
  const [claimRefNumber, setClaimRefNumber] = useState('TRF-AUD-2026-11');
  const [auditNotes, setAuditNotes] = useState('Monthly TRF allowance claim submitted for internal audit verification.');

  if (!isOpen) return null;

  const totalCalculated = (headcount || 0) * monthlyPerHeadRate;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!monthYear.trim() || headcount < 1) return;

    createAuditClaim({
      monthYear: monthYear.trim(),
      headcount,
      claimRefNumber: claimRefNumber.trim(),
      auditNotes: auditNotes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Monthly TRF Audit Claim</h3>
              <p className="text-xs text-slate-500">1,400 PKR per head allowance claim voucher</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="rounded-xl border border-cyan-500/30 bg-cyan-50/60 dark:bg-cyan-950/20 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-300 text-xs font-semibold">
                <Calculator className="h-4 w-4" />
                <span>Claim Formula</span>
              </div>
              <span className="text-xs text-slate-500">1,400 PKR / Head</span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <div className="text-xs text-slate-600 dark:text-slate-300">
                {headcount} Heads × {formatPKR(monthlyPerHeadRate)}
              </div>
              <div className="text-xl font-extrabold text-cyan-700 dark:text-cyan-400">
                {formatPKR(totalCalculated)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Month & Year *
              </label>
              <input
                type="text"
                required
                value={monthYear}
                onChange={(e) => setMonthYear(e.target.value)}
                placeholder="November 2026"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Eligible Headcount *
              </label>
              <input
                type="number"
                required
                min="1"
                value={headcount}
                onChange={(e) => setHeadcount(parseInt(e.target.value, 10) || 0)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Audit Voucher Ref #
            </label>
            <input
              type="text"
              value={claimRefNumber}
              onChange={(e) => setClaimRefNumber(e.target.value)}
              placeholder="TRF-AUD-2026-11"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Audit Notes
            </label>
            <textarea
              rows={2}
              value={auditNotes}
              onChange={(e) => setAuditNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-cyan-600 hover:bg-cyan-500 px-5 py-2 text-xs font-bold text-white shadow-xs transition-all"
            >
              Submit to Audit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
