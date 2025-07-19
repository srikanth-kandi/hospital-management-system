export interface User {
  id: string;
  name: string;
  email: string;
  role: 'hospital_admin' | 'doctor' | 'patient';
  gender?: string;
  dob?: string;
  unique_id?: string;
  qualifications?: string;
  specializations?: string[];
  experience?: number;
  created_at: string;
  updated_at: string;
}

export interface Hospital {
  id: string;
  name: string;
  location: string;
  created_by: string;
  admin?: User;
  departments?: Department[];
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  name: string;
  hospital_id: string;
  hospital?: Hospital;
  created_at: string;
  updated_at: string;
}

export interface DoctorHospital {
  id: string;
  doctor_id: string;
  hospital_id: string;
  consultation_fee: number;
  doctor?: User;
  hospital?: Hospital;
  created_at: string;
  updated_at: string;
}

export interface Availability {
  id: string;
  doctor_id: string;
  hospital_id: string;
  start_time: string;
  end_time: string;
  date: string;
  doctor?: User;
  hospital?: Hospital;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  hospital_id: string;
  appointment_time: string;
  amount_paid: number;
  patient?: User;
  doctor?: User;
  hospital?: Hospital;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'hospital_admin' | 'doctor' | 'patient';
  gender?: string;
  dob?: string;
  unique_id?: string;
  qualifications?: string;
  specializations?: string[];
  experience?: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface HospitalDashboard {
  totalConsultations: number;
  totalRevenue: number;
  associatedDoctors: number;
  departmentsCount: number;
}

export interface DoctorDashboard {
  doctor: {
    id: string;
    name: string;
    email: string;
    specializations: string[];
    qualifications: string;
    experience: number;
  };
  statistics: {
    totalConsultations: number;
    totalEarnings: number;
    associatedHospitals: number;
  };
  recentAppointments: Array<{
    id: string;
    appointment_time: string;
    amount_paid: number;
    hospital_name: string;
    patient_name: string;
  }>;
  monthlyEarnings: Array<{
    month: string;
    earnings: number;
  }>;
}

// Type for hospital doctors API response (flattened structure)
export interface HospitalDoctor extends User {
  consultation_fee: number;
} 