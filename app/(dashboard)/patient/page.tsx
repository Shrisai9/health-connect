import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Calendar, Clock, Video, FileText } from 'lucide-react';
import Link from 'next/link';
import AppointmentCancelButton from '@/components/AppointmentCancelButton';

export default async function PatientDashboard() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Fetch appointments and join with profiles to get the doctor's name.
  const { data: appointments, error } = await supabase
    .from('appointments')
    .select(`
      id,
      start_time,
      status,
      doctor:doctor_id (
        profiles (
          full_name
        )
      ),
      prescriptions (
        medicines,
        notes
      )
    `)
    .eq('patient_id', user.id)
    .order('start_time', { ascending: false });

  if (error) {
    console.error('Server Error: Failed to fetch appointments.', error);
  }

  const getStatusBadgeClass = (status: string) => {
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-gray-500 mt-1">Manage your upcoming visits and consultation history</p>
        </div>
        <Link 
          href="/patient/book" 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          Book New
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {!appointments || appointments.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p className="text-lg font-medium">No appointments yet</p>
            <p className="text-sm mt-1">
              Click "Book New" to schedule your first consultation.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {appointments.map((apt: any) => {
              const date = new Date(apt.start_time);
              return (
                <div key={apt.id} className="p-6 hover:bg-gray-50 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                      <Calendar size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {apt.doctor?.profiles?.full_name || 'Unknown Doctor'}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1 flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <Clock size={14} />
                          {date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${getStatusBadgeClass(apt.status)}`}>
                          {apt.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {apt.status === 'scheduled' && (
                      <>
                        <Link 
                          href={`/room/${apt.id}`}
                          className="flex items-center justify-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium"
                        >
                          <Video size={18} /> Join Call
                        </Link>
                        <AppointmentCancelButton appointmentId={apt.id} />
                      </>
                    )}
                  </div>

                  {apt.prescriptions && apt.prescriptions.length > 0 && (
                    <div className="mt-4 w-full p-4 bg-green-50 border border-green-100 rounded-lg">
                      <div className="flex items-start gap-3">
                        <FileText className="text-green-600 mt-1" size={20} />
                        <div>
                          <h4 className="font-semibold text-green-900">Prescription</h4>
                          <p className="text-sm text-green-800 mt-1 whitespace-pre-line">{apt.prescriptions[0].medicines}</p>
                          {apt.prescriptions[0].notes && (
                            <p className="text-sm text-green-700 mt-2 italic">Note: {apt.prescriptions[0].notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
