import React, { useState, useEffect } from 'react';
import { usersAPI, hospitalsAPI } from '../services/api';
import { User, Hospital } from '../types';
import toast from 'react-hot-toast';
import { 
  UserIcon, 
  AcademicCapIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  StarIcon,
  XMarkIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

const Doctors: React.FC = () => {
  const [doctors, setDoctors] = useState<User[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [selectedHospital, setSelectedHospital] = useState('');
  const [selectedExperienceLevel, setSelectedExperienceLevel] = useState('');
  const [selectedFeeRange, setSelectedFeeRange] = useState('');
  const [filteredDoctors, setFilteredDoctors] = useState<User[]>([]);
  
  // Modal states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<User | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);
  
  // Appointment form state
  const [appointmentForm, setAppointmentForm] = useState({
    date: '',
    time: '',
    reason: '',
    hospital_id: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [doctors, searchTerm, selectedSpecialization, selectedHospital, selectedExperienceLevel, selectedFeeRange]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [doctorsData, hospitalsData] = await Promise.all([
        usersAPI.getDoctors(),
        hospitalsAPI.getAll()
      ]);

      setDoctors(doctorsData);
      setHospitals(hospitalsData);
    } catch (error) {
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const filterDoctors = () => {
    let filtered = doctors;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(doctor =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.qualifications?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by specialization
    if (selectedSpecialization) {
      filtered = filtered.filter(doctor =>
        doctor.specializations?.some(spec =>
          spec.toLowerCase().includes(selectedSpecialization.toLowerCase())
        )
      );
    }

    // Filter by hospital (this would need to be implemented based on doctor-hospital associations)
    if (selectedHospital) {
      // For now, we'll just show all doctors since we don't have the association data here
      // In a real implementation, you'd filter based on doctor-hospital relationships
    }

    // Filter by experience level
    if (selectedExperienceLevel) {
      filtered = filtered.filter(doctor => {
        const experience = doctor.experience || 0;
        switch (selectedExperienceLevel) {
          case 'junior':
            return experience < 5;
          case 'senior':
            return experience >= 5 && experience < 10;
          case 'expert':
            return experience >= 10;
          default:
            return true;
        }
      });
    }

    // Filter by consultation fee range
    if (selectedFeeRange) {
      filtered = filtered.filter(doctor => {
        // Check if doctor has consultation_fee (HospitalDoctor type)
        const fee = (doctor as any).consultation_fee || 0;
        switch (selectedFeeRange) {
          case 'low':
            return fee <= 500;
          case 'medium':
            return fee > 500 && fee <= 1000;
          case 'high':
            return fee > 1000;
          default:
            return true;
        }
      });
    }

    setFilteredDoctors(filtered);
  };

  const getUniqueSpecializations = () => {
    const allSpecializations: string[] = [];
    doctors.forEach(doctor => {
      if (doctor.specializations) {
        allSpecializations.push(...doctor.specializations);
      }
    });
    return Array.from(new Set(allSpecializations));
  };

  const getExperienceLevel = (experience: number) => {
    if (experience < 5) return { level: 'Junior', color: 'bg-green-100 text-green-800' };
    if (experience < 10) return { level: 'Senior', color: 'bg-blue-100 text-blue-800' };
    return { level: 'Expert', color: 'bg-purple-100 text-purple-800' };
  };

  const handleViewProfile = (doctor: User) => {
    setSelectedDoctor(doctor);
    setShowProfileModal(true);
  };

  const handleBookAppointment = (doctor: User) => {
    setSelectedDoctor(doctor);
    setAppointmentForm({
      date: '',
      time: '',
      reason: '',
      hospital_id: ''
    });
    setShowAppointmentModal(true);
  };

  const closeProfileModal = () => {
    setShowProfileModal(false);
    setSelectedDoctor(null);
  };

  const closeAppointmentModal = () => {
    setShowAppointmentModal(false);
    setSelectedDoctor(null);
    setAppointmentForm({
      date: '',
      time: '',
      reason: '',
      hospital_id: ''
    });
  };

  const handleAppointmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor) return;

    setLoadingAction(true);
    try {
      // This would integrate with your appointment booking API
      // await appointmentsAPI.create({
      //   doctor_id: selectedDoctor.id,
      //   hospital_id: appointmentForm.hospital_id,
      //   appointment_time: `${appointmentForm.date}T${appointmentForm.time}`,
      //   reason: appointmentForm.reason
      // });
      
      toast.success('Appointment booked successfully!');
      closeAppointmentModal();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to book appointment');
    } finally {
      setLoadingAction(false);
    }
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
        <h1 className="text-2xl font-bold text-gray-900">Doctors</h1>
        <p className="text-gray-600">Find and connect with healthcare professionals</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search doctors..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Specialization Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
            >
              <option value="">All Specializations</option>
              {getUniqueSpecializations().map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>

          {/* Experience Level Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              value={selectedExperienceLevel}
              onChange={(e) => setSelectedExperienceLevel(e.target.value)}
            >
              <option value="">All Experience Levels</option>
              <option value="junior">Junior (0-4 years)</option>
              <option value="senior">Senior (5-9 years)</option>
              <option value="expert">Expert (10+ years)</option>
            </select>
          </div>

          {/* Fee Range Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              value={selectedFeeRange}
              onChange={(e) => setSelectedFeeRange(e.target.value)}
            >
              <option value="">All Fee Ranges</option>
              <option value="low">Low (≤ ₹500)</option>
              <option value="medium">Medium (₹501-₹1000)</option>
              <option value="high">High (&gt; ₹1000)</option>
            </select>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-end text-sm text-gray-500">
            {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>

      {/* Doctors Grid */}
      {filteredDoctors.length === 0 ? (
        <div className="text-center py-12">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No doctors found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search criteria or filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => {
            const experienceLevel = getExperienceLevel(doctor.experience || 0);
            return (
              <div key={doctor.id} className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <UserIcon className="h-6 w-6 text-primary-600" />
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{doctor.name}</h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <AcademicCapIcon className="h-4 w-4 mr-1" />
                        {doctor.qualifications}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {doctor.experience} years of experience
                    </div>
                    
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${experienceLevel.color}`}>
                        {experienceLevel.level}
                      </span>
                    </div>
                  </div>

                  {doctor.specializations && doctor.specializations.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Specializations:</h4>
                      <div className="flex flex-wrap gap-1">
                        {doctor.specializations.slice(0, 3).map((spec, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                          >
                            {spec}
                          </span>
                        ))}
                        {doctor.specializations.length > 3 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            +{doctor.specializations.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 space-y-2">
                    <button 
                      onClick={() => handleViewProfile(doctor)}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      View Profile
                    </button>
                    <button 
                      onClick={() => handleBookAppointment(doctor)}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Book Appointment
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Statistics */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Doctor Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{doctors.length}</div>
            <div className="text-sm text-gray-500">Total Doctors</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{getUniqueSpecializations().length}</div>
            <div className="text-sm text-gray-500">Specializations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">
              {doctors.filter(d => (d.experience || 0) >= 10).length}
            </div>
            <div className="text-sm text-gray-500">Expert Doctors</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">
              {Math.round(doctors.reduce((sum, d) => sum + (d.experience || 0), 0) / doctors.length)}
            </div>
            <div className="text-sm text-gray-500">Avg. Experience (years)</div>
          </div>
        </div>
      </div>

      {/* Doctor Profile Modal */}
      {showProfileModal && selectedDoctor && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                    <UserIcon className="h-8 w-8 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedDoctor.name}</h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <AcademicCapIcon className="h-4 w-4 mr-1" />
                      {selectedDoctor.qualifications}
                    </div>
                  </div>
                </div>
                <button
                  onClick={closeProfileModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="space-y-6">
                {/* Doctor Overview */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Professional Overview</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center">
                      <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">
                        {selectedDoctor.experience || 0} years of experience
                      </span>
                    </div>
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">
                        Consultation Fee: ₹{(selectedDoctor as any).consultation_fee || 'Not specified'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <StarIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">
                        {getExperienceLevel(selectedDoctor.experience || 0).level} Level
                      </span>
                    </div>
                  </div>
                </div>

                {/* Specializations */}
                {selectedDoctor.specializations && selectedDoctor.specializations.length > 0 && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Specializations</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedDoctor.specializations.map((spec, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-600">{selectedDoctor.email}</span>
                    </div>
                    {selectedDoctor.unique_id && (
                      <div className="flex items-center">
                        <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">ID: {selectedDoctor.unique_id}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Details */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Additional Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedDoctor.gender && (
                      <div className="flex items-center">
                        <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">Gender: {selectedDoctor.gender}</span>
                      </div>
                    )}
                    {selectedDoctor.dob && (
                      <div className="flex items-center">
                        <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">Date of Birth: {new Date(selectedDoctor.dob).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end mt-6 space-x-3">
                <button
                  onClick={() => {
                    closeProfileModal();
                    handleBookAppointment(selectedDoctor);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Book Appointment
                </button>
                <button
                  onClick={closeProfileModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Book Appointment Modal */}
      {showAppointmentModal && selectedDoctor && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Book Appointment</h3>
                <button
                  onClick={closeAppointmentModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                    <UserIcon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{selectedDoctor.name}</h4>
                    <p className="text-sm text-gray-500">{selectedDoctor.qualifications}</p>
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleAppointmentSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={appointmentForm.date}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, date: e.target.value })}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time</label>
                  <input
                    type="time"
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={appointmentForm.time}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, time: e.target.value })}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hospital</label>
                  <select
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={appointmentForm.hospital_id}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, hospital_id: e.target.value })}
                  >
                    <option value="">Select a hospital</option>
                    {hospitals.map((hospital) => (
                      <option key={hospital.id} value={hospital.id}>
                        {hospital.name} - {hospital.location}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Visit</label>
                  <textarea
                    required
                    rows={3}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Please describe your symptoms or reason for consultation..."
                    value={appointmentForm.reason}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, reason: e.target.value })}
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeAppointmentModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loadingAction}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {loadingAction ? 'Booking...' : 'Book Appointment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Doctors; 