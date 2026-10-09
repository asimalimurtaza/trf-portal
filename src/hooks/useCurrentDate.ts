'use client';

import { useState, useEffect } from 'react';

export function useCurrentDate() {
  const [currentDate, setCurrentDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    setCurrentDate(new Date());
  }, []);

  return currentDate;
}
