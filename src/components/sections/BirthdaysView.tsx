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
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Cake className="h-6 w-6 text-pink-400" />
            Team Birthdays & Celebrations
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Never miss a teammate's special day. Cake and celebration expenses are sponsored via the TRF pool.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={triggerCelebration}
            className="rounded-xl border border-pink-500/30 bg-pink-500/10 hover:bg-pink-500/20 px-3.5 py-2 text-xs font-semibold text-pink-300 transition-colors flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            <span>Launch Confetti 🎉</span>
          </button>

          {isManager && (
            <button
              onClick={onOpenNewTransaction}
              className="rounded-xl bg-pink-600 hover:bg-pink-500 px-4 py-2 text-xs font-bold text-white shadow-lg transition-all flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Log Cake Expense</span>
            </button>
          )}
        </div>
      </div>

      {/* Spotlight: Next Birthday to Celebrate */}
      {nextPerson && (
        <div className="rounded-3xl border border-pink-500/30 bg-gradient-to-r from-pink-950/30 via-purple-950/20 to-slate-900 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Cake className="h-40 w-40 text-pink-400" />
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
            <div className="relative">
              <img
                src={nextPerson.member.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                alt={nextPerson.member.name}
                className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl object-cover border-2 border-pink-500/50 shadow-xl"
              />
              {nextPerson.countdown.isToday && (
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-lg animate-bounce">
                  TODAY!
                </div>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-pink-500/20 px-3 py-1 text-xs font-semibold text-pink-300 border border-pink-500/30 mb-2">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Next Upcoming Celebration</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                {nextPerson.member.name}
              </h3>
              <p className="text-sm text-pink-200/80 mt-0.5">
                {nextPerson.member.designation} • {nextPerson.member.department}
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-300">
                <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
                  <Calendar className="h-3.5 w-3.5 text-pink-400" />
                  <span>
                    {nextPerson.countdown.nextBirthdayDate.toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 font-bold text-pink-300">
                  <Heart className="h-3.5 w-3.5 text-rose-400 fill-rose-400" />
                  <span>
                    {nextPerson.countdown.isToday
                      ? 'Celebrate Today!'
                      : `In ${nextPerson.countdown.daysLeft} days`}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
                  <Gift className="h-3.5 w-3.5 text-emerald-400" />
                  <span>TRF Cake Fund: {formatPKR(3500)}</span>
                </div>
              </div>
            </div>

            <div className="flex sm:flex-col items-center justify-center gap-2 mt-2 sm:mt-0">
              <button
                onClick={triggerCelebration}
                className="rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-pink-900/40 transition-all hover:scale-105"
              >
                Cheer & Wish 🎉
              </button>
            </div>
          </div>
        </div>
      )}

      {/* All Team Members Birthdays Grid */}
      <div>
        <h3 className="text-base font-bold text-white mb-4">
          All Teammate Birthdays (Chronological)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {membersWithCountdown.map(({ member, countdown }) => (
            <div
              key={member.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 hover:border-pink-500/30 transition-all hover:-translate-y-0.5 shadow-lg group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <img
                    src={member.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={member.name}
                    className="h-12 w-12 rounded-xl object-cover border border-slate-700 group-hover:border-pink-500/50 transition-colors"
                  />
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                      countdown.daysLeft <= 14
                        ? 'bg-pink-500/20 text-pink-300 border-pink-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    In {countdown.daysLeft} days
                  </span>
                </div>

                <div className="mt-3">
                  <h4 className="text-sm font-bold text-white group-hover:text-pink-300 transition-colors">
                    {member.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {member.designation}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-slate-500" />
                  {countdown.nextBirthdayDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <span className="text-[10px] text-slate-500 uppercase font-mono">
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
