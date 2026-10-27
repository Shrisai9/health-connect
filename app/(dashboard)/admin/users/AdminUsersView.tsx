'use client';

import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  X,
  Stethoscope,
  ShieldCheck,
  UserCheck,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Filter
} from 'lucide-react';
import { updateUserRoleAction, UserRole } from '@/app/actions/users';

interface AdminUsersViewProps {
  initialUsers: any[];
  currentUserId: string;
}

export default function AdminUsersView({ initialUsers, currentUserId }: AdminUsersViewProps) {
  const [users, setUsers] = useState<any[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'patient' | 'doctor' | 'admin'>('all');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Auto-dismiss toast
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Counts for role tabs
  const counts = useMemo(() => {
    return {
      all: users.length,
      patient: users.filter((u) => u.role === 'patient').length,
      doctor: users.filter((u) => u.role === 'doctor').length,
      admin: users.filter((u) => u.role === 'admin').length,
    };
  }, [users]);

  // Real-time search and role filtering
  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return users.filter((u) => {
      // Role match
      if (activeTab !== 'all' && u.role !== activeTab) {
        return false;
      }
      // Search match (name or email)
      if (q) {
        const nameMatch = u.full_name?.toLowerCase().includes(q) || false;
        const emailMatch = u.email?.toLowerCase().includes(q) || false;
        return nameMatch || emailMatch;
      }
      return true;
    });
  }, [users, activeTab, searchQuery]);

  // Role modifier handler
  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (userId === currentUserId && newRole !== 'admin') {
      const confirmSelfDemote = window.confirm(
        'Warning: You are about to change your own role from Admin. You may lose access to this admin portal. Continue?'
      );
      if (!confirmSelfDemote) return;
    }

    setUpdatingUserId(userId);
    try {
      const res = await updateUserRoleAction(userId, newRole);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
        showToast('success', res.message);
      } else {
        showToast('error', res.message);
      }
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update user role');
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24 md:pb-12 space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle size={18} className="text-rose-600 flex-shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
              <Users size={13} />
              Identity & Access Management (RBAC)
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            User Directory & Role Governance
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage user permissions, verify clinical specialists, and govern system roles.
          </p>
        </div>
      </div>

      {/* Control Bar: Real-time Search + Role Filter Tabs */}
      <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Real-time Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search by name or email address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                title="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Role Filter Tabs with Count Badges */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>All Users</span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[11px] ${
                  activeTab === 'all'
                    ? 'bg-teal-50 text-teal-700 font-bold'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {counts.all}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('patient')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'patient'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Patients</span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[11px] ${
                  activeTab === 'patient'
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {counts.patient}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('doctor')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'doctor'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Doctors</span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[11px] ${
                  activeTab === 'doctor'
                    ? 'bg-emerald-50 text-emerald-700 font-bold'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {counts.doctor}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'admin'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Admins</span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[11px] ${
                  activeTab === 'admin'
                    ? 'bg-purple-50 text-purple-700 font-bold'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {counts.admin}
              </span>
            </button>
          </div>
        </div>

        {/* Filter Summary */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <div>
            Showing <span className="font-semibold text-slate-900">{filteredUsers.length}</span> of{' '}
            <span className="font-semibold text-slate-900">{users.length}</span> users
            {searchQuery && (
              <span>
                {' '}
                matching &ldquo;<span className="text-teal-600 font-medium">{searchQuery}</span>&rdquo;
              </span>
            )}
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-teal-600 hover:underline font-medium"
            >
              Reset filter
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Users size={24} />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">No users match your criteria</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search keywords or switching between the role filter tabs above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold text-xs uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">User Details</th>
                  <th className="px-6 py-4">Current Role</th>
                  <th className="px-6 py-4">Registered Date</th>
                  <th className="px-6 py-4 text-right">Role Modifier & Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const isUpdating = updatingUserId === u.id;
                  const isCurrent = u.id === currentUserId;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition">
                      {/* Name & Email */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-xs ${
                              u.role === 'doctor'
                                ? 'bg-emerald-100 text-emerald-800'
                                : u.role === 'admin'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {u.full_name?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 flex items-center gap-2">
                              <span>{u.full_name || 'Anonymous User'}</span>
                              {isCurrent && (
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-normal">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Current Role Badge */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold capitalize border ${
                            u.role === 'doctor'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : u.role === 'admin'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {u.role === 'doctor' && <Stethoscope size={13} className="text-emerald-600" />}
                          {u.role === 'admin' && <ShieldAlert size={13} className="text-purple-600" />}
                          {u.role === 'patient' && <Users size={13} className="text-blue-600" />}
                          <span>{u.role}</span>
                        </span>
                      </td>

                      {/* Registered Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                        {u.created_at
                          ? new Date(u.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })
                          : 'N/A'}
                      </td>

                      {/* Actionable Role Modifier */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          {/* 1-Click "Verify as Doctor" Shortcut for Patients */}
                          {u.role === 'patient' && (
                            <button
                              onClick={() => handleRoleChange(u.id, 'doctor')}
                              disabled={isUpdating}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition disabled:opacity-50"
                              title="Verify user as licensed clinical doctor"
                            >
                              <ShieldCheck size={14} />
                              <span>Verify Doctor</span>
                            </button>
                          )}

                          {/* Role Selector Dropdown */}
                          <div className="relative inline-block">
                            <select
                              value={u.role}
                              disabled={isUpdating}
                              onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                              className="text-xs font-medium bg-slate-50 hover:bg-white text-slate-700 border border-slate-200 rounded-lg px-2.5 py-1.5 pr-7 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition disabled:opacity-50 cursor-pointer"
                            >
                              <option value="patient">Role: Patient</option>
                              <option value="doctor">Role: Doctor</option>
                              <option value="admin">Role: Admin</option>
                            </select>
                            {isUpdating && (
                              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                                <Loader2 size={12} className="animate-spin text-teal-600" />
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
