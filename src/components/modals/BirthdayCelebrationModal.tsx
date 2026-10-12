'use client';

import React from 'react';
import { useTRF } from '@/context/TRFContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Sparkles, Cake, Heart, PartyPopper } from 'lucide-react';
import { motion } from 'framer-motion';

export function BirthdayCelebrationModal() {
  const { currentUser, activeCelebration, clearActiveCelebration, triggerCelebration } = useTRF();

  if (!activeCelebration) return null;

  const handleThankYou = () => {
    // Fire celebratory burst on thank you
    triggerCelebration();
    clearActiveCelebration();
  };

  return (
    <Dialog open={Boolean(activeCelebration)} onOpenChange={(open) => !open && clearActiveCelebration()}>
      <DialogContent className="sm:max-w-md border-pink-500/30 bg-gradient-to-b from-white via-pink-50/20 to-purple-50/20 dark:from-zinc-950 dark:via-pink-950/20 dark:to-purple-950/20 shadow-2xl overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <DialogHeader className="pt-2 text-center items-center">
          {/* Animated Celebration Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 text-white shadow-xl shadow-pink-500/25 mb-2"
          >
            <Cake className="w-10 h-10 animate-bounce" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
              className="absolute -top-2 -right-2 bg-yellow-400 text-zinc-900 rounded-full p-1 shadow-md"
            >
              <Sparkles className="w-4 h-4 fill-yellow-400" />
            </motion.div>
          </motion.div>

          <DialogTitle className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center justify-center gap-2">
            <span>Happy Birthday, {currentUser.name.split(' ')[0]}!</span>
            <span className="text-xl">🎂</span>
          </DialogTitle>

          <DialogDescription className="text-xs text-zinc-600 dark:text-zinc-400 max-w-xs mx-auto">
            A teammate just logged in and celebrated your birthday on the portal!
          </DialogDescription>
        </DialogHeader>

        {/* Sender Wish Highlight Card */}
        <div className="my-2 p-4 rounded-xl border border-pink-200 dark:border-pink-900/40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11 border-2 border-pink-500/40 shadow-xs">
              <AvatarImage src={activeCelebration.senderAvatar} alt={activeCelebration.senderName} />
              <AvatarFallback className="bg-pink-100 text-pink-700 font-bold text-xs uppercase">
                {activeCelebration.senderName.slice(0, 2)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                  {activeCelebration.senderName}
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-800">
                  Celebrated You! 🎉
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Just now via TRF Portal
              </p>
            </div>
          </div>

          {/* Message bubble */}
          <div className="relative p-3 rounded-lg bg-pink-50/60 dark:bg-pink-950/30 border border-pink-100 dark:border-pink-900/30">
            <p className="text-xs font-medium italic text-zinc-800 dark:text-zinc-200">
              &ldquo;{activeCelebration.message || 'Happy Birthday! Wishing you an incredible year ahead! 🎂✨'}&rdquo;
            </p>
          </div>
        </div>

        <DialogFooter className="sm:justify-between flex-row gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearActiveCelebration}
            className="text-xs text-zinc-500 dark:text-zinc-400"
          >
            Dismiss
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleThankYou}
            className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold text-xs shadow-md shadow-pink-500/20 gap-1.5 cursor-pointer"
          >
            <PartyPopper className="h-4 w-4" />
            <span>Thank You! 🎉</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
