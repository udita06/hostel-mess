'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type TimeMode = 'real' | 'before_lunch_cutoff' | 'after_lunch_cutoff' | 'after_dinner_cutoff' | 'custom';

interface TimeContextType {
  currentTime: Date;
  timeMode: TimeMode;
  setTimeMode: (mode: TimeMode) => void;
  customTime: string;
  setCustomTime: (iso: string) => void;
  resetToRealTime: () => void;
  isSimulated: boolean;
}

const TimeContext = createContext<TimeContextType | undefined>(undefined);

export function TimeProvider({ children }: { children: React.ReactNode }) {
  const [timeMode, setTimeMode] = useState<TimeMode>('real');
  const [simulatedDate, setSimulatedDate] = useState<Date>(new Date());
  const [customTime, setCustomTime] = useState<string>('');
  const [realTime, setRealTime] = useState<Date>(new Date());

  // Tick real time every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setRealTime(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const now = new Date();
    if (timeMode === 'real') {
      setSimulatedDate(now);
    } else if (timeMode === 'before_lunch_cutoff') {
      // 8:00 PM yesterday (Open for both)
      const d = new Date(now);
      d.setHours(20, 0, 0, 0);
      setSimulatedDate(d);
    } else if (timeMode === 'after_lunch_cutoff') {
      // 10:30 PM yesterday (Lunch FROZEN, Dinner OPEN)
      const d = new Date(now);
      d.setHours(22, 30, 0, 0);
      setSimulatedDate(d);
    } else if (timeMode === 'after_dinner_cutoff') {
      // 11:30 AM today (Both Lunch & Dinner FROZEN)
      const d = new Date(now);
      d.setHours(11, 30, 0, 0);
      setSimulatedDate(d);
    } else if (timeMode === 'custom' && customTime) {
      try {
        setSimulatedDate(new Date(customTime));
      } catch {
        setSimulatedDate(now);
      }
    }
  }, [timeMode, customTime, realTime]);

  const resetToRealTime = () => {
    setTimeMode('real');
    setSimulatedDate(new Date());
  };

  const effectiveTime = timeMode === 'real' ? realTime : simulatedDate;

  return (
    <TimeContext.Provider
      value={{
        currentTime: effectiveTime,
        timeMode,
        setTimeMode,
        customTime,
        setCustomTime,
        resetToRealTime,
        isSimulated: timeMode !== 'real',
      }}
    >
      {children}
    </TimeContext.Provider>
  );
}

export function useAppTime() {
  const context = useContext(TimeContext);
  if (!context) {
    throw new Error('useAppTime must be used within a TimeProvider');
  }
  return context;
}
