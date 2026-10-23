'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Info,
  Sun,
  Sunset,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Stethoscope,
  Sparkles
} from 'lucide-react';
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

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  // BVA Boundaries: Min date = Today, Max date = Today + 30 days
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateStr = `${maxDate.getFullYear()}-${String(maxDate.getMonth() + 1).padStart(2, '0')}-${String(maxDate.getDate()).padStart(2, '0')}`;

  // Generate 31 day objects for horizontal slider (Day 0 to Day 30)
  const dayList = useMemo(() => {
    const list = [];
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 0; i <= 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateString = `${yyyy}-${mm}-${dd}`;
      const dayOfWeek = d.getDay();
      const isSunday = dayOfWeek === 0;

      list.push({
        dateStr: dateString,
        dayName: weekdays[dayOfWeek],
        dayNum: d.getDate(),
        monthName: months[d.getMonth()],
        isToday: i === 0,
        isTomorrow: i === 1,
        isSunday,
        label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : weekdays[dayOfWeek],
      });
    }
    return list;
  }, []);

  // Standard categorized slots
  const morningSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30'];
  const afternoonSlots = ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];

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

    // Default select first available non-Sunday date (Today or Tomorrow)
    const firstAvailable = dayList.find((d) => !d.isSunday);
    if (firstAvailable) {
      setDate(firstAvailable.dateStr);
    }
  }, [dayList]);

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
    const current = new Date();
    const [h, m] = slotTime.split(':').map(Number);
    const slotDate = new Date();
    slotDate.setHours(h, m, 0, 0);
    return slotDate.getTime() <= current.getTime();
  };

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -260 : 260;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
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

    // Client-side Boundary Check (BVA)
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

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto flex items-center justify-center min-h-[400px] text-slate-500 gap-3">
        <Loader2 className="animate-spin text-teal-600" size={24} />
        <span>Loading verified doctor directory...</span>
      </div>
    );
  }

  const selectedDoctorObj = doctors.find((d) => d.id === selectedDoctor);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto min-h-screen pb-24 md:pb-12 text-slate-800">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          <span>STQA Validated Clinic Scheduling Engine</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Book Video Consultation</h1>
        <p className="text-slate-500 text-sm mt-1">
          Pick your preferred specialist, choose a date within the 30-day window, and select an available slot.
        </p>
      </div>

      {validationError && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-900 shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Schedule Validation Warning</h4>
            <p className="text-sm mt-0.5">{validationError}</p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Doctor Directory (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Stethoscope className="text-teal-600 w-5 h-5" /> 1. Select Specialist
            </h2>
            <span className="text-xs font-medium text-slate-400">{doctors.length} Doctors</span>
          </div>

          <div className="space-y-3">
            {doctors.map((doc) => {
              const isSelected = selectedDoctor === doc.id;
              const fee = doc.hourly_rate ? Number(doc.hourly_rate) : 499;

              return (
                <div
                  key={doc.id}
                  onClick={() => {
                    setSelectedDoctor(doc.id);
                    setTime('');
                    setValidationError(null);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-teal-600 bg-gradient-to-r from-teal-50/70 to-sky-50/50 ring-2 ring-teal-500/30 shadow-md'
                      : 'border-slate-200 bg-white hover:border-teal-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-xs ${
                        isSelected ? 'bg-teal-600' : 'bg-slate-700'
                      }`}>
                        {doc.profiles?.full_name?.split(' ').map((n: string, i: number) => i <= 1 ? n[0] : '').join('') || 'DR'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-slate-900 text-sm">{doc.profiles?.full_name || 'Dr. Specialist'}</p>
                          {isSelected && <CheckCircle2 size={16} className="text-teal-600" />}
                        </div>
                        <p className="text-xs text-teal-700 font-semibold">{doc.specialization || 'General Physician'}</p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-base font-extrabold text-slate-900">
                        ₹{fee.toLocaleString('en-IN')}
                      </p>
                      <p className="text-[10px] text-slate-400">per consult</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Schedule & Time Slot Picker (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleBook} className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            
            {/* Step 2: Date Picker with Horizontal Slider */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="text-teal-600 w-5 h-5" /> 2. Select Date (30-Day Window)
                </h2>

                {/* Quick Select Buttons */}
                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      const todayObj = dayList[0];
                      if (todayObj && !todayObj.isSunday) {
                        setDate(todayObj.dateStr);
                        setTime('');
                        setValidationError(null);
                      }
                    }}
                    className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600 font-medium transition"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const tomObj = dayList[1];
                      if (tomObj && !tomObj.isSunday) {
                        setDate(tomObj.dateStr);
                        setTime('');
                        setValidationError(null);
                      }
                    }}
                    className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600 font-medium transition"
                  >
                    Tomorrow
                  </button>
                  <div className="flex items-center gap-0.5 ml-1">
                    <button
                      type="button"
                      onClick={() => handleScroll('left')}
                      className="p-1 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-100"
                      title="Scroll left"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleScroll('right')}
                      className="p-1 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-100"
                      title="Scroll right"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Horizontal Day-by-Day Strip */}
              <div
                ref={scrollContainerRef}
                className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-thin scroll-smooth no-scrollbar"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {dayList.map((dayItem) => {
                  const isSelected = date === dayItem.dateStr;
                  const isSunday = dayItem.isSunday;

                  if (isSunday) {
                    return (
                      <button
                        key={dayItem.dateStr}
                        type="button"
                        disabled
                        className="flex-shrink-0 w-16 p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed text-center opacity-60"
                        title="Clinic is closed on Sundays (TC-DATE-09)"
                      >
                        <span className="block text-[10px] font-bold uppercase">{dayItem.dayName}</span>
                        <span className="block text-base font-extrabold line-through">{dayItem.dayNum}</span>
                        <span className="block text-[9px] text-rose-500 font-bold mt-0.5">Closed</span>
                      </button>
                    );
                  }

                  return (
                    <button
                      key={dayItem.dateStr}
                      type="button"
                      onClick={() => {
                        setDate(dayItem.dateStr);
                        setTime('');
                        setValidationError(null);
                      }}
                      className={`flex-shrink-0 w-16 p-2 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'bg-gradient-to-br from-teal-600 to-sky-600 text-white border-teal-600 shadow-md ring-2 ring-teal-400/40'
                          : 'bg-white hover:bg-teal-50/50 hover:border-teal-400 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className={`block text-[10px] font-bold uppercase ${
                        isSelected ? 'text-teal-100' : 'text-slate-400'
                      }`}>
                        {dayItem.label}
                      </span>
                      <span className="block text-lg font-extrabold leading-tight">
                        {dayItem.dayNum}
                      </span>
                      <span className={`block text-[10px] font-medium ${
                        isSelected ? 'text-teal-100' : 'text-slate-500'
                      }`}>
                        {dayItem.monthName}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Direct Date Picker & Boundary Note */}
              <div className="flex items-center justify-between text-xs text-slate-500 mt-2 px-1">
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Info size={12} className="text-teal-600" /> Mon – Sat, up to 30 days ahead (Sundays closed).
                </span>
                <input
                  type="date"
                  min={todayStr}
                  max={maxDateStr}
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setTime('');
                    setValidationError(null);
                  }}
                  className="text-xs border border-slate-200 rounded px-2 py-0.5 text-slate-600 outline-none focus:border-teal-500"
                />
              </div>
            </div>

            {/* Step 3: Categorized Time Slots */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="text-teal-600 w-5 h-5" /> 3. Select Time Slot
                </h2>
                {date && (
                  <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                    {new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </span>
                )}
              </div>

              {!date ? (
                <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-500">
                  Select a consultation date above to display available slots.
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Morning Slots */}
                  <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80">
                    <div className="flex items-center gap-2 mb-2.5 text-xs font-bold text-slate-700">
                      <Sun className="w-4 h-4 text-amber-500" />
                      <span>Morning Slots (09:00 AM – 12:30 PM)</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {morningSlots.map((slot) => {
                        const isBooked = bookedSlots.includes(slot);
                        const isPast = isSlotPastToday(slot);
                        const isDisabled = isBooked || isPast;
                        const isSelected = time === slot;

                        return (
                          <button
                            type="button"
                            key={slot}
                            disabled={isDisabled}
                            onClick={() => {
                              setTime(slot);
                              setValidationError(null);
                            }}
                            className={`p-2.5 rounded-xl text-xs font-semibold border transition-all text-center flex flex-col items-center justify-center ${
                              isSelected
                                ? 'bg-teal-600 text-white border-teal-600 shadow-md ring-2 ring-teal-400/40'
                                : isDisabled
                                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                                : 'bg-emerald-50/80 hover:bg-emerald-100/90 text-emerald-900 border-emerald-300 hover:border-emerald-500 hover:shadow-xs'
                            }`}
                            title={
                              isBooked
                                ? 'Slot already reserved by another patient'
                                : isPast
                                ? 'Time slot already elapsed today'
                                : 'Available for booking'
                            }
                          >
                            <span>{formatTimeSlot(slot)}</span>
                            {isBooked ? (
                              <span className="text-[10px] text-rose-600 font-bold mt-0.5">Booked</span>
                            ) : isPast ? (
                              <span className="text-[10px] text-slate-400 font-medium mt-0.5">Passed</span>
                            ) : (
                              <span className={`text-[10px] font-medium mt-0.5 ${isSelected ? 'text-teal-100' : 'text-emerald-700'}`}>
                                Available
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Lunch Notice */}
                  <div className="px-3 py-1.5 rounded-lg bg-amber-50/70 border border-amber-200/70 text-[11px] text-amber-800 flex items-center justify-between">
                    <span>☕ Clinic Lunch Break: 01:00 PM – 02:00 PM (No Consultations)</span>
                    <span className="text-[10px] text-amber-700 font-medium">BVA Closed Boundary</span>
                  </div>

                  {/* Afternoon Slots */}
                  <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80">
                    <div className="flex items-center gap-2 mb-2.5 text-xs font-bold text-slate-700">
                      <Sunset className="w-4 h-4 text-orange-500" />
                      <span>Afternoon Slots (02:00 PM – 04:30 PM)</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {afternoonSlots.map((slot) => {
                        const isBooked = bookedSlots.includes(slot);
                        const isPast = isSlotPastToday(slot);
                        const isDisabled = isBooked || isPast;
                        const isSelected = time === slot;

                        return (
                          <button
                            type="button"
                            key={slot}
                            disabled={isDisabled}
                            onClick={() => {
                              setTime(slot);
                              setValidationError(null);
                            }}
                            className={`p-2.5 rounded-xl text-xs font-semibold border transition-all text-center flex flex-col items-center justify-center ${
                              isSelected
                                ? 'bg-teal-600 text-white border-teal-600 shadow-md ring-2 ring-teal-400/40'
                                : isDisabled
                                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                                : 'bg-emerald-50/80 hover:bg-emerald-100/90 text-emerald-900 border-emerald-300 hover:border-emerald-500 hover:shadow-xs'
                            }`}
                            title={
                              isBooked
                                ? 'Slot already reserved by another patient'
                                : isPast
                                ? 'Time slot already elapsed today'
                                : 'Available for booking'
                            }
                          >
                            <span>{formatTimeSlot(slot)}</span>
                            {isBooked ? (
                              <span className="text-[10px] text-rose-600 font-bold mt-0.5">Booked</span>
                            ) : isPast ? (
                              <span className="text-[10px] text-slate-400 font-medium mt-0.5">Passed</span>
                            ) : (
                              <span className={`text-[10px] font-medium mt-0.5 ${isSelected ? 'text-teal-100' : 'text-emerald-700'}`}>
                                Available
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirmation Summary & Submit Button */}
            <div className="pt-2 border-t border-slate-100 space-y-4">
              {selectedDoctorObj && date && time && (
                <div className="p-3.5 bg-gradient-to-r from-teal-50 to-sky-50 rounded-xl border border-teal-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-900">{selectedDoctorObj.profiles?.full_name}</span>
                    <span className="text-slate-500"> • {formatTimeSlot(time)} on {new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="font-extrabold text-teal-800 text-sm">
                    Fee: ₹{(selectedDoctorObj.hourly_rate || 499).toLocaleString('en-IN')}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !selectedDoctor || !date || !time}
                className="w-full bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 text-white font-bold py-3.5 rounded-xl shadow-md shadow-teal-600/20 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Verifying Availability & Booking...
                  </>
                ) : (
                  'Confirm Appointment Slot'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
