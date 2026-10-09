'use client';

import React, { useState, useEffect } from 'react';
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
import { Building2, UserPlus, Info } from 'lucide-react';

interface SystemRatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SystemRatesModal({ isOpen, onClose }: SystemRatesModalProps) {
  const {
    monthlyPerHeadRate,
    defaultJoiningFee,
    updateSystemRates,
    activeHeadcount,
    isManager,
  } = useTRF();

  const [monthlyRate, setMonthlyRate] = useState(monthlyPerHeadRate.toString());
  const [joiningFee, setJoiningFee] = useState(defaultJoiningFee.toString());

  useEffect(() => {
    setMonthlyRate(monthlyPerHeadRate.toString());
    setJoiningFee(defaultJoiningFee.toString());
  }, [monthlyPerHeadRate, defaultJoiningFee, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isManager) return;

    const rateNum = Math.max(0, parseFloat(monthlyRate) || 0);
    const feeNum = Math.max(0, parseFloat(joiningFee) || 0);

    updateSystemRates({
      monthlyPerHeadRate: rateNum,
      defaultJoiningFee: feeNum,
    });

    onClose();
  };

  const parsedRate = parseFloat(monthlyRate) || 0;
  const parsedFee = parseFloat(joiningFee) || 0;
  const calculatedMonthlyPool = activeHeadcount * parsedRate;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>TRF System Rates & Policies</DialogTitle>
          <DialogDescription>
            Configure company monthly allowances and member onboarding fees.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Monthly Allowance Per Head */}
          <div className="space-y-2 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-zinc-500" />
              <Label htmlFor="monthly-rate" className="text-xs font-semibold">
                Company Monthly Allowance Per Head (PKR)
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <Input
                id="monthly-rate"
                type="number"
                step="50"
                min="0"
                value={monthlyRate}
                onChange={(e) => setMonthlyRate(e.target.value)}
                placeholder="1400"
                className="font-mono text-sm"
                required
              />
              <span className="text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300 shrink-0">
                {formatPKR(parsedRate)}
              </span>
            </div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
              <span>Current team ({activeHeadcount} heads):</span>
              <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                {formatPKR(calculatedMonthlyPool)} / mo
              </span>
            </div>
          </div>

          {/* Joining Fee */}
          <div className="space-y-2 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-zinc-500" />
              <Label htmlFor="joining-fee" className="text-xs font-semibold">
                Default New Member Joining Fee (PKR)
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <Input
                id="joining-fee"
                type="number"
                step="100"
                min="0"
                value={joiningFee}
                onChange={(e) => setJoiningFee(e.target.value)}
                placeholder="1000"
                className="font-mono text-sm"
                required
              />
              <span className="text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300 shrink-0">
                {formatPKR(parsedFee)}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              One-time initial contribution suggested when adding new team members.
            </p>
          </div>

          <div className="flex items-start gap-2 p-2.5 rounded-md bg-zinc-100 dark:bg-zinc-800/60 text-xs text-zinc-600 dark:text-zinc-400">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              Updating these rates will immediately re-calculate the monthly audit claims formula and onboarding fee suggestions across the portal.
            </span>
          </div>

          <DialogFooter className="pt-2 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isManager}>
              Save Rates
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
