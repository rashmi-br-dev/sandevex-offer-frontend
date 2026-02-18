'use client';

import { useState, useEffect } from 'react';
import React from 'react';
import { useRouter } from 'next/navigation';

interface Appointment {
  id: string;
  candidateId: any;
  name: string;
  email: string;
  phone: string;
  position: string;
  date: string;
  slot: string;
  letterCollected: boolean;
  collectedAt?: string;
  createdAt: string;
}

interface FormData {
  candidateId: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  date: string;
  slot: '2-3' | '3-4';
}

export default function AppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [slotAvailability, setSlotAvailability] = useState<Record<string, number>>({ '2-3': 0, '3-4': 0 });

  const [formData, setFormData] = useState<FormData>({
    candidateId: '',
    name: '',
    email: '',
    phone: '',
    position: '',
    date: '',
    slot: '2-3'
  });

  useEffect(() => {
    // Check admin authentication
    const adminPassword = sessionStorage.getItem('adminPassword');
    if (adminPassword !== 'sandevex123') {
      router.push('/admin/login');
      return;
    }
    
    fetchAppointments();
    fetchAvailableDates();
  }, [router]);

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}appointments`);
      const data = await response.json();
      
      if (response.ok) {
        setAppointments(data.appointments);
      } else {
        setError('Failed to fetch appointments');
      }
    } catch (err) {
      setError('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  // Group appointments by date and slot
  const groupedAppointments = appointments.reduce((acc, appointment) => {
    const date = appointment.date;
    const slot = appointment.slot;
    
    if (!acc[date]) {
      acc[date] = { '2-3': [], '3-4': [] };
    }
    
    acc[date][slot].push(appointment);
    return acc;
  }, {} as Record<string, Record<string, any[]>>);

  const sortedDates = Object.keys(groupedAppointments).sort();

  const fetchAvailableDates = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}slots/dates`);
      const data = await response.json();
      
      if (response.ok) {
        setAvailableDates(data.dates);
      }
    } catch (err) {
      console.error('Failed to fetch available dates');
    }
  };

  const fetchSlotAvailability = async (date: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/slots?date=${date}&_t=${Date.now()}`);
      const data = await response.json();
      
      if (response.ok) {
        setSlotAvailability(data);
      }
    } catch (err) {
      console.error('Failed to fetch slot availability');
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Appointment booked successfully');
        setShowBookingForm(false);
        setFormData({
          candidateId: '',
          name: '',
          email: '',
          phone: '',
          position: '',
          date: '',
          slot: '2-3'
        });
        fetchAppointments();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to book appointment');
      }
    } catch (err) {
      setError('Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatDateDisplay = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTimeDisplay = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSendBookingEmail = async (appointment: Appointment) => {
    try {
      const response = await fetch('http://localhost:5000/api/appointments/send-booking-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: appointment.name,
          email: appointment.email,
          position: appointment.position,
          candidateId: appointment.candidateId
        }),
      });

      if (response.ok) {
        setSuccess('Booking email sent successfully');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to send booking email');
      }
    } catch (err) {
      setError('Failed to send booking email');
    }
  };

  const handleMarkCollected = async (appointmentId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}appointments/${appointmentId}/collected`, {
        method: 'PATCH',
      });

      if (response.ok) {
        setSuccess('Letter marked as collected');
        fetchAppointments();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to update appointment');
      }
    } catch (err) {
      setError('Failed to update appointment');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-md rounded-lg">
          <div className="bg-blue-600 text-white p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">Appointments Management</h1>
                <p className="mt-2 text-blue-100">Manage offer letter collection appointments</p>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => router.push('/admin/appoints-manage')}
                  className="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition-colors"
                >
                  Manage Accepted Offers
                </button>
                <button
                  onClick={() => setShowBookingForm(!showBookingForm)}
                  className="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition-colors"
                >
                  {showBookingForm ? 'Cancel' : 'Book Slot'}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 m-6 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 m-6 rounded-md">
              {success}
            </div>
          )}

          {showBookingForm && (
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold mb-4">Book New Appointment</h2>
              <form onSubmit={handleBookingSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Candidate ID *</label>
                  <input
                    type="text"
                    name="candidateId"
                    value={formData.candidateId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Position *</label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                  <select
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose a date</option>
                    {availableDates.map(date => (
                      <option key={date} value={date}>
                        {formatDateDisplay(date)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Slot *</label>
                  <select
                    name="slot"
                    value={formData.slot}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="2-3">2:00 PM - 3:00 PM ({slotAvailability['2-3']} bookings)</option>
                    <option value="3-4">3:00 PM - 4:00 PM ({slotAvailability['3-4']} bookings)</option>
                  </select>
                  {formData.date && (
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="text-blue-600">Unlimited slots available</span>
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                  >
                    {submitting ? 'Booking...' : 'Book Appointment'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Scheduled Appointments ({appointments.length})</h2>
            
            {appointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No appointments scheduled yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Candidate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Position
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Slot
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
                    {sortedDates.map((date) => (
                      <React.Fragment key={date}>
                        <tr>
                          <td colSpan={6} className="px-6 py-3 bg-gray-50 font-semibold text-gray-900">
                            {formatDateDisplay(date)}
                          </td>
                        </tr>
                        
                        {/* 2-3 PM Slot */}
                        <tr>
                          <td colSpan={6} className="px-6 py-2 bg-blue-50 text-sm font-medium text-blue-900">
                            2:00 PM - 3:00 PM
                          </td>
                        </tr>
                        {groupedAppointments[date]['2-3'].map((appointment) => (
                          <tr key={appointment.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{appointment.name}</div>
                              <div className="text-sm text-gray-500">ID: {appointment.candidateId?._id || appointment.candidateId}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{appointment.email}</div>
                              <div className="text-sm text-gray-500">{appointment.phone}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {appointment.position}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{formatDateDisplay(appointment.date)}</div>
                              <div className="text-sm text-gray-500">{appointment.slot === '2-3' ? '2:00 PM - 3:00 PM' : '3:00 PM - 4:00 PM'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                appointment.letterCollected 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {appointment.letterCollected ? 'Collected' : 'Pending'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleMarkCollected(appointment.id)}
                                disabled={appointment.letterCollected}
                                className={`px-3 py-1 rounded text-xs ${
                                  appointment.letterCollected
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                              >
                                {appointment.letterCollected ? 'Collected' : 'Mark Collected'}
                              </button>
                            </td>
                          </tr>
                        ))}
                        
                        {/* 3-4 PM Slot */}
                        <tr>
                          <td colSpan={6} className="px-6 py-2 bg-blue-50 text-sm font-medium text-blue-900">
                            3:00 PM - 4:00 PM
                          </td>
                        </tr>
                        {groupedAppointments[date]['3-4'].map((appointment) => (
                          <tr key={appointment.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{appointment.name}</div>
                              <div className="text-sm text-gray-500">ID: {appointment.candidateId?._id || appointment.candidateId}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{appointment.email}</div>
                              <div className="text-sm text-gray-500">{appointment.phone}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {appointment.position}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{formatDateDisplay(appointment.date)}</div>
                              <div className="text-sm text-gray-500">{appointment.slot === '2-3' ? '2:00 PM - 3:00 PM' : '3:00 PM - 4:00 PM'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                appointment.letterCollected 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {appointment.letterCollected ? 'Collected' : 'Pending'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleMarkCollected(appointment.id)}
                                disabled={appointment.letterCollected}
                                className={`px-3 py-1 rounded text-xs ${
                                  appointment.letterCollected
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                              >
                                {appointment.letterCollected ? 'Collected' : 'Mark Collected'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
