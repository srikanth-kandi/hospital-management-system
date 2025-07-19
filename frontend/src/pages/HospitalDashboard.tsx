import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { hospitalsAPI, departmentsAPI, doctorsAPI } from '../services/api';
import { Hospital, Department, DoctorHospital, HospitalDashboard as DashboardData, HospitalDoctor } from '../types';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorHandler';
import { 
  BuildingOfficeIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon, 
  CalendarIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const HospitalDashboard: React.FC = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<HospitalDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateHospital, setShowCreateHospital] = useState(false);
  const [showCreateDepartment, setShowCreateDepartment] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

  const [newHospital, setNewHospital] = useState({ name: '', location: '' });
  const [newDepartment, setNewDepartment] = useState({ name: '', hospital_id: '' });
  const [existingDepartments, setExistingDepartments] = useState<Department[]>([]);
  const [selectedExistingDepartment, setSelectedExistingDepartment] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [editHospitalForm, setEditHospitalForm] = useState({ name: '', location: '' });
  const [hospitalToEdit, setHospitalToEdit] = useState<Hospital | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [hospitalsData, departmentsData] = await Promise.all([
        hospitalsAPI.getAll(),
        departmentsAPI.getAll()
      ]);

      setHospitals(hospitalsData);
      setDepartments(departmentsData);

      // If user is hospital admin, load their hospital's dashboard
      if (user?.role === 'hospital_admin') {
        const userHospitals = hospitalsData.filter(h => h.created_by === user.id);
        if (userHospitals.length > 0) {
          const hospital = userHospitals[0];
          setSelectedHospital(hospital);
          const [dashboardData, doctorsData] = await Promise.all([
            hospitalsAPI.getDashboard(hospital.id),
            hospitalsAPI.getDoctors(hospital.id)
          ]);
          setDashboard(dashboardData);
          setDoctors(doctorsData);
          console.log('Loaded doctors data:', doctorsData); // Debug log
        }
      }
    } catch (error: any) {
      toast.error(getErrorMessage(error, 'Failed to load dashboard data'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await hospitalsAPI.create({
        ...newHospital,
        created_by: user.id
      });
      toast.success('Hospital created successfully');
      setShowCreateHospital(false);
      setNewHospital({ name: '', location: '' });
      loadData();
    } catch (error: any) {
      toast.error(getErrorMessage(error, 'Failed to create hospital'));
    }
  };

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHospital) return;

    try {
      await departmentsAPI.create({
        ...newDepartment,
        hospital_id: selectedHospital.id
      });
      toast.success('Department created successfully');
      setShowCreateDepartment(false);
      setNewDepartment({ name: '', hospital_id: '' });
      setSelectedExistingDepartment('');
      setIsCreatingNew(false);
      loadData();
    } catch (error: any) {
      toast.error(getErrorMessage(error, 'Failed to create department'));
    }
  };

  const handleSelectExistingDepartment = async () => {
    if (!selectedExistingDepartment || !selectedHospital) return;

    // Find the existing department
    const existingDept = existingDepartments.find(d => d.id === selectedExistingDepartment);
    if (!existingDept) return;

    try {
      // Create a new department with the same name but for the selected hospital
      await departmentsAPI.create({
        name: existingDept.name,
        hospital_id: selectedHospital.id
      });
      toast.success(`Department '${existingDept.name}' added to hospital successfully`);
      setShowCreateDepartment(false);
      setSelectedExistingDepartment('');
      setIsCreatingNew(false);
      loadData();
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error(`Department '${existingDept.name}' already exists in this hospital`);
      } else {
        toast.error(getErrorMessage(error, 'Failed to add existing department'));
      }
    }
  };

  const openCreateDepartmentModal = async () => {
    setShowCreateDepartment(true);
    setIsCreatingNew(false);
    setSelectedExistingDepartment('');
    setNewDepartment({ name: '', hospital_id: '' });
    
    try {
      // Load unique department names for better organization
      const uniqueDepartments = await departmentsAPI.getUniqueNames();
      // Convert to flat list for the dropdown
      const flatDepartments = uniqueDepartments.flatMap(uniqueDept => 
        uniqueDept.hospitals.map((hospital: any) => ({
          id: `${uniqueDept.name}-${hospital.id}`, // Create a unique identifier
          name: uniqueDept.name,
          hospital_id: hospital.id,
          hospital: { name: hospital.name }
        }))
      );
      setExistingDepartments(flatDepartments);
    } catch (error) {
      // Fallback to all departments if unique names API fails
      setExistingDepartments(departments);
    }
  };

  const handleEditHospital = (hospital: Hospital) => {
    setHospitalToEdit(hospital);
    setEditHospitalForm({ name: hospital.name, location: hospital.location });
    setShowEditModal(true);
  };

  const handleDeleteHospital = (hospital: Hospital) => {
    setHospitalToEdit(hospital);
    setShowDeleteModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setHospitalToEdit(null);
    setEditHospitalForm({ name: '', location: '' });
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setHospitalToEdit(null);
  };

  const handleEditHospitalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospitalToEdit) return;

    setLoadingAction(true);
    try {
      await hospitalsAPI.update(hospitalToEdit.id, editHospitalForm);
      toast.success('Hospital updated successfully');
      closeEditModal();
      loadData(); // Reload data to reflect changes
    } catch (error: any) {
      toast.error(getErrorMessage(error, 'Failed to update hospital'));
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteHospitalConfirm = async () => {
    if (!hospitalToEdit) return;

    setLoadingAction(true);
    try {
      await hospitalsAPI.delete(hospitalToEdit.id);
      toast.success('Hospital deleted successfully');
      closeDeleteModal();
      loadData(); // Reload data to reflect changes
    } catch (error: any) {
      toast.error(getErrorMessage(error, 'Failed to delete hospital'));
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hospital Dashboard</h1>
          <p className="text-gray-600">Manage your hospital and view statistics</p>
        </div>
        {user?.role === 'hospital_admin' && (
          <button
            onClick={() => setShowCreateHospital(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Hospital
          </button>
        )}
      </div>

      {/* Dashboard Stats */}
      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CalendarIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Consultations
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {dashboard.totalConsultations}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CurrencyDollarIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Revenue
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      ₹{dashboard.totalRevenue.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserGroupIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Associated Doctors
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {dashboard.associatedDoctors}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BuildingOfficeIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Departments
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {dashboard.departmentsCount}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hospitals List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Hospitals</h3>
            {user?.role === 'hospital_admin' && (
              <button
                onClick={openCreateDepartmentModal}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-primary-600 bg-primary-100 hover:bg-primary-200"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Department
              </button>
            )}
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Departments
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {hospitals.map((hospital) => {
                  const hospitalDepartments = departments.filter(d => d.hospital_id === hospital.id);
                  return (
                    <tr key={hospital.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {hospital.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {hospital.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {hospitalDepartments.length}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => handleEditHospital(hospital)}
                          className="text-primary-600 hover:text-primary-900 mr-3"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteHospital(hospital)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Associated Doctors */}
      {doctors.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Associated Doctors</h3>
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
                      Consultation Fee
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {doctors.map((doctor) => (
                    <tr key={doctor.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {doctor.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {doctor.specializations?.join(', ') || 'Not specified'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₹{doctor.consultation_fee}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Create Hospital Modal */}
      {showCreateHospital && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Hospital</h3>
              <form onSubmit={handleCreateHospital}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={newHospital.name}
                    onChange={(e) => setNewHospital({ ...newHospital, name: e.target.value })}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={newHospital.location}
                    onChange={(e) => setNewHospital({ ...newHospital, location: e.target.value })}
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateHospital(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Department Modal */}
      {showCreateDepartment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Department</h3>
              
              {/* Hospital Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Hospital</label>
                <select
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={selectedHospital?.id || ''}
                  onChange={(e) => {
                    const hospital = hospitals.find(h => h.id === e.target.value);
                    setSelectedHospital(hospital || null);
                  }}
                >
                  <option value="">Select a hospital</option>
                  {hospitals.map((hospital) => (
                    <option key={hospital.id} value={hospital.id}>
                      {hospital.name} - {hospital.location}
                    </option>
                  ))}
                </select>
              </div>

              {selectedHospital && (
                <>
                  {/* Mode Selection */}
                  <div className="mb-4">
                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={() => setIsCreatingNew(false)}
                        className={`px-4 py-2 text-sm font-medium rounded-md ${
                          !isCreatingNew 
                            ? 'bg-primary-600 text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Select Existing Department
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCreatingNew(true)}
                        className={`px-4 py-2 text-sm font-medium rounded-md ${
                          isCreatingNew 
                            ? 'bg-primary-600 text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Create New Department
                      </button>
                    </div>
                  </div>

                  {/* Existing Department Selection */}
                  {!isCreatingNew && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Existing Department
                      </label>
                      <select
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        value={selectedExistingDepartment}
                        onChange={(e) => setSelectedExistingDepartment(e.target.value)}
                      >
                        <option value="">Choose an existing department</option>
                        {existingDepartments
                          .filter(dept => dept.hospital_id !== selectedHospital.id) // Exclude departments already in this hospital
                          .map((dept) => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name} (from {dept.hospital?.name})
                            </option>
                          ))}
                      </select>
                      <p className="mt-1 text-sm text-gray-500">
                        This will create a new department with the same name in the selected hospital
                      </p>
                    </div>
                  )}

                  {/* New Department Creation */}
                  {isCreatingNew && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Department Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Enter department name"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        value={newDepartment.name}
                        onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Department names must be unique within each hospital
                      </p>
                    </div>
                  )}
                </>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateDepartment(false);
                    setSelectedExistingDepartment('');
                    setIsCreatingNew(false);
                    setNewDepartment({ name: '', hospital_id: '' });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                {selectedHospital && (
                  isCreatingNew ? (
                    <button
                      type="button"
                      onClick={handleCreateDepartment}
                      disabled={!newDepartment.name.trim()}
                      className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Create New Department
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSelectExistingDepartment}
                      disabled={!selectedExistingDepartment}
                      className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Add Existing Department
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Hospital Modal */}
      {showEditModal && hospitalToEdit && (
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
              
              <form onSubmit={handleEditHospitalSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hospital Name</label>
                  <input
                    type="text"
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={editHospitalForm.name}
                    onChange={(e) => setEditHospitalForm({ ...editHospitalForm, name: e.target.value })}
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={editHospitalForm.location}
                    onChange={(e) => setEditHospitalForm({ ...editHospitalForm, location: e.target.value })}
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
      {showDeleteModal && hospitalToEdit && (
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
                    <h4 className="text-lg font-medium text-gray-900">{hospitalToEdit.name}</h4>
                    <p className="text-sm text-gray-500">{hospitalToEdit.location}</p>
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
                  onClick={handleDeleteHospitalConfirm}
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

export default HospitalDashboard; 