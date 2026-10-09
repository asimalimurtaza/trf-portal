'use client';

import React, { useState, useEffect } from 'react';
import { useTRF } from '@/context/TRFContext';
import { PlannedActivity } from '@/types/trf';
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
import { AlertTriangle, CheckCircle2, DollarSign, Users } from 'lucide-react';

interface CompleteOutingModalProps {
  activity: PlannedActivity | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CompleteOutingModal({ activity, isOpen, onClose }: CompleteOutingModalProps) {
  const { currentBalance, activeHeadcount, completePlannedActivity } = useTRF();

  const [billAmount, setBillAmount] = useState<string>('0');
  const [splitDeficit, setSplitDeficit] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (activity) {
      const defaultBill = activity.actualBillAmount || activity.estimatedTotalBudget || activity.trfContributionShare || 10000;
      setBillAmount(String(defaultBill));
      setSplitDeficit(true);
    }
  }, [activity]);

  if (!activity) return null;

  const parsedBill = Math.max(0, parseFloat(billAmount) || 0);
  const projectedBalance = currentBalance - parsedBill;
  const hasDeficit = projectedBalance < 0;
  const deficitAmount = hasDeficit ? Math.abs(projectedBalance) : 0;
  const memberCount = Math.max(1, activeHeadcount);
  const perMemberDeficit = Math.ceil(deficitAmount / memberCount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedBill <= 0) return;

    setIsSubmitting(true);
    await completePlannedActivity({
      activityId: activity.id,
      finalBillAmount: parsedBill,
      splitShortfallWithMembers: hasDeficit ? splitDeficit : false,
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span>Complete & Settle Outing Bill</span>
          </DialogTitle>
          <DialogDescription>
            Record the final paid bill for &quot;{activity.title}&quot; at {activity.venueName}. This will deduct the bill from the TRF fund pool.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Bill Input */}
          <div className="space-y-1.5">
            <Label htmlFor="outing-bill-input">Actual Bill Paid (PKR) *</Label>
            <Input
              id="outing-bill-input"
              type="number"
              min="1"
              step="100"
              required
              value={billAmount}
              onChange={(e) => setBillAmount(e.target.value)}
              className="text-base font-mono font-medium"
            />
          </div>

          {/* Balance & Impact Summary */}
          <div className="grid grid-cols-3 gap-2 p-3 rounded-lg border border-border bg-muted/30 text-center">
            <div>
              <div className="text-[10px] text-muted-foreground">Current Pool</div>
              <div className="text-xs font-mono font-semibold mt-0.5">
                {formatPKR(currentBalance)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground">Bill Amount</div>
              <div className="text-xs font-mono font-semibold text-red-600 dark:text-red-400 mt-0.5">
                -{formatPKR(parsedBill)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground">Projected Pool</div>
              <div
                className={`text-xs font-mono font-bold mt-0.5 ${
                  hasDeficit ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {formatPKR(projectedBalance)}
              </div>
            </div>
          </div>

          {/* Deficit / Shortfall Splitting Option */}
          {hasDeficit && (
            <div className="rounded-lg border border-amber-300 dark:border-amber-800/60 bg-amber-50/70 dark:bg-amber-950/20 p-3.5 space-y-2.5">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-semibold text-amber-900 dark:text-amber-200">
                    Bill Exceeds TRF Funds by {formatPKR(deficitAmount)}
                  </div>
                  <div className="text-[11px] text-amber-700 dark:text-amber-300/90 mt-0.5">
                    The bill is greater than the available pool balance. You can optionally split the remaining deficit equally across all members.
                  </div>
                </div>
              </div>

              <div className="pt-1.5 border-t border-amber-200 dark:border-amber-900/40">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={splitDeficit}
                    onChange={(e) => setSplitDeficit(e.target.checked)}
                    className="mt-0.5 rounded border-amber-400 text-primary focus:ring-primary"
                  />
                  <div className="text-xs">
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      Equally divide remaining {formatPKR(deficitAmount)} across all {memberCount} active members
                    </span>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Users className="h-3 w-3" />
                      <span>{formatPKR(perMemberDeficit)} per member will be logged as pending contribution</span>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || parsedBill <= 0}>
              {isSubmitting ? 'Processing...' : 'Complete & Settle Bill'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
