'use client';

import React from 'react';
import { useTRF } from '@/context/TRFContext';
import { formatPKR } from '@/lib/utils';
import { 
  Wallet, 
  ShieldCheck, 
  User, 
  Plus, 
  FileCheck2, 
  Gift, 
  Database,
  ChevronDown
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
    currentBalance 
  } = useTRF();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white">TRF Portal</span>
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                1,400 PKR / Head
              </span>
            </div>
          </div>
        </div>

        {/* Live Pool Balance */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800/80 rounded-full px-3.5 py-1.5 shadow-sm">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-slate-400">Pool Balance:</span>
          <span className="text-sm font-bold text-emerald-400">
            {formatPKR(currentBalance)}
          </span>
        </div>

        {/* Actions & User */}
        <div className="flex items-center gap-2.5">
          {/* Declare Treat (All Members) */}
          <button
            onClick={onOpenNewTreat}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-xs font-semibold text-purple-300 hover:bg-purple-500/20 transition-colors"
          >
            <Gift className="h-3.5 w-3.5" />
            <span>+ Treat</span>
          </button>

          {/* Manager Actions */}
          {isManager && (
            <>
              <button
                onClick={onOpenNewClaim}
                className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 transition-colors"
              >
                <FileCheck2 className="h-3.5 w-3.5" />
                <span>+ Claim</span>
              </button>
              <button
                onClick={onOpenNewTransaction}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Log Expense</span>
              </button>
            </>
          )}

          {/* User Account Persona */}
          <div className="relative group">
            <div className="flex items-center gap-2 rounded-lg bg-slate-900 border border-slate-800 p-1.5 pl-2.5 cursor-pointer hover:border-slate-700 transition-colors">
              <div className="text-right">
                <div className="text-xs font-semibold text-slate-200 leading-none">
                  {currentUser.name}
                </div>
                <div className="text-[10px] mt-0.5 font-medium">
                  {isManager ? (
                    <span className="text-amber-400 flex items-center justify-end gap-0.5">
                      <ShieldCheck className="h-2.5 w-2.5" /> Manager
                    </span>
                  ) : (
                    <span className="text-slate-400 flex items-center justify-end gap-0.5">
                      <User className="h-2.5 w-2.5" /> Member
                    </span>
                  )}
                </div>
              </div>
              <img
                src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={currentUser.name}
                className="h-7 w-7 rounded-md object-cover border border-slate-700"
              />
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </div>

            {/* Switch User Dropdown */}
            <div className="absolute right-0 mt-2 w-60 rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
              <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Select Active Account
              </div>
              <div className="max-h-48 overflow-y-auto py-1 space-y-0.5">
                {members.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => switchUser(m.id)}
                    className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-left transition-colors ${
                      m.id === currentUser.id
                        ? 'bg-emerald-500/10 text-emerald-400 font-bold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{m.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {m.role === 'manager' ? 'Admin' : 'Member'}
                    </span>
                  </button>
                ))}
              </div>
              <div className="pt-1.5 border-t border-slate-800">
                <button
                  onClick={toggleRole}
                  className="w-full text-center py-1 text-[11px] font-medium text-slate-400 hover:text-white"
                >
                  Toggle Role ({currentUser.role === 'manager' ? 'To Member' : 'To Manager'})
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
