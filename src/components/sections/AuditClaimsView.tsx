'use client';

import React from 'react';
import { useTRF } from '@/context/TRFContext';
import { formatPKR, formatDate } from '@/lib/utils';
import {
  FileCheck2,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Calculator,
  FileSpreadsheet
} from 'lucide-react';
import { ClaimStatus } from '@/types/trf';

interface AuditClaimsViewProps {
  onOpenNewClaim: () => void;
}

export function AuditClaimsView({ onOpenNewClaim }: AuditClaimsViewProps) {
  const { claims, isManager, updateClaimStatus, activeHeadcount, monthlyPerHeadRate } = useTRF();

  const getStatusBadge = (status: ClaimStatus) => {
    switch (status) {
      case 'approved_disbursed':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-3 w-3" />
            Disbursed
          </span>
        );
      case 'submitted':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-400 border border-amber-500/20 animate-pulse">
            <Clock className="h-3 w-3" />
            Submitted to Audit
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2.5 py-0.5 text-[11px] font-medium text-slate-300">
            Draft
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-bold text-rose-400 border border-rose-500/20">
            Returned
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileCheck2 className="h-5 w-5 text-cyan-400" />
            Company TRF Audit Claims
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Formula: {activeHeadcount} Active Heads × PKR 1,400 = <strong className="text-cyan-300">{formatPKR(activeHeadcount * monthlyPerHeadRate)} / month</strong>
          </p>
        </div>

        {isManager && (
          <button
            onClick={onOpenNewClaim}
            className="rounded-xl bg-cyan-600 hover:bg-cyan-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Generate Monthly Claim</span>
          </button>
        )}
      </div>

      {/* Claims List Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Month & Voucher</th>
                <th className="px-5 py-3.5 font-semibold">Headcount</th>
                <th className="px-5 py-3.5 font-semibold">Total Claim (PKR)</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold">Submitted</th>
                <th className="px-5 py-3.5 font-semibold">Disbursed Date</th>
                {isManager && <th className="px-5 py-3.5 font-semibold text-right">Audit Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {claims.map((claim) => (
                <tr key={claim.id} className="hover:bg-slate-800/30 transition-colors">
                  {/* Month */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="font-bold text-white">{claim.monthYear}</div>
                    <div className="text-[10px] text-cyan-400 font-mono">
                      {claim.claimRefNumber || 'TRF-CLAIM'}
                    </div>
                  </td>

                  {/* Headcount */}
                  <td className="px-5 py-3.5 whitespace-nowrap text-slate-400">
                    {claim.headcount} Heads (@ 1,400)
                  </td>

                  {/* Total Amount */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="font-extrabold text-cyan-300">
                      {formatPKR(claim.totalAmount)}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    {getStatusBadge(claim.status)}
                  </td>

                  {/* Submitted Date */}
                  <td className="px-5 py-3.5 whitespace-nowrap text-slate-400">
                    {formatDate(claim.submissionDate)}
                  </td>

                  {/* Disbursed Date */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    {claim.disbursedDate ? (
                      <span className="text-emerald-400 font-medium">
                        {formatDate(claim.disbursedDate)}
                      </span>
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </td>

                  {/* Action */}
                  {isManager && (
                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                      {claim.status === 'submitted' && (
                        <button
                          onClick={() => updateClaimStatus(claim.id, 'approved_disbursed')}
                          className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1 text-xs font-bold text-white shadow-sm transition-colors"
                        >
                          Mark Disbursed
                        </button>
                      )}
                      {claim.status === 'approved_disbursed' && (
                        <span className="text-[11px] text-emerald-400/80 font-medium">
                          Credited ✓
                        </span>
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
  );
}
