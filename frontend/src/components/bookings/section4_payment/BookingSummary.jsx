import React, { useState, useEffect } from 'react';
import { Calendar, Home, Users, Building2 } from 'lucide-react';
import axios from 'axios';

const BookingSummary = ({ bookingData, savedBookingId }) => {
  const [companyDetails, setCompanyDetails] = useState(null);
  const [villaDetails, setVillaDetails] = useState(null);
  const [roomsDetails, setRoomsDetails] = useState([]);
  const [loadingCompany, setLoadingCompany] = useState(false);
  const [loadingVilla, setLoadingVilla] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      if (!bookingData?.roomSelection?.companyId) {
        return;
      }

      setLoadingCompany(true);
      try {
        const companyId = bookingData.roomSelection.companyId;
        
        const response = await axios.get(`/api/companies/${companyId}`);
        console.log('Fetched company details:', response.data);
        setCompanyDetails(response.data);
      } catch (error) {
        console.error('Error fetching company details:', error);
        setCompanyDetails(null);
      } finally {
        setLoadingCompany(false);
      }
    };

    fetchCompanyDetails();
  }, [bookingData]);

  useEffect(() => {
    const fetchVillaDetails = async () => {
      if (!bookingData?.roomSelection?.villaId) {
        return;
      }

      setLoadingVilla(true);
      try {
        const villaId = typeof bookingData.roomSelection.villaId === 'object'
          ? bookingData.roomSelection.villaId._id
          : bookingData.roomSelection.villaId;

        console.log('Fetching villa details for ID:', villaId);
        
        const response = await axios.get(`/api/villas/${villaId}`);
        console.log('Fetched villa details:', response.data);
        setVillaDetails(response.data);
      } catch (error) {
        console.error('Error fetching villa details:', error);
        setVillaDetails(null);
      } finally {
        setLoadingVilla(false);
      }
    };

    fetchVillaDetails();
  }, [bookingData]);

  useEffect(() => {
    const fetchRoomsDetails = async () => {
      if (!bookingData?.roomSelection?.rooms || bookingData.roomSelection.rooms.length === 0) {
        return;
      }

      setLoadingRooms(true);
      try {
        const roomIds = bookingData.roomSelection.rooms.map(room => {
          // Check if room.roomId is already populated (object) or just an ID (string)
          if (typeof room.roomId === 'object' && room.roomId !== null) {
            return room.roomId._id;
          }
          return room.roomId;
        });

        console.log('Fetching room details for IDs:', roomIds);

        // Fetch each room individually
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
        
        console.log('Fetched room details:', validRooms);
        setRoomsDetails(validRooms);
      } catch (error) {
        console.error('Error fetching rooms details:', error);
        setRoomsDetails([]);
      } finally {
        setLoadingRooms(false);
      }
    };

    fetchRoomsDetails();
  }, [bookingData]);

  if (!bookingData) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-500 text-center">No booking data available</p>
      </div>
    );
  }

  const { bookingDates, roomSelection, customer } = bookingData;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-6 text-gray-800">Booking Summary</h3>

      {/* Booking ID Badge */}
      {savedBookingId && (
        <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-xs text-blue-600 mb-1">Booking ID</div>
          <div className="font-mono font-semibold text-blue-800 text-lg">{savedBookingId}</div>
          {bookingData.status && (
            <div className="text-xs text-gray-600 mt-2 flex gap-3">
              <span>Status: <span className="capitalize font-medium text-gray-800">{bookingData.status}</span></span>
              <span>Payment: <span className="capitalize font-medium text-gray-800">{bookingData.paymentStatus}</span></span>
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
              <span className="font-medium text-gray-800">{customer?.passengers?.adults || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Children:</span>
              <span className="font-medium text-gray-800">{customer?.passengers?.children || 0}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="text-gray-600">Total:</span>
              <span className="font-semibold text-purple-600">
                {(customer?.passengers?.adults || 0) + (customer?.passengers?.children || 0)} Passengers
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

      {/* Rooms Section - Single Row with Horizontal Scroll */}
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
                    className="bg-green-50 border border-green-200 rounded-md p-3 text-sm w-1/3 flex-shrink-0"
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
        <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-orange-500" />
          Customer Details
        </h4>
        {/* Right-aligned Edit Button */}
        <div className="flex justify-end items-baseline mb-1">
            <button className="border border-orange-300 bg-white rounded-md px-2 py-1 flex items-center gap-2">
                <span className="text-xs text-gray-600">Edit</span>
            </button>
        </div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-md p-3 text-sm space-y-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div >
            <div>
            <span className="text-xs text-gray-600">Name:</span>
            <p className="font-medium text-gray-900">{customer?.name || '—'}</p>
          </div>
          <div>
            <span className="text-xs text-gray-600">Email:</span>
            <p className="font-medium text-gray-700">{customer?.email || '—'}</p>
          </div>
          <div>
            <span className="text-xs text-gray-600">Contact:</span>
            <p className="font-medium text-gray-700">{customer?.contactNumber || '—'}</p>
          </div>
          </div>

          {(customer?.identification?.nic || customer?.identification?.passport) && (
            <div >
            
              <div className="text-xs text-gray-600">Identification:</div>
              {customer?.identification?.nic && (
                <p className="text-xs text-gray-700">NIC: {customer.identification.nic}</p>
              )}
              {customer?.identification?.passport && (
                <p className="text-xs text-gray-700">Passport: {customer.identification.passport}</p>
              )}

            </div>

            

            
          )}
          
        </div>
      </div>
    </div>
  );
};

export default BookingSummary;