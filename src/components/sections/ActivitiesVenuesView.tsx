'use client';

import React, { useState } from 'react';
import { useTRF } from '@/context/TRFContext';
import { formatPKR, formatDate } from '@/lib/utils';
import {
  Plus,
  ThumbsUp,
  MapPin,
  Calendar,
  Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { motion } from 'framer-motion';

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

  const [activeTab, setActiveTab] = useState<'venues' | 'activities'>('venues');
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
    setActiveTab('activities');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="space-y-4"
    >
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Places & Outings
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Team wishlist voting, planned outings, and TRF pool subsidies
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenAddVenue}
            className="gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Suggest Place</span>
          </Button>

          {isManager && (
            <Button
              size="sm"
              onClick={() => setShowPlanActivityModal(true)}
              className="gap-1.5"
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Schedule Outing</span>
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'venues' | 'activities')}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="venues">
            Wishlist Places ({venues.length})
          </TabsTrigger>
          <TabsTrigger value="activities">
            Planned Outings ({plannedActivities.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Venues Wishlist */}
        <TabsContent value="venues" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {venues.map((venue) => {
              const hasVoted = venue.votes.includes(currentUser.id);
              return (
                <Card key={venue.id} className="flex flex-col justify-between">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {venue.category}
                      </Badge>
                      <span className="text-xs text-zinc-500 font-mono">
                        ★ {venue.rating}
                      </span>
                    </div>
                    <CardTitle className="text-base mt-2">{venue.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 text-xs">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{venue.location}</span>
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pb-3 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                    {venue.description}
                  </CardContent>

                  <div className="p-4 pt-0 mt-auto border-t border-border flex items-center justify-between text-xs">
                    <div>
                      <div className="text-[10px] text-zinc-400">Est. / Head</div>
                      <div className="font-mono font-medium text-zinc-900 dark:text-zinc-100">
                        {formatPKR(venue.estimatedCostPerHead)}
                      </div>
                    </div>

                    <Button
                      variant={hasVoted ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleVenueVote(venue.id)}
                      className="gap-1.5 h-8 text-xs"
                    >
                      <ThumbsUp className={`h-3 w-3 ${hasVoted ? 'fill-current' : ''}`} />
                      <span>{venue.votes.length} {venue.votes.length === 1 ? 'Vote' : 'Votes'}</span>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Tab 2: Planned Outings */}
        <TabsContent value="activities" className="mt-4 space-y-3">
          {plannedActivities.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-xs text-zinc-500">
                No planned outings yet. Managers can click "Schedule Outing" above.
              </CardContent>
            </Card>
          ) : (
            plannedActivities.map((act) => {
              const userRsvp = act.rsvps.find((r) => r.userId === currentUser.id)?.status || 'maybe';
              const goingCount = act.rsvps.filter((r) => r.status === 'going').length;

              return (
                <Card key={act.id}>
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px] uppercase">
                          {act.status}
                        </Badge>
                        <span className="text-xs text-zinc-500 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {act.venueName}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-zinc-500">
                        {formatDate(act.date)} at {act.time}
                      </div>
                    </div>
                    <CardTitle className="text-base mt-1">{act.title}</CardTitle>
                    {act.description && (
                      <CardDescription className="text-xs">{act.description}</CardDescription>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg border border-border bg-muted/40 text-center">
                      <div>
                        <div className="text-[10px] text-zinc-400">Est. Total Bill</div>
                        <div className="text-xs font-mono font-medium text-zinc-900 dark:text-zinc-100">
                          {formatPKR(act.estimatedTotalBudget)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-zinc-400">TRF Pool Share</div>
                        <div className="text-xs font-mono font-medium text-zinc-900 dark:text-zinc-100">
                          {formatPKR(act.trfContributionShare)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-zinc-400">Member Share / Head</div>
                        <div className="text-xs font-mono font-medium text-zinc-900 dark:text-zinc-100">
                          {formatPKR(act.personalContributionPerHead)}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                        <Users className="h-3.5 w-3.5" />
                        <span><strong>{goingCount} Going</strong> ({act.rsvps.length} invited)</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-xs text-zinc-400 mr-1">RSVP:</span>
                        <Button
                          variant={userRsvp === 'going' ? 'default' : 'outline'}
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => updateRSVP(act.id, 'going')}
                        >
                          Going
                        </Button>
                        <Button
                          variant={userRsvp === 'maybe' ? 'secondary' : 'outline'}
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => updateRSVP(act.id, 'maybe')}
                        >
                          Maybe
                        </Button>
                        <Button
                          variant={userRsvp === 'not_going' ? 'destructive' : 'outline'}
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => updateRSVP(act.id, 'not_going')}
                        >
                          Can't
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>

      {/* Schedule Outing Dialog */}
      <Dialog open={showPlanActivityModal} onOpenChange={setShowPlanActivityModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Team Outing</DialogTitle>
            <DialogDescription>
              Plan a team recreational dinner or hangout subsidized by the TRF fund.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateActivity} className="space-y-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="act-title">Outing Title</Label>
              <Input
                id="act-title"
                required
                value={actTitle}
                onChange={(e) => setActTitle(e.target.value)}
                placeholder="e.g. Monthly Team Dinner"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="act-venue">Venue Name</Label>
              <Input
                id="act-venue"
                required
                value={actVenueName}
                onChange={(e) => setActVenueName(e.target.value)}
                placeholder="e.g. Roasters Coffee House & Grill"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="act-date">Date</Label>
                <Input
                  id="act-date"
                  type="date"
                  required
                  value={actDate}
                  onChange={(e) => setActDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="act-time">Time</Label>
                <Input
                  id="act-time"
                  value={actTime}
                  onChange={(e) => setActTime(e.target.value)}
                  placeholder="7:30 PM"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="act-bill">Estimated Total Bill (PKR)</Label>
                <Input
                  id="act-bill"
                  type="number"
                  value={actTotalBudget}
                  onChange={(e) => setActTotalBudget(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="act-trf">TRF Pool Share (PKR)</Label>
                <Input
                  id="act-trf"
                  type="number"
                  value={actTrfShare}
                  onChange={(e) => setActTrfShare(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPlanActivityModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Create Outing
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
