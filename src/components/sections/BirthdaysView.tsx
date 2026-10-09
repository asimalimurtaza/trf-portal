'use client';

import React from 'react';
import { useTRF } from '@/context/TRFContext';
import { getBirthdayCountdown } from '@/lib/utils';
import { useCurrentDate } from '@/hooks/useCurrentDate';
import { Cake, Sparkles, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  // Compute countdown for each member and sort by closest
  const membersWithCountdown = members
    .map((member) => ({
      member,
      countdown: getBirthdayCountdown(member.birthDate, currentDate),
    }))
    .sort((a, b) => a.countdown.daysLeft - b.countdown.daysLeft);

  const nextPerson = membersWithCountdown[0];

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
            Upcoming team birthdays funded from the collective TRF pool
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={triggerCelebration}
            className="gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Celebrate 🎉</span>
          </Button>

          {isManager && (
            <Button
              size="sm"
              onClick={onOpenNewTransaction}
              className="gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Log Cake Expense</span>
            </Button>
          )}
        </div>
      </div>

      {/* Next Birthday Spotlight Card */}
      {nextPerson && (
        <Card>
          <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <Avatar className="h-12 w-12 border">
                <AvatarImage src={nextPerson.member.avatarUrl} alt={nextPerson.member.name} />
                <AvatarFallback className="text-sm uppercase">
                  {nextPerson.member.name.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    {nextPerson.member.name}
                  </span>
                  <Badge variant={nextPerson.countdown.isToday ? 'default' : 'secondary'} className="text-[10px]">
                    {nextPerson.countdown.isToday ? 'Today! 🎂' : `In ${nextPerson.countdown.daysLeft} days`}
                  </Badge>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {nextPerson.member.designation} • {nextPerson.member.department}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <div className="text-right">
                <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                  {nextPerson.countdown.nextBirthdayDate.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
                <div className="text-[11px] text-zinc-400">
                  Standard Cake Pool: PKR 3,500
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={triggerCelebration}
                className="gap-1.5 text-xs"
              >
                <Cake className="h-3.5 w-3.5" />
                <span>Wish</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Birthday Schedule Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Teammate Birthday Calendar</CardTitle>
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
              {membersWithCountdown.map(({ member, countdown }) => (
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
                      variant={countdown.isToday ? 'default' : countdown.daysLeft <= 14 ? 'secondary' : 'outline'}
                      className="text-[10px]"
                    >
                      {countdown.isToday ? 'Today' : `${countdown.daysLeft}d left`}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
