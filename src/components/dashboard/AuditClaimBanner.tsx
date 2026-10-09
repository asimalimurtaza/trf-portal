'use client';

import React from 'react';
import { useTRF } from '@/context/TRFContext';
import { formatPKR } from '@/lib/utils';
import { FileCheck2, Clock, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

interface AuditClaimBannerProps {
  onOpenNewClaim: () => void;
  onNavigateToClaims: () => void;
}

export function AuditClaimBanner({ onOpenNewClaim, onNavigateToClaims }: AuditClaimBannerProps) {
  const { claims, isManager, updateClaimStatus } = useTRF();
  const latestClaim = claims[0];

  if (!latestClaim) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">No Monthly Audit Claim on Record</h4>
            <p className="text-xs text-amber-200/80 mt-0.5">
              Generate this month's TRF claim form (1,400 PKR/head) to request funds from Internal Audit.
            </p>
          </div>
        </div>
        {isManager && (
          <button
            onClick={onOpenNewClaim}
            className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors"
          >
            Create Claim
          </button>
        )}
      </div>
    );
  }

  const isSubmitted = latestClaim.status === 'submitted';
  const isApproved = latestClaim.status === 'approved_disbursed';

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
        isSubmitted
          ? 'border-amber-500/30 bg-gradient-to-r from-amber-950/30 via-slate-900/60 to-slate-900/40'
          : isApproved
          ? 'border-emerald-500/30 bg-gradient-to-r from-emerald-950/30 via-slate-900/60 to-slate-900/40'
          : 'border-slate-800 bg-slate-900/60'
      }`}
    >
      <div className="flex items-center gap-3.5">
        <div
          className={`p-2.5 rounded-xl ${
            isSubmitted
              ? 'bg-amber-500/20 text-amber-300 animate-pulse'
              : isApproved
              ? 'bg-emerald-500/20 text-emerald-300'
              : 'bg-slate-800 text-slate-300'
          }`}
        >
          {isSubmitted ? (
            <Clock className="h-5 w-5" />
          ) : isApproved ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <FileCheck2 className="h-5 w-5" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-white">
              {latestClaim.monthYear} Claim: {formatPKR(latestClaim.totalAmount)}
            </h4>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                isSubmitted
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : isApproved
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {latestClaim.status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            {isSubmitted
              ? `Ref ${latestClaim.claimRefNumber || 'N/A'}: Claim form with ${latestClaim.headcount} active headcount submitted to Internal Audit. Awaiting audit release.`
              : isApproved
              ? `Ref ${latestClaim.claimRefNumber || 'N/A'}: Funds verified and released into collective pool on ${latestClaim.disbursedDate}.`
              : latestClaim.auditNotes}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
        {isManager && isSubmitted && (
          <button
            onClick={() => updateClaimStatus(latestClaim.id, 'approved_disbursed')}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors flex items-center gap-1.5"
            title="Mark as released by audit"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Audit Disbursed</span>
          </button>
        )}
        <button
          onClick={onNavigateToClaims}
          className="rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 px-3.5 py-1.5 text-xs font-medium text-slate-300 transition-colors flex items-center gap-1.5"
        >
          <span>Claim Details</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
