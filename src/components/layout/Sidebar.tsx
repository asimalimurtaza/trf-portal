'use client';

import React from 'react';
import { useTRF } from '@/context/TRFContext';
import { useTheme } from '@/context/ThemeContext';
import {
  LayoutDashboard,
  Receipt,
  FileSpreadsheet,
  Cake,
  Compass,
  Gift,
  Users,
  Wallet,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
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
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({
  activeTab,
  onTabChange,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const { currentUser, isManager } = useTRF();
  const { theme, toggleTheme } = useTheme();

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
    <aside
      className={`fixed left-0 top-0 bottom-0 z-40 h-screen transition-all duration-300 ease-in-out border-r flex flex-col justify-between hidden md:flex ${
        isCollapsed ? 'w-20' : 'w-64'
      } bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800/80 shadow-sm`}
    >
      {/* Top: Brand & Toggle */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <Wallet className="h-5 w-5" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 transition-opacity duration-200">
                <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white truncate block">
                  TRF Portal
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">
                  Team Funds
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Menu Navigation */}
        <div className="p-3 space-y-1">
          {!isCollapsed && (
            <div className="px-3 pb-1 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
              Navigation
            </div>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                  isCollapsed ? 'justify-center' : ''
                } ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Icon
                  className={`h-4 w-4 flex-shrink-0 ${
                    isActive
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom: Theme Toggle & User Info */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
        {/* Light / Dark Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className={`w-full flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-400 flex-shrink-0" />
          ) : (
            <Moon className="h-4 w-4 text-slate-700 flex-shrink-0" />
          )}
          {!isCollapsed && (
            <span className="truncate">
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
          )}
        </button>

        {/* User Card */}
        <div
          className={`flex items-center gap-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 p-2 border border-slate-200 dark:border-slate-800 ${
            isCollapsed ? 'justify-center p-1.5' : ''
          }`}
        >
          <img
            src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
            alt={currentUser.name}
            className="h-8 w-8 rounded-lg object-cover border border-slate-300 dark:border-slate-700 flex-shrink-0"
          />
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                {isManager ? (
                  <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-0.5">
                    <ShieldCheck className="h-2.5 w-2.5" /> Manager
                  </span>
                ) : (
                  <span className="flex items-center gap-0.5">
                    <User className="h-2.5 w-2.5" /> Member
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
