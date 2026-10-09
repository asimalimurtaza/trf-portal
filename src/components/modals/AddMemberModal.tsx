'use client';

import React, { useState } from 'react';
import { useTRF } from '@/context/TRFContext';
import { X, UserPlus, Shield, Cake, CreditCard } from 'lucide-react';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddMemberModal({ isOpen, onClose }: AddMemberModalProps) {
  const { addMember } = useTRF();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'member' | 'manager'>('member');
  const [department, setDepartment] = useState('Engineering');
  const [designation, setDesignation] = useState('');
  const [birthDate, setBirthDate] = useState('2000-01-01');
  const [joiningFeeAmount, setJoiningFeeAmount] = useState('1000');
  const [phone, setPhone] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    addMember({
      name: name.trim(),
      email: email.trim(),
      role,
      department,
      designation: designation.trim() || 'Software Engineer',
      birthDate,
      phone: phone.trim() || undefined,
      joiningFeeAmount: parseFloat(joiningFeeAmount) || 1000,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Add Team Member</h3>
              <p className="text-xs text-slate-400">Registers new member & sets mandatory TRF joining fee</p>
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
          {/* Name & Email */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Daniyal Qureshi"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="daniyal@company.com"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Designation & Department */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Designation *
              </label>
              <input
                type="text"
                required
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Backend Engineer"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="Engineering">Engineering</option>
                <option value="UI/UX">UI/UX Design</option>
                <option value="QA & Testing">QA & Testing</option>
                <option value="Product">Product Management</option>
                <option value="DevOps">DevOps & Cloud</option>
              </select>
            </div>
          </div>

          {/* Birth Date (for Birthday Module) & Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                <Cake className="h-3 w-3 text-pink-400" />
                Birth Date (Birthday Tracker) *
              </label>
              <input
                type="date"
                required
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Role Permission
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'member' | 'manager')}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="member">Team Member (Viewer)</option>
                <option value="manager">TRF Manager (Admin)</option>
              </select>
            </div>
          </div>

          {/* Joining Payment Section */}
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3.5">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold mb-1">
              <CreditCard className="h-4 w-4" />
              <span>Mandatory Joining Payment</span>
            </div>
            <p className="text-[11px] text-slate-400 mb-2">
              Every newly joined teammate contributes an entry fee into the TRF pool.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300 font-medium">Joining Amount:</span>
              <input
                type="number"
                min="0"
                step="100"
                value={joiningFeeAmount}
                onChange={(e) => setJoiningFeeAmount(e.target.value)}
                className="w-32 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none font-bold"
              />
              <span className="text-xs text-slate-400">PKR (Starts as Pending)</span>
            </div>
          </div>

          {/* Actions */}
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
              Register Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
