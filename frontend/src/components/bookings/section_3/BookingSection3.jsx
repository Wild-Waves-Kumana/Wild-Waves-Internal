import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { bookingStorage } from '../../../utils/bookingStorage';
import PricesBill from '../section_2/PricesBill';

const BookingSection3 = ({ onBack, onNext }) => {
  const [bookingData, setBookingData] = useState(null);
  const [villaDetails, setVillaDetails] = useState(null);
  const [roomsDetails, setRoomsDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = bookingStorage.getBookingData();
      console.log('Loaded booking data:', data);
      setBookingData(data);

      // Fetch villa details from roomSelection
      if (data?.roomSelection?.villaId) {
        try {
          const r = await axios.get(`/api/villas/${data.roomSelection.villaId}`);
          setVillaDetails(r.data);
        } catch (e) {
          console.error('Error fetching villa details:', e);
          setVillaDetails(null);
        }
      }

      // Fetch rooms details from roomSelection
      if (Array.isArray(data?.roomSelection?.rooms) && data.roomSelection.rooms.length > 0) {
        try {
          const promises = data.roomSelection.rooms.map(room => 
            axios.get(`/api/rooms/${room.roomId}`).catch(() => null)
          );
          const responses = await Promise.all(promises);
          setRoomsDetails(responses.filter(Boolean).map(r => r.data));
        } catch (e) {
          console.error('Error fetching room details:', e);
          setRoomsDetails([]);
        }
      }

      setLoading(false);
    };

    load();
  }, []);

  const handleConfirm = async () => {
    setSaveError(null);
    setSaving(true);

    try {
      const data = bookingStorage.getBookingData();
      const bookingDates = data.bookingDates;
      const roomSelection = data.roomSelection;
      const prices = data.prices;
      const customer = data.customer;

      console.log('Customer data from localStorage:', customer);

      // Step 1: Generate new booking ID
      const resId = await axios.get('/api/bookings/next-id');
      const bookingId = resId.data?.nextBookingId;

      if (!bookingId) {
        throw new Error('Failed to generate booking ID');
      }

      console.log('Generated booking ID:', bookingId);

      // Step 2: Prepare payload with generated booking ID
      const payload = {
        bookingId,
        // Dates
        dates: bookingDates?.dates?.map(d => new Date(d).toISOString()) || [],
        checkInDate: bookingDates?.checkInDate ? new Date(bookingDates.checkInDate).toISOString() : null,
        checkOutDate: bookingDates?.checkOutDate ? new Date(bookingDates.checkOutDate).toISOString() : null,
        nights: bookingDates?.nights || 0,
        
        // Room Selection (including company)
        company: roomSelection?.companyId || null,
        villa: roomSelection?.villaId || null,
        selectedRooms: roomSelection?.rooms?.map(r => r.roomId) || [],
        acStatus: roomSelection?.acStatus ?? null,
        
        // Customer (including passengers)
        customer: {
          name: customer?.name || '',
          email: customer?.email || '',
          contactNumber: customer?.contactNumber || '',
          identification: customer?.identification || { nic: '', passport: '' },
          passengers: {
            adults: Number(customer?.passengers?.adults) || 0,
            children: Number(customer?.passengers?.children) || 0
          }
        },
        email: customer?.email || '',
        contactNumber: customer?.contactNumber || '',
        
        // Prices
        prices: {
          villaPrice: prices?.villaPrice || 0,
          roomPrices: prices?.roomPrices || [],
          nights: prices?.nights || 0,
          totalPrice: prices?.totalPrice || 0
        },
        
        // Full data for reference
        bookingData: data
      };

      console.log('Submitting booking payload:', payload);

      // Step 3: Save to MongoDB
      const res = await axios.post('/api/bookings/create', payload);
      console.log('Booking created in MongoDB:', res.data);

      // Step 4: Save booking ID to localStorage
      bookingStorage.saveSavedBookingId(bookingId);
      console.log('Booking ID saved to localStorage:', bookingId);
      
      // Step 5: Proceed to next step
      if (typeof onNext === 'function') {
        onNext();
      }
    } catch (err) {
      console.error('Failed to create booking:', err);
      setSaveError(err.response?.data?.message || err.message || 'Failed to create booking');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading summary...</span>
      </div>
    );
  }

  if (!bookingData || !bookingData.bookingDates || !bookingData.roomSelection) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <p className="text-gray-600">No booking data found. Please start from the beginning.</p>
        <button onClick={onBack} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
          Go Back
        </button>
      </div>
    );
  }

  const { bookingDates, roomSelection, customer: customerData } = bookingData;

  const renderAc = () => {
    if (roomSelection?.acStatus === 1) return <span className="text-green-700 font-medium">AC</span>;
    if (roomSelection?.acStatus === 0) return <span className="text-gray-700 font-medium">Non-AC</span>;
    return <span className="text-gray-500">Not selected</span>;
  };

  return (
    <div className="w-full space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold text-gray-800">Booking Summary</h3>
          <button 
            onClick={onBack} 
            className="text-blue-600 hover:text-blue-800 underline text-sm font-medium"
          >
            ← Edit Details
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Dates & Villa */}
          <div className="space-y-6">
            {/* Dates Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Stay Duration
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-xs text-gray-600">Check-in</p>
                  <p className="font-medium text-gray-800">
                    {bookingDates?.checkInDate 
                      ? new Date(bookingDates.checkInDate).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })
                      : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Check-out</p>
                  <p className="font-medium text-gray-800">
                    {bookingDates?.checkOutDate 
                      ? new Date(bookingDates.checkOutDate).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })
                      : '—'}
                  </p>
                </div>
                <div className="pt-2 border-t border-blue-300">
                  <p className="text-xs text-gray-600">Total Duration</p>
                  <p className="text-xl font-bold text-blue-600">
                    {bookingDates?.nights || 0} {bookingDates?.nights === 1 ? 'Night' : 'Nights'}
                  </p>
                </div>
              </div>
            </div>

            {/* Villa Section */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Villa
              </h4>
              {villaDetails ? (
                <div className="text-sm space-y-2">
                  <p className="font-semibold text-gray-900 text-base">{villaDetails.villaName}</p>
                  <p className="text-xs text-gray-500">{villaDetails.villaId}</p>
                  {villaDetails.villaLocation && (
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      {villaDetails.villaLocation}
                    </p>
                  )}
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-600 mb-1">AC Preference</p>
                    {renderAc()}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Villa details not available</p>
              )}
            </div>
          </div>

          {/* Middle Column: Rooms */}
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                Selected Rooms ({roomSelection?.rooms?.length || 0})
              </h4>
              {roomsDetails.length > 0 ? (
                <div className="space-y-3">
                  {roomsDetails.map(room => (
                    <div key={room._id} className="bg-white border border-green-300 rounded-md p-3">
                      <p className="font-semibold text-gray-900 text-sm">{room.roomName}</p>
                      <p className="text-xs text-gray-500">{room.roomId}</p>
                      {room.type && (
                        <span className="inline-block mt-1 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded capitalize">
                          {room.type}
                        </span>
                      )}
                      {room.capacity && (
                        <p className="text-xs text-gray-600 mt-1">Capacity: {room.capacity} persons</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : roomSelection?.rooms && roomSelection.rooms.length > 0 ? (
                <div className="space-y-2">
                  {roomSelection.rooms.map(room => (
                    <div key={room.roomId} className="bg-white border border-green-300 rounded-md p-3">
                      <p className="font-medium text-gray-900 text-sm">{room.roomName}</p>
                      <p className="text-xs text-gray-500">ID: {room.roomId}</p>
                      {room.capacity && (
                        <p className="text-xs text-gray-600">Capacity: {room.capacity}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No rooms selected</p>
              )}
            </div>
          </div>

          {/* Right Column: Customer */}
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Customer Details
              </h4>
              {customerData ? (
                <div className="text-sm space-y-2">
                  <div>
                    <p className="text-xs text-gray-600">Name</p>
                    <p className="font-medium text-gray-900">{customerData.name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Email</p>
                    <p className="font-medium text-gray-700">{customerData.email || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Contact</p>
                    <p className="font-medium text-gray-700">{customerData.contactNumber || '—'}</p>
                  </div>
                  <div className="pt-2 border-t border-purple-300">
                    <p className="text-xs text-gray-600 mb-1">Identification</p>
                    {customerData.identification?.nic && (
                      <p className="text-sm">
                        <span className="text-xs text-gray-500">NIC:</span>{' '}
                        <span className="font-medium text-gray-700">{customerData.identification.nic}</span>
                      </p>
                    )}
                    {customerData.identification?.passport && (
                      <p className="text-sm">
                        <span className="text-xs text-gray-500">Passport:</span>{' '}
                        <span className="font-medium text-gray-700">{customerData.identification.passport}</span>
                      </p>
                    )}
                    {!customerData.identification?.nic && !customerData.identification?.passport && (
                      <p className="text-sm text-gray-500">Not provided</p>
                    )}
                  </div>
                  <div className="pt-2 border-t border-purple-300">
                    <p className="text-xs text-gray-600 mb-1">Passengers</p>
                    {customerData.passengers && (
                      <div className="flex gap-3">
                        <div className="bg-white px-3 py-1.5 rounded border border-purple-200">
                          <span className="text-xs text-gray-500">Adults:</span>{' '}
                          <span className="font-semibold text-purple-700">{customerData.passengers.adults || 0}</span>
                        </div>
                        <div className="bg-white px-3 py-1.5 rounded border border-purple-200">
                          <span className="text-xs text-gray-500">Children:</span>{' '}
                          <span className="font-semibold text-purple-700">{customerData.passengers.children || 0}</span>
                        </div>
                      </div>
                    )}
                    {customerData.passengers && (
                      <p className="text-xs text-gray-600 mt-1">
                        Total: <span className="font-semibold text-purple-600">
                          {(customerData.passengers.adults || 0) + (customerData.passengers.children || 0)} passengers
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No customer details saved</p>
              )}
            </div>
          </div>
        </div>

        {/* Price Bill - Full Width */}
        <div className="mt-6 pt-6 border-t">
          <PricesBill />
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-6 border-t flex justify-between items-center">
          <button 
            onClick={onBack} 
            className="px-6 py-2.5 border-2 border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors font-medium"
          >
            ← Back
          </button>
          <div className="flex items-center gap-3">
            {saveError && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{saveError}</p>
            )}
            <button 
              onClick={handleConfirm}
              disabled={saving}
              className={`px-8 py-2.5 rounded-md text-white font-medium transition-colors flex items-center gap-2 ${
                saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating Booking...
                </>
              ) : (
                <>
                  Confirm & Continue to Payment
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSection3;