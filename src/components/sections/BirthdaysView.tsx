'use client';

import React, { useState } from 'react';
import { useTRF } from '@/context/TRFContext';
import { getBirthdayCountdown } from '@/lib/utils';
import { useCurrentDate } from '@/hooks/useCurrentDate';
import { Cake, Sparkles, Plus, Calendar, Clock, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { motion } from 'framer-motion';

interface BirthdaysViewProps {
  onOpenNewTransaction: () => void;
}

export function BirthdaysView({ onOpenNewTransaction }: BirthdaysViewProps) {
  const { members, triggerCelebration, isManager } = useTRF();
  const currentDate = useCurrentDate();
  const [filterMode, setFilterMode] = useState<'week' | 'all'>('week');

  // Compute countdown for each member and sort by closest
  const membersWithCountdown = members
    .map((member) => ({
      member,
      countdown: getBirthdayCountdown(member.birthDate, currentDate),
    }))
    .sort((a, b) => a.countdown.daysLeft - b.countdown.daysLeft);

  // Strictly filter for birthdays within the next 7 days (or today)
  const upcomingWeekBirthdays = membersWithCountdown.filter(
    (item) => item.countdown.daysLeft <= 7
  );

  const displayedList = filterMode === 'week' ? upcomingWeekBirthdays : membersWithCountdown;

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
            Birthdays & Celebrations
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Team birthdays occurring within the next 7 days funded from TRF
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={triggerCelebration}
            className="gap-1.5 text-xs"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Celebrate 🎉</span>
          </Button>

          {isManager && (
            <Button
              size="sm"
              onClick={onOpenNewTransaction}
              className="gap-1.5 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Log Cake Expense</span>
            </Button>
          )}
        </div>
      </div>

      {/* Spotlight: Only shown if someone has a birthday in the next 7 days */}
      {upcomingWeekBirthdays.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            Upcoming This Week ({upcomingWeekBirthdays.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {upcomingWeekBirthdays.map(({ member, countdown }) => (
              <Card key={member.id} className="border-zinc-200 dark:border-zinc-800">
                <CardContent className="p-4 flex items-center justify-between gap-3.5">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-11 w-11 border border-zinc-200 dark:border-zinc-800">
                      <AvatarImage src={member.avatarUrl} alt={member.name} />
                      <AvatarFallback className="text-xs uppercase font-medium">
                        {member.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          {member.name}
                        </span>
                        <Badge
                          variant={countdown.isToday ? 'default' : 'secondary'}
                          className="text-[10px]"
                        >
                          {countdown.isToday ? 'Today! 🎂' : `In ${countdown.daysLeft}d`}
                        </Badge>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        {member.designation} • {countdown.nextBirthdayDate.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={triggerCelebration}
                    className="gap-1 text-xs shrink-0"
                  >
                    <Cake className="h-3.5 w-3.5" />
                    <span>Wish</span>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card className="border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
          <CardContent className="p-6 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 mb-2">
              <Calendar className="h-5 w-5 text-zinc-400" />
            </div>
            <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              No Birthdays in the Next 7 Days
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
              Teammate birthdays will automatically appear here exactly 1 week before their day so the team can arrange a cake and celebration.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Birthday Schedule Table with View Filter */}
      <Card>
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-semibold">Teammate Birthday Schedule</CardTitle>
            <CardDescription className="text-xs">
              {filterMode === 'week' ? 'Showing birthdays within 7 days' : 'Full team roster calendar'}
            </CardDescription>
          </div>

          <div className="flex items-center gap-1 self-start sm:self-auto">
            <Button
              variant={filterMode === 'week' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setFilterMode('week')}
              className="h-7 text-xs"
            >
              Next 7 Days ({upcomingWeekBirthdays.length})
            </Button>
            <Button
              variant={filterMode === 'all' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setFilterMode('all')}
              className="h-7 text-xs"
            >
              All Year ({members.length})
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teammate</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Birthday Date</TableHead>
                <TableHead className="text-right">Countdown</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-xs text-zinc-500">
                    No birthdays in the next 7 days. Switch to "All Year" to view all dates.
                  </TableCell>
                </TableRow>
              ) : (
                displayedList.map(({ member, countdown }) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={member.avatarUrl} alt={member.name} />
                          <AvatarFallback className="text-[10px] uppercase">
                            {member.name.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-xs text-zinc-900 dark:text-zinc-100">
                            {member.name}
                          </div>
                          <div className="text-[11px] text-zinc-400">
                            {member.designation}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-zinc-500">
                      {member.department}
                    </TableCell>

                    <TableCell className="text-xs text-zinc-500 font-mono whitespace-nowrap">
                      {countdown.nextBirthdayDate.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </TableCell>

                    <TableCell className="text-right whitespace-nowrap">
                      <Badge
                        variant={countdown.isToday ? 'default' : countdown.daysLeft <= 7 ? 'secondary' : 'outline'}
                        className="text-[10px]"
                      >
                        {countdown.isToday ? 'Today! 🎂' : `${countdown.daysLeft}d left`}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
