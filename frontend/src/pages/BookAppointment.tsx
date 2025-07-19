import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usersAPI, hospitalsAPI, availabilityAPI, appointmentsAPI } from '../services/api';
import { User, Hospital, Availability } from '../types';
import toast from 'react-hot-toast';
import { 
  UserIcon, 
  BuildingOfficeIcon,
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

const BookAppointment: React.FC = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Data states
  const [doctors, setDoctors] = useState<User[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);

  // Selection states
  const [selectedDoctor, setSelectedDoctor] = useState<User | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedAvailability, setSelectedAvailability] = useState<Availability | null>(null);

  // Filter states
  const [specializationFilter, setSpecializationFilter] = useState('');
  const [hospitalFilter, setHospitalFilter] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedDoctor && selectedHospital && selectedDate) {
      loadAvailabilities();
    }
  }, [selectedDoctor, selectedHospital, selectedDate]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [doctorsData, hospitalsData] = await Promise.all([
        usersAPI.getDoctors(),
        hospitalsAPI.getAll()
      ]);

      setDoctors(doctorsData);
      setHospitals(hospitalsData);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailabilities = async () => {
    if (!selectedDoctor || !selectedHospital || !selectedDate) return;

    try {
      const availabilitiesData = await availabilityAPI.getAvailableSlots(
        selectedDoctor.id,
        selectedHospital.id,
        selectedDate
      );
      setAvailabilities(availabilitiesData);
    } catch (error) {
      toast.error('Failed to load available slots');
    }
  };

  const handleDoctorSelection = (doctor: User) => {
    setSelectedDoctor(doctor);
    setStep(2);
  };

  const handleHospitalSelection = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setStep(3);
  };

  const handleDateSelection = (date: string) => {
    setSelectedDate(date);
    setStep(4);
  };

  const handleTimeSelection = (availability: Availability) => {
    setSelectedAvailability(availability);
    setSelectedTime(availability.start_time);
    setStep(5);
  };

  const handleBooking = async () => {
    if (!user || !selectedDoctor || !selectedHospital || !selectedAvailability) return;

    try {
      setBookingLoading(true);
      await appointmentsAPI.create({
        patient_id: user.id,
        doctor_id: selectedDoctor.id,
        hospital_id: selectedHospital.id,
        appointment_time: `${selectedDate}T${selectedTime}:00`,
        amount_paid: 1000 // This should come from doctor's consultation fee
      });

      toast.success('Appointment booked successfully!');
      // Reset form
      setSelectedDoctor(null);
      setSelectedHospital(null);
      setSelectedDate('');
      setSelectedTime('');
      setSelectedAvailability(null);
      setStep(1);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setBookingLoading(false);
    }
  };

  const getFilteredDoctors = () => {
    let filtered = doctors;

    if (specializationFilter) {
      filtered = filtered.filter(doctor =>
        doctor.specializations?.some(spec =>
          spec.toLowerCase().includes(specializationFilter.toLowerCase())
        )
      );
    }

    if (hospitalFilter) {
      // In a real implementation, you'd filter based on doctor-hospital associations
    }

    return filtered;
  };

  const getFilteredHospitals = () => {
    let filtered = hospitals;

    if (hospitalFilter) {
      filtered = filtered.filter(hospital =>
        hospital.name.toLowerCase().includes(hospitalFilter.toLowerCase()) ||
        hospital.location.toLowerCase().includes(hospitalFilter.toLowerCase())
      );
    }

    return filtered;
  };

  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
        <p className="text-gray-600">Schedule your consultation with a healthcare professional</p>
      </div>

      {/* Progress Steps */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4, 5].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= stepNumber ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {step > stepNumber ? (
                  <CheckIcon className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{stepNumber}</span>
                )}
              </div>
              {stepNumber < 5 && (
                <div className={`w-16 h-1 mx-2 ${
                  step > stepNumber ? 'bg-primary-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-5 text-xs text-gray-500">
          <div className="text-center">Choose Doctor</div>
          <div className="text-center">Choose Hospital</div>
          <div className="text-center">Select Date</div>
          <div className="text-center">Select Time</div>
          <div className="text-center">Confirm</div>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white shadow rounded-lg p-6">
        {step === 1 && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Step 1: Choose a Doctor</h2>
            
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                <input
                  type="text"
                  placeholder="Filter by specialization..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  value={specializationFilter}
                  onChange={(e) => setSpecializationFilter(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hospital</label>
                <input
                  type="text"
                  placeholder="Filter by hospital..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  value={hospitalFilter}
                  onChange={(e) => setHospitalFilter(e.target.value)}
                />
              </div>
            </div>

            {/* Doctors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getFilteredDoctors().map((doctor) => (
                <div
                  key={doctor.id}
                  className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-primary-300 hover:shadow-md transition-all"
                  onClick={() => handleDoctorSelection(doctor)}
                >
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                      <UserIcon className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{doctor.name}</h3>
                      <p className="text-sm text-gray-500">{doctor.qualifications}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Experience: {doctor.experience} years</p>
                    {doctor.specializations && (
                      <p className="mt-1">
                        Specializations: {doctor.specializations.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Step 2: Choose a Hospital</h2>
            <p className="text-gray-600 mb-4">Selected Doctor: {selectedDoctor?.name}</p>

            {/* Hospitals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getFilteredHospitals().map((hospital) => (
                <div
                  key={hospital.id}
                  className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-primary-300 hover:shadow-md transition-all"
                  onClick={() => handleHospitalSelection(hospital)}
                >
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                      <BuildingOfficeIcon className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{hospital.name}</h3>
                      <p className="text-sm text-gray-500">{hospital.location}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Step 3: Select Date</h2>
            <p className="text-gray-600 mb-4">
              Doctor: {selectedDoctor?.name} | Hospital: {selectedHospital?.name}
            </p>

            {/* Date Selection */}
            <div className="grid grid-cols-7 gap-2">
              {getAvailableDates().map((date) => (
                <button
                  key={date}
                  className="p-3 border border-gray-200 rounded-lg text-center hover:border-primary-300 hover:bg-primary-50 transition-all"
                  onClick={() => handleDateSelection(date)}
                >
                  <div className="text-sm font-medium">
                    {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Step 4: Select Time</h2>
            <p className="text-gray-600 mb-4">
              {selectedDoctor?.name} | {selectedHospital?.name} | {new Date(selectedDate).toLocaleDateString()}
            </p>

            {/* Time Slots */}
            {availabilities.length === 0 ? (
              <div className="text-center py-8">
                <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No available slots</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try selecting a different date.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {availabilities.map((availability) => (
                  <button
                    key={availability.id}
                    className="p-3 border border-gray-200 rounded-lg text-center hover:border-primary-300 hover:bg-primary-50 transition-all"
                    onClick={() => handleTimeSelection(availability)}
                  >
                    <div className="text-sm font-medium">
                      {availability.start_time} - {availability.end_time}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 5 && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Step 5: Confirm Booking</h2>
            
            {/* Booking Summary */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Appointment Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Doctor:</span>
                  <span className="font-medium">{selectedDoctor?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hospital:</span>
                  <span className="font-medium">{selectedHospital?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{new Date(selectedDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Consultation Fee:</span>
                  <span className="font-medium">₹1000</span>
                </div>
                <hr className="my-3" />
                <div className="flex justify-between text-lg font-medium">
                  <span>Total:</span>
                  <span>₹1000</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between">
              <button
                onClick={() => setStep(4)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleBooking}
                disabled={bookingLoading}
                className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {bookingLoading ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookAppointment; 