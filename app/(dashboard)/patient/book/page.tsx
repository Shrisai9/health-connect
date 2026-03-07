﻿'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, User, CheckCircle, Loader2 } from 'lucide-react';

export default function BookingPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchDoctors = async () => {
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          id,
          specialization,
          hourly_rate,
          profiles (full_name)
        `);
      
      if (error) console.error('Error fetching doctors:', error);
      if (data) setDoctors(data);
      setLoading(false);
    };
    fetchDoctors();
  }, []);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor || !date || !time) return;
    setSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Combine date and time into ISO string
    const startTime = new Date(`${date}T${time}`).toISOString();

    const { error } = await supabase
      .from('appointments')
      .insert({
        patient_id: user.id,
        doctor_id: selectedDoctor,
        start_time: startTime,
        status: 'scheduled'
      });

    if (error) {
      alert('Error booking appointment: ' + error.message);
      setSubmitting(false);
    } else {
      router.push('/patient');
      router.refresh();
    }
  };

  if (loading) return <div className="p-8">Loading doctors...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Book an Appointment</h1>
      <p className="text-gray-500 mb-8">Select a specialist and a time that works for you.</p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Column: Doctor Selection */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <User className="text-blue-600" /> Select Doctor
          </h2>
          <div className="space-y-3">
            {doctors.map((doc) => (
              <div 
                key={doc.id}
                onClick={() => setSelectedDoctor(doc.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedDoctor === doc.id 
                    ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' 
                    : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-900">{doc.profiles?.full_name || 'Unknown Doctor'}</p>
                    <p className="text-sm text-gray-500">{doc.specialization}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">${doc.hourly_rate}/hr</p>
                    {selectedDoctor === doc.id && <CheckCircle size={20} className="text-blue-600 mt-1 ml-auto" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Time & Confirm */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="text-blue-600" /> Schedule
          </h2>
          
          <form onSubmit={handleBook} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input 
                type="date" 
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 text-gray-400" size={16} />
                <input 
                  type="time" 
                  required
                  className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={!selectedDoctor || !date || !time || submitting}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {submitting ? <Loader2 className="animate-spin" /> : 'Confirm Booking'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
