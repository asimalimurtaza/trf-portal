'use client';

import React, { useState, useEffect } from 'react';
import { TRFProvider } from '@/context/TRFContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar, NavTab } from '@/components/layout/Sidebar';
import { OverviewView } from '@/components/sections/OverviewView';
import { FundsLedgerView } from '@/components/sections/FundsLedgerView';
import { AuditClaimsView } from '@/components/sections/AuditClaimsView';
import { BirthdaysView } from '@/components/sections/BirthdaysView';
import { ActivitiesVenuesView } from '@/components/sections/ActivitiesVenuesView';
import { RulesTreatsView } from '@/components/sections/RulesTreatsView';
import { MembersView } from '@/components/sections/MembersView';

// Modals
import { AddTransactionModal } from '@/components/modals/AddTransactionModal';
import { SubmitClaimModal } from '@/components/modals/SubmitClaimModal';
import { AddTreatModal } from '@/components/modals/AddTreatModal';
import { AddVenueModal } from '@/components/modals/AddVenueModal';
import { AddMemberModal } from '@/components/modals/AddMemberModal';
import { ProfileModal } from '@/components/modals/ProfileModal';
import { LoginScreen } from '@/components/auth/LoginScreen';
import { useTRF } from '@/context/TRFContext';

// Mobile Navigation
import { 
  LayoutDashboard, 
  Receipt, 
  FileSpreadsheet, 
  Cake, 
  Compass, 
  Gift, 
  Users 
} from 'lucide-react';

function DashboardContent() {
  const { isAuthenticated } = useTRF();
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Modals state
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isTreatModalOpen, setIsTreatModalOpen] = useState(false);
  const [isVenueModalOpen, setIsVenueModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Restore sidebar state preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('trf_sidebar_collapsed');
      if (saved !== null) {
        setIsSidebarCollapsed(saved === 'true');
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('trf_sidebar_collapsed', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      {/* 1. Fixed Sidebar Component */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* 2. Main Layout Area (Automatically adjusts margin when sidebar expands/collapses) */}
      <div
        className={`min-h-screen flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'md:pl-16' : 'md:pl-60'
        }`}
      >
        {/* Top Navbar */}
        <Navbar
          onOpenNewTransaction={() => setIsTransactionModalOpen(true)}
          onOpenNewClaim={() => setIsClaimModalOpen(true)}
          onOpenNewTreat={() => setIsTreatModalOpen(true)}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          onToggleSidebar={toggleSidebarCollapse}
        />

        {/* Dynamic Main Content Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto pb-24 md:pb-12">
          {activeTab === 'overview' && (
            <OverviewView
              onNavigateTab={setActiveTab}
              onOpenNewTransaction={() => setIsTransactionModalOpen(true)}
              onOpenNewClaim={() => setIsClaimModalOpen(true)}
              onOpenNewTreat={() => setIsTreatModalOpen(true)}
            />
          )}

          {activeTab === 'ledger' && (
            <FundsLedgerView
              onOpenNewTransaction={() => setIsTransactionModalOpen(true)}
            />
          )}

          {activeTab === 'audit-claims' && (
            <AuditClaimsView
              onOpenNewClaim={() => setIsClaimModalOpen(true)}
            />
          )}

          {activeTab === 'birthdays' && (
            <BirthdaysView
              onOpenNewTransaction={() => setIsTransactionModalOpen(true)}
            />
          )}

          {activeTab === 'activities-venues' && (
            <ActivitiesVenuesView
              onOpenAddVenue={() => setIsVenueModalOpen(true)}
            />
          )}

          {activeTab === 'rules-treats' && (
            <RulesTreatsView
              onOpenNewTreat={() => setIsTreatModalOpen(true)}
            />
          )}

          {activeTab === 'members' && (
            <MembersView
              onOpenAddMember={() => setIsMemberModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Minimalist Shadcn Neutral) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 border-t border-border backdrop-blur-md px-2 py-1.5 flex items-center justify-around">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex flex-col items-center py-1 px-2 rounded-md text-[10px] font-medium transition-colors ${
            activeTab === 'overview'
              ? 'text-foreground font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Home</span>
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex flex-col items-center py-1 px-2 rounded-md text-[10px] font-medium transition-colors ${
            activeTab === 'ledger'
              ? 'text-foreground font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Receipt className="h-4 w-4" />
          <span>Ledger</span>
        </button>
        <button
          onClick={() => setActiveTab('audit-claims')}
          className={`flex flex-col items-center py-1 px-2 rounded-md text-[10px] font-medium transition-colors ${
            activeTab === 'audit-claims'
              ? 'text-foreground font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span>Claims</span>
        </button>
        <button
          onClick={() => setActiveTab('birthdays')}
          className={`flex flex-col items-center py-1 px-2 rounded-md text-[10px] font-medium transition-colors ${
            activeTab === 'birthdays'
              ? 'text-foreground font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Cake className="h-4 w-4" />
          <span>Birthdays</span>
        </button>
        <button
          onClick={() => setActiveTab('activities-venues')}
          className={`flex flex-col items-center py-1 px-2 rounded-md text-[10px] font-medium transition-colors ${
            activeTab === 'activities-venues'
              ? 'text-foreground font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Compass className="h-4 w-4" />
          <span>Venues</span>
        </button>
        <button
          onClick={() => setActiveTab('rules-treats')}
          className={`flex flex-col items-center py-1 px-2 rounded-md text-[10px] font-medium transition-colors ${
            activeTab === 'rules-treats'
              ? 'text-foreground font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Gift className="h-4 w-4" />
          <span>Treats</span>
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`flex flex-col items-center py-1 px-2 rounded-md text-[10px] font-medium transition-colors ${
            activeTab === 'members'
              ? 'text-foreground font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Team</span>
        </button>
      </div>

      {/* Global Modals */}
      <AddTransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
      />

      <SubmitClaimModal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
      />

      <AddTreatModal
        isOpen={isTreatModalOpen}
        onClose={() => setIsTreatModalOpen(false)}
      />

      <AddVenueModal
        isOpen={isVenueModalOpen}
        onClose={() => setIsVenueModalOpen(false)}
      />

      <AddMemberModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
}

export default function Home() {
  return (
    <ThemeProvider>
      <TRFProvider>
        <DashboardContent />
      </TRFProvider>
    </ThemeProvider>
  );
}