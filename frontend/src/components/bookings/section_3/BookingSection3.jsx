import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Home, Users, Building2 } from 'lucide-react';
import { bookingStorage } from '../../../utils/bookingStorage';
import PricingSummary from '../PricingSummary';

const BookingSection3 = ({ onBack, onNext }) => {
  const [bookingData, setBookingData] = useState(null);
  const [companyDetails, setCompanyDetails] = useState(null);
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

      // Fetch company details
      if (data?.roomSelection?.companyId) {
        try {
          const response = await axios.get(`/api/companies/${data.roomSelection.companyId}`);
          setCompanyDetails(response.data);
        } catch (e) {
          console.error('Error fetching company details:', e);
          setCompanyDetails(null);
        }
      }

      // Fetch villa details
      if (data?.roomSelection?.villaId) {
        try {
          const r = await axios.get(`/api/villas/${data.roomSelection.villaId}`);
          setVillaDetails(r.data);
        } catch (e) {
          console.error('Error fetching villa details:', e);
          setVillaDetails(null);
        }
      }

      // Fetch rooms details
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

  const { bookingDates, roomSelection, customer: customerData, prices } = bookingData;

  return (
    <div className="w-full space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Booking Summary</h3>
          <button 
            onClick={onBack} 
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Edit Details
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Dates Section */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              Booking Dates
            </h4>
            <div className="space-y-2 text-sm bg-sky-50 border border-sky-200 p-4 rounded-md">
              <div className="flex justify-between">
                <span className="text-gray-600">Check-in:</span>
                <span className="font-medium text-gray-800">
                  {bookingDates?.checkInDate 
                    ? new Date(bookingDates.checkInDate).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })
                    : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Check-out:</span>
                <span className="font-medium text-gray-800">
                  {bookingDates?.checkOutDate 
                    ? new Date(bookingDates.checkOutDate).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })
                    : '—'}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-gray-600">Total Nights:</span>
                <span className="font-semibold text-blue-600">
                  {bookingDates?.nights || 0} {bookingDates?.nights === 1 ? 'Night' : 'Nights'}
                </span>
              </div>
            </div>
          </div>

          {/* Passengers Section */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-500" />
              Passengers
            </h4>
            <div className="space-y-2 text-sm bg-sky-50 border border-sky-200 p-4 rounded-md">
              <div className="flex justify-between">
                <span className="text-gray-600">Adults:</span>
                <span className="font-medium text-gray-800">{customerData?.passengers?.adults || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Children:</span>
                <span className="font-medium text-gray-800">{customerData?.passengers?.children || 0}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-gray-600">Total:</span>
                <span className="font-semibold text-purple-600">
                  {(customerData?.passengers?.adults || 0) + (customerData?.passengers?.children || 0)} Passengers
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-500" />
              Company
            </h4>
            {companyDetails ? (
              <div className="bg-sky-50 border border-sky-200 rounded-md p-3">
                <p className="font-semibold text-gray-900">{companyDetails.companyName}</p>
                <p className="text-xs text-gray-500 mt-1">{companyDetails.companyId}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No company selected</p>
            )}
          </div>

          {/* Villa */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Home className="w-4 h-4 text-green-500" />
              Villa
            </h4>
            {villaDetails ? (
              <div className="bg-sky-50 border border-sky-200 rounded-md p-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-900">{villaDetails.villaName}</p>
                  <p className="text-xs text-gray-600">
                    {roomSelection?.acStatus === 1
                      ? "AC"
                      : roomSelection?.acStatus === 0
                      ? "Non-AC"
                      : "Not specified"}
                  </p>
                </div>
                {villaDetails.villaLocation && (
                  <p className="text-xs text-gray-600 mt-1">{villaDetails.villaLocation}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No villa selected</p>
            )}
          </div>
        </div>

        {/* Rooms Section */}
        {(roomsDetails.length > 0 || (roomSelection?.rooms && roomSelection.rooms.length > 0)) && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Home className="w-4 h-4 text-green-500" />
                Selected Rooms
              </h4>
              <span className="text-xs text-gray-600 bg-green-100 px-2 py-1 rounded-full">
                {roomsDetails.length || roomSelection?.rooms?.length || 0} {(roomsDetails.length || roomSelection?.rooms?.length || 0) === 1 ? 'Room' : 'Rooms'}
              </span>
            </div>
            
            {roomsDetails.length > 0 ? (
              <div className="overflow-x-auto">
                <div className="flex gap-3 pb-2">
                  {roomsDetails.map((room, idx) => (
                    <div 
                      key={room._id || idx} 
                      className="bg-green-50 border border-green-200 rounded-md p-3 text-sm min-w-[200px] flex-shrink-0"
                    >
                      <div className="font-medium text-gray-800 mb-1">{room.roomName}</div>
                      <div className="space-y-1">
                        {room.capacity > 0 && (
                          <div className="text-xs text-gray-600 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{room.capacity} {room.capacity === 1 ? 'person' : 'persons'}</span>
                          </div>
                        )}
                        {room.type && (
                          <div className="text-xs text-gray-600 capitalize">
                            Type: {room.type}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="flex gap-3 pb-2">
                  {roomSelection.rooms.map((room, idx) => (
                    <div 
                      key={room.roomId || idx} 
                      className="bg-green-50 border border-green-200 rounded-md p-3 text-sm min-w-[200px] flex-shrink-0"
                    >
                      <div className="font-medium text-gray-800 mb-1">{room.roomName}</div>
                      <div className="space-y-1">
                        {room.capacity > 0 && (
                          <div className="text-xs text-gray-600 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{room.capacity} {room.capacity === 1 ? 'person' : 'persons'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Customer Details */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-orange-500" />
            Customer Details
          </h4>
          <div className="bg-orange-50 border border-orange-200 rounded-md p-3 text-sm space-y-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div>
                <span className="text-xs text-gray-600">Name:</span>
                <p className="font-medium text-gray-900">{customerData?.name || '—'}</p>
              </div>
              <div>
                <span className="text-xs text-gray-600">Email:</span>
                <p className="font-medium text-gray-700">{customerData?.email || '—'}</p>
              </div>
              <div>
                <span className="text-xs text-gray-600">Contact:</span>
                <p className="font-medium text-gray-700">{customerData?.contactNumber || '—'}</p>
              </div>
            </div>

            {(customerData?.identification?.nic || customerData?.identification?.passport) && (
              <div>
                <div className="text-xs text-gray-600">Identification:</div>
                {customerData?.identification?.nic && (
                  <p className="text-xs text-gray-700">NIC: {customerData.identification.nic}</p>
                )}
                {customerData?.identification?.passport && (
                  <p className="text-xs text-gray-700">Passport: {customerData.identification.passport}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Pricing Details */}
        <PricingSummary 
          prices={prices}
          nights={bookingDates?.nights}
          totalAmount={prices?.totalPrice}
        />

        {/* Error Message */}
        {saveError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-red-800">
              <p className="font-semibold mb-1">Error Creating Booking</p>
              <p className="text-xs">{saveError}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <button 
            onClick={onBack} 
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            Back
          </button>
          
          <button 
            onClick={handleConfirm}
            disabled={saving}
            className={`px-8 py-3 rounded-md text-white font-medium transition-colors flex items-center gap-2 ${
              saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
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
  );
};

export default BookingSection3;