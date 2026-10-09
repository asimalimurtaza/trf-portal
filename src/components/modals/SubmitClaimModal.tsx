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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Generate Monthly TRF Audit Claim</h3>
              <p className="text-xs text-slate-400">1,400 PKR per head company allowance claim form</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Claim Summary Card */}
          <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-300 text-xs font-semibold">
                <Calculator className="h-4 w-4" />
                <span>Allowance Formula</span>
              </div>
              <span className="text-xs text-slate-400">Fixed Rate</span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <div className="text-xs text-slate-300">
                {headcount} Heads × {formatPKR(monthlyPerHeadRate)}
              </div>
              <div className="text-xl font-extrabold text-cyan-400">
                {formatPKR(totalCalculated)}
              </div>
            </div>
          </div>

          {/* Month & Headcount Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Month & Year *
              </label>
              <input
                type="text"
                required
                value={monthYear}
                onChange={(e) => setMonthYear(e.target.value)}
                placeholder="e.g. November 2026"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Eligible Headcount *
              </label>
              <input
                type="number"
                required
                min="1"
                value={headcount}
                onChange={(e) => setHeadcount(parseInt(e.target.value, 10) || 0)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Claim Reference Number */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Audit Claim Ref # (Optional)
            </label>
            <input
              type="text"
              value={claimRefNumber}
              onChange={(e) => setClaimRefNumber(e.target.value)}
              placeholder="e.g. TRF-AUD-2026-11"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Audit Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Audit Submission Notes
            </label>
            <textarea
              rows={2}
              value={auditNotes}
              onChange={(e) => setAuditNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400">
            <Info className="h-4 w-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <span>
              Once submitted, the claim will appear under <strong>Submitted</strong> status. When Audit releases the funds, the TRF Manager can click "Audit Disbursed" to automatically credit the collective pool.
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-cyan-600 hover:bg-cyan-500 px-5 py-2 text-xs font-bold text-white shadow-lg transition-all"
            >
              Submit to Audit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
