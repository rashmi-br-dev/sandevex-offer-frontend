'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { notification } from 'antd';

interface SlotAvailability {
  '2-3': number;
  '3-4': number;
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

export default function BookSlotPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [api, contextHolder] = notification.useNotification();

  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
    const email = searchParams.get('email') || '';
    const name = searchParams.get('name') || '';
    const position = searchParams.get('position') || '';
    const candidateId = searchParams.get('candidateId') || '';
    
    setFormData(prev => ({
      ...prev,
      email,
      name,
      position,
      candidateId
    }));

    // Fetch candidate details to get phone number
    if (candidateId) {
      fetchCandidatePhone(candidateId);
    }
  }, [searchParams]);

  const fetchCandidatePhone = async (candidateId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}students/${candidateId}`);
      const data = await res.json();
      
      if (res.ok && data.student?.mobile) {
        setFormData(prev => ({
          ...prev,
          phone: data.student.mobile
        }));
      }
    } catch (error) {
      console.error('Failed to fetch candidate phone:', error);
    }
  };

  useEffect(() => {
    fetchAvailableDates();
  }, []);

  const fetchAvailableDates = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}slots/dates`);
    const data = await response.json();
    setAvailableDates(data.dates || []);
    setLoading(false);
  };

  const notifySuccess = () => {
    api.success({
      message: 'Slot Confirmed',
      description: `Confirmation mail sent to ${formData.email}`,
      placement: 'topRight'
    });
  };

  const notifyError = (msg: string) => {
    api.error({
      message: 'Booking Failed',
      description: msg,
      placement: 'topRight'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    console.log('Submitting appointment data:', formData);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('Appointment response:', data);

      if (!response.ok) notifyError(data.message);
      else {
        notifySuccess();
        setTimeout(() => router.push('/thank-you'), 2500); // Redirect to thank-you page
      }
    } catch {
      notifyError('Server error');
    }

    setSubmitting(false);
  };

  const handleInputChange = (e: any) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const formatDateDisplay = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] px-3 sm:px-4 py-10 sm:py-16">
      {contextHolder}

      <div className="w-full max-w-lg mx-auto bg-white border border-gray-200 rounded-xl p-5 sm:p-8">

        {/* Logo */}
        <div className="pb-5 mb-5 border-b border-gray-200 flex justify-center">
          <img src="/1.png" alt="Sandevex Logo" className="h-14 sm:h-20 w-auto" />
        </div>

        <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
          Book Offer Letter Collection Slot
        </h1>

        <p className="text-sm text-gray-600 mt-1 sm:mt-2">
          Choose a convenient time to visit our office
        </p>

        <form onSubmit={handleSubmit} className="mt-6 sm:mt-8 space-y-4 sm:space-y-5">

          <Input label="Full Name" name="name" value={formData.name} onChange={handleInputChange} />
          <Input label="Email" name="email" value={formData.email} readOnly />
          <Input label="Phone" name="phone" value={formData.phone} onChange={handleInputChange} />
          {/* <Input label="Position" name="position" value={formData.position} onChange={handleInputChange} /> */}

          {/* Date */}
          <div>
            <label className="text-sm text-gray-700">Select Date</label>
            <select
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-3 text-[16px] focus:outline-none focus:ring-1 focus:ring-black"
            >
              <option value="">Choose a date</option>
              {availableDates.map(d => (
                <option key={d} value={d}>{formatDateDisplay(d)}</option>
              ))}
            </select>
          </div>

          {/* Slot */}
          <div>
            <label className="text-sm text-gray-700">Select Time</label>
            <select
              name="slot"
              value={formData.slot}
              onChange={handleInputChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-3 text-[16px]"
            >
              <option value="2-3">2:00 PM – 3:00 PM (Booking closes at 11:00 AM)</option>
              <option value="3-4">3:00 PM – 4:00 PM (Booking closes at 12:00 PM)</option>
            </select>
          </div>

          {/* Location */}
          <div className="border border-gray-200 rounded-lg p-4 text-sm">
            <p className="font-medium text-gray-900 mb-1">Office Location</p>

            <a
              href="https://maps.app.goo.gl/J251RV3LQo9CwUnr9"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-700 hover:text-black transition"
            >
              {/* Location Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 21s-6-5.686-6-10a6 6 0 1112 0c0 4.314-6 10-6 10z"
                />
                <circle cx="12" cy="11" r="2.5" />
              </svg>

              <span className="underline underline-offset-2">
                Sandevex | SandHut India Private Limited
              </span>
            </a>
          </div>

          <button
            type="submit"
            disabled={submitting || !formData.date}
            className="w-full bg-black text-white rounded-lg py-3 text-sm font-medium hover:opacity-90 active:scale-[0.99] transition disabled:opacity-40"
          >
            {submitting ? 'Booking...' : 'Confirm Slot'}
          </button>

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
            <p className="font-medium">⏰ Important:</p>
            <p>Slots must be booked at least 3 hours before the scheduled time.</p>
          </div>

        </form>
      </div>
    </div>
  );
}

function Input({ label, ...props }: any) {
  return (
    <div>
      <label className="text-sm text-gray-700">{label}</label>
      <input
        {...props}
        className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-3 text-[16px] focus:outline-none focus:ring-1 focus:ring-black"
      />
    </div>
  );
}
