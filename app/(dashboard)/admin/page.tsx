import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  Calendar,
  UserCheck,
  Stethoscope,
  CheckCircle2,
  XCircle,
  IndianRupee,
  Clock,
  ArrowRight,
  Activity,
  ShieldCheck,
  Video,
  UserPlus,
  ExternalLink
} from 'lucide-react';

async function getAdminDashboardData() {
  const supabase = createClient();

  // Run queries in parallel for high performance
  const [
    { count: patientCount },
    { count: doctorCount },
    { count: appointmentCount },
    { count: scheduledCount },
    { count: completedCount },
    { count: cancelledCount },
    { data: completedConsults },
    { data: recentAppointments }
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'patient'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'doctor'),
    supabase.from('appointments').select('*', { count: 'exact', head: true }),
    supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'scheduled'),
    supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'cancelled'),
    supabase.from('appointments').select('id, doctor:doctor_id(hourly_rate)').eq('status', 'completed'),
    supabase
      .from('appointments')
      .select(`
        id,
        start_time,
        status,
        patient:patient_id ( full_name, email ),
        doctor:doctor_id (
          id,
          specialization,
          hourly_rate,
          profiles ( full_name )
        )
      `)
      .order('start_time', { ascending: false })
      .limit(8)
  ]);

  // Calculate gross platform volume in ₹ (standard fee is ₹1,499 if hourly_rate not explicitly set)
  const platformVolume = (completedConsults || []).reduce((sum: number, apt: any) => {
    const rate = Number(apt?.doctor?.hourly_rate);
    return sum + (rate > 0 ? rate : 1499);
  }, 0);

  return {
    patientCount: patientCount || 0,
    doctorCount: doctorCount || 0,
    appointmentCount: appointmentCount || 0,
    scheduledCount: scheduledCount || 0,
    completedCount: completedCount || 0,
    cancelledCount: cancelledCount || 0,
    platformVolume,
    recentAppointments: recentAppointments || []
  };
}

export default async function AdminDashboard() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Verify administrator access
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') redirect('/');

  const data = await getAdminDashboardData();

  const totalApts = data.appointmentCount || 0;
  const completionRate = totalApts > 0 ? Math.round((data.completedCount / totalApts) * 100) : 100;
  const scheduledPercent = totalApts > 0 ? Math.round((data.scheduledCount / totalApts) * 100) : 0;
  const completedPercent = totalApts > 0 ? Math.round((data.completedCount / totalApts) * 100) : 0;
  const cancelledPercent = totalApts > 0 ? Math.round((data.cancelledCount / totalApts) * 100) : 0;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24 md:pb-12 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
              Live Platform Operations
            </span>
            <span className="text-xs text-slate-400">NABH & HIPAA Compliant</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Executive Clinical Command Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Platform governance, provider throughput, and patient consultation metrics.
          </p>
        </div>

        {/* Quick Navigation Links */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
          >
            <Users size={15} className="text-teal-600" />
            <span>Manage Users</span>
          </Link>
          <Link
            href="/admin/appointments"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-sm shadow-teal-600/20 transition"
          >
            <Calendar size={15} />
            <span>All Appointments</span>
          </Link>
        </div>
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-5">
        {/* Total Patients */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-teal-200 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Patients</span>
            <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl">
              <Users size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 tracking-tight">{data.patientCount}</p>
          <p className="text-xs text-slate-500 mt-1">Registered recipients</p>
        </div>

        {/* Active Doctors */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-200 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Doctors</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
              <Stethoscope size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 tracking-tight">{data.doctorCount}</p>
          <p className="text-xs text-slate-500 mt-1">Verified practitioners</p>
        </div>

        {/* Total Appointments */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-sky-200 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Appointments</span>
            <div className="p-2.5 bg-sky-50 text-sky-700 rounded-xl">
              <Calendar size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 tracking-tight">{data.appointmentCount}</p>
          <p className="text-xs text-slate-500 mt-1">Total bookings created</p>
        </div>

        {/* Completed Consultations */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-200 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed</span>
            <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 tracking-tight">{data.completedCount}</p>
          <p className="text-xs text-emerald-600 font-medium mt-1">
            {completionRate}% success rate
          </p>
        </div>

        {/* Platform Volume in ₹ */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-amber-200 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Platform Volume</span>
            <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl">
              <IndianRupee size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 tracking-tight">
            ₹{data.platformVolume.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-slate-500 mt-1">Gross consulting value</p>
        </div>
      </div>

      {/* Visual Status Breakdown Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Consultation Pipeline & Throughput</h2>
            <p className="text-xs text-slate-500">Real-time status breakdown across all recorded clinical sessions.</p>
          </div>

          {/* Visual Status Breakdown Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
              <span className="w-2 h-2 rounded-full bg-sky-500"></span>
              <span>{data.scheduledCount} Scheduled</span>
              <span className="text-sky-500 font-normal">({scheduledPercent}%)</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>{data.completedCount} Completed</span>
              <span className="text-emerald-500 font-normal">({completedPercent}%)</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>{data.cancelledCount} Cancelled</span>
              <span className="text-rose-500 font-normal">({cancelledPercent}%)</span>
            </div>
          </div>
        </div>

        {/* Multi-segmented Progress Bar */}
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
          {totalApts === 0 ? (
            <div className="w-full bg-slate-200 h-full"></div>
          ) : (
            <>
              <div
                style={{ width: `${scheduledPercent}%` }}
                className="bg-sky-500 h-full transition-all duration-500"
                title={`${data.scheduledCount} Scheduled (${scheduledPercent}%)`}
              />
              <div
                style={{ width: `${completedPercent}%` }}
                className="bg-emerald-500 h-full transition-all duration-500"
                title={`${data.completedCount} Completed (${completedPercent}%)`}
              />
              <div
                style={{ width: `${cancelledPercent}%` }}
                className="bg-rose-400 h-full transition-all duration-500"
                title={`${data.cancelledCount} Cancelled (${cancelledPercent}%)`}
              />
            </>
          )}
        </div>
      </div>

      {/* Recent Appointments Quick Table with Live Status Badges */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-50 text-teal-700 rounded-lg">
              <Clock size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Recent Appointments</h2>
              <p className="text-xs text-slate-500">Latest consultations booked across all specialties.</p>
            </div>
          </div>

          <Link
            href="/admin/appointments"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700 transition"
          >
            <span>View All</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {data.recentAppointments.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Calendar size={24} />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">No appointments recorded yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Patient consultations booked via the portal will appear here in real time.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold text-xs uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Date & Time</th>
                  <th className="px-6 py-3.5">Patient</th>
                  <th className="px-6 py-3.5">Assigned Doctor</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recentAppointments.map((apt: any) => {
                  const aptDate = new Date(apt.start_time);
                  const isScheduled = apt.status === 'scheduled';
                  const isCompleted = apt.status === 'completed';

                  return (
                    <tr key={apt.id} className="hover:bg-slate-50/80 transition">
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

                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">
                          {apt.patient?.full_name || 'Patient'}
                        </div>
                        <div className="text-xs text-slate-400 truncate max-w-xs">
                          {apt.patient?.email || 'N/A'}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">
                          {apt.doctor?.profiles?.full_name
                            ? `Dr. ${apt.doctor.profiles.full_name}`
                            : 'Unassigned Doctor'}
                        </div>
                        <div className="text-xs text-teal-600 font-medium">
                          {apt.doctor?.specialization || 'General Physician'}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize border ${
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

                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        {isScheduled ? (
                          <Link
                            href={`/room/${apt.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 transition"
                          >
                            <Video size={13} />
                            <span>Room</span>
                          </Link>
                        ) : (
                          <Link
                            href="/admin/appointments"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                          >
                            <span>Details</span>
                            <ArrowRight size={13} />
                          </Link>
                        )}
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
