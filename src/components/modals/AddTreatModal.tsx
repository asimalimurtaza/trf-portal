'use client';

import React, { useState } from 'react';
import { useTRF } from '@/context/TRFContext';
import { X, Sparkles } from 'lucide-react';

interface AddTreatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddTreatModal({ isOpen, onClose }: AddTreatModalProps) {
  const { logTreatEvent, members, rules, currentUser } = useTRF();

  const [memberId, setMemberId] = useState(currentUser.id);
  const [ruleTitle, setRuleTitle] = useState(rules[1]?.title || 'New Smartphone / Laptop Treat');
  const [details, setDetails] = useState('');
  const [amount, setAmount] = useState('3000');

  if (!isOpen) return null;

  const handleRuleChange = (title: string) => {
    setRuleTitle(title);
    const matchedRule = rules.find((r) => r.title === title);
    if (matchedRule) {
      setAmount(matchedRule.suggestedAmount.toString());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim() || !amount) return;

    logTreatEvent({
      memberId,
      ruleTitle,
      details: details.trim(),
      amount: parseFloat(amount),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Declare Milestone Treat</h3>
              <p className="text-xs text-slate-500">New phone, promotion, appraisal, or celebration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Celebrating Member *
            </label>
            <select
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-purple-500 focus:outline-none"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.designation})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Celebration Type *
            </label>
            <select
              value={ruleTitle}
              onChange={(e) => handleRuleChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-purple-500 focus:outline-none"
            >
              {rules.map((rule) => (
                <option key={rule.id} value={rule.title}>
                  {rule.title} (Suggested: PKR {rule.suggestedAmount})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Celebration Details *
            </label>
            <input
              type="text"
              required
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="e.g. Bought iPhone 16 Pro Max 256GB"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Contribution (PKR) *
            </label>
            <input
              type="number"
              required
              min="100"
              step="100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-purple-600 hover:bg-purple-500 px-5 py-2 text-xs font-bold text-white shadow-xs transition-all"
            >
              Log Treat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
