'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  Video,
  FileText,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Plus,
  Stethoscope,
  Printer,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import AppointmentCancelButton from '@/components/AppointmentCancelButton';
import DigitalPrescriptionSlip from '@/components/DigitalPrescriptionSlip';

interface PatientDashboardViewProps {
  appointments: any[];
  user: any;
}

export default function PatientDashboardView({ appointments, user }: PatientDashboardViewProps) {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled' | 'all'>('upcoming');
  const [selectedPrescriptionApt, setSelectedPrescriptionApt] = useState<any | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Update current time every 30 seconds for live countdown accuracy
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Filter and classify appointments
  const upcomingAppointments = useMemo(
    () => appointments.filter((a) => a.status === 'scheduled'),
    [appointments]
  );
  const completedAppointments = useMemo(
    () => appointments.filter((a) => a.status === 'completed'),
    [appointments]
  );
  const cancelledAppointments = useMemo(
    () => appointments.filter((a) => a.status === 'cancelled'),
    [appointments]
  );

  // Active Consultation Alert: Check if any scheduled appointment is within 30 minutes of starting or started within last 45 mins
  const activeConsultation = useMemo(() => {
    const nowMs = currentTime.getTime();

    return upcomingAppointments.find((apt) => {
      const aptTime = new Date(apt.start_time).getTime();
      const diffMs = aptTime - nowMs;
      const diffMinutes = Math.floor(diffMs / 60000);

      // Within 30 minutes before appointment OR ongoing within 45 minutes of scheduled start
      return diffMinutes <= 30 && diffMinutes >= -45;
    });
  }, [upcomingAppointments, currentTime]);

  const activeConsultationDiffMinutes = useMemo(() => {
    if (!activeConsultation) return 0;
    const nowMs = currentTime.getTime();
    const aptTime = new Date(activeConsultation.start_time).getTime();
    return Math.floor((aptTime - nowMs) / 60000);
  }, [activeConsultation, currentTime]);

  // Determine current filtered list
  const filteredAppointments = useMemo(() => {
    switch (activeTab) {
      case 'upcoming':
        return upcomingAppointments;
      case 'completed':
        return completedAppointments;
      case 'cancelled':
        return cancelledAppointments;
      case 'all':
      default:
        return appointments;
    }
  }, [activeTab, upcomingAppointments, completedAppointments, cancelledAppointments, appointments]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Scheduled
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
            <CheckCircle2 size={12} className="text-sky-600" /> Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle size={12} className="text-rose-600" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto pb-24 md:pb-12 text-slate-800">
      
      {/* Active Consultation Alert Banner */}
      {activeConsultation && (
        <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 text-white shadow-lg shadow-teal-700/20 border border-emerald-400/40 relative overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-start sm:items-center gap-3.5">
              <span className="relative flex h-3.5 w-3.5 flex-shrink-0 mt-1 sm:mt-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-white shadow-xs"></span>
              </span>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-100">
                    {activeConsultationDiffMinutes <= 0 ? 'Live Consultation in Progress' : 'Upcoming Consultation Alert'}
                  </span>
                </div>
                <h3 className="text-lg font-bold tracking-tight">
                  {activeConsultationDiffMinutes <= 0
                    ? `Your consultation with Dr. ${activeConsultation.doctor?.profiles?.full_name || 'Specialist'} is LIVE!`
                    : `Your consultation with Dr. ${activeConsultation.doctor?.profiles?.full_name || 'Specialist'} starts in ${activeConsultationDiffMinutes} min${activeConsultationDiffMinutes === 1 ? '' : 's'}.`}
                </h3>
                <p className="text-xs text-teal-100 mt-0.5 flex items-center gap-1.5">
                  <Clock size={12} /> Scheduled at{' '}
                  {new Date(activeConsultation.start_time).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            <Link
              href={`/room/${activeConsultation.id}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-teal-900 font-extrabold text-xs shadow-md transition hover:scale-105"
            >
              <Video size={16} className="text-emerald-600" />
              Join Video Room Now
            </Link>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>Patient Telehealth Command Center</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Consultations</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your booked visits, join video rooms, and access digital prescriptions.
          </p>
        </div>

        <Link
          href="/patient/book"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-teal-600/20 transition hover:shadow-lg"
        >
          <Plus size={16} /> Book New Consultation
        </Link>
      </div>

      {/* Segmented Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl max-w-lg mb-6 border border-slate-200 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'upcoming'
              ? 'bg-white text-teal-800 shadow-xs border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Upcoming</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
            activeTab === 'upcoming' ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-600'
          }`}>
            {upcomingAppointments.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('completed')}
          className={`flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'completed'
              ? 'bg-white text-teal-800 shadow-xs border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Completed</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
            activeTab === 'completed' ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-600'
          }`}>
            {completedAppointments.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cancelled')}
          className={`flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'cancelled'
              ? 'bg-white text-teal-800 shadow-xs border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Cancelled</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
            activeTab === 'cancelled' ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-600'
          }`}>
            {cancelledAppointments.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'all'
              ? 'bg-white text-teal-800 shadow-xs border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>All</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
            activeTab === 'all' ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-600'
          }`}>
            {appointments.length}
          </span>
        </button>
      </div>

      {/* Appointment Cards List */}
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Calendar size={28} />
            </div>
            <h3 className="font-bold text-slate-800 text-base">
              {activeTab === 'upcoming'
                ? 'No upcoming appointments scheduled'
                : activeTab === 'completed'
                ? 'No completed appointments yet'
                : activeTab === 'cancelled'
                ? 'No cancelled appointments'
                : 'No appointments on record'}
            </h3>
            <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
              {activeTab === 'upcoming'
                ? 'Pick a verified doctor and schedule a convenient video slot.'
                : 'Your history will appear here once consultations are finished.'}
            </p>
            {activeTab === 'upcoming' && (
              <Link
                href="/patient/book"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded-xl shadow-xs transition"
              >
                <Plus size={14} /> Book a Consultation
              </Link>
            )}
          </div>
        ) : (
          filteredAppointments.map((apt: any) => {
            const date = new Date(apt.start_time);
            const rawDocName = apt.doctor?.profiles?.full_name || 'Medical Specialist';
            const cleanDocName = rawDocName.startsWith('Dr.') ? rawDocName : `Dr. ${rawDocName}`;
            const specialization = apt.doctor?.specialization || 'Consultant Physician';
            const hasPrescription = apt.prescriptions && apt.prescriptions.length > 0;
            const rx = hasPrescription ? apt.prescriptions[0] : null;

            return (
              <div
                key={apt.id}
                className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-teal-300 hover:shadow-md transition duration-200 flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                {/* Left: Doctor Details & Time */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-teal-500 to-sky-600 text-white font-extrabold flex items-center justify-center flex-shrink-0 shadow-xs text-base">
                    {cleanDocName.replace('Dr.', '').trim().split(' ').map((n: string, i: number) => i <= 1 ? n[0] : '').join('') || 'DR'}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-extrabold text-slate-900 text-base">{cleanDocName}</h3>
                      {getStatusBadge(apt.status)}
                    </div>

                    <p className="text-xs text-teal-700 font-semibold">{specialization}</p>

                    <div className="flex items-center gap-3 text-xs text-slate-500 pt-1 flex-wrap">
                      <span className="flex items-center gap-1.5 font-medium text-slate-700">
                        <Calendar size={13} className="text-teal-600" />
                        {date.toLocaleDateString('en-IN', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="flex items-center gap-1.5 font-medium text-slate-700">
                        <Clock size={13} className="text-teal-600" />
                        {date.toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        ID: {apt.id.slice(0, 8)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2.5 flex-wrap self-end md:self-center">
                  {apt.status === 'scheduled' && (
                    <>
                      <Link
                        href={`/room/${apt.id}`}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 text-white rounded-xl text-xs font-bold shadow-xs transition hover:shadow-md"
                      >
                        <Video size={15} /> Join Call
                      </Link>
                      <AppointmentCancelButton appointmentId={apt.id} />
                    </>
                  )}

                  {hasPrescription && (
                    <button
                      type="button"
                      onClick={() => setSelectedPrescriptionApt(apt)}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-teal-300 bg-teal-50/70 hover:bg-teal-100 text-teal-900 rounded-xl text-xs font-bold transition"
                    >
                      <FileText size={15} className="text-teal-600" />
                      View & Print Prescription
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Digital Printable Prescription Modal */}
      {selectedPrescriptionApt && (
        <DigitalPrescriptionSlip
          prescriptionId={selectedPrescriptionApt.prescriptions[0]?.id}
          appointmentId={selectedPrescriptionApt.id}
          dateStr={selectedPrescriptionApt.start_time}
          doctorName={selectedPrescriptionApt.doctor?.profiles?.full_name || 'Medical Specialist'}
          doctorSpecialization={selectedPrescriptionApt.doctor?.specialization || 'Consultant Physician'}
          patientName={user?.user_metadata?.full_name || selectedPrescriptionApt.patient?.full_name || 'Patient'}
          patientEmail={user?.email || selectedPrescriptionApt.patient?.email}
          patientId={user?.id}
          medicines={selectedPrescriptionApt.prescriptions[0]?.medicines || ''}
          notes={selectedPrescriptionApt.prescriptions[0]?.notes || ''}
          onClose={() => setSelectedPrescriptionApt(null)}
          showPrintButton={true}
        />
      )}
    </div>
  );
}
