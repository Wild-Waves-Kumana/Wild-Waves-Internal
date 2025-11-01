import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Toaster from '../../components/common/Toaster';
import BookingCalendar from '../../components/bookings/BookingCalender';

const CreateBooking = () => {
  const [bookingId, setBookingId] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [selectedDates, setSelectedDates] = useState([]);
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

  const toggleDateSelection = (date) => {
    const isSelected = selectedDates.some(
      selectedDate => 
        selectedDate.getDate() === date.getDate() &&
        selectedDate.getMonth() === date.getMonth() &&
        selectedDate.getFullYear() === date.getFullYear()
    );

    if (isSelected) {
      setSelectedDates(selectedDates.filter(d => 
        !(d.getDate() === date.getDate() &&
          d.getMonth() === date.getMonth() &&
          d.getFullYear() === date.getFullYear())
      ));
    } else {
      setSelectedDates([...selectedDates, date]);
    }
  };

  // Get check-in and check-out dates from selected dates
  const getCheckInCheckOut = () => {
    if (selectedDates.length === 0) return { checkin: null, checkout: null };
    
    const sorted = [...selectedDates].sort((a, b) => a - b);
    return {
      checkin: sorted[0],
      checkout: sorted[sorted.length - 1]
    };
  };

  const { checkin, checkout } = getCheckInCheckOut();

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

    if (selectedDates.length === 0) {
      setToast({
        show: true,
        message: 'Please select at least one date',
        type: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/bookings/create', {
        bookingId,
        email,
        contactNumber,
        selectedDates: selectedDates.map(date => date.toISOString())
      });

      console.log('Booking created:', response.data);

      setToast({
        show: true,
        message: 'Booking created successfully!',
        type: 'success'
      });

      // Reset form
      setEmail('');
      setContactNumber('');
      setSelectedDates([]);
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

      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Create Booking</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Form */}
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

              {/* Check-in and Check-out Dates Display */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1">Check-in Date</label>
                  <div className="w-full px-4 py-2 border rounded-md bg-gray-50 text-gray-700">
                    {checkin ? (
                      <span className="text-sm">
                        {checkin.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">Not selected</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block font-medium mb-1">Check-out Date</label>
                  <div className="w-full px-4 py-2 border rounded-md bg-gray-50 text-gray-700">
                    {checkout ? (
                      <span className="text-sm">
                        {checkout.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">Not selected</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Selected Dates Display */}
              <div>
                <label className="block font-medium mb-1">Selected Dates</label>
                <div className="w-full px-4 py-2 border rounded-md bg-gray-50 text-gray-700 min-h-[60px]">
                  {selectedDates.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {[...selectedDates].sort((a, b) => a - b).map((date, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                        >
                          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          <button
                            type="button"
                            onClick={() => toggleDateSelection(date)}
                            className="hover:text-blue-900"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">No dates selected</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedDates.length} date(s) selected
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || idLoading || selectedDates.length === 0}
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

          {/* Right Column - Calendar Component */}
          <BookingCalendar 
            selectedDates={selectedDates}
            onDateToggle={toggleDateSelection}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateBooking;
