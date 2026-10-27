import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminUsersView from './AdminUsersView';

export default async function AdminUsersPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Verify administrator role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') redirect('/');

  // Fetch all registered user profiles
  const { data: users, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching profiles in AdminUsersPage:', error);
  }

  return (
    <AdminUsersView
      initialUsers={users || []}
      currentUserId={user.id}
    />
  );
}
