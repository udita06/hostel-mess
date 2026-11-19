'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  UtensilsCrossed,
  Mail,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  ArrowRight,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = (emailToUse: string) => {
    setErrorMessage('');
    const res = login(emailToUse);
    if (res.success) {
      router.push('/');
    } else {
      setErrorMessage(res.message || 'Login failed. Please check your email.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    handleLogin(email);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50/50 to-slate-100 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 items-center justify-center text-white shadow-xl shadow-emerald-500/25 mb-4">
            <UtensilsCrossed className="w-9 h-9" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Hostel Mess Portal
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Student Meal Preference & Attendance Management
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Sign in with Email</h2>
          <p className="text-xs text-gray-500 mb-6">
            Enter your official hostel registered email address.
          </p>

          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">
                Hostel Email:
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@hostel.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              Sign In to Portal <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick 1-Click Demo Profiles */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-1.5 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Instant Demo Access:
              </span>
            </div>

            <div className="space-y-2">
              {/* Admin Button */}
              <button
                type="button"
                onClick={() => handleLogin('admin@hostel.edu')}
                className="w-full p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/70 text-left flex items-center justify-between text-xs transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-indigo-950 block">
                      Hostel Warden (Admin)
                    </span>
                    <span className="text-[11px] text-indigo-600">admin@hostel.edu</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-indigo-700 group-hover:translate-x-0.5 transition-transform">
                  Full Access →
                </span>
              </button>

              {/* Student 1 Button */}
              <button
                type="button"
                onClick={() => handleLogin('rahul.s@hostel.edu')}
                className="w-full p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/70 text-left flex items-center justify-between text-xs transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-emerald-950 block">
                      Rahul Sharma (Student)
                    </span>
                    <span className="text-[11px] text-emerald-700">
                      2nd Yr B.Tech • Room A-205
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 group-hover:translate-x-0.5 transition-transform">
                  Login →
                </span>
              </button>

              {/* Student 2 Button */}
              <button
                type="button"
                onClick={() => handleLogin('diya.s@hostel.edu')}
                className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-left flex items-center justify-between text-xs transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold">
                    D
                  </div>
                  <div>
                    <span className="font-bold text-gray-900 block">
                      Diya Sen (Student)
                    </span>
                    <span className="text-[11px] text-gray-500">
                      1st Yr MCA • Room B-104
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-gray-500">Login →</span>
              </button>
            </div>
          </div>

          {/* Google Form Link */}
          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <a
              href="https://docs.google.com/forms"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-semibold"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              New resident or update profile via Google Form
            </a>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Hostel Mess Management System • Deployable on Vercel
        </p>
      </div>
    </div>
  );
}
