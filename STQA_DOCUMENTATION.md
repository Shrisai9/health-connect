# Software Testing and Quality Assurance (STQA) Project Report

## Project 1: 37 - Doctor Appointment System
* **Subject:** Software Testing and Quality Assurance (STQA)
* **Application Name:** HealthConnect
* **Repository:** [https://github.com/Shrisai9/health-connect](https://github.com/Shrisai9/health-connect)
* **Stack:** Next.js 14 (App Router), TypeScript, Supabase, Tailwind CSS, Node.js Test Runner
* **Testing Techniques Applied:**
  1. **Boundary Value Analysis (BVA)**
  2. **Equivalence Partitioning (EP)**
  3. **State Transition & Collision Testing (Duplicate Prevention & Cancellation)**

---

## 1. Requirement Traceability Matrix

| Requirement from Syllabus | Implementation in HealthConnect | STQA Test Case ID | Test Result |
| :--- | :--- | :--- | :---: |
| **Doctor Schedules** | Working hours (09:00 AM – 05:00 PM), 30-minute consultation slots, lunch break exclusion (01:00 PM – 02:00 PM), doctor dashboard quota & statistics card. | `TC-SCHED-01`, `TC-SCHED-02` | **PASS** |
| **Patient Booking** | Validated booking interface with real-time slot selection, doctor directory integration, and advance booking window. | `TC-DATE-04`, `TC-DATE-05`, `TC-DATE-06` | **PASS** |
| **Appointment Cancellation** | Dedicated cancellation server action and interactive cancel buttons for both patient and doctor; frees the booked time slot. | `TC-DUP-04` | **PASS** |
| **Date/Time Boundary Testing** | Disallows past dates ($Date < Today$), past times for today, Sunday closure, and appointments beyond 30 days advance limit. Clinic hours ($09:00 \le Time < 17:00$). | `TC-DATE-01` to `TC-DATE-09`, `TC-TIME-01` to `TC-TIME-07` | **PASS** |
| **Duplicate Appointments Testing** | Validates against concurrent double-booking of doctors and prevents overlapping appointments for patients. | `TC-DUP-01`, `TC-DUP-02`, `TC-DUP-03` | **PASS** |

---

## 2. Boundary Value Analysis (BVA) Matrix

### A. Date Boundaries (Reference: Today = 2026-10-22, Min = Today, Max = Today + 30 Days)

| Test ID | Boundary Condition | Input Date Tested | Boundary Class | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| `TC-DATE-01` | Yesterday (Past Date) | `2026-10-21` | $Date < Today$ (Invalid) | Rejected (`PAST_DATE`) | Rejected (`PAST_DATE`) | **PASS** |
| `TC-DATE-02` | Distant Past | `2025-01-01` | $Date \ll Today$ (Invalid) | Rejected (`PAST_DATE`) | Rejected (`PAST_DATE`) | **PASS** |
| `TC-DATE-03` | Today with elapsed time | `2026-10-22 09:00` | $Time < Now$ (Invalid) | Rejected (`PAST_TIME`) | Rejected (`PAST_TIME`) | **PASS** |
| `TC-DATE-04` | Today with future slot | `2026-10-22 11:30` | $Time \ge Now$ (Valid) | Accepted | Accepted | **PASS** |
| `TC-DATE-05` | Tomorrow | `2026-10-23 10:00` | Nominal Future (Valid) | Accepted | Accepted | **PASS** |
| `TC-DATE-06` | Day 30 (Max Boundary) | `2026-11-21 10:00` | $Date = Today + 30$ (Valid) | Accepted | Accepted | **PASS** |
| `TC-DATE-07` | Day 31 (Above Boundary) | `2026-11-22 10:00` | $Date = Today + 31$ (Invalid) | Rejected (`SUNDAY_CLOSED` / `EXCEEDS_MAX_WINDOW`) | Rejected | **PASS** |
| `TC-DATE-08` | 45 Days Ahead | `2026-12-08 10:00` | $Date > Today + 30$ (Invalid) | Rejected (`EXCEEDS_MAX_WINDOW`) | Rejected (`EXCEEDS_MAX_WINDOW`) | **PASS** |
| `TC-DATE-09` | Sunday Closure | `2026-10-25 11:00` | Sunday (Closed) | Rejected (`SUNDAY_CLOSED`) | Rejected (`SUNDAY_CLOSED`) | **PASS** |

### B. Operating Hours Boundaries (Clinic Hours: 09:00 AM to 05:00 PM)

| Test ID | Boundary Condition | Input Time | Boundary Class | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| `TC-TIME-01` | Pre-opening (08:30 AM) | `08:30` | $Time < 09:00$ (Invalid) | Rejected (`OUTSIDE_HOURS`) | Rejected (`OUTSIDE_HOURS`) | **PASS** |
| `TC-TIME-02` | Clinic Opening (09:00 AM) | `09:00` | Min Operating Hour (Valid) | Accepted | Accepted | **PASS** |
| `TC-TIME-03` | Lunch Break (01:00 PM) | `13:00` | $13:00 \le Time < 14:00$ (Invalid) | Rejected (`OUTSIDE_HOURS`) | Rejected (`OUTSIDE_HOURS`) | **PASS** |
| `TC-TIME-04` | Afternoon Opening (02:00 PM) | `14:00` | Post-Lunch Min (Valid) | Accepted | Accepted | **PASS** |
| `TC-TIME-05` | Late Afternoon (04:30 PM) | `16:30` | Last Valid Slot (Valid) | Accepted | Accepted | **PASS** |
| `TC-TIME-06` | Closing Boundary (05:00 PM) | `17:00` | Doctor Consultation End (Invalid) | Rejected (`OUTSIDE_HOURS`) | Rejected (`OUTSIDE_HOURS`) | **PASS** |
| `TC-TIME-07` | Off-Hour Night (02:00 AM) | `02:00` | Extreme Night Slot (Invalid) | Rejected (`OUTSIDE_HOURS`) | Rejected (`OUTSIDE_HOURS`) | **PASS** |

---

## 3. Equivalence Partitioning (EP) Matrix

| Test ID | Variable Partition | Sample Input | Partition Classification | Expected Output | Actual Output | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| `TC-EP-01` | 30-Minute Interval | `10:00`, `10:30` | Valid Partition (:00 or :30) | Accepted | Accepted | **PASS** |
| `TC-EP-02` | Non-Standard Minutes | `10:15`, `10:45`, `10:22` | Invalid Partition ($\ne :00, :30$) | Rejected (`INVALID_SLOT`) | Rejected (`INVALID_SLOT`) | **PASS** |

---

## 4. Duplicate Appointments & Cancellation Collision Matrix

| Test ID | Scenario Tested | Pre-condition | Action Tested | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| `TC-DUP-01` | Doctor Double-Booking | Dr. A already booked at 10:00 AM | Patient B tries booking Dr. A at 10:00 AM | Rejected (`DUPLICATE_DOCTOR`) | Rejected (`DUPLICATE_DOCTOR`) | **PASS** |
| `TC-DUP-02` | Patient Double-Booking | Patient A booked with Dr. A at 10:00 AM | Patient A tries booking Dr. B at 10:00 AM | Rejected (`DUPLICATE_PATIENT`) | Rejected (`DUPLICATE_PATIENT`) | **PASS** |
| `TC-DUP-03` | Available Slot Booking | Slot 10:30 AM is open | Patient B books Dr. A at 10:30 AM | Accepted | Accepted | **PASS** |
| `TC-DUP-04` | Re-booking Cancelled Slot | Slot 02:00 PM was previously cancelled | New patient books Dr. A at 02:00 PM | Accepted (Slot Freed) | Accepted | **PASS** |

---

## 5. Automated Test Execution Guide

To run the automated STQA test suite directly:

```bash
cd D:\health_connect
npm test
```

### Execution Evidence
```
✔ STQA Test Suite: Doctor Appointment System
  ✔ Boundary Value Analysis (BVA) - Date Boundaries (9 tests)
  ✔ Boundary Value Analysis (BVA) - Operating Hours (7 tests)
  ✔ Equivalence Partitioning (EP) - Slot Interval Boundaries (2 tests)
  ✔ Duplicate Appointments & Collision Testing (4 tests)
  ✔ Doctor Schedule & Clinic Slot Generation (2 tests)

ℹ tests 24
ℹ pass 24
ℹ fail 0
ℹ duration_ms 192ms
```
