'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import '@livekit/components-styles';
import { Loader2 } from 'lucide-react';

export default function RoomPage({ params }: { params: { id: string } }) {
  const [token, setToken] = useState('');
  const [role, setRole] = useState('patient');
  const router = useRouter();
  const roomID = params.id;

  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            router.push('/login');
            return;
        }

        // Fetch user's name and role to handle redirect correctly
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', user.id)
          .single();
          
        const name = profile?.full_name || user.email || 'Guest';
        if (profile?.role) setRole(profile.role);

        // Fetch the secure token from our API
        const resp = await fetch(`/api/livekit?room=${roomID}&username=${encodeURIComponent(name)}`);
        const data = await resp.json();
        
        if (data.error) {
          console.error(data.error);
          alert('Failed to join: ' + data.error);
          // If join fails, redirect based on role immediately
          if (profile?.role === 'doctor') router.push('/doctor');
          else if (profile?.role === 'admin') router.push('/admin/appointments');
          else router.push('/patient');
          return;
        }
        
        setToken(data.token);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [roomID, router]);

  const handleDisconnect = () => {
    // Redirect to the correct dashboard based on role
    if (role === 'doctor') {
      router.push('/doctor');
    } else if (role === 'admin') {
      router.push('/admin/appointments');
    } else {
      router.push('/patient');
    }
    router.refresh();
  };

  if (!token) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Connecting to secure room...</p>
        </div>
      </div>
    );
  }

  return (
    <LiveKitRoom
      video={true}
      audio={true}
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      data-lk-theme="default"
      style={{ height: '100vh' }}
      onDisconnected={handleDisconnect}
    >
      <VideoConference />
    </LiveKitRoom>
  );
}