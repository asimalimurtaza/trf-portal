'use client';

import React from 'react';
import { useTRF } from '@/context/TRFContext';
import { formatPKR } from '@/lib/utils';
import { 
  Wallet, 
  ShieldCheck, 
  User, 
  RefreshCw, 
  Sparkles,
  FileCheck2,
  ChevronDown,
  Layers
} from 'lucide-react';

interface NavbarProps {
  onOpenNewTransaction: () => void;
  onOpenNewClaim: () => void;
  onOpenNewTreat: () => void;
}

export function Navbar({ onOpenNewTransaction, onOpenNewClaim, onOpenNewTreat }: NavbarProps) {
  const { 
    currentUser, 
    isManager, 
    members, 
    switchUser, 
    toggleRole, 
    currentBalance,
    claims,
    resetToDemoData,
    triggerCelebration
  } = useTRF();

  const currentClaim = claims[0]; // Most recent claim

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Left Section */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-lg shadow-emerald-900/30">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">TRF Portal</span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                Team Funds
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              1,400 PKR / month / head allowance portal
            </p>
          </div>
        </div>

        {/* Live Pool Balance Pill & Audit Status */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2.5 rounded-full bg-slate-900/90 border border-slate-800 px-3.5 py-1.5 shadow-inner">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-400 font-medium">Collective Pool:</span>
            <span className="text-sm font-bold text-emerald-400">
              {formatPKR(currentBalance)}
            </span>
          </div>

          {currentClaim && (
            <div className="flex items-center gap-2 rounded-full bg-slate-900/70 border border-slate-800/80 px-3 py-1.5 text-xs text-slate-300">
              <FileCheck2 className="h-3.5 w-3.5 text-cyan-400" />
              <span>{currentClaim.monthYear}:</span>
              <span className={`font-semibold capitalize ${
                currentClaim.status === 'approved_disbursed'
                  ? 'text-emerald-400'
                  : currentClaim.status === 'submitted'
                  ? 'text-amber-400'
                  : 'text-slate-400'
              }`}>
                {currentClaim.status.replace('_', ' ')}
              </span>
            </div>
          )}
        </div>

        {/* Right Section: Actions & User Switcher */}
        <div className="flex items-center gap-2.5">
          {/* Quick Treat / Contrib Button */}
          <button
            onClick={onOpenNewTreat}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-300 hover:bg-purple-500/20 transition-colors"
            title="Declare a treat or gadget contribution"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>+ Treat / Gift</span>
          </button>

          {/* Manager Action Buttons */}
          {isManager && (
            <>
              <button
                onClick={onOpenNewClaim}
                className="hidden lg:inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-500/20 transition-colors"
                title="Generate monthly claim for company audit"
              >
                <FileCheck2 className="h-3.5 w-3.5" />
                <span>+ Audit Claim</span>
              </button>
              <button
                onClick={onOpenNewTransaction}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 transition-colors"
              >
                <span>+ Log Expense</span>
              </button>
            </>
          )}

          {/* User Switcher Dropdown (Allows testing Manager vs Regular Member instantly) */}
          <div className="relative group">
            <div className="flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 p-1.5 pl-2.5 cursor-pointer hover:border-slate-700 transition-colors">
              <div className="flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-200 leading-none">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center justify-end gap-1">
                  {isManager ? (
                    <span className="text-amber-400 font-semibold flex items-center gap-0.5">
                      <ShieldCheck className="h-2.5 w-2.5" /> TRF Manager
                    </span>
                  ) : (
                    <span className="text-slate-400 flex items-center gap-0.5">
                      <User className="h-2.5 w-2.5" /> Member
                    </span>
                  )}
                </span>
              </div>
              <img
                src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={currentUser.name}
                className="h-8 w-8 rounded-lg object-cover border border-slate-700"
              />
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 mr-1" />
            </div>

            {/* Switcher Menu Dropdown */}
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-2xl backdrop-blur-xl opacity-0 translate-y-1 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible transition-all duration-200 z-50">
              <div className="px-2 py-1.5 text-xs font-medium text-slate-400 border-b border-slate-800">
                Switch Active Persona (Demo Preview)
              </div>
              <div className="max-h-48 overflow-y-auto py-1 space-y-1">
                {members.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => switchUser(member.id)}
                    className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-left transition-colors ${
                      member.id === currentUser.id
                        ? 'bg-emerald-500/10 text-emerald-300 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div>{member.name}</div>
                      <div className="text-[10px] text-slate-500">{member.designation}</div>
                    </div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                      member.role === 'manager'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {member.role === 'manager' ? 'Admin' : 'Member'}
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-1 pt-1.5 border-t border-slate-800 flex flex-col gap-1">
                <button
                  onClick={toggleRole}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 py-1.5 text-xs text-slate-300 transition-colors font-medium"
                >
                  <Layers className="h-3 w-3" />
                  Toggle Current Role ({currentUser.role === 'manager' ? 'Make Member' : 'Make Manager'})
                </button>
                <button
                  onClick={resetToDemoData}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 py-1 text-[11px] transition-colors"
                >
                  <RefreshCw className="h-3 w-3" />
                  Reset Demo Dataset
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
