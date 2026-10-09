'use client';

import React from 'react';
import { RulesTreatsView } from '@/components/sections/RulesTreatsView';
import { useModals } from '@/context/ModalContext';

export default function TreatRulesPage() {
  const { openNewTreatModal } = useModals();

  return (
    <RulesTreatsView
      onOpenNewTreat={openNewTreatModal}
    />
  );
}
