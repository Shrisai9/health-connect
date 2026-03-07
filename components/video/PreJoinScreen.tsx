'use client';

import { useState, useEffect } from 'react';
import { LocalVideoTrack, LocalAudioTrack, createLocalVideoTrack, createLocalAudioTrack } from 'livekit-client';
import { Video, Mic, MicOff, VideoOff } from 'lucide-react';

interface PreJoinScreenProps {
  onJoin: () => void;
}

export default function PreJoinScreen({ onJoin }: PreJoinScreenProps) {
  const [videoTrack, setVideoTrack] = useState<LocalVideoTrack | null>(null);
  const [audioTrack, setAudioTrack] = useState<LocalAudioTrack | null>(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);

  useEffect(() => {
    let vTrack: LocalVideoTrack | null = null;
    let aTrack: LocalAudioTrack | null = null;

    const initTracks = async () => {
      try {
        vTrack = await createLocalVideoTrack();
        aTrack = await createLocalAudioTrack();
        setVideoTrack(vTrack);
        setAudioTrack(aTrack);
      } catch (e) {
        console.error('Error accessing media devices:', e);
      }
    };
    initTracks();

    return () => {
      vTrack?.stop();
      aTrack?.stop();
    };
  }, []);

  useEffect(() => {
    if (videoTrack) {
      const el = document.getElementById('prejoin-video') as HTMLVideoElement;
      if (el) videoTrack.attach(el);
    }
  }, [videoTrack]);

  const toggleAudio = async () => {
    if (audioTrack) {
      if (audioTrack.isMuted) {
        await audioTrack.unmute();
        setAudioEnabled(true);
      } else {
        await audioTrack.mute();
        setAudioEnabled(false);
      }
    }
  };

  const toggleVideo = async () => {
    if (videoTrack) {
      // In LiveKit v2:
      // - isEnabled is replaced by !isMuted
      // - disable() is replaced by mute()
      // - enable() is replaced by unmute()
      if (videoTrack.isMuted) {
        await videoTrack.unmute();
        setVideoEnabled(true);
      } else {
        await videoTrack.mute();
        setVideoEnabled(false);
      }
    }
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="w-full max-w-2xl p-4 md:p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Check your Audio & Video</h2>
        
        <div className="relative aspect-video bg-black rounded-xl overflow-hidden mb-6 border border-gray-700">
          <video id="prejoin-video" className="w-full h-full object-cover" />
          {!videoEnabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <VideoOff size={48} className="text-gray-500" />
            </div>
          )}
        </div>

        <div className="flex justify-center gap-4 mb-8">
          <button onClick={toggleAudio} className={`p-4 rounded-full ${audioEnabled ? 'bg-gray-700' : 'bg-red-500'}`}>
            {audioEnabled ? <Mic /> : <MicOff />}
          </button>
          <button onClick={toggleVideo} className={`p-4 rounded-full ${videoEnabled ? 'bg-gray-700' : 'bg-red-500'}`}>
            {videoEnabled ? <Video /> : <VideoOff />}
          </button>
        </div>

        <button onClick={onJoin} className="w-full bg-blue-600 py-4 rounded-xl font-bold text-lg hover:bg-blue-700">
          Join Consultation
        </button>
      </div>
    </div>
  );
}