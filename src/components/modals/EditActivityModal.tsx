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
import { Trash2, AlertTriangle, Users } from 'lucide-react';

interface EditActivityModalProps {
  activity: PlannedActivity | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditActivityModal({ activity, isOpen, onClose }: EditActivityModalProps) {
  const {
    updatePlannedActivity,
    completePlannedActivity,
    deletePlannedActivity,
    isManager,
    activeHeadcount,
    currentBalance,
    venues,
  } = useTRF();

  const [title, setTitle] = useState('');
  const [venueName, setVenueName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [estimatedTotalBudget, setEstimatedTotalBudget] = useState('15000');
  const [trfContributionShare, setTrfContributionShare] = useState('10000');
  const [status, setStatus] = useState<PlannedActivity['status']>('voting');
  const [splitDeficit, setSplitDeficit] = useState(true);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (activity) {
      setTitle(activity.title);
      setVenueName(activity.venueName);
      setDate(activity.date);
      setTime(activity.time || '7:30 PM');
      setEstimatedTotalBudget(String(activity.estimatedTotalBudget));
      setTrfContributionShare(String(activity.trfContributionShare));
      setStatus(activity.status);
      setDescription(activity.description || '');
    }
  }, [activity]);

  if (!activity) return null;

  const totalBill = parseFloat(estimatedTotalBudget) || 0;
  const trfShare = parseFloat(trfContributionShare) || 0;
  const remainingShare = Math.max(0, totalBill - trfShare);
  const calculatedMemberShare = activeHeadcount > 0 ? Math.round(remainingShare / activeHeadcount) : 0;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !venueName.trim() || !date) return;

    setIsSubmitting(true);
    if (status === 'completed' && activity.status !== 'completed') {
      await completePlannedActivity({
        activityId: activity.id,
        finalBillAmount: totalBill,
        splitShortfallWithMembers: totalBill > currentBalance ? splitDeficit : false,
      });
      await updatePlannedActivity(activity.id, {
        title: title.trim(),
        venueName: venueName.trim(),
        date,
        time: time.trim() || '7:30 PM',
        description: description.trim(),
      });
    } else {
      await updatePlannedActivity(activity.id, {
        title: title.trim(),
        venueName: venueName.trim(),
        date,
        time: time.trim() || '7:30 PM',
        estimatedTotalBudget: totalBill,
        trfContributionShare: trfShare,
        status,
        description: description.trim(),
      });
    }
    setIsSubmitting(false);
    onClose();
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete planned outing "${activity.title}"?`)) {
      setIsSubmitting(true);
      await deletePlannedActivity(activity.id);
      setIsSubmitting(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Planned Outing</DialogTitle>
          <DialogDescription>
            Update event timeline, adjust TRF budget subsidy, or remove this outing.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-3.5">
          {/* Summary Box */}
          <div className="rounded-lg border border-border bg-muted/40 p-3 flex items-center justify-between">
            <div>
              <div className="text-xs text-zinc-500">
                Remaining bill: {formatPKR(remainingShare)}
              </div>
              <div className="text-xs text-zinc-400">
                Est. Member Share: {formatPKR(calculatedMemberShare)} / head ({activeHeadcount} heads)
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-zinc-400">Total Budget</div>
              <div className="text-base font-mono font-bold text-zinc-900 dark:text-zinc-100">
                {formatPKR(totalBill)}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-act-title">Outing Title *</Label>
            <Input
              id="edit-act-title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Monthly Team Dinner"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-act-venue">Venue Name *</Label>
              {venues.length > 0 && (
                <span className="text-[10px] text-muted-foreground">
                  Pick from wishlist or type custom
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                id="edit-act-venue"
                required
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                placeholder="e.g. Monash BBQ & Grill"
                className="flex-1"
              />
              {venues.length > 0 && (
                <select
                  aria-label="Select venue from wishlist"
                  onChange={(e) => {
                    if (e.target.value) setVenueName(e.target.value);
                  }}
                  defaultValue=""
                  className="h-9 rounded-md border border-input bg-transparent px-2 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="" disabled>Wishlist</option>
                  {venues.map((v) => (
                    <option key={v.id} value={v.name} className="bg-background">
                      {v.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-act-date">Date *</Label>
              <Input
                id="edit-act-date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-act-time">Time</Label>
              <Input
                id="edit-act-time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="8:00 PM"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-act-total">Total Bill (PKR)</Label>
              <Input
                id="edit-act-total"
                type="number"
                min="0"
                step="any"
                value={estimatedTotalBudget}
                onChange={(e) => setEstimatedTotalBudget(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-act-trf">TRF Subsidy (PKR)</Label>
              <Input
                id="edit-act-trf"
                type="number"
                min="0"
                step="any"
                value={trfContributionShare}
                onChange={(e) => setTrfContributionShare(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-act-status">Status</Label>
            <select
              id="edit-act-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as PlannedActivity['status'])}
              className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="voting" className="bg-background">Voting / Discussion</option>
              <option value="confirmed" className="bg-background">Confirmed</option>
              <option value="completed" className="bg-background">Completed</option>
              <option value="cancelled" className="bg-background">Cancelled</option>
            </select>

            {status === 'completed' && activity.status !== 'completed' && (
              <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-2 mt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Available TRF Pool:</span>
                  <span className="font-semibold">{formatPKR(currentBalance)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Bill To Deduct:</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">-{formatPKR(totalBill)}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono font-medium pt-1.5 border-t border-border">
                  <span>Projected Pool:</span>
                  <span className={currentBalance - totalBill < 0 ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-emerald-600 dark:text-emerald-400 font-bold'}>
                    {formatPKR(currentBalance - totalBill)}
                  </span>
                </div>

                {totalBill > currentBalance && (
                  <div className="pt-2 border-t border-amber-200 dark:border-amber-900/40">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={splitDeficit}
                        onChange={(e) => setSplitDeficit(e.target.checked)}
                        className="mt-0.5 rounded border-amber-400 text-primary"
                      />
                      <div className="text-[11px]">
                        <span className="font-medium text-amber-900 dark:text-amber-200">
                          Equally divide remaining {formatPKR(totalBill - currentBalance)} across all {Math.max(1, activeHeadcount)} members
                        </span>
                        <div className="text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Users className="h-3 w-3" />
                          <span>{formatPKR(Math.ceil((totalBill - currentBalance) / Math.max(1, activeHeadcount)))} / member will be logged as pending due</span>
                        </div>
                      </div>
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-act-desc">Description & Notes</Label>
            <Input
              id="edit-act-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Reservation under Asim, casual dress code"
            />
          </div>

          <DialogFooter className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2">
            {isManager ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="gap-1.5 w-full sm:w-auto"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Outing</span>
              </Button>
            ) : <div />}

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
