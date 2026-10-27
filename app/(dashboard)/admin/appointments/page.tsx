import { createClient } from '@/lib/supabase/server';
import { decryptData } from '@/lib/encryption';
import { redirect } from 'next/navigation';
import AdminAppointmentsView from './AdminAppointmentsView';

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

  // Fetch appointments with full patient, doctor, and prescription records
  const { data: appointments, error } = await supabase
    .from('appointments')
    .select(`
      id,
      start_time,
      status,
      patient:patient_id ( id, full_name, email ),
      doctor:doctor_id (
        id,
        specialization,
        hourly_rate,
        profiles ( full_name )
      ),
      prescriptions (
        id,
        encrypted_data,
        iv,
        medicines,
        notes,
        created_at
      )
    `)
    .order('start_time', { ascending: false });

  if (error) {
    console.error('Error fetching appointments in AdminAppointmentsPage:', error);
  }

  // Decrypt prescription payloads on the server for security and client convenience
  const formattedAppointments = (appointments || []).map((apt: any) => {
    const script = apt.prescriptions?.[0];
    let medicines = script?.medicines || '';
    let notes = script?.notes || '';
    let diagnosis = 'Clinical Evaluation';

    if (script?.encrypted_data && script?.iv) {
      try {
        const [data, authTag] = script.encrypted_data.split(':');
        if (data && authTag) {
          const jsonString = decryptData(data, script.iv, authTag);
          const parsed = JSON.parse(jsonString);
          if (parsed.medicines) medicines = parsed.medicines;
          if (parsed.notes) notes = parsed.notes;
          if (parsed.diagnosis) diagnosis = parsed.diagnosis;
        }
      } catch (err) {
        console.warn('Prescription decryption error for appointment', apt.id);
      }
    }

    return {
      ...apt,
      decryptedPrescription: {
        id: script?.id,
        medicines,
        notes,
        diagnosis,
        created_at: script?.created_at
      }
    };
  });

  return <AdminAppointmentsView initialAppointments={formattedAppointments} />;
}
