'use client';

import React, { useState, useEffect } from 'react';
import { useTRF } from '@/context/TRFContext';
import { ContributionRule } from '@/types/trf';
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
import { Textarea } from '@/components/ui/textarea';
import { Trash2, AlertCircle } from 'lucide-react';

interface AddEditRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  ruleToEdit?: ContributionRule | null;
}

export function AddEditRuleModal({
  isOpen,
  onClose,
  ruleToEdit,
}: AddEditRuleModalProps) {
  const { addRule, updateRule, deleteRule, isManager } = useTRF();

  const isEditing = Boolean(ruleToEdit);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [suggestedAmount, setSuggestedAmount] = useState('3000');
  const [isMandatory, setIsMandatory] = useState(false);
  const [isConfirmDelete, setIsConfirmDelete] = useState(false);

  useEffect(() => {
    if (ruleToEdit) {
      setTitle(ruleToEdit.title);
      setDescription(ruleToEdit.description || '');
      setSuggestedAmount(ruleToEdit.suggestedAmount?.toString() || '1000');
      setIsMandatory(ruleToEdit.isMandatory);
    } else {
      setTitle('');
      setDescription('');
      setSuggestedAmount('3000');
      setIsMandatory(false);
    }
    setIsConfirmDelete(false);
  }, [ruleToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !suggestedAmount) return;

    const amountNum = Math.max(0, parseFloat(suggestedAmount) || 0);

    if (isEditing && ruleToEdit) {
      updateRule(ruleToEdit.id, {
        title: title.trim(),
        description: description.trim(),
        suggestedAmount: amountNum,
        isMandatory,
      });
    } else {
      addRule({
        title: title.trim(),
        description: description.trim(),
        suggestedAmount: amountNum,
        icon: isMandatory ? 'AlertCircle' : 'Gift',
        isMandatory,
      });
    }

    onClose();
  };

  const handleDelete = () => {
    if (!ruleToEdit) return;
    deleteRule(ruleToEdit.id);
    onClose();
  };

  const parsedAmount = parseFloat(suggestedAmount) || 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Contribution Rule & Amount' : 'Add New Contribution Rule'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the suggested contribution amount and policy terms for this rule.'
              : 'Create a milestone treat, event guideline, or mandatory fund contribution rule.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rule Title */}
          <div className="space-y-1.5">
            <Label htmlFor="rule-title">Rule Title *</Label>
            <Input
              id="rule-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. New Smartphone / Laptop Treat"
              required
            />
          </div>

          {/* Classification / Type */}
          <div className="space-y-1.5">
            <Label htmlFor="rule-type">Classification *</Label>
            <select
              id="rule-type"
              value={isMandatory ? 'mandatory' : 'milestone'}
              onChange={(e) => setIsMandatory(e.target.value === 'mandatory')}
              className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="milestone" className="bg-background">
                Milestone Treat (Celebratory / Discretionary)
              </option>
              <option value="mandatory" className="bg-background">
                Mandatory Rule (Joining Fee / Standup Delay Penalty)
              </option>
            </select>
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="rule-amount">
                {isMandatory ? 'Required Amount (PKR) *' : 'Suggested Treat Amount (PKR) *'}
              </Label>
              <span className="text-xs font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                {formatPKR(parsedAmount)}
              </span>
            </div>
            <Input
              id="rule-amount"
              type="number"
              step="any"
              min="0"
              value={suggestedAmount}
              onChange={(e) => setSuggestedAmount(e.target.value)}
              placeholder="e.g. 3000"
              required
            />
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              This amount auto-populates when teammates declare treats or dues under this rule.
            </p>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="rule-description">Guidelines & Description</Label>
            <Textarea
              id="rule-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief guidelines on when this contribution is expected..."
              rows={3}
            />
          </div>

          {/* Danger zone for delete */}
          {isEditing && isManager && (
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
              {isConfirmDelete ? (
                <div className="p-2.5 rounded-md bg-destructive/10 border border-destructive/20 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>Permanently delete this contribution rule?</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleDelete}
                      className="h-7 text-xs"
                    >
                      Yes, Delete
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsConfirmDelete(false)}
                      className="h-7 text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsConfirmDelete(true)}
                  className="text-xs text-destructive hover:bg-destructive/10 h-8 gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete Rule</span>
                </Button>
              )}
            </div>
          )}

          <DialogFooter className="pt-2 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Save Changes' : 'Create Rule'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
