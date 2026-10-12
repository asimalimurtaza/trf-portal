'use client';

import React from 'react';
import { useTRF } from '@/context/TRFContext';
import { useModals } from '@/context/ModalContext';
import { getBirthdayCountdown } from '@/lib/utils';
import { useCurrentDate } from '@/hooks/useCurrentDate';
import { Cake, Sparkles, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface UpcomingBirthdaysWidgetProps {
  onNavigateToBirthdays: () => void;
}

export function UpcomingBirthdaysWidget({ onNavigateToBirthdays }: UpcomingBirthdaysWidgetProps) {
  const { members } = useTRF();
  const { openSendBirthdayWishModal } = useModals();
  const currentDate = useCurrentDate();

  // Sort members by next birthday countdown
  const sortedMembers = [...members]
    .map((member) => ({
      member,
      countdown: getBirthdayCountdown(member.birthDate, currentDate),
    }))
    .sort((a, b) => a.countdown.daysLeft - b.countdown.daysLeft)
    .slice(0, 3);

  const nextCelebration = sortedMembers[0];

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Cake className="h-4 w-4 text-zinc-900 dark:text-zinc-100" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Upcoming Birthdays
            </h3>
          </div>
          <button
            onClick={onNavigateToBirthdays}
            className="text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 flex items-center gap-1 font-medium transition-colors cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {/* Highlight closest birthday */}
        {nextCelebration && (
          <div className="mt-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/50 p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar className="h-9 w-9 border border-zinc-200 dark:border-zinc-800 shrink-0">
                <AvatarImage src={nextCelebration.member.avatarUrl} alt={nextCelebration.member.name} />
                <AvatarFallback className="text-xs font-medium uppercase">
                  {nextCelebration.member.name.slice(0, 2)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                    {nextCelebration.member.name}
                  </span>
                  <Badge
                    variant={nextCelebration.countdown.isToday ? 'default' : 'secondary'}
                    className="text-[9px] px-1.5 py-0 h-4"
                  >
                    {nextCelebration.countdown.isToday ? 'Today! 🎂' : `In ${nextCelebration.countdown.daysLeft}d`}
                  </Badge>
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                  {nextCelebration.member.designation}
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                openSendBirthdayWishModal({
                  id: nextCelebration.member.id,
                  name: nextCelebration.member.name,
                  avatarUrl: nextCelebration.member.avatarUrl,
                })
              }
              className="h-7 px-2.5 text-xs gap-1 shrink-0 cursor-pointer"
            >
              <Sparkles className="h-3 w-3" />
              <span>Celebrate</span>
            </Button>
          </div>
        )}

        {/* Other upcoming */}
        <div className="mt-2.5 space-y-1.5">
          {sortedMembers.slice(1).map(({ member, countdown }) => (
            <div
              key={member.id}
              className="flex items-center justify-between rounded-md bg-zinc-50/40 dark:bg-zinc-900/30 p-2 px-2.5 border border-zinc-200 dark:border-zinc-800/80 text-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Avatar className="h-6 w-6 shrink-0">
                  <AvatarImage src={member.avatarUrl} alt={member.name} />
                  <AvatarFallback className="text-[9px] uppercase">
                    {member.name.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="font-medium text-zinc-900 dark:text-zinc-100 truncate text-xs">
                    {member.name}
                  </div>
                </div>
              </div>
              <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 text-zinc-500 shrink-0">
                In {countdown.daysLeft}d
              </Badge>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
        <span>Cake Budget:</span>
        <span className="font-medium text-zinc-900 dark:text-zinc-100">PKR 3,500</span>
      </div>
    </div>
  );
}
