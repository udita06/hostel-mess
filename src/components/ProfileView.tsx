'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMessData } from '../context/MessDataContext';
import { User, Year, Course } from '../types';
import {
  User as UserIcon,
  ShieldCheck,
  UserPlus,
  Trash2,
  Edit2,
  FileSpreadsheet,
  Download,
  RotateCcw,
  CheckCircle,
  XCircle,
  ExternalLink,
  GraduationCap,
  Sparkles,
  Inbox,
  AlertCircle,
  Home,
  Mail,
  Check,
} from 'lucide-react';

interface ProfileViewProps {
  onOpenGFormModal: () => void;
  onOpenAdminOverride: (studentId: string, studentName: string, date: string) => void;
}

export default function ProfileView({
  onOpenGFormModal,
  onOpenAdminOverride,
}: ProfileViewProps) {
  const { user, isAdmin } = useAuth();
  const {
    users,
    meals,
    overrides,
    gformConfig,
    addUser,
    updateUser,
    deleteUser,
    resolveOverrideRequest,
    resetData,
  } = useMessData();

  // Add user modal state
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState<Omit<User, 'id' | 'createdAt'>>({
    name: '',
    email: '',
    role: 'student',
    year: 1,
    course: 'B.Tech',
    roomNumber: '',
    phone: '',
  });

  // Edit user modal state
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Student specific 30-day personal stats
  const studentMeals = meals.filter((m) => m.userId === user?.id);
  const personalVegCount = studentMeals.reduce(
    (acc, m) => acc + (m.lunch === 'VEG' ? 1 : 0) + (m.dinner === 'VEG' ? 1 : 0),
    0
  );
  const personalNonVegCount = studentMeals.reduce(
    (acc, m) => acc + (m.lunch === 'NON_VEG' ? 1 : 0) + (m.dinner === 'NON_VEG' ? 1 : 0),
    0
  );

  const pendingOverrides = overrides.filter((o) => o.status === 'pending');
  const studentOverrides = overrides.filter((o) => o.userId === user?.id);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;
    addUser(newUser);
    setShowAddUserModal(false);
    setNewUser({
      name: '',
      email: '',
      role: 'student',
      year: 1,
      course: 'B.Tech',
      roomNumber: '',
      phone: '',
    });
  };

  const handleSaveUserUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    updateUser(editingUser.id, editingUser);
    setEditingUser(null);
  };

  const exportDataAsJSON = () => {
    const data = {
      users,
      meals,
      overrides,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hostel-mess-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black shadow-inner ${
                isAdmin
                  ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white'
                  : 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white'
              }`}
            >
              {isAdmin ? <ShieldCheck className="w-9 h-9" /> : user?.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-gray-900">{user?.name}</h2>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    isAdmin
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {isAdmin ? 'Hostel Warden / Admin' : 'Resident Student'}
                </span>
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                <Mail className="w-3.5 h-3.5 text-gray-400" /> {user?.email}
                <span>•</span>
                <Home className="w-3.5 h-3.5 text-gray-400" /> Room: {user?.roomNumber}
              </p>
            </div>
          </div>

          {/* GForm Update Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenGFormModal}
              className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold border border-blue-200 flex items-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
              Update via Google Form (GForm)
            </button>
          </div>
        </div>

        {/* Student personal summary */}
        {!isAdmin && (
          <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-100">
              <span className="text-[11px] font-semibold text-emerald-800 block">
                Total Veg Meals Booked
              </span>
              <span className="text-xl font-black text-emerald-700">{personalVegCount}</span>
            </div>
            <div className="bg-rose-50/70 p-3 rounded-xl border border-rose-100">
              <span className="text-[11px] font-semibold text-rose-800 block">
                Total Non-Veg Meals Booked
              </span>
              <span className="text-xl font-black text-rose-600">{personalNonVegCount}</span>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
              <span className="text-[11px] font-semibold text-gray-600 block">Year & Course</span>
              <span className="text-sm font-bold text-gray-900">
                {user?.year}st/nd Yr • {user?.course}
              </span>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
              <span className="text-[11px] font-semibold text-gray-600 block">Hostel Room</span>
              <span className="text-sm font-bold text-gray-900">{user?.roomNumber}</span>
            </div>
          </div>
        )}
      </div>

      {/* STUDENT: OVERRIDE REQUESTS STATUS */}
      {!isAdmin && studentOverrides.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 pb-3 border-b border-gray-100">
            <Inbox className="w-4 h-4 text-amber-600" />
            Your Admin Override Requests
          </h3>
          <div className="mt-3 divide-y divide-gray-100 text-xs">
            {studentOverrides.map((req) => (
              <div key={req.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-gray-900">{req.date}</span>
                  <span className="text-gray-500 ml-2">({req.mealType} meal)</span>
                  <p className="text-gray-400 text-[11px]">{req.reason}</p>
                </div>
                <div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      req.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : req.status === 'rejected'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {req.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADMIN CONTROLS SECTION */}
      {isAdmin && (
        <div className="space-y-6">
          {/* Admin Control Bar */}
          <div className="bg-indigo-900 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-800 text-indigo-200 text-xs font-semibold mb-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Full Read & Write Access
              </div>
              <h3 className="text-xl font-black">Admin Mess Management Console</h3>
              <p className="text-xs text-indigo-200 mt-0.5">
                Add/delete users, edit details, override meals without freeze restrictions, and sync Google Forms.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowAddUserModal(true)}
                className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow transition-all"
              >
                <UserPlus className="w-4 h-4" /> Add User
              </button>

              <button
                onClick={onOpenGFormModal}
                className="px-3.5 py-2 bg-indigo-700 hover:bg-indigo-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> GForm Sync
              </button>

              <button
                onClick={exportDataAsJSON}
                className="px-3 py-2 bg-indigo-800 hover:bg-indigo-700 text-indigo-100 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                title="Backup full DB as JSON"
              >
                <Download className="w-3.5 h-3.5" /> Export DB
              </button>

              <button
                onClick={() => {
                  if (confirm('Reset entire mess database to initial seed data?')) {
                    resetData();
                  }
                }}
                className="px-3 py-2 bg-indigo-850 hover:bg-rose-900/60 text-indigo-200 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
                title="Reset to initial seed data"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>
          </div>

          {/* PENDING OVERRIDE REQUESTS */}
          {pendingOverrides.length > 0 && (
            <div className="bg-amber-50 rounded-2xl p-5 border border-amber-300 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-amber-200">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-700" />
                  <h4 className="font-bold text-amber-900 text-sm">
                    Pending Student Meal Override Requests ({pendingOverrides.length})
                  </h4>
                </div>
                <span className="text-xs text-amber-700 font-semibold">Requires Warden Action</span>
              </div>

              <div className="mt-3 space-y-2">
                {pendingOverrides.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white p-3.5 rounded-xl border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-bold text-gray-900">{req.userName}</span>
                      <span className="text-gray-500 ml-2">Date: {req.date}</span>
                      <div className="text-gray-600 text-[11px] mt-0.5">
                        Meal: <strong>{req.mealType}</strong> • Desired:{' '}
                        <strong>
                          {req.requestedLunch && `Lunch: ${req.requestedLunch}`}
                          {req.requestedDinner && ` Dinner: ${req.requestedDinner}`}
                        </strong>
                      </div>
                      <p className="text-amber-800 text-[11px] italic mt-0.5">
                        "{req.reason}"
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => resolveOverrideRequest(req.id, 'approved')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => resolveOverrideRequest(req.id, 'rejected')}
                        className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold rounded-lg text-xs flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* USER MANAGEMENT TABLE */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-gray-900">
                    User Directory ({users.length} Users)
                  </h4>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                    🍃 MongoDB Atlas
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Manage resident students (name, email, room number, year), update information, and modify meal preferences.
                </p>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase">
                  <tr>
                    <th className="py-3 px-4">Name & Email</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3">Year</th>
                    <th className="py-3 px-3">Course</th>
                    <th className="py-3 px-3">Room</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/70">
                      <td className="py-3 px-4">
                        <span className="font-bold text-gray-900 block">{u.name}</span>
                        <span className="text-[11px] text-gray-400">{u.email}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.role === 'admin'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-gray-700">
                        {u.year}st/nd Yr
                      </td>
                      <td className="py-3 px-3 font-semibold text-indigo-700">
                        {u.course}
                      </td>
                      <td className="py-3 px-3 font-mono">{u.roomNumber}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() =>
                              onOpenAdminOverride(
                                u.id,
                                u.name,
                                new Date().toISOString().split('T')[0]
                              )
                            }
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded"
                            title="Modify Meal Preference for User"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingUser(u)}
                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                            title="Edit User Information"
                          >
                            <GraduationCap className="w-3.5 h-3.5" />
                          </button>
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => {
                                if (confirm(`Delete student ${u.name}?`)) {
                                  deleteUser(u.id);
                                }
                              }}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                              title="Delete User"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ADD USER MODAL */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-base">Add New Hostel Resident</h3>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Full Name:</label>
                <input
                  required
                  type="text"
                  placeholder="e.g., Rohan Gupta"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Email:</label>
                <input
                  required
                  type="email"
                  placeholder="e.g., rohan.g@hostel.edu"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Role:</label>
                  <select
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser({ ...newUser, role: e.target.value as any })
                    }
                    className="w-full p-2 border border-gray-200 rounded-lg"
                  >
                    <option value="student">Student</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Year:</label>
                  <select
                    value={newUser.year}
                    onChange={(e) =>
                      setNewUser({ ...newUser, year: Number(e.target.value) as any })
                    }
                    className="w-full p-2 border border-gray-200 rounded-lg"
                  >
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Course:</label>
                  <select
                    value={newUser.course}
                    onChange={(e) =>
                      setNewUser({ ...newUser, course: e.target.value as any })
                    }
                    className="w-full p-2 border border-gray-200 rounded-lg"
                  >
                    <option value="B.Tech">B.Tech</option>
                    <option value="M.Tech">M.Tech</option>
                    <option value="MCA">MCA</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Room No:</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g., A-205"
                    value={newUser.roomNumber}
                    onChange={(e) => setNewUser({ ...newUser, roomNumber: e.target.value })}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold"
                >
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-base">Edit User Information</h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUserUpdate} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Full Name:</label>
                <input
                  required
                  type="text"
                  value={editingUser.name}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, name: e.target.value })
                  }
                  className="w-full p-2 border border-gray-200 rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Email:</label>
                <input
                  required
                  type="email"
                  value={editingUser.email}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                  className="w-full p-2 border border-gray-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Year:</label>
                  <select
                    value={editingUser.year}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        year: Number(e.target.value) as any,
                      })
                    }
                    className="w-full p-2 border border-gray-200 rounded-lg"
                  >
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Course:</label>
                  <select
                    value={editingUser.course}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        course: e.target.value as any,
                      })
                    }
                    className="w-full p-2 border border-gray-200 rounded-lg"
                  >
                    <option value="B.Tech">B.Tech</option>
                    <option value="M.Tech">M.Tech</option>
                    <option value="MCA">MCA</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Room No:</label>
                <input
                  required
                  type="text"
                  value={editingUser.roomNumber}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, roomNumber: e.target.value })
                  }
                  className="w-full p-2 border border-gray-200 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
