'use client';

import React from 'react';
import { useTRF } from '@/context/TRFContext';
import {
  LayoutDashboard,
  Receipt,
  FileSpreadsheet,
  Cake,
  Compass,
  Gift,
  Users,
  ShieldCheck,
  User,
  ExternalLink
} from 'lucide-react';

export type NavTab = 
  | 'overview' 
  | 'ledger' 
  | 'audit-claims' 
  | 'birthdays' 
  | 'activities-venues' 
  | 'rules-treats' 
  | 'members';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { currentUser, isManager, pendingAuditAmount, pendingMemberDuesAmount } = useTRF();

  const navItems: {
    id: NavTab;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
    badgeColor?: string;
  }[] = [
    {
      id: 'overview',
      label: 'Overview & Pool',
      icon: LayoutDashboard,
    },
    {
      id: 'ledger',
      label: 'Funds Ledger & Expenses',
      icon: Receipt,
    },
    {
      id: 'audit-claims',
      label: 'Monthly Audit Claims',
      icon: FileSpreadsheet,
      badge: pendingAuditAmount > 0 ? 'Pending' : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'birthdays',
      label: 'Birthday Celebrations',
      icon: Cake,
      badge: 'Upcoming',
      badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    },
    {
      id: 'activities-venues',
      label: 'Planned Activities & Places',
      icon: Compass,
    },
    {
      id: 'rules-treats',
      label: 'Contribution Rules & Treats',
      icon: Gift,
      badge: pendingMemberDuesAmount > 0 ? 'Dues' : undefined,
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    },
    {
      id: 'members',
      label: 'Members & Joining Fees',
      icon: Users,
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-800 bg-slate-950/50 flex flex-col justify-between p-4 hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        {/* Navigation Items */}
        <div className="space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/20 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium border ${
                      item.badgeColor || 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Audit Guidance Note */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3.5 text-xs text-slate-400">
          <div className="flex items-center gap-2 font-semibold text-slate-300 mb-1">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            Company TRF Rule
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">
            Monthly rate is fixed at <strong className="text-emerald-400">1,400 PKR</strong> per head. Submit claim form at the start of each month to Internal Audit.
          </p>
        </div>
      </div>

      {/* User profile bottom footer */}
      <div className="pt-4 border-t border-slate-800/80">
        <div className="flex items-center gap-3 rounded-xl bg-slate-900/80 p-2.5 border border-slate-800">
          <img
            src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
            alt={currentUser.name}
            className="h-9 w-9 rounded-lg object-cover border border-slate-700"
          />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-slate-200 truncate">
              {currentUser.name}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              {isManager ? (
                <span className="text-amber-400 font-medium flex items-center gap-0.5">
                  <ShieldCheck className="h-3 w-3" /> TRF Manager
                </span>
              ) : (
                <span className="text-slate-400 flex items-center gap-0.5">
                  <User className="h-3 w-3" /> Team Member
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
