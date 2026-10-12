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
  const { currentBalance, activeHeadcount, completePlannedActivity, isManager } = useTRF();

  const [billAmount, setBillAmount] = useState<string>('0');
  const [trfSubsidy, setTrfSubsidy] = useState<string>('0');
  const [splitDeficit, setSplitDeficit] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (activity) {
      const defaultBill = activity.actualBillAmount || activity.estimatedTotalBudget || 5000;
      const defaultSubsidy = activity.trfContributionShare !== undefined ? activity.trfContributionShare : Math.min(defaultBill, 2800);
      setBillAmount(String(defaultBill));
      setTrfSubsidy(String(defaultSubsidy));
      setSplitDeficit(true);
    }
  }, [activity]);

  if (!activity || !isManager) return null;

  const parsedBill = Math.max(0, parseFloat(billAmount) || 0);
  const parsedSubsidy = Math.max(0, parseFloat(trfSubsidy) || 0);
  const remainingMemberShare = Math.max(0, parsedBill - parsedSubsidy);
  const memberCount = Math.max(1, activeHeadcount);
  const perMemberShare = Math.ceil(remainingMemberShare / memberCount);
  const projectedBalance = currentBalance - parsedSubsidy;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isManager || parsedBill <= 0) return;

    setIsSubmitting(true);
    await completePlannedActivity({
      activityId: activity.id,
      finalBillAmount: parsedBill,
      trfSubsidyAmount: parsedSubsidy,
      splitShortfallWithMembers: remainingMemberShare > 0 ? splitDeficit : false,
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
            Finalize the bill for &quot;{activity.title}&quot; at {activity.venueName}. Specify TRF fund subsidy and member share.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Bill & Subsidy Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="outing-bill-input">Total Bill Paid (PKR) *</Label>
              <Input
                id="outing-bill-input"
                type="number"
                min="1"
                step="any"
                required
                value={billAmount}
                onChange={(e) => setBillAmount(e.target.value)}
                className="font-mono text-sm font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="outing-subsidy-input">TRF Fund Subsidy (PKR) *</Label>
              <Input
                id="outing-subsidy-input"
                type="number"
                min="0"
                step="any"
                required
                value={trfSubsidy}
                onChange={(e) => setTrfSubsidy(e.target.value)}
                className="font-mono text-sm font-medium"
              />
            </div>
          </div>

          {/* Balance & Impact Summary */}
          <div className="grid grid-cols-3 gap-2 p-3 rounded-lg border border-border bg-muted/30 text-center">
            <div>
              <div className="text-[10px] text-muted-foreground">TRF Subsidy</div>
              <div className="text-xs font-mono font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5">
                {formatPKR(parsedSubsidy)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground">Member Share</div>
              <div className="text-xs font-mono font-semibold text-amber-600 dark:text-amber-400 mt-0.5">
                {formatPKR(remainingMemberShare)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground">Projected Pool</div>
              <div
                className={`text-xs font-mono font-bold mt-0.5 ${
                  projectedBalance < 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {formatPKR(projectedBalance)}
              </div>
            </div>
          </div>

          {/* Member Share Splitting Option */}
          {remainingMemberShare > 0 ? (
            <div className="rounded-lg border border-amber-300 dark:border-amber-800/60 bg-amber-50/70 dark:bg-amber-950/20 p-3.5 space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-semibold text-amber-900 dark:text-amber-200">
                    Remaining Member Share: {formatPKR(remainingMemberShare)}
                  </div>
                  <div className="text-[11px] text-amber-700 dark:text-amber-300/90 mt-0.5">
                    Total bill ({formatPKR(parsedBill)}) minus TRF subsidy ({formatPKR(parsedSubsidy)}) leaves {formatPKR(remainingMemberShare)} to be covered by team members.
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-amber-200 dark:border-amber-900/40">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={splitDeficit}
                    onChange={(e) => setSplitDeficit(e.target.checked)}
                    className="mt-0.5 rounded border-amber-400 text-primary focus:ring-primary"
                  />
                  <div className="text-xs">
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      Equally divide remaining {formatPKR(remainingMemberShare)} across all {memberCount} active members
                    </span>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Users className="h-3 w-3" />
                      <span>{formatPKR(perMemberShare)} / head will be logged as pending dues in member accounts</span>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-lg border border-emerald-300 dark:border-emerald-800/60 bg-emerald-50/70 dark:bg-emerald-950/20 text-xs text-emerald-800 dark:text-emerald-300">
              The entire bill of {formatPKR(parsedBill)} is 100% subsidized by the TRF fund. No pending dues will be charged to members.
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
