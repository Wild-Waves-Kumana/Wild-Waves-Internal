import React, { useState, useEffect } from 'react';
import { Calendar, Home, Users, Building2, Loader } from 'lucide-react';
import axios from 'axios';

const UserBookingSummary = ({ bookingId }) => {
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [companyDetails, setCompanyDetails] = useState(null);
  const [villaDetails, setVillaDetails] = useState(null);
  const [roomsDetails, setRoomsDetails] = useState([]);
  const [loadingCompany, setLoadingCompany] = useState(false);
  const [loadingVilla, setLoadingVilla] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);

  // Fetch booking details
  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`/api/bookings/${bookingId}`);
        const booking = response.data.booking;
        setBookingDetails(booking);

        // Fetch company details
        if (booking.roomSelection?.companyId) {
          setLoadingCompany(true);
          try {
            const companyRes = await axios.get(`/api/companies/${booking.roomSelection.companyId}`);
            setCompanyDetails(companyRes.data);
          } catch (err) {
            console.error('Error fetching company:', err);
          } finally {
            setLoadingCompany(false);
          }
        }

        // Fetch villa details
        if (booking.roomSelection?.villaId) {
          setLoadingVilla(true);
          try {
            const villaId = typeof booking.roomSelection.villaId === 'object'
              ? booking.roomSelection.villaId._id
              : booking.roomSelection.villaId;
            const villaRes = await axios.get(`/api/villas/${villaId}`);
            setVillaDetails(villaRes.data);
          } catch (err) {
            console.error('Error fetching villa:', err);
          } finally {
            setLoadingVilla(false);
          }
        }

        // Fetch room details
        if (booking.roomSelection?.rooms?.length > 0) {
          setLoadingRooms(true);
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
          } finally {
            setLoadingRooms(false);
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
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600 text-sm">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600 text-sm text-center">{error}</p>
        </div>
      </div>
    );
  }

  if (!bookingDetails) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-500 text-sm text-center">No booking data available</p>
      </div>
    );
  }

  return (
    <div>
      {/* Booking ID Badge */}
      {bookingDetails.bookingId && (
        <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-xs text-blue-600 mb-1">Booking ID</div>
          <div className="font-mono font-semibold text-blue-800 text-lg">{bookingDetails.bookingId}</div>
          {bookingDetails.status && (
            <div className="text-xs text-gray-600 mt-2 flex gap-3">
              <span>Status: <span className="capitalize font-medium text-gray-800">{bookingDetails.status}</span></span>
              <span>Payment: <span className="capitalize font-medium text-gray-800">{bookingDetails.paymentStatus}</span></span>
            </div>
          )}
        </div>
      )}

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
            <div className="flex justify-between">
              <span className="text-gray-600">Check-out:</span>
              <span className="font-medium text-gray-800">
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
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="text-gray-600">Total Nights:</span>
              <span className="font-semibold text-blue-600">
                {bookingDetails.bookingDates?.nights || 0} {bookingDetails.bookingDates?.nights === 1 ? 'Night' : 'Nights'}
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
              <span className="font-medium text-gray-800">{bookingDetails.customer?.passengers?.adults || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Children:</span>
              <span className="font-medium text-gray-800">{bookingDetails.customer?.passengers?.children || 0}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="text-gray-600">Total:</span>
              <span className="font-semibold text-purple-600">
                {(bookingDetails.customer?.passengers?.adults || 0) + (bookingDetails.customer?.passengers?.children || 0)} Passengers
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

          {loadingCompany ? (
            <div className="bg-sky-50 border border-sky-200 rounded-md p-3">
              <p className="text-sm text-gray-500 italic">Loading company details...</p>
            </div>
          ) : companyDetails ? (
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

          {loadingVilla ? (
            <div className="bg-sky-50 border border-sky-200 rounded-md p-3">
              <p className="text-sm text-gray-500 italic">Loading villa details...</p>
            </div>
          ) : villaDetails ? (
            <div className="bg-sky-50 border border-sky-200 rounded-md p-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-900">{villaDetails.villaName}</p>
                <p className="text-xs text-gray-600">
                  {bookingDetails.roomSelection?.acStatus === 1
                    ? "AC"
                    : bookingDetails.roomSelection?.acStatus === 0
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
      {(loadingRooms || roomsDetails.length > 0) && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Home className="w-4 h-4 text-green-500" />
              Selected Rooms
            </h4>
            {!loadingRooms && roomsDetails.length > 0 && (
              <span className="text-xs text-gray-600 bg-green-100 px-2 py-1 rounded-full">
                {roomsDetails.length} {roomsDetails.length === 1 ? 'Room' : 'Rooms'}
              </span>
            )}
          </div>

          {loadingRooms ? (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-sm text-gray-500 italic">Loading room details...</p>
            </div>
          ) : roomsDetails.length > 0 ? (
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
            <p className="text-sm text-gray-400">No rooms available</p>
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
              <p className="font-medium text-gray-900">{bookingDetails.customer?.name || '—'}</p>
            </div>
            <div className="mt-2">
              <span className="text-xs text-gray-600">Email:</span>
              <p className="font-medium text-gray-700">{bookingDetails.customer?.email || '—'}</p>
            </div>
            <div className="mt-2">
              <span className="text-xs text-gray-600">Contact:</span>
              <p className="font-medium text-gray-700">{bookingDetails.customer?.contactNumber || '—'}</p>
            </div>
          </div>

          {(bookingDetails.customer?.identification?.nic || bookingDetails.customer?.identification?.passport) && (
            <div>
              <div className="text-xs text-gray-600 mb-1">Identification:</div>
              {bookingDetails.customer?.identification?.nic && (
                <p className="text-xs text-gray-700">NIC: {bookingDetails.customer.identification.nic}</p>
              )}
              {bookingDetails.customer?.identification?.passport && (
                <p className="text-xs text-gray-700 mt-1">Passport: {bookingDetails.customer.identification.passport}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pricing Summary */}
      {bookingDetails.prices && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-800 mb-3">Pricing Summary</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Villa Price (per night):</span>
              <span className="font-medium text-gray-900">
                LKR {bookingDetails.prices.villaPrice?.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Number of Nights:</span>
              <span className="font-medium text-gray-900">
                {bookingDetails.prices.nights || 0} {bookingDetails.prices.nights === 1 ? 'night' : 'nights'}
              </span>
            </div>
            {bookingDetails.prices.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount:</span>
                <span className="font-medium text-green-600">
                  - LKR {bookingDetails.prices.discount?.toLocaleString() || 0}
                </span>
              </div>
            )}
            <div className="pt-2 border-t border-blue-300 flex justify-between items-center">
              <span className="font-semibold text-gray-900">Total Amount:</span>
              <span className="font-bold text-blue-600 text-lg">
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
