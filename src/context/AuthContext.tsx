'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { getStoredUsers } from '../lib/storage';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string) => { success: boolean; message?: string };
  logout: () => void;
  switchUser: (userId: string) => void;
  isAdmin: boolean;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_ID_KEY = 'hostel_mess_current_user_id';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize from localStorage or default to demo student (Rahul Sharma)
  useEffect(() => {
    const users = getStoredUsers();
    const savedUserId = localStorage.getItem(CURRENT_USER_ID_KEY);
    
    if (savedUserId) {
      const found = users.find((u) => u.id === savedUserId);
      if (found) {
        setUser(found);
        setIsLoading(false);
        return;
      }
    }

    // Default to demo student Rahul Sharma for immediate interactive demo
    const defaultStudent = users.find((u) => u.id === 'usr_201') || users[1] || users[0];
    if (defaultStudent) {
      setUser(defaultStudent);
      localStorage.setItem(CURRENT_USER_ID_KEY, defaultStudent.id);
    }
    setIsLoading(false);
  }, []);

  // Listen to storage update event if user details change
  useEffect(() => {
    const handleUsersUpdate = () => {
      const users = getStoredUsers();
      if (user) {
        const updated = users.find((u) => u.id === user.id);
        if (updated) setUser(updated);
      }
    };
    window.addEventListener('hostel_users_updated', handleUsersUpdate);
    return () => window.removeEventListener('hostel_users_updated', handleUsersUpdate);
  }, [user]);

  const login = (email: string): { success: boolean; message?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const users = getStoredUsers();
    const found = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (found) {
      setUser(found);
      localStorage.setItem(CURRENT_USER_ID_KEY, found.id);
      return { success: true };
    }

    // If new email, allow auto-creation or report not found
    return {
      success: false,
      message: `No account found for "${cleanEmail}". Please check your email or select a demo profile below.`,
    };
  };

  const switchUser = (userId: string) => {
    const users = getStoredUsers();
    const found = users.find((u) => u.id === userId);
    if (found) {
      setUser(found);
      localStorage.setItem(CURRENT_USER_ID_KEY, found.id);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_ID_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        switchUser,
        isAdmin: user?.role === 'admin',
        isLoggedIn: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
