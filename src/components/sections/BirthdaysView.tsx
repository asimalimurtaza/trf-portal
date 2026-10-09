'use client';

import React from 'react';
import { useTRF } from '@/context/TRFContext';
import { getBirthdayCountdown, formatPKR } from '@/lib/utils';
import { useCurrentDate } from '@/hooks/useCurrentDate';
import { Cake, Sparkles, Gift, Calendar, Plus, Heart } from 'lucide-react';

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
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Cake className="h-5 w-5 text-pink-500 dark:text-pink-400" />
            Team Birthdays & Celebrations
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cakes and team celebrations are covered from the collective TRF pool.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={triggerCelebration}
            className="rounded-xl border border-pink-500/30 bg-pink-500/10 hover:bg-pink-500/20 px-3.5 py-2 text-xs font-semibold text-pink-600 dark:text-pink-300 transition-colors flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            <span>Launch Confetti 🎉</span>
          </button>

          {isManager && (
            <button
              onClick={onOpenNewTransaction}
              className="rounded-xl bg-pink-600 hover:bg-pink-500 px-4 py-2 text-xs font-bold text-white shadow-xs transition-all flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Log Cake Expense</span>
            </button>
          )}
        </div>
      </div>

      {/* Spotlight: Next Birthday to Celebrate */}
      {nextPerson && (
        <div className="rounded-3xl border border-pink-200 dark:border-pink-500/30 bg-white dark:bg-gradient-to-r dark:from-pink-950/30 dark:via-purple-950/20 dark:to-slate-900 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="relative">
              <img
                src={nextPerson.member.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                alt={nextPerson.member.name}
                className="h-20 w-20 rounded-2xl object-cover border-2 border-pink-400 dark:border-pink-500/50 shadow-md"
              />
              {nextPerson.countdown.isToday && (
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-md animate-bounce">
                  TODAY!
                </div>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-pink-500/10 px-2.5 py-0.5 text-xs font-semibold text-pink-600 dark:text-pink-300 border border-pink-500/20 mb-1.5">
                <Sparkles className="h-3 w-3" />
                <span>Next Upcoming Birthday</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                {nextPerson.member.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-pink-200/80 mt-0.5">
                {nextPerson.member.designation} • {nextPerson.member.department}
              </p>

              <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/80 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-800">
                  <Calendar className="h-3.5 w-3.5 text-pink-500 dark:text-pink-400" />
                  <span>
                    {nextPerson.countdown.nextBirthdayDate.toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/80 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-800 font-bold text-pink-600 dark:text-pink-300">
                  <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
                  <span>
                    {nextPerson.countdown.isToday
                      ? 'Celebrate Today!'
                      : `In ${nextPerson.countdown.daysLeft} days`}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/80 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-800">
                  <Gift className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Cake Budget: {formatPKR(3500)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={triggerCelebration}
              className="rounded-xl bg-pink-600 hover:bg-pink-500 px-4 py-2 text-xs font-bold text-white shadow-xs transition-all"
            >
              Wish Happy Birthday 🎉
            </button>
          </div>
        </div>
      )}

      {/* All Team Members Birthdays Grid */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
          All Teammate Birthdays
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {membersWithCountdown.map(({ member, countdown }) => (
            <div
              key={member.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <img
                    src={member.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={member.name}
                    className="h-10 w-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                      countdown.daysLeft <= 14
                        ? 'bg-pink-500/10 text-pink-600 dark:text-pink-300 border-pink-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    In {countdown.daysLeft} days
                  </span>
                </div>

                <div className="mt-3">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {member.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {member.designation}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {countdown.nextBirthdayDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <span className="text-[10px] uppercase font-mono">
                  {member.department}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
