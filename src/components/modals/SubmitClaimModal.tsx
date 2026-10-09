'use client';

import React, { useState } from 'react';
import { useTRF } from '@/context/TRFContext';
import { formatPKR } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Monthly TRF Audit Claim</DialogTitle>
          <DialogDescription>
            Company allowance claim voucher based on PKR 1,400 per head
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Summary Box */}
          <div className="rounded-lg border border-border bg-muted/40 p-3 flex items-center justify-between">
            <div>
              <div className="text-xs text-zinc-500">
                Formula: {headcount} heads × {formatPKR(monthlyPerHeadRate)}
              </div>
              <div className="text-xs text-zinc-400">Company Allowance Rate</div>
            </div>
            <div className="text-lg font-mono font-bold text-zinc-900 dark:text-zinc-100">
              {formatPKR(totalCalculated)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="claim-month">Month & Year *</Label>
              <Input
                id="claim-month"
                required
                value={monthYear}
                onChange={(e) => setMonthYear(e.target.value)}
                placeholder="November 2026"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="claim-headcount">Eligible Headcount *</Label>
              <Input
                id="claim-headcount"
                type="number"
                required
                min="1"
                value={headcount}
                onChange={(e) => setHeadcount(parseInt(e.target.value, 10) || 0)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="claim-ref">Audit Voucher Ref #</Label>
            <Input
              id="claim-ref"
              value={claimRefNumber}
              onChange={(e) => setClaimRefNumber(e.target.value)}
              placeholder="TRF-AUD-2026-11"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="claim-notes">Audit Notes</Label>
            <Input
              id="claim-notes"
              value={auditNotes}
              onChange={(e) => setAuditNotes(e.target.value)}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Submit to Audit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
