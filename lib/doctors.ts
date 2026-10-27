export interface DoctorProfile {
  id: string;
  name: string;
  degrees: string;
  specialization: string;
  experience: string;
  rating: number;
  reviews: number;
  fee: number;
  availability: string;
  hospital: string;
  avatarColor: string;
}

export const FEATURED_DOCTORS: DoctorProfile[] = [
  {
    id: '36f52f6f-5360-4477-afb6-a01b3ea949e9',
    name: 'Dr. Priya Sharma',
    degrees: 'MBBS, MD (Medicine)',
    specialization: 'General Physician',
    experience: '12+ yrs experience',
    rating: 4.9,
    reviews: 840,
    fee: 499,
    availability: 'Available Today',
    hospital: 'Ex-AIIMS New Delhi',
    avatarColor: 'from-teal-500 to-emerald-600',
  },
  {
    id: 'cf9c2a1f-ca70-4804-85f5-0167221aa2e9',
    name: 'Dr. Rajesh Verma',
    degrees: 'MBBS, DM (Cardiology)',
    specialization: 'Senior Cardiologist',
    experience: '15+ yrs experience',
    rating: 5.0,
    reviews: 1120,
    fee: 899,
    availability: 'Next: 10:30 AM',
    hospital: 'Fortis Escorts Heart Inst.',
    avatarColor: 'from-sky-500 to-blue-600',
  },
  {
    id: '98432a1f-953c-4f7b-acf9-44185c02afa1',
    name: 'Dr. Ananya Iyer',
    degrees: 'MBBS, MD (Dermatology)',
    specialization: 'Consultant Dermatologist',
    experience: '9+ yrs experience',
    rating: 4.8,
    reviews: 620,
    fee: 699,
    availability: 'Available Today',
    hospital: 'Apollo Hospitals',
    avatarColor: 'from-indigo-500 to-purple-600',
  },
  {
    id: '8bec5553-c3fa-46d3-9dfc-0a0d7a306a09',
    name: 'Dr. Rohan Kulkarni',
    degrees: 'MBBS, DCH (Pediatrics)',
    specialization: 'Specialist Pediatrician',
    experience: '11+ yrs experience',
    rating: 4.9,
    reviews: 750,
    fee: 549,
    availability: 'Next: 02:00 PM',
    hospital: 'Manipal Children’s Clinic',
    avatarColor: 'from-emerald-500 to-teal-700',
  },
];

export function getDoctorById(id: string): DoctorProfile | undefined {
  return FEATURED_DOCTORS.find((d) => d.id === id);
}

export function getDoctorName(id: string, fallbackName?: string): string {
  const doc = getDoctorById(id);
  if (doc) return doc.name;
  return fallbackName || 'Dr. Medical Specialist';
}
