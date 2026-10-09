'use client';

import React, { useState, useEffect } from 'react';
import { useTRF } from '@/context/TRFContext';
import { TransactionCategory } from '@/types/trf';
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

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddTransactionModal({ isOpen, onClose }: AddTransactionModalProps) {
  const { addTransaction, members } = useTRF();

  const [type, setType] = useState<'outflow' | 'inflow'>('outflow');
  const [category, setCategory] = useState<TransactionCategory>('team_dinner');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('2026-10-09');
  const [description, setDescription] = useState('');
  const [relatedMemberId, setRelatedMemberId] = useState('');

  useEffect(() => {
    setDate(new Date().toISOString().split('T')[0]);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;

    addTransaction({
      title: title.trim(),
      description: description.trim(),
      amount: parseFloat(amount),
      type,
      category,
      date,
      relatedMemberId: relatedMemberId || undefined,
    });

    setTitle('');
    setAmount('');
    setDescription('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log Fund Transaction</DialogTitle>
          <DialogDescription>
            Record an expense withdrawal or incoming fund contribution
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-lg border border-border bg-muted/50">
            <Button
              type="button"
              variant={type === 'outflow' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {
                setType('outflow');
                setCategory('team_dinner');
              }}
              className="text-xs h-8"
            >
              Outflow (Expense)
            </Button>
            <Button
              type="button"
              variant={type === 'inflow' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {
                setType('inflow');
                setCategory('treat_event');
              }}
              className="text-xs h-8"
            >
              Inflow (Deposit)
            </Button>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tx-title">Title *</Label>
            <Input
              id="tx-title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Dinner at Roasters, Birthday Cake"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="tx-amount">Amount (PKR) *</Label>
              <Input
                id="tx-amount"
                type="number"
                required
                min="1"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="4500"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tx-date">Date *</Label>
              <Input
                id="tx-date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tx-category">Category</Label>
            <select
              id="tx-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as TransactionCategory)}
              className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {type === 'outflow' ? (
                <>
                  <option value="team_dinner" className="bg-background">Team Dinner / Lunch</option>
                  <option value="snacks_refreshment" className="bg-background">Snacks & Refreshments</option>
                  <option value="birthday_cake" className="bg-background">Birthday Cake</option>
                  <option value="activity_outing" className="bg-background">Outing / Bowling</option>
                  <option value="miscellaneous" className="bg-background">Miscellaneous</option>
                </>
              ) : (
                <>
                  <option value="company_claim" className="bg-background">Company Allowance (1,400)</option>
                  <option value="joining_fee" className="bg-background">Joining Fee</option>
                  <option value="treat_event" className="bg-background">Member Treat / Gadget</option>
                  <option value="fine_penalty" className="bg-background">Standup Fine</option>
                  <option value="miscellaneous" className="bg-background">Other Deposit</option>
                </>
              )}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tx-member">Associated Member (Optional)</Label>
            <select
              id="tx-member"
              value={relatedMemberId}
              onChange={(e) => setRelatedMemberId(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="" className="bg-background">None / Whole Team</option>
              {members.map((m) => (
                <option key={m.id} value={m.id} className="bg-background">
                  {m.name} ({m.department})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tx-desc">Notes (Optional)</Label>
            <Input
              id="tx-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Receipt verified, paid by Asim"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Save Transaction
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
