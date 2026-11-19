'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppTime } from '../context/TimeContext';
import { useMessData } from '../context/MessDataContext';
import {
  UtensilsCrossed,
  LayoutDashboard,
  CalendarDays,
  User as UserIcon,
  Clock,
  LogOut,
  ChevronDown,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  RefreshCw,
  Bell,
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'dashboard' | 'food_selection' | 'profile';
  setCurrentTab: (tab: 'dashboard' | 'food_selection' | 'profile') => void;
  onOpenGFormModal: () => void;
}

export default function Navbar({
  currentTab,
  setCurrentTab,
  onOpenGFormModal,
}: NavbarProps) {
  const { user, isAdmin, logout, switchUser } = useAuth();
  const { currentTime, timeMode, setTimeMode, resetToRealTime, isSimulated } = useAppTime();
  const { users, overrides } = useMessData();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);

  const pendingOverridesCount = overrides.filter((o) => o.status === 'pending').length;

  const formatClock = (d: Date) => {
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (d: Date) => {
    return d.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Hostel Mess Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 text-lg tracking-tight">
                  Hostel Mess
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Vercel Live
                </span>
              </div>
              <p className="text-xs text-gray-500 hidden sm:block">
                Meal Preference & Cutoff Management
              </p>
            </div>
          </div>

          {/* Center Nav Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden md:inline">Dashboard</span>
            </button>

            <button
              onClick={() => setCurrentTab('food_selection')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'food_selection'
                  ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>Food Selection</span>
            </button>

            <button
              onClick={() => setCurrentTab('profile')}
              className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'profile'
                  ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span className="hidden md:inline">Profile</span>
              {isAdmin && pendingOverridesCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {pendingOverridesCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right Controls: Time Simulator & User Switcher */}
          <div className="flex items-center gap-2">
            {/* Time Simulator Button */}
            <button
              onClick={() => setShowTimeModal(true)}
              title="Click to test cutoff simulation (10 PM lunch / 10 AM dinner freeze)"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                isSimulated
                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <div className="text-left hidden sm:block">
                <span className="font-semibold block">{formatClock(currentTime)}</span>
                <span className="text-[10px] text-gray-500 leading-none">
                  {isSimulated ? '(Simulated)' : formatDate(currentTime)}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {/* User Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 bg-white transition-all text-left"
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    isAdmin
                      ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500/20'
                      : 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500/20'
                  }`}
                >
                  {isAdmin ? <ShieldCheck className="w-4 h-4" /> : user?.name.charAt(0) || 'U'}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-semibold text-gray-900 leading-tight flex items-center gap-1">
                    {user?.name.split(' ')[0]}
                    {isAdmin && (
                      <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1 rounded">
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-gray-500 leading-none">
                    {isAdmin ? 'Full Control' : `${user?.year}st/nd Yr ${user?.course}`}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    <span
                      className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isAdmin
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isAdmin ? 'Administrator (Full Access)' : `Student • ${user?.course} Yr ${user?.year} • Room ${user?.roomNumber}`}
                    </span>
                  </div>

                  {/* Switch to quick accounts for testing */}
                  <div className="my-2">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 py-1">
                      Quick Switch (For Demo):
                    </p>
                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {users.slice(0, 7).map((u) => (
                        <button
                          key={u.id}
                          onClick={() => {
                            switchUser(u.id);
                            setShowUserMenu(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                            u.id === user?.id
                              ? 'bg-emerald-50 text-emerald-800 font-semibold'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <div className="truncate">
                            <span>{u.name}</span>
                            <span className="block text-[10px] text-gray-400">
                              {u.role === 'admin' ? 'Admin' : `${u.year} Yr • ${u.course}`}
                            </span>
                          </div>
                          {u.id === user?.id && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <button
                      onClick={onOpenGFormModal}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded"
                    >
                      GForm Sync
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="text-xs text-rose-600 hover:text-rose-800 font-medium px-2 py-1 flex items-center gap-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cutoff Time Simulation Modal */}
      {showTimeModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-gray-900 text-base">
                  Test Cutoff & Freeze Rules
                </h3>
              </div>
              <button
                onClick={() => setShowTimeModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 text-xs text-gray-600 bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="font-semibold text-amber-900 mb-1">Mess Freeze Rules:</p>
              <ul className="list-disc list-inside space-y-0.5 text-amber-800">
                <li>
                  <strong>Lunch Cutoff:</strong> 10:00 PM on the day before.
                </li>
                <li>
                  <strong>Dinner Cutoff:</strong> 10:00 AM on the same day.
                </li>
                <li>
                  Admin can always modify/clear at any time.
                </li>
              </ul>
            </div>

            <div className="mt-4 space-y-2">
              <label className="text-xs font-semibold text-gray-700 block">
                Select Simulation Scenario:
              </label>

              <button
                onClick={() => {
                  resetToRealTime();
                  setShowTimeModal(false);
                }}
                className={`w-full text-left p-3 rounded-xl border text-xs flex items-center justify-between ${
                  timeMode === 'real'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-medium'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div>
                  <span className="font-bold block">1. Use Live System Clock</span>
                  <span className="text-[11px] text-gray-500">
                    Real current time ({formatClock(new Date())})
                  </span>
                </div>
                {timeMode === 'real' && <span className="text-emerald-600 font-bold">Active</span>}
              </button>

              <button
                onClick={() => {
                  setTimeMode('before_lunch_cutoff');
                  setShowTimeModal(false);
                }}
                className={`w-full text-left p-3 rounded-xl border text-xs flex items-center justify-between ${
                  timeMode === 'before_lunch_cutoff'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-medium'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div>
                  <span className="font-bold block">2. Simulate 8:00 PM (Before Cutoff)</span>
                  <span className="text-[11px] text-gray-500">
                    Both Lunch & Dinner for tomorrow are OPEN for editing/clearing
                  </span>
                </div>
                {timeMode === 'before_lunch_cutoff' && (
                  <span className="text-emerald-600 font-bold">Active</span>
                )}
              </button>

              <button
                onClick={() => {
                  setTimeMode('after_lunch_cutoff');
                  setShowTimeModal(false);
                }}
                className={`w-full text-left p-3 rounded-xl border text-xs flex items-center justify-between ${
                  timeMode === 'after_lunch_cutoff'
                    ? 'border-amber-500 bg-amber-50 text-amber-900 font-medium'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div>
                  <span className="font-bold block">3. Simulate 10:30 PM (Lunch FROZEN)</span>
                  <span className="text-[11px] text-gray-500">
                    Lunch option for tomorrow freezes; Dinner still OPEN until tomorrow 10 AM
                  </span>
                </div>
                {timeMode === 'after_lunch_cutoff' && (
                  <span className="text-amber-600 font-bold">Active</span>
                )}
              </button>

              <button
                onClick={() => {
                  setTimeMode('after_dinner_cutoff');
                  setShowTimeModal(false);
                }}
                className={`w-full text-left p-3 rounded-xl border text-xs flex items-center justify-between ${
                  timeMode === 'after_dinner_cutoff'
                    ? 'border-rose-500 bg-rose-50 text-rose-900 font-medium'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div>
                  <span className="font-bold block">4. Simulate 11:30 AM (Both FROZEN)</span>
                  <span className="text-[11px] text-gray-500">
                    Both Lunch & Dinner for today are locked for students
                  </span>
                </div>
                {timeMode === 'after_dinner_cutoff' && (
                  <span className="text-rose-600 font-bold">Active</span>
                )}
              </button>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowTimeModal(false)}
                className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-semibold hover:bg-gray-800"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
