import type { Metadata } from 'next';
import './globals.css';
import { TimeProvider } from '../context/TimeContext';
import { AuthProvider } from '../context/AuthContext';
import { MessDataProvider } from '../context/MessDataContext';

export const metadata: Metadata = {
  title: 'Hostel Mess Portal - Meal Preference & Cutoff Management',
  description:
    'Modern hostel mess management app for students to book Veg & Non-Veg meals with automated 10 PM and 10 AM cutoff enforcement, 30-day hostel forecasting, and admin override controls.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 antialiased selection:bg-emerald-500 selection:text-white">
        <TimeProvider>
          <AuthProvider>
            <MessDataProvider>{children}</MessDataProvider>
          </AuthProvider>
        </TimeProvider>
      </body>
    </html>
  );
}
