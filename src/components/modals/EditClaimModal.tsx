'use client';

import React, { useState, useEffect } from 'react';
import { useTRF } from '@/context/TRFContext';
import { formatPKR } from '@/lib/utils';
import { AuditClaim, ClaimStatus } from '@/types/trf';
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
import { Trash2 } from 'lucide-react';

interface EditClaimModalProps {
  claim: AuditClaim | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditClaimModal({ claim, isOpen, onClose }: EditClaimModalProps) {
  const { updateClaim, deleteClaim, monthlyPerHeadRate } = useTRF();

  const [monthYear, setMonthYear] = useState('');
  const [headcount, setHeadcount] = useState(1);
  const [claimRefNumber, setClaimRefNumber] = useState('');
  const [auditNotes, setAuditNotes] = useState('');
  const [status, setStatus] = useState<ClaimStatus>('submitted');

  useEffect(() => {
    if (claim) {
      setMonthYear(claim.monthYear);
      setHeadcount(claim.headcount);
      setClaimRefNumber(claim.claimRefNumber || '');
      setAuditNotes(claim.auditNotes || '');
      setStatus(claim.status);
    }
  }, [claim]);

  if (!claim) return null;

  const totalCalculated = headcount * monthlyPerHeadRate;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateClaim(claim.id, {
      monthYear: monthYear.trim(),
      headcount,
      claimRefNumber: claimRefNumber.trim() || undefined,
      auditNotes: auditNotes.trim() || undefined,
      status,
    });
    onClose();
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete the claim request for ${claim.monthYear}?`)) {
      deleteClaim(claim.id);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Audit Claim Request</DialogTitle>
          <DialogDescription>
            Update claim voucher parameters, modify eligible headcount, or delete this request
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-3.5">
          {/* Summary Box */}
          <div className="rounded-lg border border-border bg-muted/40 p-3 flex items-center justify-between">
            <div>
              <div className="text-xs text-zinc-500">
                Formula: {headcount} heads × {formatPKR(monthlyPerHeadRate)}
              </div>
              <div className="text-xs text-zinc-400">Total Claimable</div>
            </div>
            <div className="text-lg font-mono font-bold text-zinc-900 dark:text-zinc-100">
              {formatPKR(totalCalculated)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-claim-month">Month & Year *</Label>
              <Input
                id="edit-claim-month"
                required
                value={monthYear}
                onChange={(e) => setMonthYear(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-claim-heads">Eligible Headcount *</Label>
              <Input
                id="edit-claim-heads"
                type="number"
                required
                min="1"
                value={headcount}
                onChange={(e) => setHeadcount(parseInt(e.target.value, 10) || 1)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-claim-ref">Voucher Ref #</Label>
              <Input
                id="edit-claim-ref"
                value={claimRefNumber}
                onChange={(e) => setClaimRefNumber(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-claim-status">Audit Status</Label>
              <select
                id="edit-claim-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as ClaimStatus)}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="draft" className="bg-background">Draft (Not submitted)</option>
                <option value="submitted" className="bg-background">Submitted (Pending Audit)</option>
                <option value="approved_disbursed" className="bg-background">Approved & Disbursed</option>
                <option value="rejected" className="bg-background">Returned / Rejected</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-claim-notes">Audit Notes</Label>
            <Input
              id="edit-claim-notes"
              value={auditNotes}
              onChange={(e) => setAuditNotes(e.target.value)}
              placeholder="e.g. Verified by internal audit"
            />
          </div>

          <DialogFooter className="pt-2 flex items-center justify-between sm:justify-between w-full">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              className="gap-1 text-xs"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Claim</span>
            </Button>

            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
