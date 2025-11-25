import React, { useState, useEffect } from 'react';
import { Calendar, Home, Users, DollarSign } from 'lucide-react';
import axios from 'axios';

const BookingPreview = ({ bookingData }) => {
  const {
    bookingDates,
    roomSelection,
    prices,
    customer
  } = bookingData;

  const [villaDetails, setVillaDetails] = useState(null);
  const [loadingVilla, setLoadingVilla] = useState(false);

  const checkin = bookingDates?.checkInDate ? new Date(bookingDates.checkInDate) : null;
  const checkout = bookingDates?.checkOutDate ? new Date(bookingDates.checkOutDate) : null;
  const nights = bookingDates?.nights || 0;

  const totalPassengers = (customer?.passengers?.adults || 0) + (customer?.passengers?.children || 0);

  // Fetch villa details when villaId is available
  useEffect(() => {
    const fetchVillaDetails = async () => {
      if (!roomSelection?.villaId) {
        setVillaDetails(null);
        return;
      }

      setLoadingVilla(true);
      try {
        const response = await axios.get(`/api/villas/${roomSelection.villaId}`);
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
  }, [roomSelection?.villaId]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-6 text-gray-800">Booking Summary</h3>

      {/* Dates Section */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-500" />
          Booking Dates
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Check-in:</span>
            <span className="font-medium text-gray-800">
              {checkin ? checkin.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              }) : 'Not selected'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Check-out:</span>
            <span className="font-medium text-gray-800">
              {checkout ? checkout.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              }) : 'Not selected'}
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t border-gray-200">
            <span className="text-gray-600">Total Nights:</span>
            <span className="font-semibold text-blue-600">
              {nights} {nights === 1 ? 'Night' : 'Nights'}
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
        <div className="space-y-2 text-sm">
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
              {totalPassengers} {totalPassengers === 1 ? 'Person' : 'Persons'}
            </span>
          </div>
        </div>
      </div>

      {/* Villa & Rooms Section */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Home className="w-4 h-4 text-green-500" />
          Accommodation
        </h4>
        <div className="space-y-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Villa */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            
            {loadingVilla ? (
              <div className="text-sm text-gray-500 italic">Loading villa details...</div>
            ) : villaDetails ? (
              <>
              
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-gray-800 text-base">
                    {villaDetails.villaName}
                  </div>
                <div className="text-xs border text-blue-500 border-blue-600 p-1 rounded">
                  {roomSelection?.acStatus === 1 ? 'AC' : roomSelection?.acStatus === 0 ? 'Non-AC' : 'Not specified'}
                </div>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  ID: {villaDetails.villaId}
                </div>

                <div className="text-xs text-gray-600 my-2">
                  Selected Rooms ({roomSelection.rooms.length})
                </div>
                
              </>
            ) : (
              <div className="font-medium text-gray-800">
                {roomSelection?.villaId || 'Not selected'}
              </div>
            )}
          </div>

          {/* Rooms */}
          {roomSelection?.rooms && roomSelection.rooms.length > 0 && (
            <div>
              
              <div className="space-y-2">
                {roomSelection.rooms.map((room, idx) => (
                  <div 
                    key={idx} 
                    className="bg-green-50 border border-green-200 rounded-md p-2 text-sm"
                  >
                    <div className="font-medium text-gray-800">{room.roomName}</div>
                    {room.capacity > 0 && (
                      <div className="text-xs text-gray-600">
                        Capacity: {room.capacity} {room.capacity === 1 ? 'person' : 'persons'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pricing Section */}
      <div className="border-t border-gray-300 pt-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-green-500" />
          Pricing
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Villa (per night):</span>
            <span className="font-medium text-gray-800">
              LKR {prices?.villaPrice?.toLocaleString() || 0}
            </span>
          </div>
          
          {prices?.roomPrices && prices.roomPrices.length > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Rooms (per night):</span>
              <span className="font-medium text-gray-800">
                LKR {prices.roomPrices.reduce((sum, r) => sum + (r.price || 0), 0).toLocaleString()}
              </span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-gray-600">Number of nights:</span>
            <span className="font-medium text-gray-800">{nights}</span>
          </div>

          <div className="flex justify-between pt-3 border-t border-gray-300">
            <span className="text-base font-semibold text-gray-800">Total Price:</span>
            <span className="text-lg font-bold text-green-600">
              LKR {prices?.totalPrice?.toLocaleString() || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPreview;