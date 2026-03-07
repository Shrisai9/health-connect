export type Role = 'patient' | 'doctor' | 'admin';

export type AppointmentStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  avatar_url?: string;
  created_at: string;
}

export interface Doctor extends Profile {
  specialization: string;
  hourly_rate: number;
  bio: string;
  availability_json: Record<string, string[]>; // e.g., { "mon": ["09:00", "10:00"] }
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  start_time: string;
  status: AppointmentStatus;
  meeting_token?: string;
  created_at: string;
  // Joins
  doctor?: Doctor;
  patient?: Profile;
}

export interface Prescription {
  id: string;
  appointment_id: string;
  encrypted_data: string;
  iv: string;
  created_at: string;
}