'use client';

import React from 'react';
import { ActivitiesVenuesView } from '@/components/sections/ActivitiesVenuesView';
import { useModals } from '@/context/ModalContext';

export default function OutingsPage() {
  const { openNewVenueModal } = useModals();

  return (
    <ActivitiesVenuesView
      onOpenAddVenue={openNewVenueModal}
    />
  );
}
