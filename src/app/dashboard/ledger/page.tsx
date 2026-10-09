'use client';

import React from 'react';
import { FundsLedgerView } from '@/components/sections/FundsLedgerView';
import { useModals } from '@/context/ModalContext';

export default function LedgerPage() {
  const { openNewTransactionModal } = useModals();

  return (
    <FundsLedgerView
      onOpenNewTransaction={openNewTransactionModal}
    />
  );
}
