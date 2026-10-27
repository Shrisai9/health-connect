import { createClient } from '@/lib/supabase/server';
import { decryptData } from '@/lib/encryption';
import { redirect } from 'next/navigation';
import PatientPrescriptionsView, { EnrichedPrescription } from '@/components/dashboard/PatientPrescriptionsView';
import { parseMedicineInput } from '@/components/DigitalPrescriptionSlip';

export default async function PatientPrescriptionsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Fetch patient profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, role')
    .eq('id', user.id)
    .single();

  const userName = profile?.full_name || user.email?.split('@')[0] || 'Patient';
  const userEmail = user.email || '';

  // Fetch prescriptions with disambiguated doctor and appointment relations
  const { data: rawPrescriptions, error } = await supabase
    .from('prescriptions')
    .select(`
      id,
      created_at,
      medicines,
      notes,
      encrypted_data,
      iv,
      appointment_id,
      appointment:appointment_id (
        id,
        start_time,
        status
      ),
      doctor:doctor_id (
        id,
        specialization,
        profiles!doctors_id_fkey (
          full_name
        )
      )
    `)
    .eq('patient_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching prescriptions:', error);
  }

  // Transform and enrich database records
  const enrichedPrescriptions: EnrichedPrescription[] = (rawPrescriptions || []).map((script: any) => {
    let diagnosis = 'General Medical Consultation';
    let medicinesList = parseMedicineInput(script.medicines || '');
    let notes = script.notes || '';

    // If encrypted_data is present and formatted as "DATA:TAG", attempt decryption
    if (script.encrypted_data && script.encrypted_data !== 'N/A' && script.iv && script.encrypted_data.includes(':')) {
      try {
        const [data, authTag] = script.encrypted_data.split(':');
        if (data && authTag) {
          const jsonString = decryptData(data, script.iv, authTag);
          const decrypted = JSON.parse(jsonString);
          if (decrypted.diagnosis) diagnosis = decrypted.diagnosis;
          if (decrypted.notes) notes = decrypted.notes;
          if (decrypted.medicines) {
            medicinesList = parseMedicineInput(decrypted.medicines);
          }
        }
      } catch (e) {
        console.error('Prescription decryption error:', e);
      }
    }

    const doctorProfile = script.doctor?.profiles;
    const doctorName = doctorProfile?.full_name ? `Dr. ${doctorProfile.full_name}` : 'Dr. Medical Specialist';
    const doctorSpecialization = script.doctor?.specialization || 'Consultant Physician';
    const createdAt = script.appointment?.start_time || script.created_at;

    return {
      id: script.id,
      created_at: createdAt,
      doctor_name: doctorName,
      doctor_specialization: doctorSpecialization,
      diagnosis,
      medicines: medicinesList,
      notes,
      appointment_id: script.appointment_id,
    };
  });

  return (
    <PatientPrescriptionsView
      prescriptions={enrichedPrescriptions}
      userName={userName}
      userEmail={userEmail}
      userId={user.id}
    />
  );
}
