/**
 * Doctor Schedule and Appointment Boundary Validation Rules
 * Subject: Software Testing and Quality Assurance (STQA)
 * Techniques: Boundary Value Analysis (BVA) & Equivalence Partitioning (EP)
 */

export interface ScheduleSlot {
  time: string; // "09:00"
  label: string; // "09:00 AM"
  isAvailable?: boolean;
}

export const CLINIC_CONFIG = {
  START_HOUR: 9, // 09:00 AM
  END_HOUR: 17, // 05:00 PM (17:00)
  SLOT_INTERVAL_MINUTES: 30,
  LUNCH_BREAK_START: '13:00',
  LUNCH_BREAK_END: '14:00',
  MAX_ADVANCE_DAYS: 30,
  CLOSED_DAYS: [0], // 0 = Sunday
};

/**
 * Generate standard clinic appointment slots for a given working day.
 */
export function getStandardTimeSlots(): string[] {
  const slots: string[] = [];
  for (let hour = CLINIC_CONFIG.START_HOUR; hour < CLINIC_CONFIG.END_HOUR; hour++) {
    for (let min = 0; min < 60; min += CLINIC_CONFIG.SLOT_INTERVAL_MINUTES) {
      const timeStr = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
      // Exclude lunch break 1:00 PM to 2:00 PM
      if (timeStr >= CLINIC_CONFIG.LUNCH_BREAK_START && timeStr < CLINIC_CONFIG.LUNCH_BREAK_END) {
        continue;
      }
      slots.push(timeStr);
    }
  }
  return slots;
}

export function formatTimeSlot(timeStr: string): string {
  const [hourStr, minStr] = timeStr.split(':');
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${String(hour).padStart(2, '0')}:${minStr} ${ampm}`;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  code?: 'PAST_DATE' | 'PAST_TIME' | 'SUNDAY_CLOSED' | 'EXCEEDS_MAX_WINDOW' | 'OUTSIDE_HOURS' | 'INVALID_SLOT' | 'DUPLICATE_DOCTOR' | 'DUPLICATE_PATIENT';
}

/**
 * Validates date and time boundaries according to Boundary Value Analysis (BVA).
 * @param dateStr "YYYY-MM-DD"
 * @param timeStr "HH:MM"
 * @param now Reference date for testing (defaults to current system time)
 */
export function validateDateTimeBoundary(dateStr: string, timeStr: string, now: Date = new Date()): ValidationResult {
  if (!dateStr || !timeStr) {
    return { valid: false, error: 'Date and time are required', code: 'INVALID_SLOT' };
  }

  // Parse target date and time
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);

  if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hours) || isNaN(minutes)) {
    return { valid: false, error: 'Invalid date or time format', code: 'INVALID_SLOT' };
  }

  const selectedDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);

  // 1. Boundary: Date/time cannot be in the past
  if (selectedDateTime.getTime() < now.getTime()) {
    const todayZero = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const selectedDateZero = new Date(year, month - 1, day);
    if (selectedDateZero < todayZero) {
      return { valid: false, error: 'Cannot book appointments for past dates', code: 'PAST_DATE' };
    }
    return { valid: false, error: 'Cannot book an appointment time that has already passed today', code: 'PAST_TIME' };
  }

  // 2. Boundary: Cannot book on Sundays
  if (selectedDateTime.getDay() === 0) {
    return { valid: false, error: 'Clinic is closed on Sundays. Please select Monday to Saturday.', code: 'SUNDAY_CLOSED' };
  }

  // 3. Boundary: Maximum advance booking window (30 days from now)
  const maxAllowedDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + CLINIC_CONFIG.MAX_ADVANCE_DAYS, 23, 59, 59);
  if (selectedDateTime > maxAllowedDate) {
    return { valid: false, error: `Appointments can only be booked up to ${CLINIC_CONFIG.MAX_ADVANCE_DAYS} days in advance`, code: 'EXCEEDS_MAX_WINDOW' };
  }

  // 4. Boundary: Operating hours (09:00 AM to 05:00 PM)
  const timeMinutes = hours * 60 + minutes;
  const startMinutes = CLINIC_CONFIG.START_HOUR * 60;
  const endMinutes = CLINIC_CONFIG.END_HOUR * 60;

  if (timeMinutes < startMinutes || timeMinutes >= endMinutes) {
    return { valid: false, error: 'Appointments must be scheduled during clinic hours (09:00 AM to 05:00 PM)', code: 'OUTSIDE_HOURS' };
  }

  // 5. Boundary: Lunch break (13:00 to 14:00)
  if (hours === 13) {
    return { valid: false, error: 'Clinic is closed for lunch break between 01:00 PM and 02:00 PM', code: 'OUTSIDE_HOURS' };
  }

  // 6. Boundary: 30-minute interval check (Equivalence Partitioning: min must be 0 or 30)
  if (minutes !== 0 && minutes !== 30) {
    return { valid: false, error: 'Appointments must be booked in 30-minute intervals (:00 or :30)', code: 'INVALID_SLOT' };
  }

  return { valid: true };
}

export interface ExistingAppointmentSlot {
  doctor_id: string;
  patient_id: string;
  start_time: string; // ISO string
  status: string; // 'scheduled' | 'cancelled' | 'completed'
}

/**
 * Validates that an appointment does not cause duplicate/double-booking conflicts.
 */
export function validateDuplicateAppointment(
  doctorId: string,
  patientId: string,
  startTimeIso: string,
  existingAppointments: ExistingAppointmentSlot[]
): ValidationResult {
  const targetTime = new Date(startTimeIso).getTime();

  for (const apt of existingAppointments) {
    // Only active 'scheduled' appointments block a slot
    if (apt.status !== 'scheduled') {
      continue;
    }

    const aptTime = new Date(apt.start_time).getTime();
    if (aptTime === targetTime) {
      if (apt.doctor_id === doctorId) {
        return {
          valid: false,
          error: 'Doctor is already booked for this time slot. Please select another time or doctor.',
          code: 'DUPLICATE_DOCTOR'
        };
      }
      if (apt.patient_id === patientId) {
        return {
          valid: false,
          error: 'You already have an appointment scheduled at this exact date and time.',
          code: 'DUPLICATE_PATIENT'
        };
      }
    }
  }

  return { valid: true };
}
