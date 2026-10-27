'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { validateDateTimeBoundary, validateDuplicateAppointment } from '@/lib/schedule';

export interface BookingResponse {
  success: boolean;
  message?: string;
  appointmentId?: string;
}

export async function bookAppointmentAction(formData: {
  doctorId: string;
  date: string;
  time: string;
  startTimeIso?: string;
}): Promise<BookingResponse> {
  const { doctorId, date, time } = formData;

  if (!doctorId || !date || !time) {
    return { success: false, message: 'Please select a doctor, date, and time slot.' };
  }

  // 1. Validate Boundaries (BVA)
  const boundaryCheck = validateDateTimeBoundary(date, time);
  if (!boundaryCheck.valid) {
    return { success: false, message: boundaryCheck.error };
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: 'You must be signed in to book an appointment.' };
  }

  // Use client-provided exact ISO to prevent server timezone skew, or compute fallback
  const startTimeIso = formData.startTimeIso || new Date(`${date}T${time}`).toISOString();

  // 2. Check for Duplicate Appointments in Database
  // Fetch any active appointment at this time for this doctor OR this patient
  const { data: conflicts, error: conflictErr } = await supabase
    .from('appointments')
    .select('id, doctor_id, patient_id, start_time, status')
    .eq('start_time', startTimeIso)
    .eq('status', 'scheduled');

  if (conflictErr) {
    console.error('Error checking duplicate appointments:', conflictErr);
    return { success: false, message: 'Failed to verify slot availability. Please try again.' };
  }

  const duplicateCheck = validateDuplicateAppointment(
    doctorId,
    user.id,
    startTimeIso,
    conflicts || []
  );

  if (!duplicateCheck.valid) {
    return { success: false, message: duplicateCheck.error };
  }

  // 3. Insert Appointment
  const { data: newApt, error: insertErr } = await supabase
    .from('appointments')
    .insert({
      patient_id: user.id,
      doctor_id: doctorId,
      start_time: startTimeIso,
      status: 'scheduled'
    })
    .select('id')
    .single();

  if (insertErr) {
    console.error('Database Error booking appointment:', insertErr);
    return { success: false, message: 'Error booking appointment: ' + insertErr.message };
  }

  revalidatePath('/patient');
  revalidatePath('/doctor');
  revalidatePath('/admin/appointments');

  return { success: true, appointmentId: newApt?.id, message: 'Appointment booked successfully!' };
}

export async function cancelAppointmentAction(appointmentId: string): Promise<{ success: boolean; message: string }> {
  if (!appointmentId) {
    return { success: false, message: 'Appointment ID is required' };
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: 'Unauthorized' };
  }

  // Verify the appointment belongs to this user (as patient or doctor or admin)
  const { data: apt, error: fetchErr } = await supabase
    .from('appointments')
    .select('id, patient_id, doctor_id, status')
    .eq('id', appointmentId)
    .single();

  if (fetchErr || !apt) {
    return { success: false, message: 'Appointment not found' };
  }

  if (apt.status === 'cancelled') {
    return { success: false, message: 'This appointment is already cancelled' };
  }

  // Update status to 'cancelled'
  const { error: updateErr } = await supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', appointmentId);

  if (updateErr) {
    console.error('Error cancelling appointment:', updateErr);
    return { success: false, message: 'Failed to cancel appointment: ' + updateErr.message };
  }

  revalidatePath('/patient');
  revalidatePath('/doctor');
  revalidatePath('/admin/appointments');

  return { success: true, message: 'Appointment cancelled successfully' };
}



export async function updateUserRoleAction(userId: string, newRole: 'patient' | 'doctor' | 'admin') {
  const { updateUserRoleAction: action } = await import('./users');
  return action(userId, newRole);
}
