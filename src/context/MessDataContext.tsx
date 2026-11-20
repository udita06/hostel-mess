'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, MealPreference, OverrideRequest, MealChoice, DayAggregatedStats } from '../types';
import {
  getStoredUsers,
  saveStoredUsers,
  getStoredMealPreferences,
  saveStoredMealPreferences,
  getStoredOverrides,
  saveStoredOverrides,
  getStoredGFormConfig,
  saveStoredGFormConfig,
  GFormConfig,
  resetAllDataToDefault,
} from '../lib/storage';
import { getMealCutoffStatus } from '../lib/cutoff';
import { useAppTime } from './TimeContext';

interface MessDataContextType {
  users: User[];
  meals: MealPreference[];
  overrides: OverrideRequest[];
  gformConfig: GFormConfig;
  dbConnected: boolean;
  dbSource: string;
  updateGFormConfig: (config: GFormConfig) => void;
  // Meal Actions
  getStudentMeal: (userId: string, date: string) => MealPreference | undefined;
  saveMealPreference: (
    userId: string,
    date: string,
    lunch: MealChoice,
    dinner: MealChoice,
    isAdmin?: boolean
  ) => { success: boolean; message: string };
  clearMealPreference: (
    userId: string,
    date: string,
    mealType: 'lunch' | 'dinner' | 'both',
    isAdmin?: boolean
  ) => { success: boolean; message: string };
  // Stats
  getDayStats: (date: string) => DayAggregatedStats;
  get30DayStats: (startDate?: string) => DayAggregatedStats[];
  // User Management (Admin & MongoDB)
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => Promise<User>;
  updateUser: (userId: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  refreshUsersFromDb: () => Promise<void>;
  // Overrides
  submitOverrideRequest: (
    userId: string,
    userName: string,
    date: string,
    mealType: 'lunch' | 'dinner' | 'both',
    requestedLunch?: MealChoice,
    requestedDinner?: MealChoice,
    reason?: string
  ) => void;
  resolveOverrideRequest: (requestId: string, status: 'approved' | 'rejected') => void;
  // GForm sync
  syncGFormData: (rawCsvOrJson?: string) => { success: boolean; count: number; message: string };
  resetData: () => void;
}

const MessDataContext = createContext<MessDataContextType | undefined>(undefined);

export function MessDataProvider({ children }: { children: React.ReactNode }) {
  const { currentTime } = useAppTime();
  const [users, setUsers] = useState<User[]>([]);
  const [meals, setMeals] = useState<MealPreference[]>([]);
  const [overrides, setOverrides] = useState<OverrideRequest[]>([]);
  const [gformConfig, setGformConfig] = useState<GFormConfig>(getStoredGFormConfig());
  const [dbConnected, setDbConnected] = useState<boolean>(false);
  const [dbSource, setDbSource] = useState<string>('initializing');

  // Load initial local data immediately for fast first paint
  useEffect(() => {
    setUsers(getStoredUsers());
    setMeals(getStoredMealPreferences());
    setOverrides(getStoredOverrides());
    setGformConfig(getStoredGFormConfig());
  }, []);

  // Fetch live users from MongoDB backend
  const refreshUsersFromDb = useCallback(async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        if (data.users && data.users.length > 0) {
          setUsers(data.users);
          saveStoredUsers(data.users);
          setDbConnected(true);
          setDbSource(data.source || 'mongodb');
          return;
        }
      }
      setDbConnected(false);
    } catch (err) {
      console.warn('Could not reach /api/users, using cached storage', err);
      setDbConnected(false);
    }
  }, []);

  // Check DB status and fetch users on mount
  useEffect(() => {
    refreshUsersFromDb();

    // Check DB status
    fetch('/api/db-status')
      .then((r) => r.json())
      .then((d) => {
        if (d.connected) {
          setDbConnected(true);
          setDbSource('mongodb');
        }
      })
      .catch(() => {});
  }, [refreshUsersFromDb]);

  // Listen to cross-tab / window sync events
  useEffect(() => {
    const handleUsers = () => setUsers(getStoredUsers());
    const handleMeals = () => setMeals(getStoredMealPreferences());
    const handleOverrides = () => setOverrides(getStoredOverrides());

    window.addEventListener('hostel_users_updated', handleUsers);
    window.addEventListener('hostel_meals_updated', handleMeals);
    window.addEventListener('hostel_overrides_updated', handleOverrides);

    return () => {
      window.removeEventListener('hostel_users_updated', handleUsers);
      window.removeEventListener('hostel_meals_updated', handleMeals);
      window.removeEventListener('hostel_overrides_updated', handleOverrides);
    };
  }, []);

  const updateGFormConfig = (newConfig: GFormConfig) => {
    setGformConfig(newConfig);
    saveStoredGFormConfig(newConfig);
  };

  const getStudentMeal = useCallback(
    (userId: string, date: string): MealPreference | undefined => {
      return meals.find((m) => m.userId === userId && m.date === date);
    },
    [meals]
  );

  const saveMealPreference = (
    userId: string,
    date: string,
    lunch: MealChoice,
    dinner: MealChoice,
    isAdmin: boolean = false
  ): { success: boolean; message: string } => {
    // Cutoff check if not admin
    if (!isAdmin) {
      const cutoff = getMealCutoffStatus(date, currentTime, false);
      const existing = getStudentMeal(userId, date);

      // Check if lunch was changed and is locked
      if (existing && existing.lunch !== lunch && cutoff.lunchLocked) {
        return {
          success: false,
          message: 'Cannot modify Lunch preference: Option is frozen after 10:00 PM on the day before.',
        };
      }
      if (!existing && lunch !== 'NONE' && cutoff.lunchLocked) {
        return {
          success: false,
          message: 'Cannot set Lunch preference: Option is frozen after 10:00 PM on the day before.',
        };
      }

      // Check if dinner was changed and is locked
      if (existing && existing.dinner !== dinner && cutoff.dinnerLocked) {
        return {
          success: false,
          message: 'Cannot modify Dinner preference: Option is frozen after 10:00 AM on the same day.',
        };
      }
      if (!existing && dinner !== 'NONE' && cutoff.dinnerLocked) {
        return {
          success: false,
          message: 'Cannot set Dinner preference: Option is frozen after 10:00 AM on the same day.',
        };
      }
    }

    const updatedMeals = [...meals];
    const index = updatedMeals.findIndex((m) => m.userId === userId && m.date === date);

    if (index >= 0) {
      updatedMeals[index] = {
        ...updatedMeals[index],
        lunch,
        dinner,
        updatedAt: new Date().toISOString(),
        updatedBy: isAdmin ? 'admin' : 'student',
      };
    } else {
      updatedMeals.push({
        id: `pref_${userId}_${date}_${Date.now()}`,
        userId,
        date,
        lunch,
        dinner,
        updatedAt: new Date().toISOString(),
        updatedBy: isAdmin ? 'admin' : 'student',
      });
    }

    setMeals(updatedMeals);
    saveStoredMealPreferences(updatedMeals);

    // Sync to backend MongoDB asynchronously
    const targetUser = users.find((u) => u.id === userId);
    fetch('/api/meals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        userEmail: targetUser?.email || '',
        date,
        lunch,
        dinner,
        updatedBy: isAdmin ? 'admin' : 'student',
      }),
    }).catch((err) => console.warn('Could not sync meal to MongoDB', err));

    return {
      success: true,
      message: isAdmin
        ? 'Admin updated preference successfully!'
        : 'Meal preference saved successfully!',
    };
  };

  const clearMealPreference = (
    userId: string,
    date: string,
    mealType: 'lunch' | 'dinner' | 'both',
    isAdmin: boolean = false
  ): { success: boolean; message: string } => {
    const cutoff = getMealCutoffStatus(date, currentTime, isAdmin);
    const existing = getStudentMeal(userId, date);

    if (!existing) {
      return { success: true, message: 'No preference was set.' };
    }

    if (!isAdmin) {
      if ((mealType === 'lunch' || mealType === 'both') && cutoff.lunchLocked) {
        return {
          success: false,
          message: 'Cannot clear Lunch: Cutoff passed 10:00 PM day before.',
        };
      }
      if ((mealType === 'dinner' || mealType === 'both') && cutoff.dinnerLocked) {
        return {
          success: false,
          message: 'Cannot clear Dinner: Cutoff passed 10:00 AM today.',
        };
      }
    }

    const newLunch = mealType === 'lunch' || mealType === 'both' ? 'NONE' : existing.lunch;
    const newDinner = mealType === 'dinner' || mealType === 'both' ? 'NONE' : existing.dinner;

    const updatedMeals = meals.map((m) => {
      if (m.userId === userId && m.date === date) {
        return {
          ...m,
          lunch: newLunch,
          dinner: newDinner,
          updatedAt: new Date().toISOString(),
          updatedBy: isAdmin ? ('admin' as const) : ('student' as const),
        };
      }
      return m;
    });

    setMeals(updatedMeals);
    saveStoredMealPreferences(updatedMeals);

    // Sync to backend
    const targetUser = users.find((u) => u.id === userId);
    fetch('/api/meals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        userEmail: targetUser?.email || '',
        date,
        lunch: newLunch,
        dinner: newDinner,
        updatedBy: isAdmin ? 'admin' : 'student',
      }),
    }).catch(() => {});

    return { success: true, message: 'Preference cleared successfully.' };
  };

  const getDayStats = useCallback(
    (date: string): DayAggregatedStats => {
      const studentUsers = users.filter((u) => u.role === 'student');
      const dayMeals = meals.filter((m) => m.date === date);

      let lunchVeg = 0;
      let lunchNonVeg = 0;
      let lunchNone = 0;

      let dinnerVeg = 0;
      let dinnerNonVeg = 0;
      let dinnerNone = 0;

      studentUsers.forEach((student) => {
        const pref = dayMeals.find((m) => m.userId === student.id);
        if (!pref) {
          lunchNone++;
          dinnerNone++;
          return;
        }

        if (pref.lunch === 'VEG') lunchVeg++;
        else if (pref.lunch === 'NON_VEG') lunchNonVeg++;
        else lunchNone++;

        if (pref.dinner === 'VEG') dinnerVeg++;
        else if (pref.dinner === 'NON_VEG') dinnerNonVeg++;
        else dinnerNone++;
      });

      const totalVeg = lunchVeg + dinnerVeg;
      const totalNonVeg = lunchNonVeg + dinnerNonVeg;
      const totalMarkedStudents = studentUsers.filter((student) => {
        const pref = dayMeals.find((m) => m.userId === student.id);
        return pref && (pref.lunch !== 'NONE' || pref.dinner !== 'NONE');
      }).length;

      // Format display date
      const d = new Date(date + 'T00:00:00');
      const displayDate = d.toLocaleDateString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });

      return {
        date,
        displayDate,
        lunchVeg,
        lunchNonVeg,
        lunchNone,
        dinnerVeg,
        dinnerNonVeg,
        dinnerNone,
        totalVeg,
        totalNonVeg,
        totalMarkedStudents,
      };
    },
    [users, meals]
  );

  const get30DayStats = useCallback(
    (startDate?: string): DayAggregatedStats[] => {
      const baseDate = startDate ? new Date(startDate + 'T00:00:00') : new Date();
      const statsList: DayAggregatedStats[] = [];

      for (let i = 0; i < 30; i++) {
        const d = new Date(baseDate);
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        statsList.push(getDayStats(dateStr));
      }

      return statsList;
    },
    [getDayStats]
  );

  // Admin user operations with MongoDB sync
  const addUser = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
    const tempId = `usr_${Date.now()}`;
    const newUser: User = {
      ...userData,
      id: tempId,
      createdAt: new Date().toISOString(),
    };

    // Optimistic local update
    const updated = [...users, newUser];
    setUsers(updated);
    saveStoredUsers(updated);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (res.ok) {
        const result = await res.json();
        if (result.user) {
          // Replace tempId with MongoDB _id
          const finalUsers = users.map((u) => (u.id === tempId ? result.user : u));
          setUsers(finalUsers);
          saveStoredUsers(finalUsers);
          return result.user;
        }
      }
    } catch (err) {
      console.warn('User saved locally, background MongoDB sync failed:', err);
    }

    return newUser;
  };

  const updateUser = async (userId: string, updates: Partial<User>): Promise<void> => {
    const updated = users.map((u) => (u.id === userId ? { ...u, ...updates } : u));
    setUsers(updated);
    saveStoredUsers(updated);

    try {
      await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, ...updates }),
      });
    } catch (err) {
      console.warn('Could not sync user update to MongoDB:', err);
    }
  };

  const deleteUser = async (userId: string): Promise<void> => {
    const updatedUsers = users.filter((u) => u.id !== userId);
    setUsers(updatedUsers);
    saveStoredUsers(updatedUsers);

    // Also remove user meals locally
    const updatedMeals = meals.filter((m) => m.userId !== userId);
    setMeals(updatedMeals);
    saveStoredMealPreferences(updatedMeals);

    try {
      await fetch(`/api/users?id=${userId}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('Could not delete user from MongoDB:', err);
    }
  };

  // Override requests
  const submitOverrideRequest = (
    userId: string,
    userName: string,
    date: string,
    mealType: 'lunch' | 'dinner' | 'both',
    requestedLunch?: MealChoice,
    requestedDinner?: MealChoice,
    reason: string = 'Missed cutoff time'
  ) => {
    const newReq: OverrideRequest = {
      id: `req_${Date.now()}`,
      userId,
      userName,
      date,
      mealType,
      requestedLunch,
      requestedDinner,
      reason,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const updated = [newReq, ...overrides];
    setOverrides(updated);
    saveStoredOverrides(updated);
  };

  const resolveOverrideRequest = (requestId: string, status: 'approved' | 'rejected') => {
    const req = overrides.find((o) => o.id === requestId);
    if (!req) return;

    if (status === 'approved') {
      const current = getStudentMeal(req.userId, req.date);
      const lunch = req.requestedLunch || current?.lunch || 'NONE';
      const dinner = req.requestedDinner || current?.dinner || 'NONE';
      saveMealPreference(req.userId, req.date, lunch, dinner, true);
    }

    const updatedOverrides = overrides.map((o) =>
      o.id === requestId ? { ...o, status } : o
    );
    setOverrides(updatedOverrides);
    saveStoredOverrides(updatedOverrides);
  };

  // Google Form Sync Engine
  const syncGFormData = (rawCsvOrJson?: string): { success: boolean; count: number; message: string } => {
    try {
      let importedCount = 0;
      const updatedUsers = [...users];

      if (rawCsvOrJson && rawCsvOrJson.trim().startsWith('{')) {
        const parsed = JSON.parse(rawCsvOrJson);
        const entries = Array.isArray(parsed) ? parsed : [parsed];

        entries.forEach((entry: any) => {
          if (!entry.email) return;
          const existing = updatedUsers.find(
            (u) => u.email.toLowerCase() === entry.email.toLowerCase()
          );
          if (existing) {
            if (entry.name) existing.name = entry.name;
            if (entry.year) existing.year = Number(entry.year) as any;
            if (entry.course) existing.course = entry.course;
            if (entry.roomNumber) existing.roomNumber = entry.roomNumber;
            importedCount++;
          } else {
            const newUser = {
              name: entry.name || 'GForm Student',
              email: entry.email,
              role: 'student' as const,
              year: (Number(entry.year) || 1) as any,
              course: entry.course || 'B.Tech',
              roomNumber: entry.roomNumber || 'TBD',
            };
            addUser(newUser);
            importedCount++;
          }
        });
      } else {
        const demoGFormResponses = [
          {
            name: 'Priya Patel (GForm Registered)',
            email: 'priya.p@hostel.edu',
            year: 2,
            course: 'MCA',
            roomNumber: 'B-215',
          },
          {
            name: 'Karan Mehra (GForm Registered)',
            email: 'karan.m@hostel.edu',
            year: 1,
            course: 'B.Tech',
            roomNumber: 'A-110',
          },
        ];

        demoGFormResponses.forEach((res) => {
          const exists = updatedUsers.find((u) => u.email.toLowerCase() === res.email.toLowerCase());
          if (!exists) {
            addUser({
              name: res.name,
              email: res.email,
              role: 'student',
              year: res.year as any,
              course: res.course as any,
              roomNumber: res.roomNumber,
            });
            importedCount++;
          }
        });
      }

      setUsers(updatedUsers);
      saveStoredUsers(updatedUsers);

      const newConfig = {
        ...gformConfig,
        lastSyncedAt: new Date().toISOString(),
      };
      setGformConfig(newConfig);
      saveStoredGFormConfig(newConfig);

      return {
        success: true,
        count: importedCount,
        message: `Successfully synchronized ${importedCount} record(s) from Google Form into MongoDB!`,
      };
    } catch (err: any) {
      return {
        success: false,
        count: 0,
        message: `Failed to sync Google Form data: ${err.message}`,
      };
    }
  };

  const resetData = () => {
    resetAllDataToDefault();
    setUsers(getStoredUsers());
    setMeals(getStoredMealPreferences());
    setOverrides([]);
  };

  return (
    <MessDataContext.Provider
      value={{
        users,
        meals,
        overrides,
        gformConfig,
        dbConnected,
        dbSource,
        updateGFormConfig,
        getStudentMeal,
        saveMealPreference,
        clearMealPreference,
        getDayStats,
        get30DayStats,
        addUser,
        updateUser,
        deleteUser,
        refreshUsersFromDb,
        submitOverrideRequest,
        resolveOverrideRequest,
        syncGFormData,
        resetData,
      }}
    >
      {children}
    </MessDataContext.Provider>
  );
}

export function useMessData() {
  const context = useContext(MessDataContext);
  if (!context) {
    throw new Error('useMessData must be used within a MessDataProvider');
  }
  return context;
}
