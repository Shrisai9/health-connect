'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, User, CheckCircle, Loader2, AlertCircle, Info } from 'lucide-react';
import { bookAppointmentAction } from '@/app/actions/appointments';
import { getStandardTimeSlots, formatTimeSlot, validateDateTimeBoundary } from '@/lib/schedule';

export default function BookingPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  // BVA Boundaries: Min date = Today, Max date = Today + 30 days
  const todayStr = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  const standardSlots = getStandardTimeSlots();

  useEffect(() => {
    const fetchDoctors = async () => {
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          id,
          specialization,
          hourly_rate,
          profiles!inner (full_name, role)
        `)
        .eq('profiles.role', 'doctor');

      if (error) console.error('Error fetching doctors:', error);
      if (data && data.length > 0) {
        setDoctors(data);
        setSelectedDoctor(data[0].id);
      }
      setLoading(false);
    };
    fetchDoctors();
  }, []);

  // Fetch booked slots whenever selectedDoctor or date changes
  useEffect(() => {
    if (!selectedDoctor || !date) {
      setBookedSlots([]);
      return;
    }

    const fetchBookedSlots = async () => {
      const startOfDay = new Date(`${date}T00:00:00`).toISOString();
      const endOfDay = new Date(`${date}T23:59:59`).toISOString();

      const { data, error } = await supabase
        .from('appointments')
        .select('start_time, status')
        .eq('doctor_id', selectedDoctor)
        .eq('status', 'scheduled')
        .gte('start_time', startOfDay)
        .lte('start_time', endOfDay);

      if (error) {
        console.error('Error checking booked slots:', error);
        return;
      }

      const booked = (data || []).map((apt) => {
        const d = new Date(apt.start_time);
        const hours = String(d.getHours()).padStart(2, '0');
        const mins = String(d.getMinutes()).padStart(2, '0');
        return `${hours}:${mins}`;
      });

      setBookedSlots(booked);
    };

    fetchBookedSlots();
  }, [selectedDoctor, date]);

  // Check if a time slot has already passed for today
  const isSlotPastToday = (slotTime: string) => {
    if (date !== todayStr) return false;
    const now = new Date();
    const [h, m] = slotTime.split(':').map(Number);
    const slotDate = new Date();
    slotDate.setHours(h, m, 0, 0);
    return slotDate.getTime() <= now.getTime();
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!selectedDoctor) {
      setValidationError('Please select a doctor.');
      return;
    }
    if (!date) {
      setValidationError('Please choose an appointment date.');
      return;
    }
    if (!time) {
      setValidationError('Please select an available time slot.');
      return;
    }

    // Client-side Boundary Check
    const boundaryCheck = validateDateTimeBoundary(date, time);
    if (!boundaryCheck.valid) {
      setValidationError(boundaryCheck.error || 'Invalid date or time boundary.');
      return;
    }

    // Client-side Duplicate Check for selected doctor
    if (bookedSlots.includes(time)) {
      setValidationError('This slot is already booked for this doctor. Please pick another slot.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await bookAppointmentAction({
        doctorId: selectedDoctor,
        date,
        time,
      });

      if (!result.success) {
        setValidationError(result.message || 'Booking failed.');
        setSubmitting(false);
      } else {
        router.push('/patient');
        router.refresh();
      }
    } catch (err: any) {
      setValidationError(err.message || 'An unexpected error occurred.');
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-gray-600">Loading doctor directory...</div>;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto min-h-screen bg-gray-50 pb-24 md:pb-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Book an Appointment</h1>
        <p className="text-gray-500 mt-1">Select a specialist and a validated clinic schedule slot.</p>
      </div>

      {validationError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-800">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm">Booking Validation Conflict</h4>
            <p className="text-sm mt-0.5">{validationError}</p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Column: Doctor Selection */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-800">
            <User className="text-blue-600" /> Select Doctor
          </h2>
          <div className="space-y-3">
            {doctors.map((doc) => (
              <div
                key={doc.id}
                onClick={() => setSelectedDoctor(doc.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedDoctor === doc.id
                    ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-500/20 shadow-sm'
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
                    {selectedDoctor === doc.id && (
                      <CheckCircle size={20} className="text-blue-600 mt-1 ml-auto" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Date & Slot Schedule */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-800">
            <Calendar className="text-blue-600" /> Select Schedule Slot
          </h2>

          <form onSubmit={handleBook} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Date (Mon–Sat, up to 30 days)
              </label>
              <input
                type="date"
                required
                min={todayStr}
                max={maxDateStr}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm text-gray-900"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setTime('');
                  setValidationError(null);
                }}
              />
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                <Info size={13} /> Boundary test: Past dates and dates beyond 30 days are disabled.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Available Time Slots (09:00 AM – 05:00 PM)
              </label>

              {!date ? (
                <div className="p-4 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-center text-xs text-gray-500">
                  Select a date above to view available schedule slots.
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto p-1 border rounded-lg bg-gray-50/50">
                  {standardSlots.map((slot) => {
                    const isBooked = bookedSlots.includes(slot);
                    const isPast = isSlotPastToday(slot);
                    const isDisabled = isBooked || isPast;

                    return (
                      <button
                        type="button"
                        key={slot}
                        disabled={isDisabled}
                        onClick={() => {
                          setTime(slot);
                          setValidationError(null);
                        }}
                        className={`p-2 rounded-lg text-xs font-medium border transition text-center ${
                          time === slot
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : isDisabled
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                        }`}
                        title={
                          isBooked
                            ? 'Slot already booked (duplicate prevention)'
                            : isPast
                            ? 'Time slot already passed'
                            : 'Available for booking'
                        }
                      >
                        <div>{formatTimeSlot(slot)}</div>
                        {isBooked && <div className="text-[10px] text-red-500 font-semibold no-underline">Booked</div>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting || !selectedDoctor || !date || !time}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Verifying & Booking...
                </>
              ) : (
                'Confirm Appointment'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
