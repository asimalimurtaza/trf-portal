'use client';

import React, { useState, useEffect } from 'react';
import { useTRF } from '@/context/TRFContext';
import { VenuePlace } from '@/types/trf';
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

interface EditVenueModalProps {
  venue: VenuePlace | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditVenueModal({ venue, isOpen, onClose }: EditVenueModalProps) {
  const { updateVenue, deleteVenue, isManager, currentUser } = useTRF();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<VenuePlace['category']>('restaurant');
  const [location, setLocation] = useState('');
  const [estimatedCostPerHead, setEstimatedCostPerHead] = useState('2000');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<VenuePlace['status']>('wishlist');
  const [rating, setRating] = useState('4.5');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (venue) {
      setName(venue.name);
      setCategory(venue.category);
      setLocation(venue.location);
      setEstimatedCostPerHead(String(venue.estimatedCostPerHead));
      setDescription(venue.description || '');
      setStatus(venue.status || 'wishlist');
      setRating(String(venue.rating || 4.5));
    }
  }, [venue]);

  if (!venue) return null;

  const canEditOrDelete = isManager || venue.suggestedBy === currentUser.name;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !location.trim()) return;

    setIsSubmitting(true);
    await updateVenue(venue.id, {
      name: name.trim(),
      category,
      location: location.trim(),
      estimatedCostPerHead: parseFloat(estimatedCostPerHead) || 1500,
      description: description.trim(),
      status,
      rating: parseFloat(rating) || 4.5,
    });
    setIsSubmitting(false);
    onClose();
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${venue.name}" from suggested places?`)) {
      setIsSubmitting(true);
      await deleteVenue(venue.id);
      setIsSubmitting(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Suggested Place</DialogTitle>
          <DialogDescription>
            Modify destination details, update status, or delete this venue from the team wishlist.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-3.5">
          <div className="space-y-1.5">
            <Label htmlFor="edit-venue-name">Venue Name *</Label>
            <Input
              id="edit-venue-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Roasters, Monal, Super Space"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-venue-category">Category</Label>
              <select
                id="edit-venue-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as VenuePlace['category'])}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="restaurant" className="bg-background">Restaurant</option>
                <option value="cafe" className="bg-background">Cafe / Hi-Tea</option>
                <option value="gaming" className="bg-background">Gaming & Arcade</option>
                <option value="adventure" className="bg-background">Bowling / Adventure</option>
                <option value="outdoor" className="bg-background">Outdoor / BBQ</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-venue-cost">Est. Cost (PKR/head)</Label>
              <Input
                id="edit-venue-cost"
                type="number"
                required
                min="0"
                step="any"
                value={estimatedCostPerHead}
                onChange={(e) => setEstimatedCostPerHead(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-venue-location">Location / City *</Label>
            <Input
              id="edit-venue-location"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Blue Area, Islamabad"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-venue-status">Status</Label>
              <select
                id="edit-venue-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as VenuePlace['status'])}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="wishlist" className="bg-background">Wishlist (Voting)</option>
                <option value="planned" className="bg-background">Planned for Outing</option>
                <option value="visited" className="bg-background">Visited / Completed</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-venue-rating">Rating (1-5)</Label>
              <Input
                id="edit-venue-rating"
                type="number"
                min="1"
                max="5"
                step="any"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-venue-desc">Description</Label>
            <Input
              id="edit-venue-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Why should the team visit here?"
            />
          </div>

          <DialogFooter className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2">
            {canEditOrDelete ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="gap-1.5 w-full sm:w-auto"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Place</span>
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
