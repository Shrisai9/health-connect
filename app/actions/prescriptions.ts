'use server';

import { createClient } from '@/lib/supabase/server';
import { encryptData } from '@/lib/encryption';
import { redirect } from 'next/navigation';

export async function submitPrescription(formData: FormData) {
  const appointment_id = formData.get('appointment_id') as string;
  const patient_id = formData.get('patient_id') as string;
  const diagnosis = formData.get('diagnosis') as string;
  const medicines = formData.get('medicines') as string;
  const notes = formData.get('notes') as string;

  if (!appointment_id || !patient_id) {
    throw new Error("Missing appointment or patient ID");
  }

  // 1. Prepare the payload
  const payload = JSON.stringify({
    diagnosis,
    medicines,
    notes,
    date: new Date().toISOString()
  });

  // 2. Encrypt the payload
  // We get encryptedData, iv, and authTag.
  const { encryptedData, iv, authTag } = encryptData(payload);

  // 3. Save to Database
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("Unauthorized");

  // Note: We store authTag appended to encrypted_data because our initial schema 
  // didn't have a separate column for it. Format: "DATA:TAG"
  const combinedData = `${encryptedData}:${authTag}`;

  const { error } = await supabase.from('prescriptions').insert({
    appointment_id,
    patient_id,
    doctor_id: user.id,
    encrypted_data: combinedData,
    iv: iv,
  });

  if (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to save prescription');
  }

  // 4. Update appointment status to completed
  await supabase
    .from('appointments')
    .update({ status: 'completed' })
    .eq('id', appointment_id);

  redirect('/doctor');
}
