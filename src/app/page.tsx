'use client';

import React, { useState } from 'react';
import { TRFProvider } from '@/context/TRFContext';
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
  const [activeTab, setActiveTab] = useState<NavTab>('overview');

  // Modals state
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isTreatModalOpen, setIsTreatModalOpen] = useState(false);
  const [isVenueModalOpen, setIsVenueModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100">
      {/* Top Navbar */}
      <Navbar
        onOpenNewTransaction={() => setIsTransactionModalOpen(true)}
        onOpenNewClaim={() => setIsClaimModalOpen(true)}
        onOpenNewTreat={() => setIsTreatModalOpen(true)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar */}
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto pb-24 md:pb-8">
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

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800 backdrop-blur-lg px-2 py-1.5 flex items-center justify-around">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
            activeTab === 'overview' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Home</span>
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
            activeTab === 'ledger' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Receipt className="h-4 w-4" />
          <span>Ledger</span>
        </button>
        <button
          onClick={() => setActiveTab('audit-claims')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
            activeTab === 'audit-claims' ? 'text-cyan-400 font-bold' : 'text-slate-400'
          }`}
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span>Claims</span>
        </button>
        <button
          onClick={() => setActiveTab('birthdays')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
            activeTab === 'birthdays' ? 'text-pink-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Cake className="h-4 w-4" />
          <span>Birthdays</span>
        </button>
        <button
          onClick={() => setActiveTab('activities-venues')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
            activeTab === 'activities-venues' ? 'text-cyan-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Compass className="h-4 w-4" />
          <span>Venues</span>
        </button>
        <button
          onClick={() => setActiveTab('rules-treats')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
            activeTab === 'rules-treats' ? 'text-purple-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Gift className="h-4 w-4" />
          <span>Treats</span>
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
    </div>
  );
}

export default function Home() {
  return (
    <TRFProvider>
      <DashboardContent />
    </TRFProvider>
  );
}
