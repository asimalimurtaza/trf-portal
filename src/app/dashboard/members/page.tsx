'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MembersView } from '@/components/sections/MembersView';
import { useModals } from '@/context/ModalContext';
import { useTRF } from '@/context/TRFContext';

export default function MembersPage() {
  const router = useRouter();
  const { openNewMemberModal } = useModals();
  const { setActiveChatUserId } = useTRF();

  return (
    <MembersView
      onOpenAddMember={openNewMemberModal}
      onOpenChat={(partnerId) => {
        setActiveChatUserId(partnerId);
        router.push('/dashboard/chat');
      }}
    />
  );
}
