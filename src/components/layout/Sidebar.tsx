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
  User
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
  const { currentUser, isManager } = useTRF();

  const navItems: {
    id: NavTab;
    label: string;
    icon: React.ElementType;
  }[] = [
    {
      id: 'overview',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'ledger',
      label: 'Funds Ledger',
      icon: Receipt,
    },
    {
      id: 'audit-claims',
      label: 'Audit Claims (1,400)',
      icon: FileSpreadsheet,
    },
    {
      id: 'birthdays',
      label: 'Birthdays',
      icon: Cake,
    },
    {
      id: 'activities-venues',
      label: 'Places & Outings',
      icon: Compass,
    },
    {
      id: 'rules-treats',
      label: 'Treats & Rules',
      icon: Gift,
    },
    {
      id: 'members',
      label: 'Team & Joining Fees',
      icon: Users,
    },
  ];

  return (
    <aside className="w-56 flex-shrink-0 border-r border-slate-800/80 bg-slate-950/40 flex flex-col justify-between p-3.5 hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
          Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* User profile bottom footer */}
      <div className="pt-3 border-t border-slate-800/80">
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <img
            src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
            alt={currentUser.name}
            className="h-8 w-8 rounded-lg object-cover border border-slate-700"
          />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-slate-200 truncate">
              {currentUser.name}
            </div>
            <div className="text-[10px] text-slate-400">
              {isManager ? 'TRF Manager' : 'Team Member'}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
