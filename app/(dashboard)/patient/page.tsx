import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import PatientDashboardView from '@/components/dashboard/PatientDashboardView';

export const dynamic = 'force-dynamic';

export default async function PatientDashboard() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Fetch appointments with full doctor profile, patient details, and prescription records
  const { data: appointments, error } = await supabase
    .from('appointments')
    .select(`
      id,
      start_time,
      status,
      doctor:doctor_id (
        id,
        specialization,
        hourly_rate,
        profiles (
          full_name
        )
      ),
      patient:patient_id (
        full_name,
        email
      ),
      prescriptions (
        id,
        medicines,
        notes,
        created_at
      )
    `)
    .eq('patient_id', user.id)
    .order('start_time', { ascending: false });

  if (error) {
    console.error('Server Error: Failed to fetch appointments.', error);
  }

  return <PatientDashboardView appointments={appointments || []} user={user} />;
}
