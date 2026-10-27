'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type UserRole = 'patient' | 'doctor' | 'admin';

export interface UpdateRoleResponse {
  success: boolean;
  message: string;
}

export async function updateUserRoleAction(
  userId: string,
  newRole: UserRole
): Promise<UpdateRoleResponse> {
  if (!userId || !newRole) {
    return { success: false, message: 'User ID and valid role are required.' };
  }

  const validRoles: UserRole[] = ['patient', 'doctor', 'admin'];
  if (!validRoles.includes(newRole)) {
    return { success: false, message: 'Invalid role selection.' };
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: 'Unauthorized. Please sign in.' };
  }

  // Ensure requester is an administrator
  const { data: adminProfile, error: profileErr } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileErr || adminProfile?.role !== 'admin') {
    return { success: false, message: 'Forbidden. Only administrators can modify roles.' };
  }

  // 1. Update role in profiles table
  const { error: updateErr } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId);

  if (updateErr) {
    console.error('Error updating user role in profiles:', updateErr);
    return { success: false, message: 'Failed to update user role: ' + updateErr.message };
  }

  // 2. If upgrading/verifying as doctor, ensure doctors entry exists
  if (newRole === 'doctor') {
    const { data: existingDoctor, error: docFetchErr } = await supabase
      .from('doctors')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (!existingDoctor && !docFetchErr) {
      const { error: docInsertErr } = await supabase
        .from('doctors')
        .insert({
          id: userId,
          specialization: 'General Physician',
          hourly_rate: 1499,
          bio: 'Verified clinical practitioner on HealthConnect platform.'
        });

      if (docInsertErr) {
        console.warn('Note: Profile role updated but doctor table entry creation reported:', docInsertErr);
      }
    }
  }

  revalidatePath('/admin');
  revalidatePath('/admin/users');
  revalidatePath('/admin/appointments');
  revalidatePath('/patient/book');

  return {
    success: true,
    message: `Role successfully updated to ${newRole}.`
  };
}
