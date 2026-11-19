'use client';

import React, { useState } from 'react';
import { useMessData } from '../context/MessDataContext';
import { useAuth } from '../context/AuthContext';
import { Year, Course, MealChoice } from '../types';
import {
  Calendar as CalendarIcon,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  ChevronRight,
  TrendingUp,
  Edit3,
  Users,
  Utensils,
  SunMedium,
  Moon,
  Sparkles,
  Info,
} from 'lucide-react';

interface DashboardViewProps {
  onOpenAdminOverride: (studentId: string, studentName: string, date: string) => void;
  onNavigateToSelection: (dateStr: string) => void;
}

export default function DashboardView({
  onOpenAdminOverride,
  onNavigateToSelection,
}: DashboardViewProps) {
  const { user, isAdmin } = useAuth();
  const { users, meals, getDayStats, get30DayStats, saveMealPreference } = useMessData();

  // Selected date defaults to today (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Filter state
  const [selectedYearTab, setSelectedYearTab] = useState<'ALL' | Year>('ALL');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<'ALL' | Course>('ALL');
  const [mealFilter, setMealFilter] = useState<'ALL' | 'VEG' | 'NON_VEG' | 'UNMARKED'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [show30DayForecast, setShow30DayForecast] = useState<boolean>(true);

  // Stats for today (top tiles)
  const todayStats = getDayStats(todayStr);

  // Stats for the currently selected date
  const selectedDateStats = getDayStats(selectedDate);

  // 30-day projection stats
  const next30DayStats = get30DayStats(todayStr);

  // Filter students
  const studentUsers = users.filter((u) => u.role === 'student');

  const filteredStudents = studentUsers.filter((student) => {
    // Year filter tab
    if (selectedYearTab !== 'ALL' && student.year !== selectedYearTab) {
      return false;
    }
    // Course filter
    if (selectedCourseFilter !== 'ALL' && student.course !== selectedCourseFilter) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = student.name.toLowerCase().includes(q);
      const matchRoom = student.roomNumber.toLowerCase().includes(q);
      const matchEmail = student.email.toLowerCase().includes(q);
      if (!matchName && !matchRoom && !matchEmail) return false;
    }
    // Meal choice filter
    const pref = meals.find((m) => m.userId === student.id && m.date === selectedDate);
    if (mealFilter === 'VEG') {
      if (pref?.lunch !== 'VEG' && pref?.dinner !== 'VEG') return false;
    } else if (mealFilter === 'NON_VEG') {
      if (pref?.lunch !== 'NON_VEG' && pref?.dinner !== 'NON_VEG') return false;
    } else if (mealFilter === 'UNMARKED') {
      if (pref && (pref.lunch !== 'NONE' || pref.dinner !== 'NONE')) return false;
    }

    return true;
  });

  const getChoiceBadge = (choice?: MealChoice) => {
    if (choice === 'VEG') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
          Veg (V)
        </span>
      );
    }
    if (choice === 'NON_VEG') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
          <span className="w-2 h-2 rounded-full bg-rose-600"></span>
          Non-Veg (NV)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-500 border border-gray-200">
        Not Marked
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 transform skew-x-12 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Hostel Mess Central Dashboard
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hostel Meal Forecast & Attendance
            </h1>
            <p className="text-emerald-100 text-sm mt-1 max-w-2xl">
              Track real-time Veg vs Non-Veg meal bookings for today, filter by date, view the 30-day projection, and manage student preferences with automated cutoff enforcement.
            </p>
          </div>
          <button
            onClick={() => onNavigateToSelection(selectedDate)}
            className="px-5 py-2.5 bg-white text-emerald-900 rounded-xl text-sm font-bold shadow-md hover:bg-emerald-50 transition-all flex items-center gap-2 shrink-0"
          >
            <Utensils className="w-4 h-4 text-emerald-600" />
            Mark Your Meals
          </button>
        </div>
      </div>

      {/* TOP TILES (Today's Non-Veg count, Veg count, Total) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-gray-400" /> Today's Live Mess Counts ({todayStats.displayDate})
          </h2>
          <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Real-time Feed
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tile 1: Today's Non-Veg (NV) Count */}
          <div className="bg-white rounded-2xl p-5 border border-rose-200 shadow-sm relative overflow-hidden group hover:border-rose-400 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-100 px-2.5 py-1 rounded-lg">
                  Non-Veg (NV)
                </span>
                <span className="text-2xl font-black text-rose-600">
                  {todayStats.totalNonVeg}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-gray-600 pt-3 border-t border-rose-100">
                <span className="flex items-center gap-1">
                  <SunMedium className="w-3.5 h-3.5 text-amber-500" /> Lunch: <strong className="text-gray-900">{todayStats.lunchNonVeg}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <Moon className="w-3.5 h-3.5 text-indigo-500" /> Dinner: <strong className="text-gray-900">{todayStats.dinnerNonVeg}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Tile 2: Today's Veg (V) Count */}
          <div className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-sm relative overflow-hidden group hover:border-emerald-400 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                  Veg (V)
                </span>
                <span className="text-2xl font-black text-emerald-700">
                  {todayStats.totalVeg}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-gray-600 pt-3 border-t border-emerald-100">
                <span className="flex items-center gap-1">
                  <SunMedium className="w-3.5 h-3.5 text-amber-500" /> Lunch: <strong className="text-gray-900">{todayStats.lunchVeg}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <Moon className="w-3.5 h-3.5 text-indigo-500" /> Dinner: <strong className="text-gray-900">{todayStats.dinnerVeg}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Tile 3: Total Meals Served Today */}
          <div className="bg-white rounded-2xl p-5 border border-blue-200 shadow-sm relative overflow-hidden group hover:border-blue-400 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2.5 py-1 rounded-lg">
                  Total Bookings
                </span>
                <span className="text-2xl font-black text-blue-800">
                  {todayStats.totalVeg + todayStats.totalNonVeg}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-gray-600 pt-3 border-t border-blue-100">
                <span>Active: <strong className="text-gray-900">{todayStats.totalMarkedStudents} students</strong></span>
                <span>Hostel: <strong className="text-gray-900">{studentUsers.length}</strong></span>
              </div>
            </div>
          </div>

          {/* Tile 4: Ratio & Preference Distribution */}
          <div className="bg-white rounded-2xl p-5 border border-purple-200 shadow-sm relative overflow-hidden group hover:border-purple-400 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2.5 py-1 rounded-lg">
                  NV vs Veg Ratio
                </span>
                <span className="text-xl font-black text-purple-800">
                  {todayStats.totalVeg + todayStats.totalNonVeg > 0
                    ? `${Math.round(
                        (todayStats.totalNonVeg /
                          (todayStats.totalVeg + todayStats.totalNonVeg)) *
                          100
                      )}% NV`
                    : 'N/A'}
                </span>
              </div>
              <div className="mt-3">
                <div className="h-2 w-full bg-emerald-200 rounded-full overflow-hidden flex">
                  <div
                    className="bg-rose-500 h-full"
                    style={{
                      width: `${
                        todayStats.totalVeg + todayStats.totalNonVeg > 0
                          ? (todayStats.totalNonVeg /
                              (todayStats.totalVeg + todayStats.totalNonVeg)) *
                            100
                          : 50
                      }%`,
                    }}
                  />
                  <div
                    className="bg-emerald-500 h-full"
                    style={{
                      width: `${
                        todayStats.totalVeg + todayStats.totalNonVeg > 0
                          ? (todayStats.totalVeg /
                              (todayStats.totalVeg + todayStats.totalNonVeg)) *
                            100
                          : 50
                      }%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-gray-500 mt-1">
                  <span className="text-rose-600 font-semibold">{todayStats.totalNonVeg} NV</span>
                  <span className="text-emerald-700 font-semibold">{todayStats.totalVeg} Veg</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 30 DAYS HOSTEL TOTAL COUNT SECTION */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Entire Hostel's 30-Day Total V / NV Projection
            </h2>
            <p className="text-xs text-gray-500">
              Aggregated mess meal counts forecasted across next 30 days
            </p>
          </div>
          <button
            onClick={() => setShow30DayForecast(!show30DayForecast)}
            className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors"
          >
            {show30DayForecast ? 'Hide 30-Day Grid' : 'View Full 30-Day Grid'}
          </button>
        </div>

        {show30DayForecast && (
          <div className="mt-4">
            <div className="overflow-x-auto pb-2">
              <div className="flex gap-2 min-w-max">
                {next30DayStats.map((stat, idx) => {
                  const isSelected = stat.date === selectedDate;
                  const isToday = stat.date === todayStr;

                  return (
                    <button
                      key={stat.date}
                      onClick={() => setSelectedDate(stat.date)}
                      className={`flex-shrink-0 w-28 p-3 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-600/30'
                          : 'border-gray-200 bg-gray-50 hover:bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="text-[11px] font-bold text-gray-500 uppercase">
                        {isToday ? 'Today' : `Day +${idx}`}
                      </div>
                      <div className="text-xs font-extrabold text-gray-900 truncate">
                        {stat.displayDate}
                      </div>

                      <div className="mt-2 space-y-1 text-left text-[11px] bg-white p-1.5 rounded-lg border border-gray-100">
                        <div className="flex justify-between items-center text-rose-600">
                          <span className="font-semibold">NV:</span>
                          <span className="font-black">{stat.totalNonVeg}</span>
                        </div>
                        <div className="flex justify-between items-center text-emerald-700">
                          <span className="font-semibold">V:</span>
                          <span className="font-black">{stat.totalVeg}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <p className="text-[11px] text-gray-400 mt-2 italic text-right">
              Tip: Click on any day above to quickly filter the roster below for that specific date.
            </p>
          </div>
        )}
      </div>

      {/* DATE PICKER & FILTER BAR */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              Student Meal Roster & Preferences
            </h2>
            <p className="text-xs text-gray-500">
              Showing preferences for: <strong className="text-gray-800">{selectedDateStats.displayDate}</strong> ({selectedDate})
            </p>
          </div>

          {/* Calendar Date Picker & Quick Selectors */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
              <CalendarIcon className="w-4 h-4 text-emerald-600" />
              <label htmlFor="calendar-picker" className="text-xs font-semibold text-gray-700">
                Filter Date:
              </label>
              <input
                id="calendar-picker"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs font-bold text-gray-900 focus:outline-none cursor-pointer"
              />
            </div>

            <button
              onClick={() => setSelectedDate(todayStr)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
                selectedDate === todayStr
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              Today
            </button>

            {/* Quick Tomorrow Button */}
            {(() => {
              const tm = new Date();
              tm.setDate(tm.getDate() + 1);
              const tmStr = tm.toISOString().split('T')[0];
              return (
                <button
                  onClick={() => setSelectedDate(tmStr)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
                    selectedDate === tmStr
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  Tomorrow
                </button>
              );
            })()}
          </div>
        </div>

        {/* Selected Date Summary Counts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 bg-gray-50 p-4 rounded-xl border border-gray-200/70">
          <div>
            <span className="text-[11px] text-gray-500 block">Lunch Veg (V)</span>
            <span className="text-lg font-black text-emerald-700">{selectedDateStats.lunchVeg}</span>
          </div>
          <div>
            <span className="text-[11px] text-gray-500 block">Lunch Non-Veg (NV)</span>
            <span className="text-lg font-black text-rose-600">{selectedDateStats.lunchNonVeg}</span>
          </div>
          <div>
            <span className="text-[11px] text-gray-500 block">Dinner Veg (V)</span>
            <span className="text-lg font-black text-emerald-700">{selectedDateStats.dinnerVeg}</span>
          </div>
          <div>
            <span className="text-[11px] text-gray-500 block">Dinner Non-Veg (NV)</span>
            <span className="text-lg font-black text-rose-600">{selectedDateStats.dinnerNonVeg}</span>
          </div>
        </div>

        {/* YEAR WISE SEGREGATION TABS (1st to 4th Year) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          {/* Year Tabs */}
          <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl overflow-x-auto">
            {(['ALL', 1, 2, 3, 4] as const).map((yearTab) => {
              const isActive = selectedYearTab === yearTab;
              const label =
                yearTab === 'ALL'
                  ? 'All Years'
                  : yearTab === 1
                  ? '1st Year'
                  : yearTab === 2
                  ? '2nd Year'
                  : yearTab === 3
                  ? '3rd Year'
                  : '4th Year';

              return (
                <button
                  key={String(yearTab)}
                  onClick={() => setSelectedYearTab(yearTab)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-emerald-800 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Search & Course filter */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search student, room..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Course Selector */}
            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value as any)}
              className="text-xs bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 font-medium text-gray-700 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Courses</option>
              <option value="B.Tech">B.Tech</option>
              <option value="M.Tech">M.Tech</option>
              <option value="MCA">MCA</option>
            </select>

            {/* Meal Choice Filter */}
            <select
              value={mealFilter}
              onChange={(e) => setMealFilter(e.target.value as any)}
              className="text-xs bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 font-medium text-gray-700 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Meals</option>
              <option value="VEG">Veg Only</option>
              <option value="NON_VEG">Non-Veg Only</option>
              <option value="UNMARKED">Unmarked</option>
            </select>
          </div>
        </div>

        {/* STUDENT ROSTER TABLE */}
        <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-3">Year</th>
                <th className="py-3 px-3">Course</th>
                <th className="py-3 px-3">Room</th>
                <th className="py-3 px-3 text-center">Lunch Preference</th>
                <th className="py-3 px-3 text-center">Dinner Preference</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    No students match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const pref = meals.find(
                    (m) => m.userId === student.id && m.date === selectedDate
                  );
                  const isCurrentLoggedIn = student.id === user?.id;

                  return (
                    <tr
                      key={student.id}
                      className={`transition-colors ${
                        isCurrentLoggedIn
                          ? 'bg-emerald-50/70 hover:bg-emerald-100/50'
                          : 'hover:bg-gray-50/80'
                      }`}
                    >
                      <td className="py-3 px-4 font-semibold text-gray-900">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span>{student.name}</span>
                              {isCurrentLoggedIn && (
                                <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-gray-400 block font-normal">
                              {student.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-medium text-gray-700">
                        <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded font-semibold text-[11px]">
                          {student.year === 1
                            ? '1st'
                            : student.year === 2
                            ? '2nd'
                            : student.year === 3
                            ? '3rd'
                            : '4th'}{' '}
                          Yr
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-indigo-700">
                        {student.course}
                      </td>
                      <td className="py-3 px-3 font-mono text-gray-600">
                        {student.roomNumber}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {getChoiceBadge(pref?.lunch)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {getChoiceBadge(pref?.dinner)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isAdmin ? (
                          <button
                            onClick={() =>
                              onOpenAdminOverride(student.id, student.name, selectedDate)
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            Admin Edit
                          </button>
                        ) : isCurrentLoggedIn ? (
                          <button
                            onClick={() => onNavigateToSelection(selectedDate)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors"
                          >
                            Edit Self
                          </button>
                        ) : (
                          <span className="text-[11px] text-gray-400">View Only</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
