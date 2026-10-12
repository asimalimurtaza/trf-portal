'use client';

import React, { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Cake, Sparkles, Send, Heart } from 'lucide-react';

interface SendBirthdayWishModalProps {
  targetMember: { id: string; name: string; avatarUrl?: string } | null;
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_MESSAGES = [
  'Happy Birthday! 🎂 Have an amazing day!',
  'Wishing you great health, success & happiness! 🚀',
  'Enjoy your special day to the fullest! 🎉',
  'Treat banta hai! 😉🍕',
];

export function SendBirthdayWishModal({
  targetMember,
  isOpen,
  onClose,
}: SendBirthdayWishModalProps) {
  const { celebrateBirthday } = useTRF();
  const [selectedPreset, setSelectedPreset] = useState<string>(PRESET_MESSAGES[0]);
  const [customMessage, setCustomMessage] = useState<string>('');
  const [isSending, setIsSending] = useState(false);

  if (!targetMember) return null;

  const handleSend = async () => {
    setIsSending(true);
    const finalMsg = customMessage.trim() || selectedPreset;
    try {
      await celebrateBirthday(targetMember.id, targetMember.name, finalMsg);
      onClose();
      setCustomMessage('');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md border-pink-200 dark:border-pink-900/40">
        <DialogHeader>
          <div className="flex items-center gap-2.5 text-pink-500">
            <div className="p-2 rounded-xl bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400">
              <Cake className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                Celebrate {targetMember.name}&apos;s Birthday! 🎉
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500">
                Send real-time celebration confetti directly to {targetMember.name}&apos;s screen!
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Quick preset choices */}
          <div>
            <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2 block">
              Quick Birthday Wishes
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_MESSAGES.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setSelectedPreset(preset);
                    setCustomMessage('');
                  }}
                  className={`p-2.5 rounded-lg text-left text-xs transition-all border cursor-pointer ${
                    selectedPreset === preset && !customMessage
                      ? 'border-pink-500 bg-pink-50 dark:bg-pink-950/40 font-medium text-pink-700 dark:text-pink-300 ring-1 ring-pink-500'
                      : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Message Input */}
          <div className="space-y-1.5">
            <Label htmlFor="custom-wish" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Or write a personalized wish:
            </Label>
            <Input
              id="custom-wish"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="e.g. Happy Birthday buddy! Many more to come! 🎂"
              className="text-xs"
              maxLength={120}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs text-zinc-500"
          >
            Cancel
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSend}
            disabled={isSending}
            className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold text-xs gap-1.5 shadow-md shadow-pink-500/20 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Send Celebration Confetti 🎉</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
