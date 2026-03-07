'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import PreJoinScreen from '@/components/video/PreJoinScreen';
import VideoRoom from '@/components/video/VideoRoom';

export default function RoomPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [token, setToken] = useState('');
  const [isPreJoinComplete, setIsPreJoinComplete] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);
    };
    init();
  }, [router]);

  const handleJoin = async () => {
    if (!user) return;

    try {
      const res = await fetch(`/api/livekit?room=${id}&username=${user.email}`);
      const data = await res.json();
      if (data.token) {
        setToken(data.token);
        setIsPreJoinComplete(true);
      } else {
        alert('Failed to join room: ' + data.error);
      }
    } catch (e) {
      console.error(e);
      alert('Error connecting to server');
    }
  };

  if (!isPreJoinComplete) {
    return <PreJoinScreen onJoin={handleJoin} />;
  }

  return (
    <VideoRoom 
      roomName={id} 
      token={token} 
      onDisconnected={() => router.push('/')} 
    />
  );
}
