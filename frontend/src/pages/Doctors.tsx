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
  StarIcon
} from '@heroicons/react/24/outline';

const Doctors: React.FC = () => {
  const [doctors, setDoctors] = useState<User[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [selectedHospital, setSelectedHospital] = useState('');
  const [filteredDoctors, setFilteredDoctors] = useState<User[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [doctors, searchTerm, selectedSpecialization, selectedHospital]);

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
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

          {/* Hospital Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              value={selectedHospital}
              onChange={(e) => setSelectedHospital(e.target.value)}
            >
              <option value="">All Hospitals</option>
              {hospitals.map((hospital) => (
                <option key={hospital.id} value={hospital.id}>
                  {hospital.name}
                </option>
              ))}
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
                    <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                      View Profile
                    </button>
                    <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
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
    </div>
  );
};

export default Doctors; 