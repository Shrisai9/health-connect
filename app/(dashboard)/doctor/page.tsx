import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Calendar, Clock, User } from 'lucide-react';
import DoctorActions from '@/components/DoctorActions';

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
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching appointments:', error);
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage your schedule and patient consultations</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Upcoming Appointments</h2>
        </div>
        
        {!appointments || appointments.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p className="text-lg font-medium">No appointments scheduled</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {appointments.map((apt: any) => {
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
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1.5">
                          <Clock size={14} />
                          {date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize
                          ${apt.status === 'scheduled' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`
                        }>
                          {apt.status}
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