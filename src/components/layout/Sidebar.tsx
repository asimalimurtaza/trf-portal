'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  Sun,
  Moon,
  MessageSquare,
  LogOut,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export type NavTab =
  | 'overview'
  | 'ledger'
  | 'audit-claims'
  | 'birthdays'
  | 'activities-venues'
  | 'rules-treats'
  | 'members'
  | 'messages';

interface SidebarProps {
  activeTab?: NavTab;
  onTabChange?: (tab: NavTab) => void;
  isHovered?: boolean;
  onHoverChange?: (hovered: boolean) => void;
  onOpenProfile?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({
  activeTab,
  onTabChange,
  isHovered,
  onHoverChange,
  onOpenProfile,
  isMobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname() || '/dashboard';
  const { currentUser, isManager, unreadDirectMessagesCount, logout } = useTRF();
  const { theme, toggleTheme } = useTheme();

  const [internalHover, setInternalHover] = React.useState(false);
  const isCurrentlyHovered = isHovered !== undefined ? isHovered : internalHover;

  const handleMouseEnter = () => {
    setInternalHover(true);
    onHoverChange?.(true);
  };

  const handleMouseLeave = () => {
    setInternalHover(false);
    onHoverChange?.(false);
  };

  const resolvedTab: NavTab =
    activeTab ||
    (() => {
      if (pathname.startsWith('/dashboard/chat')) return 'messages';
      if (pathname.startsWith('/dashboard/treat-rules')) return 'rules-treats';
      if (pathname.startsWith('/dashboard/ledger')) return 'ledger';
      if (pathname.startsWith('/dashboard/claims')) return 'audit-claims';
      if (pathname.startsWith('/dashboard/birthdays')) return 'birthdays';
      if (pathname.startsWith('/dashboard/outings')) return 'activities-venues';
      if (pathname.startsWith('/dashboard/members')) return 'members';
      return 'overview';
    })();

  const navItems: {
    id: NavTab;
    href: string;
    label: string;
    icon: React.ElementType;
    badge?: number;
  }[] = [
    { id: 'overview', href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ledger', href: '/dashboard/ledger', label: 'Funds Ledger', icon: Receipt },
    { id: 'audit-claims', href: '/dashboard/claims', label: 'Audit Claims', icon: FileSpreadsheet },
    { id: 'birthdays', href: '/dashboard/birthdays', label: 'Birthdays', icon: Cake },
    { id: 'activities-venues', href: '/dashboard/outings', label: 'Places & Outings', icon: Compass },
    { id: 'rules-treats', href: '/dashboard/treat-rules', label: 'Treats & Rules', icon: Gift },
    { id: 'members', href: '/dashboard/members', label: 'Team & Fees', icon: Users },
    {
      id: 'messages',
      href: '/dashboard/chat',
      label: 'Direct Messages',
      icon: MessageSquare,
      badge: unreadDirectMessagesCount,
    },
  ];

  return (
    <>
      {/* 1. Desktop Persistent Sidebar with Hover Open/Collapse */}
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`fixed left-0 top-0 bottom-0 z-40 h-screen border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hidden md:flex flex-col justify-between transition-[width] duration-300 ease-in-out select-none ${
          isCurrentlyHovered ? 'w-64 shadow-xl ring-1 ring-black/5 dark:ring-white/10' : 'w-[68px]'
        }`}
      >
        {/* Top Header */}
        <div>
          <div className="h-14 border-b border-zinc-200 dark:border-zinc-800 flex items-center">
            {isCurrentlyHovered ? (
              <div className="w-full flex items-center justify-between px-3.5">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 shadow-xs">
                    <Wallet className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-xs tracking-tight text-zinc-900 dark:text-zinc-50 truncate">
                      Vicenna TRF
                    </span>
                    <span className="text-[10px] text-zinc-400 truncate">
                      Recreational Fund
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full flex items-center justify-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 shadow-xs">
                  <Wallet className="h-4 w-4" />
                </div>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-2 space-y-1 overflow-y-auto max-h-[calc(100vh-170px)] scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = resolvedTab === item.id;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => onTabChange?.(item.id)}
                  title={!isCurrentlyHovered ? item.label : undefined}
                  className={`relative group flex items-center rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    !isCurrentlyHovered
                      ? 'justify-center h-10 w-10 mx-auto'
                      : 'gap-3 px-3 py-2.5 w-full'
                  } ${
                    isActive
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs font-semibold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 hover:text-zinc-900 dark:hover:text-zinc-50'
                  }`}
                >
                  <div className="relative shrink-0 flex items-center justify-center">
                    <Icon
                      className={`h-4 w-4 ${
                        isActive
                          ? ''
                          : 'text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-50'
                      }`}
                    />
                    {!isCurrentlyHovered && item.badge !== undefined && item.badge > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-zinc-950" />
                    )}
                  </div>

                  {isCurrentlyHovered && (
                    <div className="flex-1 flex items-center justify-between min-w-0">
                      <span className="truncate">{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span
                          className={`ml-auto inline-flex items-center justify-center rounded-full text-[10px] font-bold h-4 min-w-4 px-1 leading-none shadow-xs ${
                            isActive
                              ? 'bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white'
                              : 'bg-blue-600 text-white'
                          }`}
                        >
                          {item.badge > 9 ? '9+' : item.badge}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Floating tooltip on hover when sidebar is collapsed */}
                  {!isCurrentlyHovered && (
                    <div className="absolute left-full ml-3 px-2.5 py-1 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-medium whitespace-nowrap shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                      {item.label}
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="ml-1.5 text-[10px] px-1 py-0.2 rounded-full bg-blue-600 text-white">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Footer Section */}
        <div className="p-2 border-t border-zinc-200 dark:border-zinc-800 space-y-1">
          {/* Theme switcher */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className={`w-full text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 ${
              !isCurrentlyHovered
                ? 'justify-center px-0 h-9 w-9 mx-auto'
                : 'justify-start px-2.5 h-9'
            }`}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 shrink-0" />
            ) : (
              <Moon className="h-4 w-4 shrink-0" />
            )}
            {isCurrentlyHovered && (
              <span className="ml-2.5 text-xs">
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
            )}
          </Button>

          {/* User profile row */}
          <button
            onClick={onOpenProfile}
            className={`w-full flex items-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer text-left ${
              !isCurrentlyHovered ? 'justify-center p-1 h-10 w-10 mx-auto' : 'gap-2.5 p-2'
            }`}
            title="Profile & Settings"
          >
            <img
              src={
                currentUser.avatarUrl ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
              }
              alt={currentUser.name}
              className="h-7 w-7 rounded-full object-cover shrink-0 ring-1 ring-zinc-200 dark:ring-zinc-700"
            />
            {isCurrentlyHovered && (
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-zinc-400 truncate flex items-center gap-1">
                  <span>{isManager ? 'Manager' : 'Member'}</span>
                  {currentUser.employeeId && (
                    <span>• {currentUser.employeeId}</span>
                  )}
                </div>
              </div>
            )}
          </button>

          {/* Sign out button (expanded view) */}
          {isCurrentlyHovered && (
            <button
              onClick={logout}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5 shrink-0" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </aside>

      {/* 2. Mobile Slide-Over Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Dark Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onCloseMobile}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs md:hidden"
            />

            {/* Slide-out Drawer Panel */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 35 }}
              className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col justify-between shadow-2xl md:hidden"
            >
              <div>
                {/* Drawer Header */}
                <div className="h-14 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 shadow-xs">
                      <Wallet className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xs tracking-tight text-zinc-900 dark:text-zinc-50">
                        Vicenna TRF
                      </h3>
                      <p className="text-[10px] text-zinc-400">Team Portal</p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onCloseMobile}
                    className="h-8 w-8 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                    aria-label="Close menu"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Nav Links */}
                <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-190px)]">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = resolvedTab === item.id;
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => {
                          onTabChange?.(item.id);
                          onCloseMobile?.();
                        }}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-xs'
                            : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-50'
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span
                            className={`inline-flex items-center justify-center rounded-full text-[10px] font-bold h-4 min-w-4 px-1 leading-none shadow-xs ${
                              isActive
                                ? 'bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white'
                                : 'bg-blue-600 text-white'
                            }`}
                          >
                            {item.badge > 9 ? '9+' : item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Drawer Footer */}
              <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheme}
                  className="w-full justify-start text-xs text-zinc-600 dark:text-zinc-400 h-9"
                >
                  {theme === 'dark' ? (
                    <Sun className="h-4 w-4 mr-2" />
                  ) : (
                    <Moon className="h-4 w-4 mr-2" />
                  )}
                  <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </Button>

                <div
                  onClick={() => {
                    onOpenProfile?.();
                    onCloseMobile?.();
                  }}
                  className="flex items-center gap-2.5 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                >
                  <img
                    src={
                      currentUser.avatarUrl ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                    }
                    alt={currentUser.name}
                    className="h-8 w-8 rounded-full object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold truncate text-zinc-900 dark:text-zinc-100">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] text-zinc-400 truncate">
                      {currentUser.email}
                    </div>
                  </div>
                </div>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={logout}
                  className="w-full text-xs h-8"
                >
                  <LogOut className="h-3.5 w-3.5 mr-1.5" />
                  Sign Out
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
