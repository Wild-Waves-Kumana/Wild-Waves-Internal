import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { bookingStorage } from '../../../utils/bookingStorage';
import PricesBill from './PricesBill';

const BookingSection2 = ({ onBack, onNext }) => {
  const [bookingData, setBookingData] = useState(null);
  const [villaDetails, setVillaDetails] = useState(null);
  const [roomsDetails, setRoomsDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acStatus, setAcStatus] = useState(null);

  // Customer form state with separate NIC and Passport
  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    contactNumber: '',
    identification: {
      nic: '',
      passport: ''
    }
  });

  useEffect(() => {
    loadBookingData();

    // load saved customer (if any) via bookingStorage
    try {
      const saved = bookingStorage.getCustomer();
      if (saved) {
        setCustomer({
          name: saved.name || '',
          email: saved.email || '',
          contactNumber: saved.contactNumber || '',
          identification: {
            nic: saved.identification?.nic || '',
            passport: saved.identification?.passport || ''
          }
        });
      }
    } catch (e) {
      console.error('Failed to load saved customer:', e);
    }
  }, []);

  const loadBookingData = async () => {
    setLoading(true);
    try {
      const data = bookingStorage.getBookingData();
      console.log('Loaded booking data from localStorage:', data);
      setBookingData(data);

      const roomSelection = data.roomSelection;
      setAcStatus(roomSelection?.acStatus ?? null);

      // Fetch villa details
      if (roomSelection?.villaId) {
        console.log('Fetching villa with ID:', roomSelection.villaId);
        const villaResponse = await axios.get(`/api/villas/${roomSelection.villaId}`);
        console.log('Villa details:', villaResponse.data);
        setVillaDetails(villaResponse.data);
      }

      // Fetch room details
      if (roomSelection?.rooms && roomSelection.rooms.length > 0) {
        const roomPromises = roomSelection.rooms.map(room =>
          axios.get(`/api/rooms/${room.roomId}`)
        );
        const roomResponses = await Promise.all(roomPromises);
        const roomsData = roomResponses.map(res => res.data);
        setRoomsDetails(roomsData);
      }
    } catch (error) {
      console.error('Error loading booking data:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const calculateNights = () => {
    if (!bookingData?.bookingDates?.checkInDate || !bookingData?.bookingDates?.checkOutDate) return 0;
    const diff = new Date(bookingData.bookingDates.checkOutDate) - new Date(bookingData.bookingDates.checkInDate);
    return Math.round(diff / (1000 * 60 * 60 * 24));
  };

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    
    setCustomer(prev => {
      let updated;
      
      // Handle nested identification fields
      if (name === 'nic' || name === 'passport') {
        updated = {
          ...prev,
          identification: {
            ...prev.identification,
            [name]: value
          }
        };
      } else {
        updated = { ...prev, [name]: value };
      }
      
      // Auto-save to localStorage
      try {
        bookingStorage.saveCustomer(updated);
      } catch (err) {
        console.error('Failed to auto-save customer via bookingStorage:', err);
      }
      
      return updated;
    });
  };

  const saveCustomer = () => {
    try {
      bookingStorage.saveCustomer(customer);
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

  if (!bookingData || !bookingData.bookingDates) {
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

  const renderAcLabel = () => {
    if (acStatus === 1) return <span className="text-sm font-medium text-green-700">AC</span>;
    if (acStatus === 0) return <span className="text-sm font-medium text-gray-700">Non-AC</span>;
    return <span className="text-sm text-gray-500">Not selected</span>;
  };

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
                  {new Date(bookingData.bookingDates.checkInDate).toLocaleDateString('en-US', {
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
                  {new Date(bookingData.bookingDates.checkOutDate).toLocaleDateString('en-US', {
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

                  <div className="text-right">
                    <div className="mb-2">
                      <p className="text-xs text-gray-500">AC Preference</p>
                      {renderAcLabel()}
                    </div>

                    {villaDetails.hasAC && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                        AC Available
                      </span>
                    )}
                  </div>
                </div>
                {villaDetails.description && (
                  <p className="text-sm text-gray-600 mt-3">{villaDetails.description}</p>
                )}
              </div>
            </div>
          ) : bookingData.roomSelection?.villaId ? (
            <div className="mb-6 pb-6 border-b">
              <h4 className="font-semibold text-gray-700 mb-3">Selected Villa</h4>
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ Villa details could not be loaded. Villa ID: {bookingData.roomSelection.villaId}
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
          ) : bookingData.roomSelection?.rooms && bookingData.roomSelection.rooms.length > 0 ? (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-3">Selected Rooms</h4>
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ Room details could not be loaded. {bookingData.roomSelection.rooms.length} room(s) selected.
                </p>
              </div>
            </div>
          ) : null}

          {/* Prices bill */}
          <div className="mt-4">
            <PricesBill />
          </div>
        </div>

        {/* Right column: Customer form */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Customer Details</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                name="name"
                value={customer.name}
                onChange={handleCustomerChange}
                type="text"
                placeholder="John Doe"
                className="w-full px-4 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                name="email"
                value={customer.email}
                onChange={handleCustomerChange}
                type="email"
                placeholder="name@example.com"
                className="w-full px-4 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number *</label>
              <input
                name="contactNumber"
                value={customer.contactNumber}
                onChange={handleCustomerChange}
                type="tel"
                placeholder="+94 77 123 4567"
                className="w-full px-4 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="border-t pt-4 mt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Identification</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NIC Number</label>
                  <input
                    name="nic"
                    value={customer.identification.nic}
                    onChange={handleCustomerChange}
                    type="text"
                    placeholder="200012345678 or 991234567V"
                    className="w-full px-4 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Sri Lankan National Identity Card</p>
                </div>

                <div className="text-center text-xs text-gray-500 font-medium">OR</div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Passport Number</label>
                  <input
                    name="passport"
                    value={customer.identification.passport}
                    onChange={handleCustomerChange}
                    type="text"
                    placeholder="N1234567"
                    className="w-full px-4 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">For international guests</p>
                </div>
              </div>

              <p className="text-xs text-gray-600 mt-3 bg-blue-50 p-2 rounded">
                ℹ️ Please provide either NIC or Passport number for identification
              </p>
            </div>

            <div className="flex gap-3 justify-end mt-6 pt-4 border-t">
              <button
                type="button"
                onClick={() => {
                  const emptyCustomer = {
                    name: '',
                    email: '',
                    contactNumber: '',
                    identification: { nic: '', passport: '' }
                  };
                  setCustomer(emptyCustomer);
                  bookingStorage.saveCustomer(emptyCustomer);
                }}
                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
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
            disabled={!customer.name || !customer.email || !customer.contactNumber || (!customer.identification.nic && !customer.identification.passport)}
            className="bg-green-600 text-white px-8 py-3 rounded-md hover:bg-green-700 transition-colors font-medium flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Continue to Summary
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