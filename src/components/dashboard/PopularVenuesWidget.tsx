'use client';

import React from 'react';
import { useTRF } from '@/context/TRFContext';
import { formatPKR } from '@/lib/utils';
import { Compass, ThumbsUp, MapPin, ArrowRight } from 'lucide-react';

interface PopularVenuesWidgetProps {
  onNavigateToVenues: () => void;
  onOpenAddVenue: () => void;
}

export function PopularVenuesWidget({ onNavigateToVenues, onOpenAddVenue }: PopularVenuesWidgetProps) {
  const { venues, toggleVenueVote, currentUser } = useTRF();

  // Sort venues by most votes
  const sortedVenues = [...venues]
    .sort((a, b) => b.votes.length - a.votes.length)
    .slice(0, 3);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg backdrop-blur-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2 text-cyan-400">
            <Compass className="h-4 w-4" />
            <h3 className="text-sm font-bold text-white tracking-wide">Hangout Spots Wishlist</h3>
          </div>
          <button
            onClick={onNavigateToVenues}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium transition-colors"
          >
            <span>Explore All</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <div className="mt-4 space-y-2.5">
          {sortedVenues.map((venue) => {
            const hasVoted = venue.votes.includes(currentUser.id);
            return (
              <div
                key={venue.id}
                className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3 hover:border-slate-700 transition-colors flex items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white truncate">
                      {venue.name}
                    </span>
                    <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-medium text-slate-400 capitalize">
                      {venue.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="h-2.5 w-2.5 text-slate-500" />
                      {venue.location}
                    </span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold whitespace-nowrap">
                      ~{formatPKR(venue.estimatedCostPerHead)} / head
                    </span>
                  </div>
                </div>

                {/* Upvote button */}
                <button
                  onClick={() => toggleVenueVote(venue.id)}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                    hasVoted
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-700/60'
                  }`}
                  title={hasVoted ? 'You upvoted this venue' : 'Vote for this venue'}
                >
                  <ThumbsUp className={`h-3 w-3 ${hasVoted ? 'fill-cyan-400 text-cyan-400' : ''}`} />
                  <span>{venue.votes.length}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
        <span className="text-xs text-slate-400">Have a new venue in mind?</span>
        <button
          onClick={onOpenAddVenue}
          className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          + Suggest Place
        </button>
      </div>
    </div>
  );
}
