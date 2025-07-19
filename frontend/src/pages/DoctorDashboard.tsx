import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doctorsAPI, availabilityAPI, appointmentsAPI } from '../services/api';
import { DoctorDashboard as DashboardData, DoctorHospital, Availability, Appointment } from '../types';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorHandler';
import { 
  CurrencyDollarIcon, 
  CalendarIcon, 
  UserGroupIcon,
  ClockIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [hospitals, setHospitals] = useState<DoctorHospital[]>([]);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateAvailability, setShowCreateAvailability] = useState(false);
  const [showAssociateHospital, setShowAssociateHospital] = useState(false);

  const [newAvailability, setNewAvailability] = useState({
    hospital_id: '',
    start_time: '',
    end_time: '',
    date: ''
  });

  const [newAssociation, setNewAssociation] = useState({
    hospital_id: '',
    consultation_fee: 0
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [dashboardData, hospitalsData, availabilitiesData, appointmentsData] = await Promise.all([
        doctorsAPI.getDashboard(user.id),
        doctorsAPI.getHospitals(user.id),
        availabilityAPI.getByDoctor(user.id),
        appointmentsAPI.getByDoctor(user.id)
      ]);

      setDashboard(dashboardData);
      setHospitals(hospitalsData);
      setAvailabilities(availabilitiesData);
      setAppointments(appointmentsData);
    } catch (error: any) {
      toast.error(getErrorMessage(error, 'Failed to load dashboard data'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await availabilityAPI.create({
        ...newAvailability,
        doctor_id: user.id
      });
      toast.success('Availability created successfully');
      setShowCreateAvailability(false);
      setNewAvailability({ hospital_id: '', start_time: '', end_time: '', date: '' });
      loadData();
    } catch (error: any) {
      toast.error(getErrorMessage(error, 'Failed to create availability'));
    }
  };

  const handleAssociateHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await doctorsAPI.associateWithHospital({
        ...newAssociation,
        doctor_id: user.id
      });
      toast.success('Successfully associated with hospital');
      setShowAssociateHospital(false);
      setNewAssociation({ hospital_id: '', consultation_fee: 0 });
      loadData();
    } catch (error: any) {
      toast.error(getErrorMessage(error, 'Failed to associate with hospital'));
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
          <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
          <p className="text-gray-600">Manage your practice and view earnings</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAssociateHospital(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Associate with Hospital
          </button>
          <button
            onClick={() => setShowCreateAvailability(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
          >
            <ClockIcon className="h-4 w-4 mr-2" />
            Add Availability
          </button>
        </div>
      </div>

      {/* Dashboard Stats */}
      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CurrencyDollarIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Earnings
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      ₹{dashboard.statistics.totalEarnings.toLocaleString()}
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
                  <CalendarIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Consultations
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {dashboard.statistics.totalConsultations}
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
                      Associated Hospitals
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {dashboard.statistics.associatedHospitals}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Doctor Profile */}
      {dashboard?.doctor && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Doctor Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Personal Information</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-900">Name: </span>
                    <span className="text-sm text-gray-600">{dashboard.doctor.name}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">Email: </span>
                    <span className="text-sm text-gray-600">{dashboard.doctor.email}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">Qualifications: </span>
                    <span className="text-sm text-gray-600">{dashboard.doctor.qualifications}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">Experience: </span>
                    <span className="text-sm text-gray-600">{dashboard.doctor.experience} years</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Specializations</h4>
                <div className="flex flex-wrap gap-2">
                  {dashboard.doctor.specializations.map((spec, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Appointments */}
      {dashboard?.recentAppointments && dashboard.recentAppointments.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Appointments</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hospital
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dashboard.recentAppointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {appointment.patient_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {appointment.hospital_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(appointment.appointment_time).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₹{appointment.amount_paid}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Associated Hospitals */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Associated Hospitals</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hospital
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Consultation Fee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {hospitals.map((hospital) => (
                  <tr key={hospital.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {hospital.hospital?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {hospital.hospital?.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{hospital.consultation_fee}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-primary-600 hover:text-primary-900 mr-3">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Availability Slots */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Availability Slots</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hospital
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {availabilities.map((availability) => (
                  <tr key={availability.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {availability.hospital?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(availability.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {availability.start_time} - {availability.end_time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-primary-600 hover:text-primary-900 mr-3">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>



      {/* Create Availability Modal */}
      {showCreateAvailability && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Availability</h3>
              <form onSubmit={handleCreateAvailability}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Hospital</label>
                  <select
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={newAvailability.hospital_id}
                    onChange={(e) => setNewAvailability({ ...newAvailability, hospital_id: e.target.value })}
                  >
                    <option value="">Select hospital</option>
                    {hospitals.map((hospital) => (
                      <option key={hospital.hospital_id} value={hospital.hospital_id}>
                        {hospital.hospital?.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={newAvailability.date}
                    onChange={(e) => setNewAvailability({ ...newAvailability, date: e.target.value })}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Start Time</label>
                  <input
                    type="time"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={newAvailability.start_time}
                    onChange={(e) => setNewAvailability({ ...newAvailability, start_time: e.target.value })}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">End Time</label>
                  <input
                    type="time"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={newAvailability.end_time}
                    onChange={(e) => setNewAvailability({ ...newAvailability, end_time: e.target.value })}
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateAvailability(false)}
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

      {/* Associate Hospital Modal */}
      {showAssociateHospital && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Associate with Hospital</h3>
              <form onSubmit={handleAssociateHospital}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Hospital</label>
                  <select
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={newAssociation.hospital_id}
                    onChange={(e) => setNewAssociation({ ...newAssociation, hospital_id: e.target.value })}
                  >
                    <option value="">Select hospital</option>
                    {/* This would need to be populated with available hospitals */}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Consultation Fee</label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={newAssociation.consultation_fee}
                    onChange={(e) => setNewAssociation({ ...newAssociation, consultation_fee: Number(e.target.value) })}
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAssociateHospital(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                  >
                    Associate
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

export default DoctorDashboard; 