'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Search,
  X,
  Clock,
  Video,
  FileText,
  XCircle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Stethoscope,
  User,
  Activity,
  Filter
} from 'lucide-react';
import { cancelAppointmentAction } from '@/app/actions/appointments';
import DigitalPrescriptionSlip from '@/components/DigitalPrescriptionSlip';

interface AdminAppointmentsViewProps {
  initialAppointments: any[];
}

export default function AdminAppointmentsView({
  initialAppointments
}: AdminAppointmentsViewProps) {
  const [appointments, setAppointments] = useState<any[]>(initialAppointments);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [selectedPrescriptionApt, setSelectedPrescriptionApt] = useState<any | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Status counts for tabs
  const counts = useMemo(() => {
    return {
      all: appointments.length,
      scheduled: appointments.filter((a) => a.status === 'scheduled').length,
      completed: appointments.filter((a) => a.status === 'completed').length,
      cancelled: appointments.filter((a) => a.status === 'cancelled').length,
    };
  }, [appointments]);

  // Real-time search by patient name, patient email, or doctor name
  const filteredAppointments = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return appointments.filter((apt) => {
      // Status filter
      if (activeTab !== 'all' && apt.status !== activeTab) {
        return false;
      }
      // Search filter
      if (q) {
        const patientName = apt.patient?.full_name?.toLowerCase() || '';
        const patientEmail = apt.patient?.email?.toLowerCase() || '';
        const doctorName = apt.doctor?.profiles?.full_name?.toLowerCase() || '';
        const doctorSpec = apt.doctor?.specialization?.toLowerCase() || '';
        return (
          patientName.includes(q) ||
          patientEmail.includes(q) ||
          doctorName.includes(q) ||
          doctorSpec.includes(q)
        );
      }
      return true;
    });
  }, [appointments, activeTab, searchQuery]);

  // Admin cancel appointment handler
  const handleAdminCancel = async (appointmentId: string) => {
    const confirmCancel = window.confirm(
      'Are you sure you want to cancel this appointment as an Administrator? The slot will be freed for re-booking.'
    );
    if (!confirmCancel) return;

    setCancellingId(appointmentId);
    try {
      const res = await cancelAppointmentAction(appointmentId);
      if (res.success) {
        setAppointments((prev) =>
          prev.map((a) => (a.id === appointmentId ? { ...a, status: 'cancelled' } : a))
        );
        showToast('success', 'Appointment successfully cancelled by administrator.');
      } else {
        showToast('error', res.message || 'Failed to cancel appointment');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Error cancelling appointment');
    } finally {
      setCancellingId(null);
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
              <Calendar size={13} />
              Clinical Consultation Operations
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Appointment Directory & Live Governance
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor clinical sessions, oversee LiveKit video calls, review prescriptions, and manage schedules.
          </p>
        </div>
      </div>

      {/* Control Bar: Search + Status Filter Tabs */}
      <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Real-time Search */}
          <div className="relative flex-1 max-w-md">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search by patient name, email, or doctor..."
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

          {/* Status Filter Tabs with Count Badges */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>All</span>
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
              onClick={() => setActiveTab('scheduled')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'scheduled'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Scheduled</span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[11px] ${
                  activeTab === 'scheduled'
                    ? 'bg-sky-50 text-sky-700 font-bold'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {counts.scheduled}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('completed')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'completed'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Completed</span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[11px] ${
                  activeTab === 'completed'
                    ? 'bg-emerald-50 text-emerald-700 font-bold'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {counts.completed}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('cancelled')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'cancelled'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Cancelled</span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[11px] ${
                  activeTab === 'cancelled'
                    ? 'bg-rose-50 text-rose-700 font-bold'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {counts.cancelled}
              </span>
            </button>
          </div>
        </div>

        {/* Filter Summary */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <div>
            Showing <span className="font-semibold text-slate-900">{filteredAppointments.length}</span> of{' '}
            <span className="font-semibold text-slate-900">{appointments.length}</span> appointments
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

      {/* Appointments Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {filteredAppointments.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Calendar size={24} />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">No appointments match your filter</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try selecting a different status tab or adjusting your search keywords.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold text-xs uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Session Date & Time</th>
                  <th className="px-6 py-4">Patient Information</th>
                  <th className="px-6 py-4">Attending Doctor</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAppointments.map((apt) => {
                  const aptDate = new Date(apt.start_time);
                  const isScheduled = apt.status === 'scheduled';
                  const isCompleted = apt.status === 'completed';
                  const isCancelled = apt.status === 'cancelled';
                  const isCancelling = cancellingId === apt.id;

                  return (
                    <tr key={apt.id} className="hover:bg-slate-50/70 transition">
                      {/* Date & Time */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">
                          {aptDate.toLocaleDateString('en-IN', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock size={12} />
                          {aptDate.toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </div>
                      </td>

                      {/* Patient */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                            {apt.patient?.full_name?.[0]?.toUpperCase() || 'P'}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">
                              {apt.patient?.full_name || 'Anonymous Patient'}
                            </div>
                            <div className="text-xs text-slate-400 truncate max-w-xs">
                              {apt.patient?.email || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Doctor */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">
                          {apt.doctor?.profiles?.full_name
                            ? `Dr. ${apt.doctor.profiles.full_name}`
                            : 'Unassigned Doctor'}
                        </div>
                        <div className="text-xs text-teal-600 font-medium">
                          {apt.doctor?.specialization || 'General Physician'}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold capitalize border ${
                            isCompleted
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isScheduled
                              ? 'bg-sky-50 text-sky-700 border-sky-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isCompleted
                                ? 'bg-emerald-500'
                                : isScheduled
                                ? 'bg-sky-500'
                                : 'bg-rose-500'
                            }`}
                          ></span>
                          {apt.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* LiveKit Room Link for Scheduled Calls */}
                          {isScheduled && (
                            <Link
                              href={`/room/${apt.id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-xs shadow-teal-600/20 transition"
                              title="Join secure LiveKit video consultation"
                            >
                              <Video size={13} />
                              <span>LiveKit Room</span>
                            </Link>
                          )}

                          {/* Prescription View Modal for Completed Calls */}
                          {isCompleted && (
                            <button
                              onClick={() => setSelectedPrescriptionApt(apt)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 transition"
                              title="View official digital prescription"
                            >
                              <FileText size={13} />
                              <span>View Rx</span>
                            </button>
                          )}

                          {/* Admin Cancel Action for Scheduled Calls */}
                          {isScheduled && (
                            <button
                              onClick={() => handleAdminCancel(apt.id)}
                              disabled={isCancelling}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition disabled:opacity-50"
                              title="Cancel this appointment (Admin Override)"
                            >
                              {isCancelling ? (
                                <Loader2 size={13} className="animate-spin" />
                              ) : (
                                <XCircle size={13} />
                              )}
                              <span>Cancel</span>
                            </button>
                          )}
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

      {/* Digital Printable Prescription Modal */}
      {selectedPrescriptionApt && (
        <DigitalPrescriptionSlip
          prescriptionId={
            selectedPrescriptionApt.decryptedPrescription?.id || selectedPrescriptionApt.id
          }
          appointmentId={selectedPrescriptionApt.id}
          dateStr={selectedPrescriptionApt.start_time}
          doctorName={
            selectedPrescriptionApt.doctor?.profiles?.full_name || 'Medical Specialist'
          }
          doctorSpecialization={
            selectedPrescriptionApt.doctor?.specialization || 'Clinical Physician'
          }
          patientName={selectedPrescriptionApt.patient?.full_name || 'Patient'}
          patientEmail={selectedPrescriptionApt.patient?.email}
          patientId={selectedPrescriptionApt.patient?.id}
          medicines={selectedPrescriptionApt.decryptedPrescription?.medicines || []}
          notes={
            selectedPrescriptionApt.decryptedPrescription?.notes ||
            'Prescription verified and registered by clinical staff.'
          }
          diagnosis={
            selectedPrescriptionApt.decryptedPrescription?.diagnosis ||
            'Clinical Follow-up & Evaluation'
          }
          onClose={() => setSelectedPrescriptionApt(null)}
          showPrintButton={true}
        />
      )}
    </div>
  );
}
