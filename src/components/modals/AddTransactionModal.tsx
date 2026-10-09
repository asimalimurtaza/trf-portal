'use client';

import React, { useState } from 'react';
import { useTRF } from '@/context/TRFContext';
import { TransactionCategory } from '@/types/trf';
import { X, Receipt, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddTransactionModal({ isOpen, onClose }: AddTransactionModalProps) {
  const { addTransaction, members } = useTRF();

  const [type, setType] = useState<'outflow' | 'inflow'>('outflow');
  const [category, setCategory] = useState<TransactionCategory>('team_dinner');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('2026-10-09');

  React.useEffect(() => {
    setDate(new Date().toISOString().split('T')[0]);
  }, []);
  const [description, setDescription] = useState('');
  const [relatedMemberId, setRelatedMemberId] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;

    addTransaction({
      title: title.trim(),
      description: description.trim(),
      amount: parseFloat(amount),
      type,
      category,
      date,
      relatedMemberId: relatedMemberId || undefined,
    });

    // Reset and close
    setTitle('');
    setAmount('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Log Fund Transaction</h3>
              <p className="text-xs text-slate-400">Record a TRF expense or manual fund deposit</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Type Toggle: Outflow vs Inflow */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setType('outflow');
                setCategory('team_dinner');
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                type === 'outflow'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowDownRight className="h-4 w-4" />
              <span>Outflow (Expense)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setType('inflow');
                setCategory('treat_event');
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                type === 'inflow'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowUpRight className="h-4 w-4" />
              <span>Inflow (Deposit / Treat)</span>
            </button>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Transaction Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={type === 'outflow' ? 'e.g. Dinner at Monal, Birthday Cake' : 'e.g. New Phone Treat - Hamza'}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Amount & Date Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Amount (PKR) *
              </label>
              <input
                type="number"
                required
                min="1"
                step="50"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 4500"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TransactionCategory)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
            >
              {type === 'outflow' ? (
                <>
                  <option value="team_dinner">Team Dinner / Lunch</option>
                  <option value="snacks_refreshment">Snacks, Tea & Refreshments</option>
                  <option value="birthday_cake">Birthday Cake & Celebration</option>
                  <option value="activity_outing">Recreational Outing / Gaming / Bowling</option>
                  <option value="miscellaneous">Miscellaneous Expense</option>
                </>
              ) : (
                <>
                  <option value="company_claim">Company Audit Allowance</option>
                  <option value="joining_fee">New Member Joining Fee</option>
                  <option value="treat_event">Member Treat / Gadget Celebration</option>
                  <option value="fine_penalty">Standup Fine / Fun Penalty</option>
                  <option value="miscellaneous">Other Contribution</option>
                </>
              )}
            </select>
          </div>

          {/* Related Member (if applicable) */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Associated Member (Optional)
            </label>
            <select
              value={relatedMemberId}
              onChange={(e) => setRelatedMemberId(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="">None / Whole Team</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.department})
                </option>
              ))}
            </select>
          </div>

          {/* Description / Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Description / Audit Proof Notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Receipt verified, paid via cash by Asim Khan"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2 text-xs font-bold text-white shadow-lg transition-all"
            >
              Save Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
