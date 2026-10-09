'use client';

import React from 'react';
import { BirthdaysView } from '@/components/sections/BirthdaysView';
import { useModals } from '@/context/ModalContext';

export default function BirthdaysPage() {
  const { openNewTransactionModal } = useModals();

  return (
    <BirthdaysView
      onOpenNewTransaction={openNewTransactionModal}
    />
  );
}
