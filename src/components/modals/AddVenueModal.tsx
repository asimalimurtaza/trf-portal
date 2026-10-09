'use client';

import React, { useState } from 'react';
import { useTRF } from '@/context/TRFContext';
import { VenuePlace } from '@/types/trf';
import { X, Compass, MapPin } from 'lucide-react';

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

  if (!isOpen) return null;

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

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Suggest Hangout Spot / Venue</h3>
              <p className="text-xs text-slate-400">Add a destination for the team to vote on</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Venue Name */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Venue Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Roasters Beverly, Super Space Giga Mall, Monal"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Category & Cost */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as VenuePlace['category'])}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="restaurant">Restaurant / Dining</option>
                <option value="cafe">Cafe / Hi-Tea</option>
                <option value="gaming">Gaming & Arcade</option>
                <option value="adventure">Bowling / Adventure</option>
                <option value="outdoor">Outdoor / Barbecue</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Est. Cost (PKR/head)
              </label>
              <input
                type="number"
                required
                min="200"
                step="100"
                value={estimatedCostPerHead}
                onChange={(e) => setEstimatedCostPerHead(e.target.value)}
                placeholder="2000"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Location / City *
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Blue Area, F-7 Markaz, Islamabad"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Why should the team go here?
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Great steaks, cozy terrace seating, good sprint celebration spot"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-cyan-600 hover:bg-cyan-500 px-5 py-2 text-xs font-bold text-white shadow-lg transition-all"
            >
              Add Venue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
