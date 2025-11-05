import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { bookingStorage } from '../../utils/bookingStorage';

const BookingSection2 = ({ onBack, onNext }) => {
  const [bookingData, setBookingData] = useState(null);
  const [villaDetails, setVillaDetails] = useState(null);
  const [roomsDetails, setRoomsDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  // Customer form state
  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    contactNumber: '',
    idNumber: '' // NIC or passport
  });

  useEffect(() => {
    loadBookingData();

    // load saved customer (if any)
    try {
      const saved = localStorage.getItem('booking_customer');
      if (saved) setCustomer(JSON.parse(saved));
    } catch (e) {
      console.error('Failed to load saved customer:', e);
      // ignore
    }
  }, []);

  const loadBookingData = async () => {
    setLoading(true);
    try {
      // Get data from localStorage
      const data = bookingStorage.getBookingData();
      console.log('Loaded booking data from localStorage:', data); // Debug log
      setBookingData(data);

      // Fetch villa details
      if (data.villa) {
        console.log('Fetching villa with ID:', data.villa); // Debug log
        const villaResponse = await axios.get(`/api/villas/${data.villa}`);
        console.log('Villa details:', villaResponse.data); // Debug log
        setVillaDetails(villaResponse.data);
      }

      // Fetch room details
      if (data.selectedRooms && data.selectedRooms.length > 0) {
        const roomPromises = data.selectedRooms.map(roomId =>
          axios.get(`/api/rooms/${roomId}`)
        );
        const roomResponses = await Promise.all(roomPromises);
        const roomsData = roomResponses.map(res => res.data);
        setRoomsDetails(roomsData); // ✅ Sets room details
      }
    } catch (error) {
      console.error('Error loading booking data:', error);
      console.error('Error details:', error.response?.data); // More detailed error log
    } finally {
      setLoading(false);
    }
  };

  const calculateNights = () => {
    if (!bookingData?.checkinDate || !bookingData?.checkoutDate) return 0;
    const diff = new Date(bookingData.checkoutDate) - new Date(bookingData.checkinDate);
    return Math.round(diff / (1000 * 60 * 60 * 24));
  };

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setCustomer(prev => ({ ...prev, [name]: value }));
  };

  const saveCustomer = () => {
    try {
      localStorage.setItem('booking_customer', JSON.stringify(customer));
      // Optionally merge into booking data object
      const current = bookingStorage.getBookingData() || {};
      bookingStorage.saveBookingData?.({ ...current, customer }) || localStorage.setItem('booking_bookingData', JSON.stringify({ ...current, customer }));
      alert('Customer details saved locally');
    } catch (e) {
      console.error('Failed to save customer:', e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading booking details...</span>
      </div>
    );
  }

  if (!bookingData) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <p className="text-gray-600">No booking data found. Please start from the beginning.</p>
        <button
          onClick={onBack}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  const nights = calculateNights();

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column: Booking summary */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Booking Summary</h3>
            <button
              onClick={onBack}
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              ← Edit Selection
            </button>
          </div>

          {/* Dates Section */}
          <div className="mb-6 pb-6 border-b">
            <h4 className="font-semibold text-gray-700 mb-3">Stay Duration</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Check-in</p>
                <p className="text-lg font-semibold text-blue-900">
                  {new Date(bookingData.checkinDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Check-out</p>
                <p className="text-lg font-semibold text-blue-900">
                  {new Date(bookingData.checkoutDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total Nights</p>
                <p className="text-2xl font-bold text-green-600">
                  {nights} {nights === 1 ? 'Night' : 'Nights'}
                </p>
              </div>
            </div>
          </div>

          {/* Villa Section */}
          {villaDetails ? (
            <div className="mb-6 pb-6 border-b">
              <h4 className="font-semibold text-gray-700 mb-3">Selected Villa</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="text-lg font-semibold text-gray-900">{villaDetails.villaName}</h5>
                    <p className="text-sm text-gray-600">{villaDetails.villaId}</p>
                    <p className="text-xs text-gray-500 mt-1">MongoDB ID: {villaDetails._id}</p>
                    {villaDetails.villaLocation && (
                      <p className="text-sm text-gray-600 mt-1">📍 {villaDetails.villaLocation}</p>
                    )}
                  </div>
                  {villaDetails.hasAC && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                      AC Available
                    </span>
                  )}
                </div>
                {villaDetails.description && (
                  <p className="text-sm text-gray-600 mt-3">{villaDetails.description}</p>
                )}
              </div>
            </div>
          ) : bookingData.villa ? (
            <div className="mb-6 pb-6 border-b">
              <h4 className="font-semibold text-gray-700 mb-3">Selected Villa</h4>
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ Villa details could not be loaded. Villa ID: {bookingData.villa}
                </p>
              </div>
            </div>
          ) : null}

          {/* Rooms Section */}
          {roomsDetails.length > 0 ? (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-3">
                Selected Rooms ({roomsDetails.length})
              </h4>
              <div className="space-y-3">
                {roomsDetails.map((room) => (
                  <div key={room._id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h5 className="font-semibold text-gray-900">{room.roomName}</h5>
                        <p className="text-xs text-gray-500">{room.roomId}</p>
                        <p className="text-xs text-gray-400 mt-1">MongoDB ID: {room._id}</p>
                      </div>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded capitalize">
                        {room.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : bookingData.selectedRooms && bookingData.selectedRooms.length > 0 ? (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-3">Selected Rooms</h4>
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ Room details could not be loaded. {bookingData.selectedRooms.length} room(s) selected.
                </p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Right column: Customer form */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Customer Details</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                name="name"
                value={customer.name}
                onChange={handleCustomerChange}
                type="text"
                placeholder="John Doe"
                className="w-full px-4 py-2 border rounded-md bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                name="email"
                value={customer.email}
                onChange={handleCustomerChange}
                type="email"
                placeholder="name@example.com"
                className="w-full px-4 py-2 border rounded-md bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
              <input
                name="contactNumber"
                value={customer.contactNumber}
                onChange={handleCustomerChange}
                type="tel"
                placeholder="+94 77 123 4567"
                className="w-full px-4 py-2 border rounded-md bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NIC / Passport Number</label>
              <input
                name="idNumber"
                value={customer.idNumber}
                onChange={handleCustomerChange}
                type="text"
                placeholder="NIC or Passport"
                className="w-full px-4 py-2 border rounded-md bg-gray-50"
              />
            </div>

            <div className="flex gap-3 justify-end mt-2">
              <button
                type="button"
                onClick={() => {
                  // reset
                  setCustomer({ name: '', email: '', contactNumber: '', idNumber: '' });
                  localStorage.removeItem('booking_customer');
                }}
                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
              >
                Reset
              </button>

              <button
                type="button"
                onClick={saveCustomer}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Save Details
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons (full width) */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between">
          <button
            onClick={onBack}
            className="bg-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-400 transition-colors font-medium"
          >
            ← Back
          </button>
          <button
            onClick={() => {
              saveCustomer();
              onNext();
            }}
            className="bg-green-600 text-white px-8 py-3 rounded-md hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
          >
            Continue to Payment
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingSection2;