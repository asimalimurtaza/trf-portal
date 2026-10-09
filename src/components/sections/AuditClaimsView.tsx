'use client';

import React from 'react';
import { useTRF } from '@/context/TRFContext';
import { formatPKR, formatDate } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ClaimStatus } from '@/types/trf';
import { motion } from 'framer-motion';

interface AuditClaimsViewProps {
  onOpenNewClaim: () => void;
}

export function AuditClaimsView({ onOpenNewClaim }: AuditClaimsViewProps) {
  const { claims, isManager, updateClaimStatus, activeHeadcount, monthlyPerHeadRate } = useTRF();

  const getStatusBadge = (status: ClaimStatus) => {
    switch (status) {
      case 'approved_disbursed':
        return <Badge variant="default" className="text-[10px]">Disbursed</Badge>;
      case 'submitted':
        return <Badge variant="secondary" className="text-[10px]">Submitted</Badge>;
      case 'draft':
        return <Badge variant="outline" className="text-[10px]">Draft</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="text-[10px]">Returned</Badge>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="space-y-4"
    >
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Monthly Audit Claims
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-mono">
            Rate: {activeHeadcount} Heads × PKR 1,400 = {formatPKR(activeHeadcount * monthlyPerHeadRate)} / month
          </p>
        </div>

        {isManager && (
          <Button
            size="sm"
            onClick={onOpenNewClaim}
            className="gap-1.5 self-start sm:self-auto"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Generate Claim</span>
          </Button>
        )}
      </div>

      {/* Claims Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month & Voucher</TableHead>
                <TableHead>Headcount</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submission Date</TableHead>
                <TableHead>Disbursed Date</TableHead>
                {isManager && <TableHead className="text-right">Action</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {claims.map((claim) => (
                <TableRow key={claim.id}>
                  <TableCell className="font-medium text-xs">
                    <div className="text-zinc-900 dark:text-zinc-100">{claim.monthYear}</div>
                    <div className="text-[11px] text-zinc-400 font-mono">
                      {claim.claimRefNumber || 'TRF-AUD'}
                    </div>
                  </TableCell>

                  <TableCell className="text-xs text-zinc-500">
                    {claim.headcount} Heads
                  </TableCell>

                  <TableCell className="font-mono font-medium text-xs">
                    {formatPKR(claim.totalAmount)}
                  </TableCell>

                  <TableCell>
                    {getStatusBadge(claim.status)}
                  </TableCell>

                  <TableCell className="text-xs text-zinc-500">
                    {formatDate(claim.submissionDate)}
                  </TableCell>

                  <TableCell className="text-xs text-zinc-500 font-mono">
                    {claim.disbursedDate ? formatDate(claim.disbursedDate) : '-'}
                  </TableCell>

                  {isManager && (
                    <TableCell className="text-right">
                      {claim.status === 'submitted' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateClaimStatus(claim.id, 'approved_disbursed')}
                          className="h-7 text-xs"
                        >
                          Mark Disbursed
                        </Button>
                      ) : (
                        <span className="text-[11px] text-zinc-400">Done</span>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
