'use client';

import React, { useState, useEffect } from 'react';
import { useMessData } from '../context/MessDataContext';
import { MealChoice } from '../types';
import { ShieldAlert, Check, X, Calendar, User as UserIcon } from 'lucide-react';

interface AdminOverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultStudentId?: string;
  defaultDate?: string;
}

export default function AdminOverrideModal({
  isOpen,
  onClose,
  defaultStudentId,
  defaultDate,
}: AdminOverrideModalProps) {
  const { users, getStudentMeal, saveMealPreference } = useMessData();

  const [studentId, setStudentId] = useState<string>(defaultStudentId || '');
  const [date, setDate] = useState<string>(
    defaultDate || new Date().toISOString().split('T')[0]
  );
  const [lunch, setLunch] = useState<MealChoice>('VEG');
  const [dinner, setDinner] = useState<MealChoice>('VEG');
  const [statusMessage, setStatusMessage] = useState<string>('');

  useEffect(() => {
    if (defaultStudentId) setStudentId(defaultStudentId);
    if (defaultDate) setDate(defaultDate);
  }, [defaultStudentId, defaultDate]);

  useEffect(() => {
    if (studentId && date) {
      const existing = getStudentMeal(studentId, date);
      setLunch(existing?.lunch || 'NONE');
      setDinner(existing?.dinner || 'NONE');
    }
  }, [studentId, date, getStudentMeal]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !date) return;

    const res = saveMealPreference(studentId, date, lunch, dinner, true);
    if (res.success) {
      setStatusMessage('Admin meal override applied successfully!');
      setTimeout(() => {
        setStatusMessage('');
        onClose();
      }, 1000);
    }
  };

  const studentUsers = users.filter((u) => u.role === 'student');

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-gray-900 text-base">
              Admin Meal Override (No Cutoff Restriction)
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {statusMessage && (
          <div className="mt-3 p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-600" />
            {statusMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="font-bold text-gray-700 block mb-1">Select Student:</label>
            <select
              required
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full p-2.5 border border-gray-200 rounded-xl bg-white font-medium"
            >
              <option value="">-- Choose Student --</option>
              {studentUsers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.course} • {s.year} Yr • Room {s.roomNumber})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Meal Date:</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2.5 border border-gray-200 rounded-xl font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200">
              <label className="font-bold text-amber-900 block mb-1">Lunch Choice:</label>
              <select
                value={lunch}
                onChange={(e) => setLunch(e.target.value as MealChoice)}
                className="w-full p-2 border border-amber-300 rounded-lg bg-white font-semibold"
              >
                <option value="VEG">Veg (V)</option>
                <option value="NON_VEG">Non-Veg (NV)</option>
                <option value="NONE">Not Marked / Cancel</option>
              </select>
            </div>

            <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200">
              <label className="font-bold text-indigo-900 block mb-1">Dinner Choice:</label>
              <select
                value={dinner}
                onChange={(e) => setDinner(e.target.value as MealChoice)}
                className="w-full p-2 border border-indigo-300 rounded-lg bg-white font-semibold"
              >
                <option value="VEG">Veg (V)</option>
                <option value="NON_VEG">Non-Veg (NV)</option>
                <option value="NONE">Not Marked / Cancel</option>
              </select>
            </div>
          </div>

          <p className="text-[11px] text-gray-500 italic">
            * As an administrator, you have permission to modify or cancel meals at any time, bypassing the 10:00 PM and 10:00 AM cutoff rules.
          </p>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Save Override
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
