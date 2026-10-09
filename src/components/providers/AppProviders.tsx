'use client';

import React from 'react';
import { TRFProvider } from '@/context/TRFContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ModalProvider } from '@/context/ModalContext';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <TRFProvider>
      <ThemeProvider>
        <ModalProvider>
          {children}
        </ModalProvider>
      </ThemeProvider>
    </TRFProvider>
  );
}
