'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMessData } from '../context/MessDataContext';
import { useAppTime } from '../context/TimeContext';
import { MealChoice } from '../types';
import { getMealCutoffStatus } from '../lib/cutoff';
import confetti from 'canvas-confetti';
import {
  Calendar as CalendarIcon,
  Check,
  Lock,
  Unlock,
  AlertTriangle,
  Clock,
  Sparkles,
  Sun,
  Moon,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Send,
} from 'lucide-react';

interface FoodSelectionViewProps {
  initialDate?: string;
}

export default function FoodSelectionView({ initialDate }: FoodSelectionViewProps) {
  const { user, isAdmin } = useAuth();
  const { currentTime } = useAppTime();
  const { getStudentMeal, saveMealPreference, clearMealPreference, submitOverrideRequest } =
    useMessData();

  // 30 days list starting from today
  const [days, setDays] = useState<string[]>([]);
  const [activeDate, setActiveDate] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(
    null
  );

  // Local state for edits before clicking save (tick)
  const [localChoices, setLocalChoices] = useState<
    Record<string, { lunch: MealChoice; dinner: MealChoice }>
  >({});

  // Override request modal state
  const [overrideModal, setOverrideModal] = useState<{
    isOpen: boolean;
    date: string;
    mealType: 'lunch' | 'dinner' | 'both';
    reason: string;
    requestedLunch: MealChoice;
    requestedDinner: MealChoice;
  }>({
    isOpen: false,
    date: '',
    mealType: 'both',
    reason: '',
    requestedLunch: 'VEG',
    requestedDinner: 'VEG',
  });

  // Generate 30 days
  useEffect(() => {
    const list: string[] = [];
    const base = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(base);
      d.setDate(d.getDate() + i);
      list.push(d.toISOString().split('T')[0]);
    }
    setDays(list);
    setActiveDate(initialDate && list.includes(initialDate) ? initialDate : list[0]);
  }, [initialDate]);

  // Synchronize local choices with saved DB meals
  useEffect(() => {
    if (!user) return;
    const initialLocal: Record<string, { lunch: MealChoice; dinner: MealChoice }> = {};
    days.forEach((dateStr) => {
      const meal = getStudentMeal(user.id, dateStr);
      initialLocal[dateStr] = {
        lunch: meal?.lunch || 'NONE',
        dinner: meal?.dinner || 'NONE',
      };
    });
    setLocalChoices(initialLocal);
  }, [user, days, getStudentMeal]);

  const showToast = (text: string, type: 'success' | 'error') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSelectChoice = (
    dateStr: string,
    mealType: 'lunch' | 'dinner',
    choice: MealChoice
  ) => {
    const cutoff = getMealCutoffStatus(dateStr, currentTime, isAdmin);

    if (mealType === 'lunch' && cutoff.lunchLocked) {
      showToast(
        'Lunch option is frozen! Cutoff was 10:00 PM on the day before.',
        'error'
      );
      return;
    }
    if (mealType === 'dinner' && cutoff.dinnerLocked) {
      showToast(
        'Dinner option is frozen! Cutoff was 10:00 AM today.',
        'error'
      );
      return;
    }

    setLocalChoices((prev) => ({
      ...prev,
      [dateStr]: {
        ...prev[dateStr],
        [mealType]: choice,
      },
    }));
  };

  const handleSaveDay = (dateStr: string) => {
    if (!user) return;
    const current = localChoices[dateStr] || { lunch: 'NONE', dinner: 'NONE' };

    const res = saveMealPreference(
      user.id,
      dateStr,
      current.lunch,
      current.dinner,
      isAdmin
    );

    if (res.success) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {
        // Confetti fallback
      }
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleClearDay = (dateStr: string) => {
    if (!user) return;
    const res = clearMealPreference(user.id, dateStr, 'both', isAdmin);
    if (res.success) {
      setLocalChoices((prev) => ({
        ...prev,
        [dateStr]: { lunch: 'NONE', dinner: 'NONE' },
      }));
      showToast('Meal preference cleared for this day.', 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleBatchSetAll = (choice: 'VEG' | 'NON_VEG' | 'NONE') => {
    if (!user) return;
    let savedCount = 0;

    days.forEach((dateStr) => {
      const cutoff = getMealCutoffStatus(dateStr, currentTime, isAdmin);
      const current = localChoices[dateStr] || { lunch: 'NONE', dinner: 'NONE' };

      const newLunch = cutoff.lunchLocked ? current.lunch : choice;
      const newDinner = cutoff.dinnerLocked ? current.dinner : choice;

      if (!cutoff.lunchLocked || !cutoff.dinnerLocked || isAdmin) {
        saveMealPreference(user.id, dateStr, newLunch, newDinner, isAdmin);
        savedCount++;
      }
    });

    // Refresh state
    const updated: Record<string, { lunch: MealChoice; dinner: MealChoice }> = {};
    days.forEach((d) => {
      const m = getStudentMeal(user.id, d);
      updated[d] = { lunch: m?.lunch || 'NONE', dinner: m?.dinner || 'NONE' };
    });
    setLocalChoices(updated);

    try {
      confetti({ particleCount: 75, spread: 80 });
    } catch {}
    showToast(`Updated ${savedCount} available day(s) to ${choice === 'NONE' ? 'Cleared' : choice}!`, 'success');
  };

  const openOverrideRequest = (dateStr: string, mealType: 'lunch' | 'dinner' | 'both') => {
    const cur = localChoices[dateStr] || { lunch: 'VEG', dinner: 'VEG' };
    setOverrideModal({
      isOpen: true,
      date: dateStr,
      mealType,
      reason: '',
      requestedLunch: cur.lunch === 'NONE' ? 'VEG' : cur.lunch,
      requestedDinner: cur.dinner === 'NONE' ? 'VEG' : cur.dinner,
    });
  };

  const submitOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    submitOverrideRequest(
      user.id,
      user.name,
      overrideModal.date,
      overrideModal.mealType,
      overrideModal.requestedLunch,
      overrideModal.requestedDinner,
      overrideModal.reason || 'Requested change past cutoff'
    );
    setOverrideModal((prev) => ({ ...prev, isOpen: false }));
    showToast('Override request sent to Hostel Admin for review!', 'success');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold transition-all animate-in slide-in-from-bottom duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-800 text-white border border-emerald-600'
              : 'bg-rose-800 text-white border border-rose-600'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-300" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-300" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Banner explaining the Freeze rules */}
      <div className="bg-white rounded-2xl p-6 border border-emerald-200/80 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                <Clock className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-gray-900">
                Monthly Meal Selection (Next 30 Days)
              </h2>
            </div>
            <p className="text-xs text-gray-600 max-w-2xl">
              Select your preference between <strong className="text-emerald-700">Veg (V)</strong> and{' '}
              <strong className="text-rose-600">Non-Veg (NV)</strong> for lunch and dinner. Click the{' '}
              <strong className="text-emerald-700">✓ Save tick sign</strong> to confirm.
            </p>
          </div>

          {/* Quick Batch Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase">Quick Fill:</span>
            <button
              onClick={() => handleBatchSetAll('VEG')}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold border border-emerald-300 transition-colors"
            >
              All Veg (V)
            </button>
            <button
              onClick={() => handleBatchSetAll('NON_VEG')}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-lg text-xs font-bold border border-rose-300 transition-colors"
            >
              All Non-Veg (NV)
            </button>
            <button
              onClick={() => handleBatchSetAll('NONE')}
              className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition-colors"
              title="Clear all open dates"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Cutoff Rules Warning Box */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-amber-50/70 border border-amber-200 rounded-xl p-3">
          <div className="flex items-start gap-2">
            <Sun className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-900 font-bold">Lunch Cutoff Deadline:</strong>
              <p className="text-amber-800 text-[11px]">
                Must edit or clear before <strong>10:00 PM on the day before</strong>. Freezes afterwards!
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Moon className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-indigo-900 font-bold">Dinner Cutoff Deadline:</strong>
              <p className="text-indigo-800 text-[11px]">
                Must edit or clear before <strong>10:00 AM on the same day</strong>. Freezes afterwards!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 30-Day Calendar Strip */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-emerald-600" />
            Select Day to View or Edit ({days.length} Days in Advance)
          </h3>
          <span className="text-xs text-gray-500">
            Current Date: <strong>{new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
          </span>
        </div>

        <div className="mt-3 overflow-x-auto pb-2">
          <div className="flex gap-2 min-w-max">
            {days.map((dStr, idx) => {
              const d = new Date(dStr + 'T00:00:00');
              const isSelected = dStr === activeDate;
              const isToday = idx === 0;
              const cutoff = getMealCutoffStatus(dStr, currentTime, isAdmin);
              const curChoice = localChoices[dStr] || { lunch: 'NONE', dinner: 'NONE' };

              return (
                <button
                  key={dStr}
                  onClick={() => setActiveDate(dStr)}
                  className={`w-28 p-2.5 rounded-xl border text-center transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/30'
                      : 'border-gray-200 bg-gray-50/70 hover:bg-white hover:border-gray-300'
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 block uppercase">
                      {isToday ? 'Today' : d.toLocaleDateString('en-IN', { weekday: 'short' })}
                    </span>
                    <span className="text-xs font-black text-gray-900">
                      {d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>

                  {/* Badges showing current marked choices */}
                  <div className="mt-2 flex items-center justify-center gap-1 text-[10px]">
                    <span
                      title={`Lunch: ${curChoice.lunch}`}
                      className={`w-5 h-5 rounded flex items-center justify-center font-bold ${
                        curChoice.lunch === 'VEG'
                          ? 'bg-emerald-200 text-emerald-900'
                          : curChoice.lunch === 'NON_VEG'
                          ? 'bg-rose-200 text-rose-900'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {curChoice.lunch === 'VEG' ? 'V' : curChoice.lunch === 'NON_VEG' ? 'NV' : '-'}
                    </span>
                    <span
                      title={`Dinner: ${curChoice.dinner}`}
                      className={`w-5 h-5 rounded flex items-center justify-center font-bold ${
                        curChoice.dinner === 'VEG'
                          ? 'bg-emerald-200 text-emerald-900'
                          : curChoice.dinner === 'NON_VEG'
                          ? 'bg-rose-200 text-rose-900'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {curChoice.dinner === 'VEG' ? 'V' : curChoice.dinner === 'NON_VEG' ? 'NV' : '-'}
                    </span>
                  </div>

                  {/* Lock Indicator */}
                  <div className="mt-1.5 flex justify-center">
                    {cutoff.lunchLocked && cutoff.dinnerLocked ? (
                      <span className="text-[9px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5" /> Frozen
                      </span>
                    ) : cutoff.lunchLocked ? (
                      <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                        L-Locked
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                        Open
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ACTIVE SELECTED DAY MEAL PREFERENCE CARD */}
      {activeDate && (
        <div className="bg-white rounded-2xl p-6 border border-emerald-300 shadow-md">
          {(() => {
            const d = new Date(activeDate + 'T00:00:00');
            const cutoff = getMealCutoffStatus(activeDate, currentTime, isAdmin);
            const choice = localChoices[activeDate] || { lunch: 'NONE', dinner: 'NONE' };
            const isToday = activeDate === days[0];

            return (
              <div className="space-y-6">
                {/* Day Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      {isToday ? "Today's Meal" : 'Selected Day'}
                    </span>
                    <h3 className="text-2xl font-black text-gray-900 mt-1">
                      {d.toLocaleDateString('en-IN', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </h3>
                  </div>

                  {/* Tick Save Button */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleClearDay(activeDate)}
                      className="px-3 py-2 text-xs font-semibold text-gray-600 hover:text-rose-600 hover:bg-rose-50 border border-gray-200 rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear Day
                    </button>

                    <button
                      onClick={() => handleSaveDay(activeDate)}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-500/20 text-sm flex items-center gap-2 transition-all transform active:scale-95"
                    >
                      <Check className="w-5 h-5 stroke-[3]" />
                      Save Preference (✓)
                    </button>
                  </div>
                </div>

                {/* 2 MEAL COLUMNS: LUNCH & DINNER */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* LUNCH CARD */}
                  <div
                    className={`p-5 rounded-2xl border transition-all ${
                      cutoff.lunchLocked
                        ? 'bg-gray-50/80 border-gray-200'
                        : 'bg-amber-50/30 border-amber-200'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-gray-200/60">
                      <div className="flex items-center gap-2">
                        <Sun className="w-5 h-5 text-amber-500" />
                        <h4 className="font-bold text-gray-900 text-base">Lunch</h4>
                      </div>
                      {cutoff.lunchLocked ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold bg-rose-100 text-rose-800 px-2.5 py-1 rounded-full">
                          <Lock className="w-3.5 h-3.5" /> Frozen
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
                          <Unlock className="w-3.5 h-3.5" /> Open
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-gray-500 mt-2">
                      {cutoff.lunchLocked
                        ? cutoff.lunchReason
                        : `Editable until: ${cutoff.lunchDeadline.toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                          })} on ${cutoff.lunchDeadline.toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                          })}`}
                    </p>

                    {/* V or NV Selection Buttons */}
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <button
                        disabled={cutoff.lunchLocked}
                        onClick={() => handleSelectChoice(activeDate, 'lunch', 'VEG')}
                        className={`py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all ${
                          choice.lunch === 'VEG'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-500/30'
                            : cutoff.lunchLocked
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                            : 'bg-white hover:bg-emerald-50 text-emerald-800 border-emerald-300'
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-current"></span>
                        Veg (V)
                        {choice.lunch === 'VEG' && <Check className="w-4 h-4 ml-1" />}
                      </button>

                      <button
                        disabled={cutoff.lunchLocked}
                        onClick={() => handleSelectChoice(activeDate, 'lunch', 'NON_VEG')}
                        className={`py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all ${
                          choice.lunch === 'NON_VEG'
                            ? 'bg-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-500/30'
                            : cutoff.lunchLocked
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                            : 'bg-white hover:bg-rose-50 text-rose-800 border-rose-300'
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-current"></span>
                        Non-Veg (NV)
                        {choice.lunch === 'NON_VEG' && <Check className="w-4 h-4 ml-1" />}
                      </button>
                    </div>

                    {/* Option Freeze notice & Override button */}
                    {cutoff.lunchLocked && !isAdmin && (
                      <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs text-rose-900">
                        <span>Time passed 10:00 PM. Lunch option is frozen.</span>
                        <button
                          onClick={() => openOverrideRequest(activeDate, 'lunch')}
                          className="px-2.5 py-1 bg-rose-600 text-white font-bold rounded-lg text-[11px] hover:bg-rose-700"
                        >
                          Request Change
                        </button>
                      </div>
                    )}
                  </div>

                  {/* DINNER CARD */}
                  <div
                    className={`p-5 rounded-2xl border transition-all ${
                      cutoff.dinnerLocked
                        ? 'bg-gray-50/80 border-gray-200'
                        : 'bg-indigo-50/30 border-indigo-200'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-gray-200/60">
                      <div className="flex items-center gap-2">
                        <Moon className="w-5 h-5 text-indigo-500" />
                        <h4 className="font-bold text-gray-900 text-base">Dinner</h4>
                      </div>
                      {cutoff.dinnerLocked ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold bg-rose-100 text-rose-800 px-2.5 py-1 rounded-full">
                          <Lock className="w-3.5 h-3.5" /> Frozen
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
                          <Unlock className="w-3.5 h-3.5" /> Open
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-gray-500 mt-2">
                      {cutoff.dinnerLocked
                        ? cutoff.dinnerReason
                        : `Editable until: ${cutoff.dinnerDeadline.toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                          })} on ${cutoff.dinnerDeadline.toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                          })}`}
                    </p>

                    {/* V or NV Selection Buttons */}
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <button
                        disabled={cutoff.dinnerLocked}
                        onClick={() => handleSelectChoice(activeDate, 'dinner', 'VEG')}
                        className={`py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all ${
                          choice.dinner === 'VEG'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-500/30'
                            : cutoff.dinnerLocked
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                            : 'bg-white hover:bg-emerald-50 text-emerald-800 border-emerald-300'
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-current"></span>
                        Veg (V)
                        {choice.dinner === 'VEG' && <Check className="w-4 h-4 ml-1" />}
                      </button>

                      <button
                        disabled={cutoff.dinnerLocked}
                        onClick={() => handleSelectChoice(activeDate, 'dinner', 'NON_VEG')}
                        className={`py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all ${
                          choice.dinner === 'NON_VEG'
                            ? 'bg-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-500/30'
                            : cutoff.dinnerLocked
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                            : 'bg-white hover:bg-rose-50 text-rose-800 border-rose-300'
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-current"></span>
                        Non-Veg (NV)
                        {choice.dinner === 'NON_VEG' && <Check className="w-4 h-4 ml-1" />}
                      </button>
                    </div>

                    {/* Option Freeze notice & Override button */}
                    {cutoff.dinnerLocked && !isAdmin && (
                      <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs text-rose-900">
                        <span>Time passed 10:00 AM. Dinner option is frozen.</span>
                        <button
                          onClick={() => openOverrideRequest(activeDate, 'dinner')}
                          className="px-2.5 py-1 bg-rose-600 text-white font-bold rounded-lg text-[11px] hover:bg-rose-700"
                        >
                          Request Change
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Save Reminder */}
                <div className="pt-2 flex items-center justify-between text-xs text-gray-500">
                  <span>
                    Current Selection: <strong>Lunch: {choice.lunch}</strong> •{' '}
                    <strong>Dinner: {choice.dinner}</strong>
                  </span>
                  <button
                    onClick={() => handleSaveDay(activeDate)}
                    className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
                  >
                    Click to commit and save with (✓)
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* STUDENT OVERRIDE REQUEST MODAL */}
      {overrideModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-gray-900 text-base">Request Admin Meal Change</h3>
              </div>
              <button
                onClick={() => setOverrideModal((prev) => ({ ...prev, isOpen: false }))}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={submitOverride} className="mt-4 space-y-4 text-xs">
              <p className="text-gray-600">
                You have passed the deadline for{' '}
                <strong>{overrideModal.date}</strong>. The warden/admin can review your reason and update your meal.
              </p>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Meal to Change:</label>
                <select
                  value={overrideModal.mealType}
                  onChange={(e) =>
                    setOverrideModal((p) => ({ ...p, mealType: e.target.value as any }))
                  }
                  className="w-full p-2 border border-gray-200 rounded-lg"
                >
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="both">Both Lunch & Dinner</option>
                </select>
              </div>

              {(overrideModal.mealType === 'lunch' || overrideModal.mealType === 'both') && (
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Desired Lunch:</label>
                  <select
                    value={overrideModal.requestedLunch}
                    onChange={(e) =>
                      setOverrideModal((p) => ({ ...p, requestedLunch: e.target.value as any }))
                    }
                    className="w-full p-2 border border-gray-200 rounded-lg"
                  >
                    <option value="VEG">Veg (V)</option>
                    <option value="NON_VEG">Non-Veg (NV)</option>
                    <option value="NONE">Cancel Meal (None)</option>
                  </select>
                </div>
              )}

              {(overrideModal.mealType === 'dinner' || overrideModal.mealType === 'both') && (
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Desired Dinner:</label>
                  <select
                    value={overrideModal.requestedDinner}
                    onChange={(e) =>
                      setOverrideModal((p) => ({ ...p, requestedDinner: e.target.value as any }))
                    }
                    className="w-full p-2 border border-gray-200 rounded-lg"
                  >
                    <option value="VEG">Veg (V)</option>
                    <option value="NON_VEG">Non-Veg (NV)</option>
                    <option value="NONE">Cancel Meal (None)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Reason for Late Change / Cancellation:
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g., Hospital appointment / Travelling home / Doctor dietary advice"
                  value={overrideModal.reason}
                  onChange={(e) =>
                    setOverrideModal((p) => ({ ...p, reason: e.target.value }))
                  }
                  className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOverrideModal((prev) => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
