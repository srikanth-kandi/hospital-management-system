import React, { useState, useEffect } from 'react';
import { hospitalsAPI, departmentsAPI } from '../services/api';
import { Hospital, Department, HospitalDoctor } from '../types';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorHandler';
import { 
  BuildingOfficeIcon, 
  MapPinIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const Hospitals: React.FC = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [hospitalDoctors, setHospitalDoctors] = useState<HospitalDoctor[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', location: '' });

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
    } catch (error: any) {
      toast.error(getErrorMessage(error, 'Failed to load hospitals'));
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

    // Filter by department - fix the filtering logic
    if (selectedDepartment) {
      const hospitalIdsWithDepartment = departments
        .filter(dept => dept.name === selectedDepartment) // Exact match instead of includes
        .map(dept => dept.hospital_id);
      
      filtered = filtered.filter(hospital =>
        hospitalIdsWithDepartment.includes(hospital.id)
      );
    }

    setFilteredHospitals(filtered);
  };

  const handleViewDetails = async (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setShowDetailsModal(true);
    setLoadingDetails(true);
    
    try {
      // Load hospital doctors
      const doctorsData = await hospitalsAPI.getDoctors(hospital.id);
      setHospitalDoctors(doctorsData);
    } catch (error: any) {
      toast.error(getErrorMessage(error, 'Failed to load hospital details'));
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedHospital(null);
    setHospitalDoctors([]);
  };

  const handleEdit = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setEditForm({ name: hospital.name, location: hospital.location });
    setShowEditModal(true);
  };

  const handleDelete = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setShowDeleteModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedHospital(null);
    setEditForm({ name: '', location: '' });
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedHospital(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHospital) return;

    setLoadingAction(true);
    try {
      await hospitalsAPI.update(selectedHospital.id, editForm);
      toast.success('Hospital updated successfully');
      closeEditModal();
      loadData(); // Reload data to reflect changes
    } catch (error: any) {
      toast.error(getErrorMessage(error, 'Failed to update hospital'));
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedHospital) return;

    setLoadingAction(true);
    try {
      await hospitalsAPI.delete(selectedHospital.id);
      toast.success('Hospital deleted successfully');
      closeDeleteModal();
      loadData(); // Reload data to reflect changes
    } catch (error: any) {
      toast.error(getErrorMessage(error, 'Failed to delete hospital'));
    } finally {
      setLoadingAction(false);
    }
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

                  <div className="mt-6 space-y-2">
                    <button 
                      onClick={() => handleViewDetails(hospital)}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      View Details
                    </button>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEdit(hospital)}
                        className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(hospital)}
                        className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Delete
                      </button>
                    </div>
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

      {/* Hospital Details Modal */}
      {showDetailsModal && selectedHospital && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                    <BuildingOfficeIcon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedHospital.name}</h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      {selectedHospital.location}
                    </div>
                  </div>
                </div>
                <button
                  onClick={closeDetailsModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="space-y-6">
                {/* Hospital Overview */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Hospital Overview</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center">
                      <UserGroupIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">
                        {getHospitalDepartments(selectedHospital.id).length} Departments
                      </span>
                    </div>
                    <div className="flex items-center">
                      <UserGroupIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">
                        {hospitalDoctors.length} Associated Doctors
                      </span>
                    </div>

                  </div>
                </div>

                {/* Departments */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Departments</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {getHospitalDepartments(selectedHospital.id).map((dept) => (
                      <div key={dept.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <h5 className="font-medium text-gray-900">{dept.name}</h5>
                        <p className="text-sm text-gray-500">Department ID: {dept.id.substring(0, 10)}...</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Associated Doctors */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Associated Doctors</h4>
                  {loadingDetails ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                  ) : hospitalDoctors.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Doctor
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Specializations
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Experience
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Consultation Fee
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {hospitalDoctors.map((doctor) => (
                            <tr key={doctor.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {doctor.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {doctor.specializations && doctor.specializations.length > 0 
                                  ? doctor.specializations.join(', ') 
                                  : 'Not specified'
                                }
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {doctor.experience || 0} years
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                ₹{doctor.consultation_fee}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No doctors associated</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        This hospital doesn't have any associated doctors yet.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end mt-6">
                <button
                  onClick={closeDetailsModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Hospital Modal */}
      {showEditModal && selectedHospital && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit Hospital</h3>
                <button
                  onClick={closeEditModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleEditSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hospital Name</label>
                  <input
                    type="text"
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loadingAction}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {loadingAction ? 'Updating...' : 'Update Hospital'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedHospital && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Delete Hospital</h3>
                <button
                  onClick={closeDeleteModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                    <BuildingOfficeIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{selectedHospital.name}</h4>
                    <p className="text-sm text-gray-500">{selectedHospital.location}</p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600">
                  Are you sure you want to delete this hospital? This action cannot be undone and will remove all associated data including departments and doctor associations.
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeDeleteModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={loadingAction}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loadingAction ? 'Deleting...' : 'Delete Hospital'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hospitals; 