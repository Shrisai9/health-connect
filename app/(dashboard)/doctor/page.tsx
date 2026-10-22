import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Calendar, Clock, User, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import DoctorActions from '@/components/DoctorActions';
import { CLINIC_CONFIG } from '@/lib/schedule';

export default async function DoctorDashboard() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Fetch appointments assigned to this doctor
  const { data: appointments, error } = await supabase
    .from('appointments')
    .select(`
      id,
      start_time,
      status,
      patient:patient_id (
        full_name,
        email
      )
    `)
    .eq('doctor_id', user.id)
    .order('start_time', { ascending: false });

  if (error) {
    console.error('Error fetching appointments:', error);
  }

  const allApts = appointments || [];
  const scheduledCount = allApts.filter(a => a.status === 'scheduled').length;
  const completedCount = allApts.filter(a => a.status === 'completed').length;
  const cancelledCount = allApts.filter(a => a.status === 'cancelled').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto pb-24 md:pb-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage your active schedule, consultations, and patient visits</p>
      </div>

      {/* Doctor Schedule & Clinic Hours Info Card */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-blue-600">
            <Clock size={20} />
            <h3 className="font-semibold text-sm text-gray-700">Clinic Hours</h3>
          </div>
          <p className="text-lg font-bold text-gray-900">09:00 AM – 05:00 PM</p>
          <p className="text-xs text-gray-500 mt-0.5">Mon – Sat (Sun Closed)</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-green-600">
            <Calendar size={20} />
            <h3 className="font-semibold text-sm text-gray-700">Scheduled</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{scheduledCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Upcoming visits</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-blue-600">
            <CheckCircle2 size={20} />
            <h3 className="font-semibold text-sm text-gray-700">Completed</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Consultations finished</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-red-600">
            <XCircle size={20} />
            <h3 className="font-semibold text-sm text-gray-700">Cancelled</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{cancelledCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Freed time slots</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-semibold text-gray-900">Appointment Schedule</h2>
          <span className="text-xs text-gray-500 font-medium">
            Slot interval: {CLINIC_CONFIG.SLOT_INTERVAL_MINUTES} mins (Lunch: 01:00 PM – 02:00 PM)
          </span>
        </div>
        
        {allApts.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p className="text-lg font-medium">No appointments scheduled</p>
            <p className="text-sm mt-1">Available slots are open for patient bookings.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {allApts.map((apt: any) => {
              const date = new Date(apt.start_time);
              return (
                <div key={apt.id} className="p-6 hover:bg-gray-50 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                      <User size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {apt.patient?.full_name || 'Unknown Patient'}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1 flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <Clock size={14} />
                          {date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${getStatusBadge(apt.status)}`}>
                          {apt.status}
                        </span>
                        <span className="text-xs text-gray-400">
                          {apt.patient?.email}
                        </span>
                      </div>
                    </div>
                  </div>

                  <DoctorActions appointmentId={apt.id} status={apt.status} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
