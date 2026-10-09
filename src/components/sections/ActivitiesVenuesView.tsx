'use client';

import React, { useState } from 'react';
import { useTRF } from '@/context/TRFContext';
import { formatPKR, formatDate } from '@/lib/utils';
import {
  Compass,
  Plus,
  ThumbsUp,
  MapPin,
  Calendar,
  Wallet,
  CheckCircle2,
  HelpCircle,
  XCircle,
  Users
} from 'lucide-react';

interface ActivitiesVenuesViewProps {
  onOpenAddVenue: () => void;
}

export function ActivitiesVenuesView({ onOpenAddVenue }: ActivitiesVenuesViewProps) {
  const {
    venues,
    toggleVenueVote,
    plannedActivities,
    updateRSVP,
    currentUser,
    isManager,
    createPlannedActivity,
  } = useTRF();

  const [activeSubTab, setActiveSubTab] = useState<'venues' | 'activities'>('venues');
  const [showPlanActivityModal, setShowPlanActivityModal] = useState(false);

  const [actTitle, setActTitle] = useState('');
  const [actVenueName, setActVenueName] = useState('Roasters Coffee House & Grill');
  const [actDate, setActDate] = useState('2026-10-30');
  const [actTime, setActTime] = useState('7:30 PM');
  const [actTotalBudget, setActTotalBudget] = useState('18000');
  const [actTrfShare, setActTrfShare] = useState('12000');
  const [actDesc, setActDesc] = useState('');

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actTitle.trim() || !actVenueName.trim()) return;

    createPlannedActivity({
      title: actTitle.trim(),
      venueName: actVenueName.trim(),
      date: actDate,
      time: actTime,
      estimatedTotalBudget: parseFloat(actTotalBudget) || 10000,
      trfContributionShare: parseFloat(actTrfShare) || 5000,
      description: actDesc.trim(),
    });

    setShowPlanActivityModal(false);
    setActiveSubTab('activities');
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Compass className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            Activities & Hangout Wishlist
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Vote on favorite places, plan outings, and calculate TRF pool subsidies.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={onOpenAddVenue}
            className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 px-3.5 py-2 text-xs font-semibold text-cyan-700 dark:text-cyan-300 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Suggest Place</span>
          </button>

          {isManager && (
            <button
              onClick={() => setShowPlanActivityModal(true)}
              className="rounded-xl bg-cyan-600 hover:bg-cyan-500 px-4 py-2 text-xs font-bold text-white shadow-xs transition-all flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              <span>Schedule Outing</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub Tabs: Venues vs Planned Outings */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('venues')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'venues'
              ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border border-cyan-500/20'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Places Wishlist ({venues.length})
        </button>
        <button
          onClick={() => setActiveSubTab('activities')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'activities'
              ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border border-cyan-500/20'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Planned Outings ({plannedActivities.length})
        </button>
      </div>

      {/* SUB-TAB 1: VENUES WISHLIST */}
      {activeSubTab === 'venues' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {venues.map((venue) => {
            const hasVoted = venue.votes.includes(currentUser.id);
            return (
              <div
                key={venue.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase">
                      {venue.category}
                    </span>
                    <span className="text-xs font-semibold text-amber-500">
                      ★ {venue.rating}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-2">
                    {venue.name}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="line-clamp-1">{venue.location}</span>
                  </p>

                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
                    {venue.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">
                      Est. Per Head
                    </div>
                    <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                      {formatPKR(venue.estimatedCostPerHead)}
                    </div>
                  </div>

                  <button
                    onClick={() => toggleVenueVote(venue.id)}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                      hasVoted
                        ? 'bg-cyan-500 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <ThumbsUp className={`h-3 w-3 ${hasVoted ? 'fill-white' : ''}`} />
                    <span>{venue.votes.length} Votes</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SUB-TAB 2: PLANNED OUTINGS & RSVPs */}
      {activeSubTab === 'activities' && (
        <div className="space-y-4">
          {plannedActivities.map((act) => {
            const userRsvp = act.rsvps.find((r) => r.userId === currentUser.id)?.status || 'maybe';
            const goingCount = act.rsvps.filter((r) => r.status === 'going').length;

            return (
              <div
                key={act.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                        {act.status}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {act.venueName}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                      {act.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
                    <Calendar className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                    <span>{formatDate(act.date)} at {act.time}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3">
                    <div className="text-[11px] text-slate-500">Total Bill</div>
                    <div className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                      {formatPKR(act.estimatedTotalBudget)}
                    </div>
                  </div>
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20 p-3">
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">TRF Pool Share</div>
                    <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {formatPKR(act.trfContributionShare)}
                    </div>
                  </div>
                  <div className="rounded-xl border border-cyan-500/20 bg-cyan-50/50 dark:bg-cyan-950/20 p-3">
                    <div className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold">Member Share / Head</div>
                    <div className="text-base font-extrabold text-cyan-600 dark:text-cyan-400 mt-0.5">
                      {formatPKR(act.personalContributionPerHead)}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <Users className="h-3.5 w-3.5" />
                    <strong>{goingCount} Going</strong> ({act.rsvps.length} invited)
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-500 mr-1">RSVP:</span>
                    <button
                      onClick={() => updateRSVP(act.id, 'going')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        userRsvp === 'going'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Going
                    </button>
                    <button
                      onClick={() => updateRSVP(act.id, 'maybe')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        userRsvp === 'maybe'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Maybe
                    </button>
                    <button
                      onClick={() => updateRSVP(act.id, 'not_going')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        userRsvp === 'not_going'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Can't
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Outing Modal */}
      {showPlanActivityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Schedule Outing</h3>
            <form onSubmit={handleCreateActivity} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={actTitle}
                  onChange={(e) => setActTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Venue *</label>
                <input
                  type="text"
                  required
                  value={actVenueName}
                  onChange={(e) => setActVenueName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={actDate}
                    onChange={(e) => setActDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Time</label>
                  <input
                    type="text"
                    value={actTime}
                    onChange={(e) => setActTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Total Bill (PKR)</label>
                  <input
                    type="number"
                    value={actTotalBudget}
                    onChange={(e) => setActTotalBudget(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">TRF Share (PKR)</label>
                  <input
                    type="number"
                    value={actTrfShare}
                    onChange={(e) => setActTrfShare(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPlanActivityModal(false)}
                  className="rounded-xl px-4 py-2 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-cyan-600 hover:bg-cyan-500 px-4 py-2 text-xs font-bold text-white"
                >
                  Create Outing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
