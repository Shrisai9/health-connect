'use client';

import { Suspense, useEffect, useState, useMemo, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
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
  Sparkles,
  Star
} from 'lucide-react';
import { bookAppointmentAction } from '@/app/actions/appointments';
import { getStandardTimeSlots, formatTimeSlot, validateDateTimeBoundary } from '@/lib/schedule';
import { FEATURED_DOCTORS } from '@/lib/doctors';

function BookingPageContent() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctorKey, setSelectedDoctorKey] = useState<string | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramDoctorId = searchParams.get('doctorId') || searchParams.get('doctor');
  const paramSpecialty = searchParams.get('specialty');
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
      // Ingest both previous database doctors and featured specialists with distinct unique keys
      const baseList: any[] = FEATURED_DOCTORS.map((doc, idx) => ({
        id: doc.id,
        specialization: doc.specialization,
        hourly_rate: doc.fee,
        degrees: doc.degrees,
        experience: doc.experience,
        hospital: doc.hospital,
        rating: doc.rating,
        reviews: doc.reviews,
        avatarColor: doc.avatarColor,
        category: doc.category,
        uniqueKey: `${doc.id}-${idx}`,
        profiles: { full_name: doc.name, role: 'doctor' },
      }));

      try {
        const { data, error } = await supabase
          .from('doctors')
          .select(`
            id,
            specialization,
            hourly_rate,
            bio,
            profiles!inner (full_name, role)
          `)
          .eq('profiles.role', 'doctor');

        if (!error && data && data.length > 0) {
          for (const dbDoc of data) {
            const dbProfiles = dbDoc.profiles as any;
            const dbName = (Array.isArray(dbProfiles) ? dbProfiles[0]?.full_name : dbProfiles?.full_name) || '';
            const exists = baseList.some(
              (d) => d.id === dbDoc.id && d.profiles?.full_name?.toLowerCase().includes(dbName.toLowerCase())
            );
            if (!exists) {
              baseList.push({
                ...dbDoc,
                degrees: 'MBBS, MD',
                experience: 'Verified Specialist',
                hospital: 'HealthConnect Clinical Network',
                rating: 4.9,
                reviews: 140,
                avatarColor: 'from-slate-600 to-teal-700',
                category: 'previous',
                uniqueKey: dbDoc.id,
                profiles: { full_name: dbName, role: 'doctor' },
              });
            }
          }
        }
      } catch (err) {
        console.error('Error fetching doctors from db:', err);
      }

      setDoctors(baseList);

      // Handle URL pre-selection
      if (paramDoctorId) {
        const matched = baseList.find(
          (d) =>
            d.id === paramDoctorId ||
            d.uniqueKey === paramDoctorId ||
            d.profiles?.full_name?.toLowerCase().includes(paramDoctorId.toLowerCase())
        );
        if (matched) {
          setSelectedDoctorKey(matched.uniqueKey);
          setSelectedSpecialty(matched.specialization || 'All');
        } else {
          setSelectedDoctorKey(baseList[0]?.uniqueKey || baseList[0]?.id);
        }
      } else {
        setSelectedDoctorKey(baseList[0]?.uniqueKey || baseList[0]?.id);
      }

      if (paramSpecialty) {
        setSelectedSpecialty(paramSpecialty);
      }

      setLoading(false);
    };

    fetchDoctors();

    // Default select first available non-Sunday date (Today or Tomorrow)
    const firstAvailable = dayList.find((d) => !d.isSunday);
    if (firstAvailable) {
      setDate(firstAvailable.dateStr);
    }
  }, [dayList, paramDoctorId, paramSpecialty]);

  // Derive selected doctor object and active UUID
  const selectedDoctorObj = useMemo(() => {
    return (
      doctors.find((d) => d.uniqueKey === selectedDoctorKey) ||
      doctors.find((d) => d.id === selectedDoctorKey) ||
      doctors[0] ||
      null
    );
  }, [doctors, selectedDoctorKey]);

  const selectedDoctor = selectedDoctorObj?.id || null;

  // Filter doctors by specialty
  const specialtiesList = useMemo(() => {
    const set = new Set<string>();
    doctors.forEach((d) => {
      if (d.specialization) set.add(d.specialization);
    });
    return ['All', ...Array.from(set)];
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    if (selectedSpecialty === 'All') return doctors;
    return doctors.filter(
      (d) =>
        d.specialization?.toLowerCase() === selectedSpecialty.toLowerCase() ||
        d.specialization?.toLowerCase().includes(selectedSpecialty.toLowerCase())
    );
  }, [doctors, selectedSpecialty]);

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
      setValidationError('Please select an appointment date.');
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
      const clientIso = new Date(`${date}T${time}:00`).toISOString();
      const result = await bookAppointmentAction({
        doctorId: selectedDoctor,
        date,
        time,
        startTimeIso: clientIso,
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
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {filteredDoctors.length} Available
            </span>
          </div>

          {/* Specialty Filter Strip */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {specialtiesList.map((spec) => {
              const active = selectedSpecialty === spec;
              return (
                <button
                  type="button"
                  key={spec}
                  onClick={() => {
                    setSelectedSpecialty(spec);
                    const matching =
                      spec === 'All'
                        ? doctors
                        : doctors.filter((d) => d.specialization?.toLowerCase().includes(spec.toLowerCase()));
                    if (matching.length > 0 && !matching.some((m) => m.uniqueKey === selectedDoctorKey || m.id === selectedDoctor)) {
                      setSelectedDoctorKey(matching[0].uniqueKey || matching[0].id);
                      setTime('');
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap ${
                    active
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {spec}
                </button>
              );
            })}
          </div>

          {/* Doctor List */}
          <div className="space-y-3">
            {filteredDoctors.map((doc, idx) => {
              const isSelected = selectedDoctorKey === doc.uniqueKey || (!selectedDoctorKey && idx === 0);
              const fee = doc.hourly_rate ? Number(doc.hourly_rate) : 499;
              const avatarColor = doc.avatarColor || 'from-teal-600 to-sky-600';

              return (
                <div
                  key={doc.uniqueKey || `${doc.id}-${idx}`}
                  onClick={() => {
                    setSelectedDoctorKey(doc.uniqueKey || doc.id);
                    setTime('');
                    setValidationError(null);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-teal-600 bg-gradient-to-r from-teal-50/80 to-sky-50/50 ring-2 ring-teal-500/30 shadow-md'
                      : 'border-slate-200 bg-white hover:border-teal-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-xs bg-gradient-to-tr ${avatarColor} flex-shrink-0`}
                      >
                        {doc.profiles?.full_name
                          ?.replace('Dr.', '')
                          .trim()
                          .split(' ')
                          .map((n: string, i: number) => (i <= 1 ? n[0] : ''))
                          .join('') || 'DR'}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-bold text-slate-900 text-sm">
                            {doc.profiles?.full_name || 'Dr. Specialist'}
                          </p>
                          <CheckCircle2 size={15} className="text-teal-600 flex-shrink-0" />
                          {doc.category === 'previous' ? (
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-semibold px-2 py-0.5 rounded-full">
                              Previous Doctor
                            </span>
                          ) : (
                            <span className="text-[10px] bg-sky-50 text-sky-700 border border-sky-200/80 font-semibold px-2 py-0.5 rounded-full">
                              Featured Specialist
                            </span>
                          )}
                          {isSelected && (
                            <span className="text-[10px] bg-teal-600 text-white font-semibold px-2 py-0.5 rounded-full">
                              Selected
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-teal-700 font-semibold">{doc.specialization}</p>
                        {doc.degrees && (
                          <p className="text-[11px] text-slate-500 truncate max-w-[200px]">
                            {doc.degrees} {doc.hospital ? `• ${doc.hospital}` : ''}
                          </p>
                        )}
                        <div className="flex items-center gap-2 pt-0.5 text-[11px]">
                          {doc.rating && (
                            <span className="flex items-center gap-0.5 font-bold text-amber-600">
                              <Star size={11} className="fill-amber-400 text-amber-500" /> {doc.rating.toFixed(1)}
                            </span>
                          )}
                          {doc.experience && <span className="text-slate-400">• {doc.experience}</span>}
                        </div>
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
                </div>
              </div>

              {/* Horizontal Scrollable Date Strip */}
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => handleScroll('left')}
                  className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow-md border border-slate-200 text-slate-600 hover:text-teal-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  aria-label="Scroll left"
                >
                  <ChevronLeft size={18} />
                </button>

                <div
                  ref={scrollContainerRef}
                  className="flex gap-2.5 overflow-x-auto pb-2 pt-1 px-1 scroll-smooth scrollbar-none"
                >
                  {dayList.map((item) => {
                    const isSelected = date === item.dateStr;
                    const isSunday = item.isSunday;

                    return (
                      <button
                        type="button"
                        key={item.dateStr}
                        disabled={isSunday}
                        onClick={() => {
                          if (!isSunday) {
                            setDate(item.dateStr);
                            setTime('');
                            setValidationError(null);
                          }
                        }}
                        className={`flex-shrink-0 w-20 py-3 px-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-teal-600 text-white border-teal-600 shadow-md ring-2 ring-teal-400/30'
                            : isSunday
                            ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed opacity-50'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-teal-400 hover:bg-teal-50/40 hover:shadow-xs'
                        }`}
                        title={isSunday ? 'Clinic closed on Sundays (BVA Boundary)' : item.dateStr}
                      >
                        <span className={`text-[11px] font-semibold uppercase ${
                          isSelected ? 'text-teal-100' : isSunday ? 'text-slate-300' : 'text-slate-400'
                        }`}>
                          {item.label}
                        </span>
                        <span className="text-xl font-extrabold my-0.5">
                          {item.dayNum}
                        </span>
                        <span className={`text-[10px] font-medium ${
                          isSelected ? 'text-teal-100' : isSunday ? 'text-slate-300' : 'text-slate-400'
                        }`}>
                          {item.monthName}
                        </span>
                        {isSunday && (
                          <span className="text-[9px] font-bold text-rose-400 mt-0.5">Closed</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => handleScroll('right')}
                  className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow-md border border-slate-200 text-slate-600 hover:text-teal-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  aria-label="Scroll right"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 mt-2 px-1">
                <span>* Sundays closed per STQA Clinic Boundary (TC-DATE-09)</span>
                <span>Max 30 days advance booking</span>
              </div>
            </div>

            {/* Step 3: Categorized Morning / Afternoon Slots */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="text-teal-600 w-5 h-5" /> 3. Select Consultation Slot
                </h2>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Available
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span> Booked / Elapsed
                  </span>
                </div>
              </div>

              {!date ? (
                <div className="p-8 text-center text-slate-400 border border-dashed rounded-xl bg-slate-50/50">
                  <Calendar className="mx-auto w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-sm">Please select an appointment date above to view slots</p>
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
                              <span
                                className={`text-[10px] font-medium mt-0.5 ${
                                  isSelected ? 'text-teal-100' : 'text-emerald-700'
                                }`}
                              >
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
                              <span
                                className={`text-[10px] font-medium mt-0.5 ${
                                  isSelected ? 'text-teal-100' : 'text-emerald-700'
                                }`}
                              >
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
                    <span className="text-slate-500">
                      {' '}
                      • {formatTimeSlot(time)} on{' '}
                      {new Date(date + 'T00:00:00').toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
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

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 max-w-5xl mx-auto flex items-center justify-center min-h-[400px] text-slate-500 gap-3">
          <Loader2 className="animate-spin text-teal-600" size={24} />
          <span>Loading appointment scheduler...</span>
        </div>
      }
    >
      <BookingPageContent />
    </Suspense>
  );
}
