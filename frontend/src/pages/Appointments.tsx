import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { appointmentsAPI } from '../services/api';
import { Appointment } from '../types';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorHandler';
import { 
  CalendarIcon, 
  UserIcon,
  BuildingOfficeIcon,
  ClockIcon,
  CurrencyDollarIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

const Appointments: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('');
  const [amountRangeFilter, setAmountRangeFilter] = useState('');
  const [hospitalFilter, setHospitalFilter] = useState('');
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  
  // Modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);
  
  // Reschedule form state
  const [rescheduleForm, setRescheduleForm] = useState({
    date: '',
    time: ''
  });

  useEffect(() => {
    if (user) {
      loadAppointments();
    }
  }, [user]);

  useEffect(() => {
    filterAppointments();
  }, [appointments, searchTerm, statusFilter, dateRangeFilter, amountRangeFilter, hospitalFilter]);

  const loadAppointments = async () => {
    if (!user) return;

    try {
      setLoading(true);
      let appointmentsData: Appointment[];

      // Load appointments based on user role
      if (user.role === 'patient') {
        appointmentsData = await appointmentsAPI.getByPatient(user.id);
      } else if (user.role === 'doctor') {
        appointmentsData = await appointmentsAPI.getByDoctor(user.id);
      } else {
        // For hospital admin, load all appointments (in a real app, you'd filter by hospital)
        appointmentsData = await appointmentsAPI.getAll();
      }

      setAppointments(appointmentsData);
    } catch (error: any) {
      toast.error(getErrorMessage(error, 'Failed to load appointments'));
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = appointments;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(appointment =>
        appointment.doctor?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.hospital?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(appointment => {
        const appointmentDate = new Date(appointment.appointment_time);
        if (statusFilter === 'upcoming') {
          return appointmentDate > now;
        } else if (statusFilter === 'past') {
          return appointmentDate <= now;
        }
        return true;
      });
    }

    // Filter by date range
    if (dateRangeFilter) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      filtered = filtered.filter(appointment => {
        const appointmentDate = new Date(appointment.appointment_time);
        switch (dateRangeFilter) {
          case 'today':
            return appointmentDate >= today && appointmentDate < tomorrow;
          case 'tomorrow':
            return appointmentDate >= tomorrow && appointmentDate < nextWeek;
          case 'this_week':
            return appointmentDate >= today && appointmentDate < nextWeek;
          case 'this_month':
            return appointmentDate >= today && appointmentDate < nextMonth;
          default:
            return true;
        }
      });
    }

    // Filter by amount range
    if (amountRangeFilter) {
      filtered = filtered.filter(appointment => {
        const amount = appointment.amount_paid;
        switch (amountRangeFilter) {
          case 'low':
            return amount <= 500;
          case 'medium':
            return amount > 500 && amount <= 1000;
          case 'high':
            return amount > 1000;
          default:
            return true;
        }
      });
    }

    // Filter by hospital
    if (hospitalFilter) {
      filtered = filtered.filter(appointment =>
        appointment.hospital?.id === hospitalFilter
      );
    }

    setFilteredAppointments(filtered);
  };

  const getAppointmentStatus = (appointmentTime: string) => {
    const now = new Date();
    const appointmentDate = new Date(appointmentTime);
    
    if (appointmentDate > now) {
      return { status: 'Upcoming', color: 'bg-green-100 text-green-800' };
    } else {
      return { status: 'Completed', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTotalRevenue = () => {
    return appointments.reduce((total, appointment) => total + appointment.amount_paid, 0);
  };

  const getUpcomingCount = () => {
    const now = new Date();
    return appointments.filter(appointment => new Date(appointment.appointment_time) > now).length;
  };

  const getCompletedCount = () => {
    const now = new Date();
    return appointments.filter(appointment => new Date(appointment.appointment_time) <= now).length;
  };

  const getUniqueHospitals = () => {
    const hospitals = appointments
      .map(appointment => appointment.hospital)
      .filter((hospital, index, self) => 
        hospital && self.findIndex(h => h?.id === hospital.id) === index
      );
    return hospitals;
  };

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const handleCancelAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowCancelModal(true);
  };

  const handleRescheduleAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    const appointmentDate = new Date(appointment.appointment_time);
    setRescheduleForm({
      date: appointmentDate.toISOString().split('T')[0],
      time: appointmentDate.toTimeString().slice(0, 5)
    });
    setShowRescheduleModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedAppointment(null);
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setSelectedAppointment(null);
  };

  const closeRescheduleModal = () => {
    setShowRescheduleModal(false);
    setSelectedAppointment(null);
    setRescheduleForm({ date: '', time: '' });
  };

  const handleCancelConfirm = async () => {
    if (!selectedAppointment) return;

    setLoadingAction(true);
    try {
      // This would integrate with your appointment cancellation API
      // await appointmentsAPI.cancel(selectedAppointment.id);
      
      toast.success('Appointment cancelled successfully');
      closeCancelModal();
      loadAppointments(); // Reload data to reflect changes
    } catch (error: any) {
      toast.error(getErrorMessage(error, 'Failed to cancel appointment'));
    } finally {
      setLoadingAction(false);
    }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    setLoadingAction(true);
    try {
      // This would integrate with your appointment reschedule API
      // await appointmentsAPI.reschedule(selectedAppointment.id, {
      //   appointment_time: `${rescheduleForm.date}T${rescheduleForm.time}`
      // });
      
      toast.success('Appointment rescheduled successfully');
      closeRescheduleModal();
      loadAppointments(); // Reload data to reflect changes
    } catch (error: any) {
      toast.error(getErrorMessage(error, 'Failed to reschedule appointment'));
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
        <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
        <p className="text-gray-600">Manage and track your appointments</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Appointments
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {appointments.length}
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
                <ClockIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Upcoming
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {getUpcomingCount()}
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
                    Completed
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {getCompletedCount()}
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
                    ₹{getTotalRevenue().toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
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
              placeholder="Search appointments..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Appointments</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Completed</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              value={dateRangeFilter}
              onChange={(e) => setDateRangeFilter(e.target.value)}
            >
              <option value="">All Dates</option>
              <option value="today">Today</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
            </select>
          </div>

          {/* Amount Range Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              value={amountRangeFilter}
              onChange={(e) => setAmountRangeFilter(e.target.value)}
            >
              <option value="">All Amounts</option>
              <option value="low">Low (≤ ₹500)</option>
              <option value="medium">Medium (₹501-₹1000)</option>
              <option value="high">High (&gt; ₹1000)</option>
            </select>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-end text-sm text-gray-500">
            {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-8">
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search criteria or filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {user?.role === 'patient' ? 'Doctor' : 'Patient'}
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAppointments.map((appointment) => {
                    const status = getAppointmentStatus(appointment.appointment_time);
                    return (
                      <tr key={appointment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                <UserIcon className="h-5 w-5 text-primary-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user?.role === 'patient' 
                                  ? appointment.doctor?.name 
                                  : appointment.patient?.name
                                }
                              </div>
                              <div className="text-sm text-gray-500">
                                {user?.role === 'patient' 
                                  ? appointment.doctor?.qualifications 
                                  : appointment.patient?.email
                                }
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <BuildingOfficeIcon className="h-4 w-4 text-gray-400 mr-2" />
                            <div className="text-sm text-gray-900">{appointment.hospital?.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDateTime(appointment.appointment_time)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{appointment.amount_paid}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                            {status.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            onClick={() => handleViewDetails(appointment)}
                            className="text-primary-600 hover:text-primary-900 mr-3"
                          >
                            View
                          </button>
                          {status.status === 'Upcoming' && (
                            <>
                              <button 
                                onClick={() => handleRescheduleAppointment(appointment)}
                                className="text-blue-600 hover:text-blue-900 mr-3"
                              >
                                Reschedule
                              </button>
                              <button 
                                onClick={() => handleCancelAppointment(appointment)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Appointment Details Modal */}
      {showDetailsModal && selectedAppointment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                    <CalendarIcon className="h-8 w-8 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Appointment Details</h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {formatDateTime(selectedAppointment.appointment_time)}
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
                {/* Appointment Overview */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Appointment Overview</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">
                        Status: {getAppointmentStatus(selectedAppointment.appointment_time).status}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">
                        Amount: ₹{selectedAppointment.amount_paid}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">
                        {selectedAppointment.hospital?.name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Doctor Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Doctor Information</h4>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                        <UserIcon className="h-6 w-6 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{selectedAppointment.doctor?.name}</h5>
                        <p className="text-sm text-gray-500">{selectedAppointment.doctor?.qualifications}</p>
                        {selectedAppointment.doctor?.specializations && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {selectedAppointment.doctor.specializations.map((spec, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                              >
                                {spec}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Patient Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Patient Information</h4>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                        <UserIcon className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{selectedAppointment.patient?.name}</h5>
                        <div className="space-y-1 mt-2">
                          <div className="flex items-center text-sm text-gray-500">
                            <EnvelopeIcon className="h-4 w-4 mr-2" />
                            {selectedAppointment.patient?.email}
                          </div>
                          {selectedAppointment.patient?.unique_id && (
                            <div className="flex items-center text-sm text-gray-500">
                              <UserIcon className="h-4 w-4 mr-2" />
                              ID: {selectedAppointment.patient.unique_id}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hospital Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Hospital Information</h4>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                        <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900">{selectedAppointment.hospital?.name}</h5>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <MapPinIcon className="h-4 w-4 mr-1" />
                          {selectedAppointment.hospital?.location}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end mt-6 space-x-3">
                {getAppointmentStatus(selectedAppointment.appointment_time).status === 'Upcoming' && (
                  <>
                    <button
                      onClick={() => {
                        closeDetailsModal();
                        handleRescheduleAppointment(selectedAppointment);
                      }}
                      className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Reschedule
                    </button>
                    <button
                      onClick={() => {
                        closeDetailsModal();
                        handleCancelAppointment(selectedAppointment);
                      }}
                      className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Cancel
                    </button>
                  </>
                )}
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

      {/* Cancel Appointment Modal */}
      {showCancelModal && selectedAppointment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Cancel Appointment</h3>
                <button
                  onClick={closeCancelModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">Cancel Appointment</h4>
                    <p className="text-sm text-gray-500">{formatDateTime(selectedAppointment.appointment_time)}</p>
                  </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium">Are you sure you want to cancel this appointment?</p>
                      <p className="mt-1">This action cannot be undone. The appointment will be permanently cancelled.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2">Appointment Details:</h5>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><strong>Doctor:</strong> {selectedAppointment.doctor?.name}</p>
                    <p><strong>Hospital:</strong> {selectedAppointment.hospital?.name}</p>
                    <p><strong>Date & Time:</strong> {formatDateTime(selectedAppointment.appointment_time)}</p>
                    <p><strong>Amount:</strong> ₹{selectedAppointment.amount_paid}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeCancelModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Keep Appointment
                </button>
                <button
                  onClick={handleCancelConfirm}
                  disabled={loadingAction}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loadingAction ? 'Cancelling...' : 'Cancel Appointment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Appointment Modal */}
      {showRescheduleModal && selectedAppointment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Reschedule Appointment</h3>
                <button
                  onClick={closeRescheduleModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <PencilIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">Reschedule Appointment</h4>
                    <p className="text-sm text-gray-500">Current: {formatDateTime(selectedAppointment.appointment_time)}</p>
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleRescheduleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Date</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={rescheduleForm.date}
                    onChange={(e) => setRescheduleForm({ ...rescheduleForm, date: e.target.value })}
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Time</label>
                  <input
                    type="time"
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={rescheduleForm.time}
                    onChange={(e) => setRescheduleForm({ ...rescheduleForm, time: e.target.value })}
                  />
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h5 className="font-medium text-gray-900 mb-2">Appointment Details:</h5>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><strong>Doctor:</strong> {selectedAppointment.doctor?.name}</p>
                    <p><strong>Hospital:</strong> {selectedAppointment.hospital?.name}</p>
                    <p><strong>Amount:</strong> ₹{selectedAppointment.amount_paid}</p>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeRescheduleModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loadingAction}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {loadingAction ? 'Rescheduling...' : 'Reschedule Appointment'}
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

export default Appointments; 