import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Toaster from '../../components/common/Toaster';

const CreateBooking = () => {
  const [bookingId, setBookingId] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [idLoading, setIdLoading] = useState(false);
  
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  // Fetch next booking ID on component mount
  useEffect(() => {
    fetchNextBookingId();
  }, []);

  const fetchNextBookingId = async () => {
    setIdLoading(true);
    try {
      const res = await axios.get('/api/bookings/next-id');
      if (res.data?.nextBookingId) {
        setBookingId(res.data.nextBookingId);
      }
    } catch (err) {
      console.error('Failed to fetch next booking id', err);
      setToast({
        show: true,
        message: 'Failed to generate booking ID',
        type: 'error'
      });
    } finally {
      setIdLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !contactNumber) {
      setToast({
        show: true,
        message: 'Please fill in all required fields',
        type: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/bookings/create', {
        bookingId,
        email,
        contactNumber
      });

      setToast({
        show: true,
        message: 'Booking created successfully!',
        type: 'success'
      });

      // Reset form
      setEmail('');
      setContactNumber('');
      fetchNextBookingId(); // Get next booking ID
    } catch (err) {
      console.error('Failed to create booking:', err);
      setToast({
        show: true,
        message: err.response?.data?.message || 'Failed to create booking',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Toast Notification */}
      <Toaster
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
        duration={3000}
        position="top-right"
      />

      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Create Booking</h2>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Booking ID Display */}
            <div>
              <label className="block font-medium mb-1">Booking ID</label>
              <div className="w-full px-4 py-2 border rounded-md bg-gray-50 text-gray-700 flex items-center">
                {idLoading ? (
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Generating...
                  </div>
                ) : (
                  <span className="font-mono text-lg">{bookingId}</span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Format: BDDMMYYXXXX (Today's date + sequence number)
              </p>
            </div>

            {/* Email Input */}
            <div>
              <label className="block font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="customer@example.com"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring"
              />
            </div>

            {/* Contact Number Input */}
            <div>
              <label className="block font-medium mb-1">Contact Number</label>
              <input
                type="tel"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                required
                placeholder="+94 XX XXX XXXX"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || idLoading}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </span>
              ) : (
                'Create Booking'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateBooking;
