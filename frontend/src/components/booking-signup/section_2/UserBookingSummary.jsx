import React, { useState, useEffect } from 'react';
import { Calendar, Home, Users, Building2, Loader, DollarSign, Mail, Phone, CreditCard } from 'lucide-react';
import axios from 'axios';

const UserBookingSummary = ({ bookingId }) => {
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [companyDetails, setCompanyDetails] = useState(null);
  const [villaDetails, setVillaDetails] = useState(null);
  const [roomsDetails, setRoomsDetails] = useState([]);

  // Fetch booking details
  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingId) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch booking by ID
        const response = await axios.get(`/api/bookings/${bookingId}`);
        const booking = response.data.booking;
        setBookingDetails(booking);

        // Fetch company details
        if (booking.roomSelection?.companyId) {
          try {
            const companyRes = await axios.get(`/api/companies/${booking.roomSelection.companyId}`);
            setCompanyDetails(companyRes.data);
          } catch (err) {
            console.error('Error fetching company:', err);
          }
        }

        // Fetch villa details
        if (booking.roomSelection?.villaId) {
          try {
            const villaId = typeof booking.roomSelection.villaId === 'object'
              ? booking.roomSelection.villaId._id
              : booking.roomSelection.villaId;
            const villaRes = await axios.get(`/api/villas/${villaId}`);
            setVillaDetails(villaRes.data);
          } catch (err) {
            console.error('Error fetching villa:', err);
          }
        }

        // Fetch room details
        if (booking.roomSelection?.rooms?.length > 0) {
          try {
            const roomIds = booking.roomSelection.rooms.map(room => {
              if (typeof room.roomId === 'object' && room.roomId !== null) {
                return room.roomId._id;
              }
              return room.roomId;
            });

            const roomPromises = roomIds.map(roomId =>
              axios.get(`/api/rooms/${roomId}`)
                .then(response => response.data)
                .catch(error => {
                  console.error(`Error fetching room ${roomId}:`, error);
                  return null;
                })
            );

            const rooms = await Promise.all(roomPromises);
            const validRooms = rooms.filter(room => room !== null);
            setRoomsDetails(validRooms);
          } catch (err) {
            console.error('Error fetching rooms:', err);
          }
        }
      } catch (err) {
        console.error('Error fetching booking details:', err);
        setError('Failed to load booking details.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-xl p-12">
        <div className="flex flex-col items-center justify-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <p className="text-red-600 text-center">{error}</p>
      </div>
    );
  }

  if (!bookingDetails) {
    return (
      <div className="bg-gray-50 rounded-xl p-6">
        <p className="text-gray-500 text-center">No booking data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Booking ID and Status Badge */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-xs text-blue-600 mb-1 font-medium">Booking ID</div>
          <div className="font-mono font-bold text-blue-800 text-xl">
            {bookingDetails.bookingId}
          </div>
        </div>
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="text-xs text-gray-600 mb-1 font-medium">Booking Status</div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full font-semibold text-sm ${
              bookingDetails.status === 'confirmed' 
                ? 'bg-green-100 text-green-700'
                : bookingDetails.status === 'pending'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {bookingDetails.status}
            </span>
            <span className={`px-3 py-1 rounded-full font-semibold text-sm ${
              bookingDetails.paymentStatus === 'paid' 
                ? 'bg-green-100 text-green-700'
                : bookingDetails.paymentStatus === 'pending'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {bookingDetails.paymentStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Dates and Passengers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Dates Section */}
        <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
          <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            Booking Dates
          </h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Check-in:</span>
              <span className="font-semibold text-gray-900">
                {bookingDetails.bookingDates?.checkInDate
                  ? new Date(bookingDetails.bookingDates.checkInDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })
                  : '—'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Check-out:</span>
              <span className="font-semibold text-gray-900">
                {bookingDetails.bookingDates?.checkOutDate
                  ? new Date(bookingDetails.bookingDates.checkOutDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })
                  : '—'}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-sky-300">
              <span className="text-gray-600 font-medium">Total Nights:</span>
              <span className="font-bold text-blue-600 text-lg">
                {bookingDetails.bookingDates?.nights || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Passengers Section */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" />
            Passengers
          </h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Adults:</span>
              <span className="font-semibold text-gray-900">
                {bookingDetails.customer?.passengers?.adults || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Children:</span>
              <span className="font-semibold text-gray-900">
                {bookingDetails.customer?.passengers?.children || 0}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-purple-300">
              <span className="text-gray-600 font-medium">Total Passengers:</span>
              <span className="font-bold text-purple-600 text-lg">
                {(bookingDetails.customer?.passengers?.adults || 0) + (bookingDetails.customer?.passengers?.children || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Company and Villa Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Company */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-500" />
            Company
          </h4>
          {companyDetails ? (
            <div>
              <p className="font-bold text-gray-900 text-lg">{companyDetails.companyName}</p>
              <p className="text-xs text-gray-600 mt-1 font-mono">{companyDetails.companyId}</p>
              {companyDetails.location && (
                <p className="text-sm text-gray-700 mt-2">{companyDetails.location}</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">Loading company...</p>
          )}
        </div>

        {/* Villa */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Home className="w-5 h-5 text-green-500" />
            Villa
          </h4>
          {villaDetails ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-gray-900 text-lg">{villaDetails.villaName}</p>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  bookingDetails.roomSelection?.acStatus === 1
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {bookingDetails.roomSelection?.acStatus === 1 ? 'AC' : 'Non-AC'}
                </span>
              </div>
              {villaDetails.villaLocation && (
                <p className="text-sm text-gray-700">{villaDetails.villaLocation}</p>
              )}
              {villaDetails.villaId && (
                <p className="text-xs text-gray-600 mt-1 font-mono">{villaDetails.villaId}</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">Loading villa...</p>
          )}
        </div>
      </div>

      {/* Rooms Section */}
      {roomsDetails.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <Home className="w-5 h-5 text-emerald-500" />
              Selected Rooms
            </h4>
            <span className="text-xs bg-emerald-200 text-emerald-700 px-3 py-1 rounded-full font-semibold">
              {roomsDetails.length} {roomsDetails.length === 1 ? 'Room' : 'Rooms'}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {roomsDetails.map((room, idx) => (
              <div
                key={room._id || idx}
                className="bg-white border border-emerald-300 rounded-lg p-3 hover:shadow-md transition-shadow"
              >
                <div className="font-semibold text-gray-900 mb-2">{room.roomName}</div>
                <div className="space-y-1 text-xs text-gray-600">
                  {room.capacity > 0 && (
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>Capacity: {room.capacity} persons</span>
                    </div>
                  )}
                  {room.type && (
                    <div className="capitalize">Type: {room.type}</div>
                  )}
                  {room.roomCode && (
                    <div className="font-mono text-gray-500">Code: {room.roomCode}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Customer Details */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Users className="w-5 h-5 text-orange-500" />
          Customer Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-600 font-medium">Full Name</label>
              <p className="font-semibold text-gray-900">{bookingDetails.customer?.name || '—'}</p>
            </div>
            <div>
              <label className="text-xs text-gray-600 font-medium flex items-center gap-1">
                <Mail className="w-3 h-3" /> Email
              </label>
              <p className="font-medium text-gray-800 text-sm">{bookingDetails.customer?.email || '—'}</p>
            </div>
            <div>
              <label className="text-xs text-gray-600 font-medium flex items-center gap-1">
                <Phone className="w-3 h-3" /> Contact Number
              </label>
              <p className="font-medium text-gray-800">{bookingDetails.customer?.contactNumber || '—'}</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {(bookingDetails.customer?.identification?.nic || bookingDetails.customer?.identification?.passport) && (
              <div>
                <label className="text-xs text-gray-600 font-medium flex items-center gap-1">
                  <CreditCard className="w-3 h-3" /> Identification
                </label>
                <div className="space-y-1 mt-1">
                  {bookingDetails.customer?.identification?.nic && (
                    <p className="text-sm font-mono text-gray-800">NIC: {bookingDetails.customer.identification.nic}</p>
                  )}
                  {bookingDetails.customer?.identification?.passport && (
                    <p className="text-sm font-mono text-gray-800">Passport: {bookingDetails.customer.identification.passport}</p>
                  )}
                </div>
              </div>
            )}
            {bookingDetails.customer?.address && (
              <div>
                <label className="text-xs text-gray-600 font-medium">Address</label>
                <p className="text-sm text-gray-800 mt-1">{bookingDetails.customer.address}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pricing Summary */}
      {bookingDetails.prices && (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-5">
          <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            Pricing Summary
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-700">Villa Price (per night):</span>
              <span className="font-semibold text-gray-900">
                LKR {bookingDetails.prices.villaPrice?.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-700">Number of Nights:</span>
              <span className="font-semibold text-gray-900">
                {bookingDetails.prices.nights || 0} {bookingDetails.prices.nights === 1 ? 'night' : 'nights'}
              </span>
            </div>
            {bookingDetails.prices.discount > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-700">Discount:</span>
                <span className="font-semibold text-green-600">
                  - LKR {bookingDetails.prices.discount?.toLocaleString() || 0}
                </span>
              </div>
            )}
            <div className="pt-3 border-t-2 border-blue-300 flex justify-between items-center">
              <span className="font-bold text-gray-900 text-lg">Total Amount:</span>
              <span className="font-bold text-blue-600 text-2xl">
                LKR {bookingDetails.prices.totalPrice?.toLocaleString() || 0}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserBookingSummary;
