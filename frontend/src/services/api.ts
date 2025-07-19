import axios from 'axios';
import { 
  User, 
  Hospital, 
  Department, 
  DoctorHospital, 
  Availability, 
  Appointment, 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  HospitalDashboard, 
  DoctorDashboard,
  HospitalDoctor
} from '../types';

const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (data: LoginRequest): Promise<AuthResponse> =>
    api.post('/users/login', data).then(res => res.data),
  
  register: (data: RegisterRequest): Promise<User> =>
    api.post('/users/register', data).then(res => res.data),
  
  getCurrentUser: (): Promise<User> =>
    api.get('/users/me').then(res => res.data),
};

// Users API
export const usersAPI = {
  getAll: (): Promise<User[]> =>
    api.get('/users').then(res => res.data),
  
  getById: (id: string): Promise<User> =>
    api.get(`/users/${id}`).then(res => res.data),
  
  update: (id: string, data: Partial<User>): Promise<User> =>
    api.put(`/users/${id}`, data).then(res => res.data),
  
  delete: (id: string): Promise<void> =>
    api.delete(`/users/${id}`).then(res => res.data),
  
  getDoctors: (): Promise<User[]> =>
    api.get('/users/doctors').then(res => res.data),
};

// Hospitals API
export const hospitalsAPI = {
  getAll: (): Promise<Hospital[]> =>
    api.get('/hospitals').then(res => res.data),
  
  getById: (id: string): Promise<Hospital> =>
    api.get(`/hospitals/${id}`).then(res => res.data),
  
  create: (data: { name: string; location: string; created_by: string }): Promise<Hospital> =>
    api.post('/hospitals', data).then(res => res.data),
  
  update: (id: string, data: Partial<Hospital>): Promise<Hospital> =>
    api.put(`/hospitals/${id}`, data).then(res => res.data),
  
  delete: (id: string): Promise<void> =>
    api.delete(`/hospitals/${id}`).then(res => res.data),
  
  getDashboard: (id: string): Promise<HospitalDashboard> =>
    api.get(`/hospitals/${id}/dashboard`).then(res => res.data),
  
  getDoctors: (id: string): Promise<HospitalDoctor[]> =>
    api.get(`/hospitals/${id}/doctors`).then(res => res.data),
};

// Departments API
export const departmentsAPI = {
  getAll: (): Promise<Department[]> =>
    api.get('/departments').then(res => res.data),
  
  getById: (id: string): Promise<Department> =>
    api.get(`/departments/${id}`).then(res => res.data),
  
  create: (data: { name: string; hospital_id: string }): Promise<Department> =>
    api.post('/departments', data).then(res => res.data),
  
  update: (id: string, data: Partial<Department>): Promise<Department> =>
    api.put(`/departments/${id}`, data).then(res => res.data),
  
  delete: (id: string): Promise<void> =>
    api.delete(`/departments/${id}`).then(res => res.data),
  
  getByHospital: (hospitalId: string): Promise<Department[]> =>
    api.get(`/departments/hospital/${hospitalId}`).then(res => res.data),
  
  getUniqueNames: (): Promise<any[]> =>
    api.get('/departments/unique-names').then(res => res.data),
};

// Doctors API
export const doctorsAPI = {
  getAll: (): Promise<User[]> =>
    api.get('/doctors').then(res => res.data),
  
  getById: (id: string): Promise<User> =>
    api.get(`/doctors/${id}`).then(res => res.data),
  
  associateWithHospital: (data: { doctor_id: string; hospital_id: string; consultation_fee: number }): Promise<DoctorHospital> =>
    api.post('/doctors/associate', data).then(res => res.data),
  
  getDashboard: (id: string): Promise<DoctorDashboard> =>
    api.get(`/doctors/${id}/dashboard`).then(res => res.data),
  
  getHospitals: (id: string): Promise<DoctorHospital[]> =>
    api.get(`/doctors/${id}/hospitals`).then(res => res.data),
};

// Availability API
export const availabilityAPI = {
  getAll: (): Promise<Availability[]> =>
    api.get('/availability').then(res => res.data),
  
  getById: (id: string): Promise<Availability> =>
    api.get(`/availability/${id}`).then(res => res.data),
  
  create: (data: { doctor_id: string; hospital_id: string; start_time: string; end_time: string; date: string }): Promise<Availability> =>
    api.post('/availability', data).then(res => res.data),
  
  update: (id: string, data: Partial<Availability>): Promise<Availability> =>
    api.put(`/availability/${id}`, data).then(res => res.data),
  
  delete: (id: string): Promise<void> =>
    api.delete(`/availability/${id}`).then(res => res.data),
  
  getByDoctor: (doctorId: string): Promise<Availability[]> =>
    api.get(`/availability/doctor/${doctorId}`).then(res => res.data),
  
  getByHospital: (hospitalId: string): Promise<Availability[]> =>
    api.get(`/availability/hospital/${hospitalId}`).then(res => res.data),
  
  getAvailableSlots: (doctorId: string, hospitalId: string, date: string): Promise<Availability[]> =>
    api.get(`/availability/available/${doctorId}/${hospitalId}/${date}`).then(res => res.data),
};

// Appointments API
export const appointmentsAPI = {
  getAll: (): Promise<Appointment[]> =>
    api.get('/appointments').then(res => res.data),
  
  getById: (id: string): Promise<Appointment> =>
    api.get(`/appointments/${id}`).then(res => res.data),
  
  create: (data: { patient_id: string; doctor_id: string; hospital_id: string; appointment_time: string; amount_paid: number }): Promise<Appointment> =>
    api.post('/appointments', data).then(res => res.data),
  
  update: (id: string, data: Partial<Appointment>): Promise<Appointment> =>
    api.put(`/appointments/${id}`, data).then(res => res.data),
  
  delete: (id: string): Promise<void> =>
    api.delete(`/appointments/${id}`).then(res => res.data),
  
  getByPatient: (patientId: string): Promise<Appointment[]> =>
    api.get(`/appointments/patient/${patientId}`).then(res => res.data),
  
  getByDoctor: (doctorId: string): Promise<Appointment[]> =>
    api.get(`/appointments/doctor/${doctorId}`).then(res => res.data),
  
  getByHospital: (hospitalId: string): Promise<Appointment[]> =>
    api.get(`/appointments/hospital/${hospitalId}`).then(res => res.data),
};

export default api; 