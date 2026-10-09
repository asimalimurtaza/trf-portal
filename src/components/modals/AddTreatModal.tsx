'use client';

import React, { useState } from 'react';
import { useTRF } from '@/context/TRFContext';
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

interface AddTreatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddTreatModal({ isOpen, onClose }: AddTreatModalProps) {
  const { logTreatEvent, members, rules, currentUser } = useTRF();

  const [memberId, setMemberId] = useState(currentUser.id);
  const [ruleTitle, setRuleTitle] = useState('');
  const [details, setDetails] = useState('');
  const [amount, setAmount] = useState('3000');

  React.useEffect(() => {
    if (isOpen && rules.length > 0) {
      const defaultRule = rules[1] || rules[0];
      setRuleTitle(defaultRule.title);
      setAmount(defaultRule.suggestedAmount.toString());
      setMemberId(currentUser.id);
      setDetails('');
    }
  }, [isOpen, rules, currentUser.id]);

  const handleRuleChange = (title: string) => {
    setRuleTitle(title);
    const matchedRule = rules.find((r) => r.title === title);
    if (matchedRule) {
      setAmount(matchedRule.suggestedAmount.toString());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim() || !amount) return;

    logTreatEvent({
      memberId,
      ruleTitle,
      details: details.trim(),
      amount: parseFloat(amount),
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Declare Milestone Treat</DialogTitle>
          <DialogDescription>
            New smartphone, promotion, appraisal, or celebration contribution
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1.5">
            <Label htmlFor="treat-member">Celebrating Member *</Label>
            <select
              id="treat-member"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id} className="bg-background">
                  {m.name} ({m.designation})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="treat-rule">Celebration Type *</Label>
            <select
              id="treat-rule"
              value={ruleTitle}
              onChange={(e) => handleRuleChange(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {rules.map((rule) => (
                <option key={rule.id} value={rule.title} className="bg-background">
                  {rule.title} (PKR {rule.suggestedAmount})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="treat-details">Celebration Details *</Label>
            <Input
              id="treat-details"
              required
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="e.g. Bought iPhone 16 Pro Max 256GB"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="treat-amount">Contribution (PKR) *</Label>
            <Input
              id="treat-amount"
              type="number"
              required
              min="100"
              step="100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Declare Treat
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
