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
  category?: 'previous' | 'featured';
  loginEmail?: string;
}

/**
 * PREVIOUS DOCTORS (Active Real Database Accounts with Live Video Call Credentials)
 */
export const PREVIOUS_DOCTORS: DoctorProfile[] = [
  {
    id: '36f52f6f-5360-4477-afb6-a01b3ea949e9',
    name: 'Dr. Shrisai',
    degrees: 'MBBS, MD (General Medicine)',
    specialization: 'General Physician',
    experience: '12+ yrs experience',
    rating: 4.9,
    reviews: 840,
    fee: 499,
    availability: 'Available Today',
    hospital: 'HealthConnect Medical Center',
    avatarColor: 'from-teal-500 to-emerald-600',
    category: 'previous',
    loginEmail: 'bandalshrisai@gmail.com',
  },
  {
    id: 'cf9c2a1f-ca70-4804-85f5-0167221aa2e9',
    name: 'Dr. Aniket',
    degrees: 'MBBS, MS (General Surgery)',
    specialization: 'Senior Specialist',
    experience: '10+ yrs experience',
    rating: 5.0,
    reviews: 920,
    fee: 599,
    availability: 'Next: 11:00 AM',
    hospital: 'HealthConnect Care Clinic',
    avatarColor: 'from-sky-500 to-blue-600',
    category: 'previous',
    loginEmail: 'doctor@test.com',
  },
  {
    id: '98432a1f-953c-4f7b-acf9-44185c02afa1',
    name: 'Dr. Neha Waghole',
    degrees: 'MBBS, DNB (Medicine)',
    specialization: 'Consultant Physician',
    experience: '8+ yrs experience',
    rating: 4.8,
    reviews: 610,
    fee: 499,
    availability: 'Available Today',
    hospital: 'HealthConnect Specialist Clinic',
    avatarColor: 'from-indigo-500 to-purple-600',
    category: 'previous',
    loginEmail: 'nehawaghole@gmail.com',
  },
  {
    id: '8bec5553-c3fa-46d3-9dfc-0a0d7a306a09',
    name: 'Dr. Shrisai Bandal',
    degrees: 'MBBS, MD, FICM',
    specialization: 'Senior Consultant & Clinical Director',
    experience: '15+ yrs experience',
    rating: 5.0,
    reviews: 1250,
    fee: 799,
    availability: 'Available Today',
    hospital: 'HealthConnect SuperSpecialty',
    avatarColor: 'from-emerald-500 to-teal-700',
    category: 'previous',
    loginEmail: 'shrisaibandal@gmail.com',
  },
];

/**
 * FEATURED CLINICAL SPECIALISTS (Expert Network)
 */
export const FEATURED_SPECIALISTS: DoctorProfile[] = [
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
    avatarColor: 'from-teal-600 to-emerald-700',
    category: 'featured',
    loginEmail: 'bandalshrisai@gmail.com',
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
    avatarColor: 'from-sky-600 to-blue-700',
    category: 'featured',
    loginEmail: 'doctor@test.com',
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
    avatarColor: 'from-indigo-600 to-purple-700',
    category: 'featured',
    loginEmail: 'nehawaghole@gmail.com',
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
    avatarColor: 'from-emerald-600 to-teal-800',
    category: 'featured',
    loginEmail: 'shrisaibandal@gmail.com',
  },
];

/**
 * Combined list: Previous real database doctors are preserved first,
 * followed by featured specialist cards.
 */
export const FEATURED_DOCTORS: DoctorProfile[] = [
  ...PREVIOUS_DOCTORS,
  ...FEATURED_SPECIALISTS,
];

export function getDoctorById(id: string): DoctorProfile | undefined {
  return FEATURED_DOCTORS.find((d) => d.id === id);
}

export function getDoctorName(id: string, fallbackName?: string): string {
  const doc = getDoctorById(id);
  if (doc) return doc.name;
  return fallbackName || 'Dr. Medical Specialist';
}
