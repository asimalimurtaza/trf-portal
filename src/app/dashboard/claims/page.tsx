'use client';

import React from 'react';
import { AuditClaimsView } from '@/components/sections/AuditClaimsView';
import { useModals } from '@/context/ModalContext';

export default function ClaimsPage() {
  const { openNewClaimModal } = useModals();

  return (
    <AuditClaimsView
      onOpenNewClaim={openNewClaimModal}
    />
  );
}
