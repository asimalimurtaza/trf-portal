'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { OverviewView } from '@/components/sections/OverviewView';
import { useModals } from '@/context/ModalContext';
import { NavTab } from '@/components/layout/Sidebar';

const TAB_ROUTES: Record<NavTab, string> = {
  overview: '/dashboard',
  ledger: '/dashboard/ledger',
  'audit-claims': '/dashboard/claims',
  birthdays: '/dashboard/birthdays',
  'activities-venues': '/dashboard/outings',
  'rules-treats': '/dashboard/treat-rules',
  members: '/dashboard/members',
  messages: '/dashboard/chat',
};

export default function DashboardOverviewPage() {
  const router = useRouter();
  const {
    openNewTransactionModal,
    openNewClaimModal,
    openNewTreatModal,
  } = useModals();

  return (
    <OverviewView
      onNavigateTab={(tab) => {
        const route = TAB_ROUTES[tab];
        if (route) router.push(route);
      }}
      onOpenNewTransaction={openNewTransactionModal}
      onOpenNewClaim={openNewClaimModal}
      onOpenNewTreat={openNewTreatModal}
    />
  );
}
