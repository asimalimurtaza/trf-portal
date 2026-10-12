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
import { Cake, Sparkles } from 'lucide-react';

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
      <DialogContent className="sm:max-w-md border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
              <Cake className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Celebrate {targetMember.name}&apos;s Birthday
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
                Send real-time celebration confetti directly to their screen.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3.5 py-1">
          {/* Quick preset choices */}
          <div>
            <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 block">
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
                  className={`p-2.5 rounded-lg text-left text-xs transition-colors border cursor-pointer ${
                    selectedPreset === preset && !customMessage
                      ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-100 dark:bg-zinc-800/80 font-medium text-zinc-900 dark:text-zinc-50 shadow-2xs'
                      : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Message Input */}
          <div className="space-y-1.5">
            <Label htmlFor="custom-wish" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Or personalized note:
            </Label>
            <Input
              id="custom-wish"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="e.g. Happy Birthday! Many more to come! 🎂"
              className="text-xs border-zinc-200 dark:border-zinc-800"
              maxLength={120}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs"
          >
            Cancel
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSend}
            disabled={isSending}
            className="text-xs gap-1.5 cursor-pointer font-medium"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Send Confetti 🎉</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
