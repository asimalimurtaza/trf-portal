'use client';

import React from 'react';
import { useTRF } from '@/context/TRFContext';
import { getBirthdayCountdown } from '@/lib/utils';
import { useCurrentDate } from '@/hooks/useCurrentDate';
import { Cake, Sparkles, Calendar, ArrowRight } from 'lucide-react';

interface UpcomingBirthdaysWidgetProps {
  onNavigateToBirthdays: () => void;
}

export function UpcomingBirthdaysWidget({ onNavigateToBirthdays }: UpcomingBirthdaysWidgetProps) {
  const { members, triggerCelebration } = useTRF();
  const currentDate = useCurrentDate();

  // Sort members by next birthday countdown
  const sortedMembers = [...members]
    .map((member) => ({
      member,
      countdown: getBirthdayCountdown(member.birthDate, currentDate),
    }))
    .sort((a, b) => a.countdown.daysLeft - b.countdown.daysLeft)
    .slice(0, 3); // top 3 next birthdays

  const nextCelebration = sortedMembers[0];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg backdrop-blur-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2 text-pink-400">
            <Cake className="h-4 w-4" />
            <h3 className="text-sm font-bold text-white tracking-wide">Upcoming Birthdays</h3>
          </div>
          <button
            onClick={onNavigateToBirthdays}
            className="text-xs text-pink-400 hover:text-pink-300 flex items-center gap-1 font-medium transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {/* Highlight closest birthday */}
        {nextCelebration && (
          <div className="mt-4 rounded-xl border border-pink-500/20 bg-gradient-to-r from-pink-950/20 via-slate-900/40 to-purple-950/20 p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={nextCelebration.member.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={nextCelebration.member.name}
                className="h-10 w-10 rounded-xl object-cover border border-pink-500/30 shadow-md"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white">
                    {nextCelebration.member.name}
                  </span>
                  {nextCelebration.countdown.isToday && (
                    <span className="rounded-full bg-pink-500 px-1.5 py-0.5 text-[9px] font-extrabold text-white animate-bounce">
                      TODAY!
                    </span>
                  )}
                </div>
                <div className="text-xs text-pink-300/80 flex items-center gap-1.5 mt-0.5">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {nextCelebration.countdown.isToday
                      ? 'Celebrate today!'
                      : `In ${nextCelebration.countdown.daysLeft} days`}
                  </span>
                  <span>•</span>
                  <span>{nextCelebration.member.designation}</span>
                </div>
              </div>
            </div>

            <button
              onClick={triggerCelebration}
              className="p-2 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/30 transition-all hover:scale-105"
              title="Celebrate with team confetti!"
            >
              <Sparkles className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Other upcoming */}
        <div className="mt-3 space-y-2">
          {sortedMembers.slice(1).map(({ member, countdown }) => (
            <div
              key={member.id}
              className="flex items-center justify-between rounded-xl bg-slate-900/40 p-2.5 px-3 border border-slate-800/60 text-xs"
            >
              <div className="flex items-center gap-2.5">
                <img
                  src={member.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={member.name}
                  className="h-7 w-7 rounded-lg object-cover border border-slate-700"
                />
                <div>
                  <div className="font-semibold text-slate-200">{member.name}</div>
                  <div className="text-[10px] text-slate-500">{member.department}</div>
                </div>
              </div>
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-300 border border-slate-700">
                In {countdown.daysLeft} days
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
        <span>Standard Cake Budget:</span>
        <span className="font-semibold text-pink-300">PKR 3,500 / celebration</span>
      </div>
    </div>
  );
}
