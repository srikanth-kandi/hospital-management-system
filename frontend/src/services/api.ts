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
import { getErrorMessage, handleApiError } from '../utils/errorHandler';

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
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Enhance error object with formatted message
    error.formattedMessage = getErrorMessage(error, 'An error occurred');
    
    return Promise.reject(error);
  }
);

// Helper function for making API calls with consistent error handling
const apiCall = async <T>(
  apiPromise: Promise<{ data: T }>,
  defaultErrorMessage: string = 'An error occurred'
): Promise<T> => {
  try {
    const response = await apiPromise;
    return response.data;
  } catch (error: any) {
    // Use the formatted message from the interceptor or get a new one
    const message = error.formattedMessage || getErrorMessage(error, defaultErrorMessage);
    throw new Error(message);
  }
};

// Auth API
export const authAPI = {
  login: (data: LoginRequest): Promise<AuthResponse> =>
    apiCall(api.post('/users/login', data), 'Failed to login. Please check your credentials.'),
  
  register: (data: RegisterRequest): Promise<User> =>
    apiCall(api.post('/users/register', data), 'Failed to register. Please try again.'),
  
  getCurrentUser: (): Promise<User> =>
    apiCall(api.get('/users/me'), 'Failed to get user information.'),
};

// Users API
export const usersAPI = {
  getAll: (): Promise<User[]> =>
    apiCall(api.get('/users'), 'Failed to load users.'),
  
  getById: (id: string): Promise<User> =>
    apiCall(api.get(`/users/${id}`), 'Failed to load user details.'),
  
  update: (id: string, data: Partial<User>): Promise<User> =>
    apiCall(api.put(`/users/${id}`, data), 'Failed to update user.'),
  
  delete: (id: string): Promise<void> =>
    apiCall(api.delete(`/users/${id}`), 'Failed to delete user.'),
  
  getDoctors: (): Promise<User[]> =>
    apiCall(api.get('/users/doctors'), 'Failed to load doctors.'),
};

// Hospitals API
export const hospitalsAPI = {
  getAll: (): Promise<Hospital[]> =>
    apiCall(api.get('/hospitals'), 'Failed to load hospitals.'),
  
  getById: (id: string): Promise<Hospital> =>
    apiCall(api.get(`/hospitals/${id}`), 'Failed to load hospital details.'),
  
  create: (data: { name: string; location: string; created_by: string }): Promise<Hospital> =>
    apiCall(api.post('/hospitals', data), 'Failed to create hospital.'),
  
  update: (id: string, data: Partial<Hospital>): Promise<Hospital> =>
    apiCall(api.put(`/hospitals/${id}`, data), 'Failed to update hospital.'),
  
  delete: (id: string): Promise<void> =>
    apiCall(api.delete(`/hospitals/${id}`), 'Failed to delete hospital.'),
  
  getDashboard: (id: string): Promise<HospitalDashboard> =>
    apiCall(api.get(`/hospitals/${id}/dashboard`), 'Failed to load hospital dashboard.'),
  
  getDoctors: (id: string): Promise<HospitalDoctor[]> =>
    apiCall(api.get(`/hospitals/${id}/doctors`), 'Failed to load hospital doctors.'),
};

// Departments API
export const departmentsAPI = {
  getAll: (): Promise<Department[]> =>
    apiCall(api.get('/departments'), 'Failed to load departments.'),
  
  getById: (id: string): Promise<Department> =>
    apiCall(api.get(`/departments/${id}`), 'Failed to load department details.'),
  
  create: (data: { name: string; hospital_id: string }): Promise<Department> =>
    apiCall(api.post('/departments', data), 'Failed to create department.'),
  
  update: (id: string, data: Partial<Department>): Promise<Department> =>
    apiCall(api.put(`/departments/${id}`, data), 'Failed to update department.'),
  
  delete: (id: string): Promise<void> =>
    apiCall(api.delete(`/departments/${id}`), 'Failed to delete department.'),
  
  getByHospital: (hospitalId: string): Promise<Department[]> =>
    apiCall(api.get(`/departments/hospital/${hospitalId}`), 'Failed to load hospital departments.'),
  
  getUniqueNames: (): Promise<any[]> =>
    apiCall(api.get('/departments/unique-names'), 'Failed to load unique department names.'),
};

// Doctors API
export const doctorsAPI = {
  getAll: (): Promise<User[]> =>
    apiCall(api.get('/doctors'), 'Failed to load doctors.'),
  
  getById: (id: string): Promise<User> =>
    apiCall(api.get(`/doctors/${id}`), 'Failed to load doctor details.'),
  
  associateWithHospital: (data: { doctor_id: string; hospital_id: string; consultation_fee: number }): Promise<DoctorHospital> =>
    apiCall(api.post('/doctors/associate', data), 'Failed to associate doctor with hospital.'),
  
  getDashboard: (id: string): Promise<DoctorDashboard> =>
    apiCall(api.get(`/doctors/${id}/dashboard`), 'Failed to load doctor dashboard.'),
  
  getHospitals: (id: string): Promise<DoctorHospital[]> =>
    apiCall(api.get(`/doctors/${id}/hospitals`), 'Failed to load doctor hospitals.'),
};

// Availability API
export const availabilityAPI = {
  getAll: (): Promise<Availability[]> =>
    apiCall(api.get('/availability'), 'Failed to load availability slots.'),
  
  getById: (id: string): Promise<Availability> =>
    apiCall(api.get(`/availability/${id}`), 'Failed to load availability details.'),
  
  create: (data: { doctor_id: string; hospital_id: string; start_time: string; end_time: string; date: string }): Promise<Availability> =>
    apiCall(api.post('/availability', data), 'Failed to create availability slot.'),
  
  update: (id: string, data: Partial<Availability>): Promise<Availability> =>
    apiCall(api.put(`/availability/${id}`, data), 'Failed to update availability slot.'),
  
  delete: (id: string): Promise<void> =>
    apiCall(api.delete(`/availability/${id}`), 'Failed to delete availability slot.'),
  
  getByDoctor: (doctorId: string): Promise<Availability[]> =>
    apiCall(api.get(`/availability/doctor/${doctorId}`), 'Failed to load doctor availability.'),
  
  getByHospital: (hospitalId: string): Promise<Availability[]> =>
    apiCall(api.get(`/availability/hospital/${hospitalId}`), 'Failed to load hospital availability.'),
  
  getAvailableSlots: (doctorId: string, hospitalId: string, date: string): Promise<Availability[]> =>
    apiCall(api.get(`/availability/available/${doctorId}/${hospitalId}/${date}`), 'Failed to load available slots.'),
};

// Appointments API
export const appointmentsAPI = {
  getAll: (): Promise<Appointment[]> =>
    apiCall(api.get('/appointments'), 'Failed to load appointments.'),
  
  getById: (id: string): Promise<Appointment> =>
    apiCall(api.get(`/appointments/${id}`), 'Failed to load appointment details.'),
  
  create: (data: { patient_id: string; doctor_id: string; hospital_id: string; appointment_time: string; amount_paid: number }): Promise<Appointment> =>
    apiCall(api.post('/appointments', data), 'Failed to create appointment.'),
  
  update: (id: string, data: Partial<Appointment>): Promise<Appointment> =>
    apiCall(api.put(`/appointments/${id}`, data), 'Failed to update appointment.'),
  
  delete: (id: string): Promise<void> =>
    apiCall(api.delete(`/appointments/${id}`), 'Failed to delete appointment.'),
  
  getByPatient: (patientId: string): Promise<Appointment[]> =>
    apiCall(api.get(`/appointments/patient/${patientId}`), 'Failed to load patient appointments.'),
  
  getByDoctor: (doctorId: string): Promise<Appointment[]> =>
    apiCall(api.get(`/appointments/doctor/${doctorId}`), 'Failed to load doctor appointments.'),
  
  getByHospital: (hospitalId: string): Promise<Appointment[]> =>
    apiCall(api.get(`/appointments/hospital/${hospitalId}`), 'Failed to load hospital appointments.'),
};

export default api; 