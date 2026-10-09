'use client';

import React, { useState } from 'react';
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

interface AddVenueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddVenueModal({ isOpen, onClose }: AddVenueModalProps) {
  const { addVenue } = useTRF();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<VenuePlace['category']>('restaurant');
  const [location, setLocation] = useState('');
  const [estimatedCostPerHead, setEstimatedCostPerHead] = useState('2000');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !location.trim()) return;

    addVenue({
      name: name.trim(),
      category,
      location: location.trim(),
      estimatedCostPerHead: parseFloat(estimatedCostPerHead) || 1500,
      description: description.trim(),
    });

    setName('');
    setLocation('');
    setDescription('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Suggest Hangout Spot</DialogTitle>
          <DialogDescription>
            Add a destination for the team to vote on
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1.5">
            <Label htmlFor="venue-name">Venue Name *</Label>
            <Input
              id="venue-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Roasters, Monal, Super Space"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="venue-category">Category</Label>
              <select
                id="venue-category"
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
              <Label htmlFor="venue-cost">Est. Cost (PKR/head)</Label>
              <Input
                id="venue-cost"
                type="number"
                required
                min="200"
                step="100"
                value={estimatedCostPerHead}
                onChange={(e) => setEstimatedCostPerHead(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="venue-location">Location / City *</Label>
            <Input
              id="venue-location"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Blue Area, Islamabad"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="venue-desc">Description</Label>
            <Input
              id="venue-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Why should the team visit here?"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Suggest Spot
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
