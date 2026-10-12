'use client';

import React, { createContext, useContext, useState } from 'react';
import { AddTransactionModal } from '@/components/modals/AddTransactionModal';
import { SubmitClaimModal } from '@/components/modals/SubmitClaimModal';
import { AddTreatModal } from '@/components/modals/AddTreatModal';
import { AddVenueModal } from '@/components/modals/AddVenueModal';
import { AddMemberModal } from '@/components/modals/AddMemberModal';
import { ProfileModal } from '@/components/modals/ProfileModal';
import { BirthdayCelebrationModal } from '@/components/modals/BirthdayCelebrationModal';
import { SendBirthdayWishModal } from '@/components/modals/SendBirthdayWishModal';

interface ModalContextType {
  openNewTransactionModal: () => void;
  openNewClaimModal: () => void;
  openNewTreatModal: () => void;
  openNewVenueModal: () => void;
  openNewMemberModal: () => void;
  openProfileModal: () => void;
  openSendBirthdayWishModal: (member: { id: string; name: string; avatarUrl?: string }) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isTransactionOpen, setIsTransactionOpen] = useState(false);
  const [isClaimOpen, setIsClaimOpen] = useState(false);
  const [isTreatOpen, setIsTreatOpen] = useState(false);
  const [isVenueOpen, setIsVenueOpen] = useState(false);
  const [isMemberOpen, setIsMemberOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [wishTargetMember, setWishTargetMember] = useState<{ id: string; name: string; avatarUrl?: string } | null>(null);

  return (
    <ModalContext.Provider
      value={{
        openNewTransactionModal: () => setIsTransactionOpen(true),
        openNewClaimModal: () => setIsClaimOpen(true),
        openNewTreatModal: () => setIsTreatOpen(true),
        openNewVenueModal: () => setIsVenueOpen(true),
        openNewMemberModal: () => setIsMemberOpen(true),
        openProfileModal: () => setIsProfileOpen(true),
        openSendBirthdayWishModal: (member) => setWishTargetMember(member),
      }}
    >
      {children}
      <AddTransactionModal isOpen={isTransactionOpen} onClose={() => setIsTransactionOpen(false)} />
      <SubmitClaimModal isOpen={isClaimOpen} onClose={() => setIsClaimOpen(false)} />
      <AddTreatModal isOpen={isTreatOpen} onClose={() => setIsTreatOpen(false)} />
      <AddVenueModal isOpen={isVenueOpen} onClose={() => setIsVenueOpen(false)} />
      <AddMemberModal isOpen={isMemberOpen} onClose={() => setIsMemberOpen(false)} />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <BirthdayCelebrationModal />
      <SendBirthdayWishModal
        targetMember={wishTargetMember}
        isOpen={Boolean(wishTargetMember)}
        onClose={() => setWishTargetMember(null)}
      />
    </ModalContext.Provider>
  );
}

export function useModals() {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    throw new Error('useModals must be used within a ModalProvider');
  }
  return ctx;
}
