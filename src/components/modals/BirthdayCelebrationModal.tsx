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
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Cake, Sparkles } from 'lucide-react';

export function BirthdayCelebrationModal() {
  const { currentUser, activeCelebration, clearActiveCelebration, triggerCelebration } = useTRF();

  if (!activeCelebration) return null;

  const handleThankYou = () => {
    triggerCelebration();
    clearActiveCelebration();
  };

  return (
    <Dialog open={Boolean(activeCelebration)} onOpenChange={(open) => !open && clearActiveCelebration()}>
      <DialogContent className="sm:max-w-md border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <DialogHeader className="pt-2 text-center items-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 mb-2">
            <Cake className="w-6 h-6" />
          </div>

          <DialogTitle className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Happy Birthday, {currentUser.name.split(' ')[0]}! 🎂
          </DialogTitle>

          <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
            A teammate just logged in and celebrated your birthday on the portal.
          </DialogDescription>
        </DialogHeader>

        {/* Sender Wish Highlight Card */}
        <div className="my-2 p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/50 space-y-2.5">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-zinc-200 dark:border-zinc-800">
              <AvatarImage src={activeCelebration.senderAvatar} alt={activeCelebration.senderName} />
              <AvatarFallback className="text-xs uppercase font-medium">
                {activeCelebration.senderName.slice(0, 2)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                  {activeCelebration.senderName}
                </span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                  Celebrated You
                </Badge>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Just now via TRF Portal
              </p>
            </div>
          </div>

          <div className="p-2.5 rounded-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 italic">
            &ldquo;{activeCelebration.message || 'Happy Birthday! Wishing you an incredible year ahead! 🎂'}&rdquo;
          </div>
        </div>

        <DialogFooter className="sm:justify-between flex-row gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearActiveCelebration}
            className="text-xs text-zinc-600 dark:text-zinc-400"
          >
            Dismiss
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleThankYou}
            className="flex-1 text-xs gap-1.5 cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Thank You! 🎉</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
