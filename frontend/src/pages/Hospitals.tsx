import React, { useState, useEffect } from 'react';
import { hospitalsAPI, departmentsAPI } from '../services/api';
import { Hospital, Department } from '../types';
import toast from 'react-hot-toast';
import { 
  BuildingOfficeIcon, 
  MapPinIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

const Hospitals: React.FC = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterHospitals();
  }, [hospitals, searchTerm, selectedDepartment]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [hospitalsData, departmentsData] = await Promise.all([
        hospitalsAPI.getAll(),
        departmentsAPI.getAll()
      ]);

      setHospitals(hospitalsData);
      setDepartments(departmentsData);
    } catch (error) {
      toast.error('Failed to load hospitals');
    } finally {
      setLoading(false);
    }
  };

  const filterHospitals = () => {
    let filtered = hospitals;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(hospital =>
        hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hospital.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by department
    if (selectedDepartment) {
      const hospitalIdsWithDepartment = departments
        .filter(dept => dept.name.toLowerCase().includes(selectedDepartment.toLowerCase()))
        .map(dept => dept.hospital_id);
      
      filtered = filtered.filter(hospital =>
        hospitalIdsWithDepartment.includes(hospital.id)
      );
    }

    setFilteredHospitals(filtered);
  };

  const getHospitalDepartments = (hospitalId: string) => {
    return departments.filter(dept => dept.hospital_id === hospitalId);
  };

  const getUniqueDepartments = () => {
    const departmentNames = departments.map(dept => dept.name);
    return Array.from(new Set(departmentNames));
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
        <h1 className="text-2xl font-bold text-gray-900">Hospitals</h1>
        <p className="text-gray-600">Find and explore hospitals in your area</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search hospitals..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Department Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <option value="">All Departments</option>
              {getUniqueDepartments().map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-end text-sm text-gray-500">
            {filteredHospitals.length} hospital{filteredHospitals.length !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>

      {/* Hospitals Grid */}
      {filteredHospitals.length === 0 ? (
        <div className="text-center py-12">
          <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hospitals found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search criteria or filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHospitals.map((hospital) => {
            const hospitalDepartments = getHospitalDepartments(hospital.id);
            return (
              <div key={hospital.id} className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <BuildingOfficeIcon className="h-6 w-6 text-primary-600" />
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{hospital.name}</h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        {hospital.location}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <UserGroupIcon className="h-4 w-4 mr-1" />
                      {hospitalDepartments.length} department{hospitalDepartments.length !== 1 ? 's' : ''}
                    </div>
                  </div>

                  {hospitalDepartments.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Departments:</h4>
                      <div className="flex flex-wrap gap-1">
                        {hospitalDepartments.slice(0, 3).map((dept) => (
                          <span
                            key={dept.id}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                          >
                            {dept.name}
                          </span>
                        ))}
                        {hospitalDepartments.length > 3 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            +{hospitalDepartments.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-6">
                    <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                      View Details
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
        <h3 className="text-lg font-medium text-gray-900 mb-4">Hospital Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{hospitals.length}</div>
            <div className="text-sm text-gray-500">Total Hospitals</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{departments.length}</div>
            <div className="text-sm text-gray-500">Total Departments</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{getUniqueDepartments().length}</div>
            <div className="text-sm text-gray-500">Unique Specialties</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hospitals; 