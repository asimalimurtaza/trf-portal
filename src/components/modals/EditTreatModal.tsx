'use client';

import React, { useState, useEffect } from 'react';
import { useTRF } from '@/context/TRFContext';
import { MemberTreatEvent } from '@/types/trf';
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

interface EditTreatModalProps {
  treat: MemberTreatEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditTreatModal({ treat, isOpen, onClose }: EditTreatModalProps) {
  const { updateTreatEvent, deleteTreatEvent, members, rules } = useTRF();

  const [memberId, setMemberId] = useState('');
  const [ruleTitle, setRuleTitle] = useState('');
  const [details, setDetails] = useState('');
  const [amount, setAmount] = useState('1000');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState<'pending' | 'collected'>('pending');

  useEffect(() => {
    if (treat) {
      setMemberId(treat.memberId);
      setRuleTitle(treat.ruleTitle);
      setDetails(treat.details || '');
      setAmount(treat.amount.toString());
      setDate(treat.date);
      setStatus(treat.status);
    }
  }, [treat]);

  if (!treat) return null;

  const handleRuleChange = (title: string) => {
    setRuleTitle(title);
    const matchedRule = rules.find((r) => r.title === title);
    if (matchedRule) {
      setAmount(matchedRule.suggestedAmount.toString());
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateTreatEvent(treat.id, {
      memberId,
      ruleTitle,
      details: details.trim(),
      amount: parseFloat(amount) || 1000,
      date,
      status,
    });
    onClose();
  };

  const handleDelete = () => {
    if (confirm(`Delete the treat request for "${treat.ruleTitle}" by ${treat.memberName}?`)) {
      deleteTreatEvent(treat.id);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Treat Contribution Request</DialogTitle>
          <DialogDescription>
            Modify occasion details, adjust contribution amount, or remove this pending request
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-3.5">
          <div className="space-y-1.5">
            <Label htmlFor="edit-treat-member">Celebrating Member *</Label>
            <select
              id="edit-treat-member"
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
            <Label htmlFor="edit-treat-rule">Celebration Type *</Label>
            <select
              id="edit-treat-rule"
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
            <Label htmlFor="edit-treat-details">Details</Label>
            <Input
              id="edit-treat-details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="e.g. Bought iPhone 16 Pro Max 256GB"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-treat-amount">Contribution (PKR) *</Label>
              <Input
                id="edit-treat-amount"
                type="number"
                required
                min="100"
                step="100"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-treat-status">Collection Status</Label>
              <select
                id="edit-treat-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'pending' | 'collected')}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="pending" className="bg-background">Pending Collection</option>
                <option value="collected" className="bg-background">Collected & Deposited</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-treat-date">Date</Label>
            <Input
              id="edit-treat-date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
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
              <span>Delete Request</span>
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
