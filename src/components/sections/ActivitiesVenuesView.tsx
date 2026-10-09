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
  Clock,
  Users,
  Wallet,
  CheckCircle2,
  HelpCircle,
  XCircle,
  ExternalLink
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

  // Form states for creating planned activity
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
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Compass className="h-6 w-6 text-cyan-400" />
            Activities & Hangout Wishlist
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Vote on favorite dining & recreation spots, plan outings, and calculate TRF pool subsidies.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenAddVenue}
            className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 px-3.5 py-2 text-xs font-semibold text-cyan-300 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Suggest Place</span>
          </button>

          {isManager && (
            <button
              onClick={() => setShowPlanActivityModal(true)}
              className="rounded-xl bg-cyan-600 hover:bg-cyan-500 px-4 py-2 text-xs font-bold text-white shadow-lg transition-all flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              <span>Schedule Outing</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub Tabs: Venues vs Planned Outings */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('venues')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'venues'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Places Wishlist & Voting ({venues.length})
        </button>
        <button
          onClick={() => setActiveSubTab('activities')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'activities'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Planned Outings & RSVPs ({plannedActivities.length})
        </button>
      </div>

      {/* SUB-TAB 1: VENUES WISHLIST */}
      {activeSubTab === 'venues' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {venues.map((venue) => {
            const hasVoted = venue.votes.includes(currentUser.id);
            return (
              <div
                key={venue.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between hover:border-cyan-500/30 transition-all hover:-translate-y-1 shadow-xl group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-bold text-cyan-400 border border-cyan-500/20 uppercase tracking-wider">
                      {venue.category}
                    </span>
                    <span className="text-xs font-semibold text-amber-400 flex items-center gap-1">
                      ★ {venue.rating}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mt-3 group-hover:text-cyan-300 transition-colors">
                    {venue.name}
                  </h3>

                  <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
                    <span className="line-clamp-1">{venue.location}</span>
                  </p>

                  <p className="text-xs text-slate-400/90 mt-2.5 line-clamp-2 leading-relaxed">
                    {venue.description}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">
                      Est. Per Head
                    </div>
                    <div className="text-sm font-extrabold text-emerald-400">
                      {formatPKR(venue.estimatedCostPerHead)}
                    </div>
                  </div>

                  <button
                    onClick={() => toggleVenueVote(venue.id)}
                    className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                      hasVoted
                        ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-900/30'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    <ThumbsUp className={`h-3.5 w-3.5 ${hasVoted ? 'fill-slate-950' : ''}`} />
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
        <div className="space-y-6">
          {plannedActivities.map((act) => {
            const userRsvp = act.rsvps.find((r) => r.userId === currentUser.id)?.status || 'maybe';
            const goingCount = act.rsvps.filter((r) => r.status === 'going').length;

            return (
              <div
                key={act.id}
                className="rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/20 p-6 sm:p-7 shadow-2xl space-y-6"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                        {act.status}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-cyan-400" />
                        {act.venueName}
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                      {act.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">{act.description}</p>
                  </div>

                  <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2.5 rounded-2xl border border-slate-800 self-start sm:self-auto">
                    <Calendar className="h-4 w-4 text-cyan-400" />
                    <div className="text-xs">
                      <div className="font-bold text-white">{formatDate(act.date)}</div>
                      <div className="text-slate-400 text-[11px]">{act.time}</div>
                    </div>
                  </div>
                </div>

                {/* Financial Subsidy Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                    <div className="text-xs text-slate-400">Total Estimated Cost</div>
                    <div className="text-lg font-extrabold text-white mt-1">
                      {formatPKR(act.estimatedTotalBudget)}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Overall bill</div>
                  </div>

                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-4">
                    <div className="text-xs text-emerald-300 font-semibold flex items-center gap-1">
                      <Wallet className="h-3.5 w-3.5" /> Covered by TRF Pool
                    </div>
                    <div className="text-lg font-extrabold text-emerald-400 mt-1">
                      {formatPKR(act.trfContributionShare)}
                    </div>
                    <div className="text-[11px] text-emerald-400/70 mt-0.5">Funded from balance</div>
                  </div>

                  <div className="rounded-2xl border border-cyan-500/20 bg-cyan-950/20 p-4">
                    <div className="text-xs text-cyan-300 font-semibold">
                      Personal Share / Head
                    </div>
                    <div className="text-lg font-extrabold text-cyan-400 mt-1">
                      {formatPKR(act.personalContributionPerHead)}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Remaining per member</div>
                  </div>
                </div>

                {/* RSVPs section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-y-0.5 items-center gap-1 text-xs text-slate-300">
                      <Users className="h-4 w-4 text-cyan-400" />
                      <strong className="text-white">{goingCount} Going</strong>
                      <span className="text-slate-500">({act.rsvps.length} members invited)</span>
                    </div>
                  </div>

                  {/* Interactive RSVP buttons for current user */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 mr-1">Your RSVP:</span>
                    <button
                      onClick={() => updateRSVP(act.id, 'going')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        userRsvp === 'going'
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Going</span>
                    </button>
                    <button
                      onClick={() => updateRSVP(act.id, 'maybe')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        userRsvp === 'maybe'
                          ? 'bg-amber-600 text-white shadow-md'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <HelpCircle className="h-3.5 w-3.5" />
                      <span>Maybe</span>
                    </button>
                    <button
                      onClick={() => updateRSVP(act.id, 'not_going')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        userRsvp === 'not_going'
                          ? 'bg-rose-600 text-white shadow-md'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      <span>Can't</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Outing Modal */}
      {showPlanActivityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">Schedule Team Outing</h3>
            <form onSubmit={handleCreateActivity} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={actTitle}
                  onChange={(e) => setActTitle(e.target.value)}
                  placeholder="e.g. November Gaming & Dinner Night"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Venue Name *
                </label>
                <input
                  type="text"
                  required
                  value={actVenueName}
                  onChange={(e) => setActVenueName(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={actDate}
                    onChange={(e) => setActDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Time</label>
                  <input
                    type="text"
                    value={actTime}
                    onChange={(e) => setActTime(e.target.value)}
                    placeholder="7:30 PM"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Est. Total Bill (PKR)
                  </label>
                  <input
                    type="number"
                    value={actTotalBudget}
                    onChange={(e) => setActTotalBudget(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    TRF Pool Share (PKR)
                  </label>
                  <input
                    type="number"
                    value={actTrfShare}
                    onChange={(e) => setActTrfShare(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={actDesc}
                  onChange={(e) => setActDesc(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPlanActivityModal(false)}
                  className="rounded-xl px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-cyan-600 hover:bg-cyan-500 px-5 py-2 text-xs font-bold text-white"
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
