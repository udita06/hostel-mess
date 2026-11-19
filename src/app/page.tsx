'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import DashboardView from '../components/DashboardView';
import FoodSelectionView from '../components/FoodSelectionView';
import ProfileView from '../components/ProfileView';
import AdminOverrideModal from '../components/AdminOverrideModal';
import GFormModal from '../components/GFormModal';
import { UtensilsCrossed, Loader2 } from 'lucide-react';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [currentTab, setCurrentTab] = useState<'dashboard' | 'food_selection' | 'profile'>(
    'dashboard'
  );
  const [selectedFoodDate, setSelectedFoodDate] = useState<string>('');

  // Modals state
  const [isGFormOpen, setIsGFormOpen] = useState(false);
  const [adminOverrideState, setAdminOverrideState] = useState<{
    isOpen: boolean;
    studentId?: string;
    studentName?: string;
    date?: string;
  }>({
    isOpen: false,
  });

  const handleOpenAdminOverride = (studentId: string, studentName: string, date: string) => {
    setAdminOverrideState({
      isOpen: true,
      studentId,
      studentName,
      date,
    });
  };

  const handleNavigateToSelection = (dateStr: string) => {
    setSelectedFoodDate(dateStr);
    setCurrentTab('food_selection');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white mb-3 animate-pulse">
          <UtensilsCrossed className="w-6 h-6" />
        </div>
        <p className="text-xs font-semibold text-gray-500 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-600" /> Loading Hostel Mess Portal...
        </p>
      </div>
    );
  }

  if (!user) {
    if (typeof window !== 'undefined') {
      router.push('/login');
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 flex flex-col">
      {/* Navbar with 3 Sections */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenGFormModal={() => setIsGFormOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'dashboard' && (
          <DashboardView
            onOpenAdminOverride={handleOpenAdminOverride}
            onNavigateToSelection={handleNavigateToSelection}
          />
        )}

        {currentTab === 'food_selection' && (
          <FoodSelectionView initialDate={selectedFoodDate} />
        )}

        {currentTab === 'profile' && (
          <ProfileView
            onOpenGFormModal={() => setIsGFormOpen(true)}
            onOpenAdminOverride={handleOpenAdminOverride}
          />
        )}
      </main>

      {/* Admin Override Modal */}
      <AdminOverrideModal
        isOpen={adminOverrideState.isOpen}
        onClose={() => setAdminOverrideState({ isOpen: false })}
        defaultStudentId={adminOverrideState.studentId}
        defaultDate={adminOverrideState.date}
      />

      {/* Google Form Integration Modal */}
      <GFormModal isOpen={isGFormOpen} onClose={() => setIsGFormOpen(false)} />

      {/* Global Footer */}
      <footer className="border-t border-gray-200 bg-white py-4 text-center text-xs text-gray-400">
        Hostel Mess Management Portal • Next.js & Tailwind CSS • Cutoff Rules: Lunch 10 PM (day before) | Dinner 10 AM (same day)
      </footer>
    </div>
  );
}
