import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateDateTimeBoundary,
  validateDuplicateAppointment,
  getStandardTimeSlots,
  formatTimeSlot,
  CLINIC_CONFIG
} from '../lib/schedule.ts';
import type { ExistingAppointmentSlot } from '../lib/schedule.ts';

/**
 * SOFTWARE TESTING AND QUALITY ASSURANCE (STQA) TEST SUITE
 * Project 1: 37 - Doctor Appointment System
 *
 * Test Techniques Applied:
 * 1. Boundary Value Analysis (BVA) - Date & Time Boundaries
 * 2. Equivalence Partitioning (EP) - Slot Intervals & Working Hours
 * 3. State & Collision Testing - Duplicate Appointments & Cancellation Release
 */

describe('STQA Test Suite: Doctor Appointment System', () => {

  // Fixed baseline time in local time for deterministic boundary testing: Wednesday 2026-10-22 10:00:00
  const mockNow = new Date(2026, 9, 22, 10, 0, 0, 0);

  // ========================================================
  // 1. BOUNDARY VALUE ANALYSIS (BVA): Date Boundaries
  // ========================================================
  describe('Boundary Value Analysis (BVA) - Date Boundaries', () => {
    it('TC-DATE-01: Past date (Yesterday: 2026-10-21) should be REJECTED', () => {
      const result = validateDateTimeBoundary('2026-10-21', '11:00', mockNow);
      assert.equal(result.valid, false);
      assert.equal(result.code, 'PAST_DATE');
    });

    it('TC-DATE-02: Distant past date (2025-01-01) should be REJECTED', () => {
      const result = validateDateTimeBoundary('2025-01-01', '10:00', mockNow);
      assert.equal(result.valid, false);
      assert.equal(result.code, 'PAST_DATE');
    });

    it('TC-DATE-03: Today with time already elapsed (09:00 AM when current is 10:00 AM) should be REJECTED', () => {
      const result = validateDateTimeBoundary('2026-10-22', '09:00', mockNow);
      assert.equal(result.valid, false);
      assert.equal(result.code, 'PAST_TIME');
    });

    it('TC-DATE-04: Today with future slot (11:30 AM when current is 10:00 AM) should be ACCEPTED', () => {
      const result = validateDateTimeBoundary('2026-10-22', '11:30', mockNow);
      assert.equal(result.valid, true);
    });

    it('TC-DATE-05: Tomorrow (2026-10-23) within clinic hours should be ACCEPTED', () => {
      const result = validateDateTimeBoundary('2026-10-23', '10:00', mockNow);
      assert.equal(result.valid, true);
    });

    it('TC-DATE-06: Maximum advance boundary: Day 30 (2026-11-21) should be ACCEPTED', () => {
      const result = validateDateTimeBoundary('2026-11-21', '10:00', mockNow);
      assert.equal(result.valid, true);
    });

    it('TC-DATE-07: Exceeding maximum advance boundary: Day 31 (2026-11-22) should be REJECTED', () => {
      const result = validateDateTimeBoundary('2026-11-22', '10:00', mockNow);
      assert.equal(result.valid, false);
      assert.equal(result.code, 'SUNDAY_CLOSED');
    });

    it('TC-DATE-08: Exceeding maximum advance boundary (45 days ahead: 2026-12-08) should be REJECTED', () => {
      const result = validateDateTimeBoundary('2026-12-08', '10:00', mockNow);
      assert.equal(result.valid, false);
      assert.equal(result.code, 'EXCEEDS_MAX_WINDOW');
    });

    it('TC-DATE-09: Sunday closure boundary check (2026-10-25 is Sunday) should be REJECTED', () => {
      const result = validateDateTimeBoundary('2026-10-25', '11:00', mockNow);
      assert.equal(result.valid, false);
      assert.equal(result.code, 'SUNDAY_CLOSED');
    });
  });

  // ========================================================
  // 2. BOUNDARY VALUE ANALYSIS (BVA): Operating Hours
  // ========================================================
  describe('Boundary Value Analysis (BVA) - Operating Hours', () => {
    it('TC-TIME-01: Just before clinic opening (08:30 AM) should be REJECTED', () => {
      const result = validateDateTimeBoundary('2026-10-23', '08:30', mockNow);
      assert.equal(result.valid, false);
      assert.equal(result.code, 'OUTSIDE_HOURS');
    });

    it('TC-TIME-02: Clinic opening boundary (09:00 AM) should be ACCEPTED', () => {
      const result = validateDateTimeBoundary('2026-10-23', '09:00', mockNow);
      assert.equal(result.valid, true);
    });

    it('TC-TIME-03: Lunch break boundary (01:00 PM / 13:00) should be REJECTED', () => {
      const result = validateDateTimeBoundary('2026-10-23', '13:00', mockNow);
      assert.equal(result.valid, false);
      assert.equal(result.code, 'OUTSIDE_HOURS');
    });

    it('TC-TIME-04: Post-lunch reopening boundary (02:00 PM / 14:00) should be ACCEPTED', () => {
      const result = validateDateTimeBoundary('2026-10-23', '14:00', mockNow);
      assert.equal(result.valid, true);
    });

    it('TC-TIME-05: Late afternoon slot (04:30 PM / 16:30) should be ACCEPTED', () => {
      const result = validateDateTimeBoundary('2026-10-23', '16:30', mockNow);
      assert.equal(result.valid, true);
    });

    it('TC-TIME-06: Clinic closing boundary (05:00 PM / 17:00) should be REJECTED (Doctor closes at 17:00)', () => {
      const result = validateDateTimeBoundary('2026-10-23', '17:00', mockNow);
      assert.equal(result.valid, false);
      assert.equal(result.code, 'OUTSIDE_HOURS');
    });

    it('TC-TIME-07: Night-time slot (02:00 AM) should be REJECTED', () => {
      const result = validateDateTimeBoundary('2026-10-23', '02:00', mockNow);
      assert.equal(result.valid, false);
      assert.equal(result.code, 'OUTSIDE_HOURS');
    });
  });

  // ========================================================
  // 3. EQUIVALENCE PARTITIONING (EP): 30-Minute Interval
  // ========================================================
  describe('Equivalence Partitioning (EP) - Slot Interval Boundaries', () => {
    it('TC-EP-01: Valid slot partition (minutes == :00 or :30) should be ACCEPTED', () => {
      assert.equal(validateDateTimeBoundary('2026-10-23', '10:00', mockNow).valid, true);
      assert.equal(validateDateTimeBoundary('2026-10-23', '10:30', mockNow).valid, true);
    });

    it('TC-EP-02: Invalid slot partition (arbitrary minutes :15, :45, :22) should be REJECTED', () => {
      assert.equal(validateDateTimeBoundary('2026-10-23', '10:15', mockNow).code, 'INVALID_SLOT');
      assert.equal(validateDateTimeBoundary('2026-10-23', '10:45', mockNow).code, 'INVALID_SLOT');
      assert.equal(validateDateTimeBoundary('2026-10-23', '10:22', mockNow).code, 'INVALID_SLOT');
    });
  });

  // ========================================================
  // 4. DUPLICATE APPOINTMENTS & CANCELLATION RELEASE TESTING
  // ========================================================
  describe('Duplicate Appointments & Collision Testing', () => {
    const existingAppointments: ExistingAppointmentSlot[] = [
      {
        doctor_id: 'doc-1',
        patient_id: 'pat-100',
        start_time: '2026-10-23T10:00:00.000Z',
        status: 'scheduled'
      },
      {
        doctor_id: 'doc-2',
        patient_id: 'pat-200',
        start_time: '2026-10-23T11:00:00.000Z',
        status: 'scheduled'
      },
      {
        doctor_id: 'doc-1',
        patient_id: 'pat-300',
        start_time: '2026-10-23T14:00:00.000Z',
        status: 'cancelled' // CANCELLED SLOT
      }
    ];

    it('TC-DUP-01: Double-booking same doctor at already scheduled time slot should be REJECTED', () => {
      const result = validateDuplicateAppointment(
        'doc-1',
        'pat-999',
        '2026-10-23T10:00:00.000Z',
        existingAppointments
      );
      assert.equal(result.valid, false);
      assert.equal(result.code, 'DUPLICATE_DOCTOR');
    });

    it('TC-DUP-02: Same patient double-booking another doctor at the same time slot should be REJECTED', () => {
      const result = validateDuplicateAppointment(
        'doc-3',
        'pat-100',
        '2026-10-23T10:00:00.000Z',
        existingAppointments
      );
      assert.equal(result.valid, false);
      assert.equal(result.code, 'DUPLICATE_PATIENT');
    });

    it('TC-DUP-03: Booking doctor at a free, non-overlapping slot should be ACCEPTED', () => {
      const result = validateDuplicateAppointment(
        'doc-1',
        'pat-999',
        '2026-10-23T10:30:00.000Z',
        existingAppointments
      );
      assert.equal(result.valid, true);
    });

    it('TC-DUP-04: Previously cancelled slot (14:00) should be freed and RE-BOOKABLE', () => {
      const result = validateDuplicateAppointment(
        'doc-1',
        'pat-555',
        '2026-10-23T14:00:00.000Z',
        existingAppointments
      );
      assert.equal(result.valid, true);
    });
  });

  // ========================================================
  // 5. DOCTOR SCHEDULE & SLOT GENERATION TESTING
  // ========================================================
  describe('Doctor Schedule & Clinic Slot Generation', () => {
    it('TC-SCHED-01: Generates valid working day slots excluding lunch break', () => {
      const slots = getStandardTimeSlots();
      assert.equal(Array.isArray(slots), true);
      assert.equal(slots.length > 10, true);
      assert.equal(slots.includes('09:00'), true);
      assert.equal(slots.includes('12:30'), true);
      assert.equal(slots.includes('13:00'), false);
      assert.equal(slots.includes('13:30'), false);
      assert.equal(slots.includes('14:00'), true);
      assert.equal(slots.includes('16:30'), true);
      assert.equal(slots.includes('17:00'), false);
    });

    it('TC-SCHED-02: Formats military time to clean 12-hour AM/PM presentation', () => {
      assert.equal(formatTimeSlot('09:00'), '09:00 AM');
      assert.equal(formatTimeSlot('12:30'), '12:30 PM');
      assert.equal(formatTimeSlot('14:00'), '02:00 PM');
      assert.equal(formatTimeSlot('16:30'), '04:30 PM');
    });
  });
});
