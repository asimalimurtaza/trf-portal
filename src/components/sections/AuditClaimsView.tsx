'use client';

import React from 'react';
import { useTRF } from '@/context/TRFContext';
import { formatPKR, formatDate } from '@/lib/utils';
import {
  FileCheck2,
  Plus,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  Calculator,
  ShieldCheck,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { ClaimStatus } from '@/types/trf';

interface AuditClaimsViewProps {
  onOpenNewClaim: () => void;
}

export function AuditClaimsView({ onOpenNewClaim }: AuditClaimsViewProps) {
  const { claims, isManager, updateClaimStatus, activeHeadcount, monthlyPerHeadRate } = useTRF();

  const totalDisbursedFromClaims = claims
    .filter((c) => c.status === 'approved_disbursed')
    .reduce((sum, c) => sum + c.totalAmount, 0);

  const pendingClaimsAmount = claims
    .filter((c) => c.status === 'submitted')
    .reduce((sum, c) => sum + c.totalAmount, 0);

  const getStatusBadge = (status: ClaimStatus) => {
    switch (status) {
      case 'approved_disbursed':
        return (
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Approved & Disbursed
          </span>
        );
      case 'submitted':
        return (
          <span className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-400 border border-amber-500/20 animate-pulse">
            <Clock className="h-3.5 w-3.5" />
            Submitted to Audit
          </span>
        );
      case 'draft':
        return (
          <span className="flex items-center gap-1.5 rounded-full bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-300 border border-slate-700">
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Draft
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-1 text-[11px] font-bold text-rose-400 border border-rose-500/20">
            <XCircle className="h-3.5 w-3.5" />
            Audit Returned
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <FileCheck2 className="h-6 w-6 text-cyan-400" />
            Company TRF Audit Claims
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Tracking monthly company funding at 1,400 PKR per head per month.
          </p>
        </div>

        {isManager && (
          <button
            onClick={onOpenNewClaim}
            className="rounded-xl bg-cyan-600 hover:bg-cyan-500 px-4 py-2 text-xs font-bold text-white shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Generate Monthly Claim</span>
          </button>
        )}
      </div>

      {/* Audit Policy Formula Header */}
      <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-slate-900 via-cyan-950/20 to-slate-900 p-5 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-300">
              <Calculator className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                Official Company Policy
              </div>
              <div className="text-base sm:text-lg font-bold text-white mt-0.5">
                {activeHeadcount} Active Team Heads × PKR 1,400 ={' '}
                <span className="text-cyan-300 font-extrabold">
                  {formatPKR(activeHeadcount * monthlyPerHeadRate)} / Month
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                The TRF Manager submits a claim voucher each month. Once Internal Audit audits and releases payment, funds are automatically credited to the collective pool.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
            <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3 text-center min-w-[120px]">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Disbursed</div>
              <div className="text-sm font-extrabold text-emerald-400 mt-0.5">
                {formatPKR(totalDisbursedFromClaims)}
              </div>
            </div>
            <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3 text-center min-w-[120px]">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Pending Audit</div>
              <div className="text-sm font-extrabold text-amber-400 mt-0.5">
                {formatPKR(pendingClaimsAmount)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Claims List Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Month & Voucher #</th>
                <th className="px-5 py-3.5 font-semibold">Headcount & Formula</th>
                <th className="px-5 py-3.5 font-semibold">Total Claim (PKR)</th>
                <th className="px-5 py-3.5 font-semibold">Audit Status</th>
                <th className="px-5 py-3.5 font-semibold">Timeline</th>
                <th className="px-5 py-3.5 font-semibold">Remarks</th>
                {isManager && <th className="px-5 py-3.5 font-semibold text-right">Audit Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {claims.map((claim) => (
                <tr key={claim.id} className="hover:bg-slate-800/40 transition-colors">
                  {/* Month & Voucher */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="font-bold text-white text-sm">
                      {claim.monthYear}
                    </div>
                    <div className="text-[10px] text-cyan-400 font-mono mt-0.5">
                      {claim.claimRefNumber || 'TRF-CLAIM'}
                    </div>
                  </td>

                  {/* Headcount */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="text-slate-200 font-semibold">
                      {claim.headcount} Team Members
                    </div>
                    <div className="text-[11px] text-slate-400">
                      @ {formatPKR(claim.ratePerHead)} / head
                    </div>
                  </td>

                  {/* Total Amount */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className="font-extrabold text-sm text-cyan-300">
                      {formatPKR(claim.totalAmount)}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    {getStatusBadge(claim.status)}
                  </td>

                  {/* Timeline */}
                  <td className="px-5 py-4 whitespace-nowrap text-slate-400 text-[11px]">
                    <div>Submitted: {formatDate(claim.submissionDate)}</div>
                    {claim.disbursedDate && (
                      <div className="text-emerald-400 font-medium">
                        Disbursed: {formatDate(claim.disbursedDate)}
                      </div>
                    )}
                  </td>

                  {/* Remarks */}
                  <td className="px-5 py-4 max-w-xs text-slate-400 text-[11px]">
                    {claim.auditNotes || 'Standard monthly allowance verified.'}
                  </td>

                  {/* Manager Controls */}
                  {isManager && (
                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      {claim.status === 'submitted' && (
                        <button
                          onClick={() => updateClaimStatus(claim.id, 'approved_disbursed')}
                          className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors"
                          title="Click when Internal Audit approves & transfers the funds into the bank/pool"
                        >
                          Mark Disbursed
                        </button>
                      )}
                      {claim.status === 'approved_disbursed' && (
                        <span className="text-[11px] text-emerald-400/80 font-medium">
                          Credited to Pool ✓
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
