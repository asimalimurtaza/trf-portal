'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTRF } from '@/context/TRFContext';
import { useModals } from '@/context/ModalContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { LoginScreen } from '@/components/auth/LoginScreen';
import {
  LayoutDashboard,
  Receipt,
  FileSpreadsheet,
  Cake,
  Compass,
  Gift,
  Users,
  MessageSquare,
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || '/dashboard';
  const { isAuthenticated, unreadDirectMessagesCount } = useTRF();
  const {
    openNewTransactionModal,
    openNewClaimModal,
    openNewTreatModal,
    openProfileModal,
  } = useModals();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const toggleSidebarCollapse = () => setIsSidebarCollapsed((prev) => !prev);

  // Authentication gate
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const mobileNavItems = [
    { href: '/dashboard', label: 'Home', icon: LayoutDashboard, exact: true },
    { href: '/dashboard/ledger', label: 'Ledger', icon: Receipt },
    { href: '/dashboard/claims', label: 'Claims', icon: FileSpreadsheet },
    { href: '/dashboard/birthdays', label: 'Birthdays', icon: Cake },
    { href: '/dashboard/outings', label: 'Venues', icon: Compass },
    { href: '/dashboard/treat-rules', label: 'Treats', icon: Gift },
    { href: '/dashboard/members', label: 'Team', icon: Users },
    { href: '/dashboard/chat', label: 'Chat', icon: MessageSquare, badge: unreadDirectMessagesCount },
  ];

  const isChatRoute = pathname === '/dashboard/chat' || pathname.startsWith('/dashboard/chat');

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      {/* 1. Fixed Sidebar Navigation */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
        onOpenProfile={openProfileModal}
      />

      {/* 2. Main Content Container */}
      <div
        className={`${
          isChatRoute ? 'h-dvh max-h-dvh overflow-hidden' : 'min-h-screen'
        } flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'md:pl-16' : 'md:pl-60'
        }`}
      >
        {/* Top Navbar */}
        <Navbar
          onOpenNewTransaction={openNewTransactionModal}
          onOpenNewClaim={openNewClaimModal}
          onOpenNewTreat={openNewTreatModal}
          onOpenProfile={openProfileModal}
          onToggleSidebar={toggleSidebarCollapse}
        />

        {/* Dynamic Route Children */}
        <main
          className={
            isChatRoute
              ? "flex-1 min-h-0 flex flex-col p-2 sm:p-4 lg:p-5 w-full max-w-7xl mx-auto pb-[4rem] md:pb-4 overflow-hidden"
              : "flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto pb-24 md:pb-12"
          }
        >
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Minimalist Shadcn Neutral) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 border-t border-border backdrop-blur-md px-1 py-1.5 flex items-center justify-around overflow-x-auto scrollbar-none">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center py-1 px-1.5 rounded-md text-[10px] font-medium transition-colors shrink-0 ${
                isActive
                  ? 'text-foreground font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="relative">
                <Icon className="h-4 w-4" />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1.5 h-2 w-2 rounded-full bg-blue-600 ring-1 ring-background" />
                )}
              </div>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
