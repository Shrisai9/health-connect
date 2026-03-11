import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AdminAppointmentsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');
  
  // Verify admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
    
  if (profile?.role !== 'admin') redirect('/');

  // Fetch appointments with patient and doctor details
  const { data: appointments, error } = await supabase
    .from('appointments')
    .select(`
      id,
      start_time,
      status,
      patient:patient_id ( full_name, email ),
      doctor:doctor_id ( profiles ( full_name ) )
    `)
    .order('start_time', { ascending: false });

  if (error) console.error('Error fetching appointments:', error);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24 md:pb-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">All Appointments</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-900 font-semibold border-b">
              <tr>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Doctor</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {appointments?.map((apt: any) => (
                <tr key={apt.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    {new Date(apt.start_time).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{apt.patient?.full_name}</div>
                    <div className="text-xs">{apt.patient?.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    {apt.doctor?.profiles?.full_name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 capitalize">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      apt.status === 'completed' ? 'bg-green-100 text-green-700' : 
                      apt.status === 'scheduled' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {apt.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}