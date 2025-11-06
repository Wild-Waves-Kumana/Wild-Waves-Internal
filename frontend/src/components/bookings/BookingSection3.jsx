import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { bookingStorage } from '../../utils/bookingStorage';

const BookingSection3 = ({ onBack, onNext }) => {
  const [bookingData, setBookingData] = useState(null);
  const [villaDetails, setVillaDetails] = useState(null);
  const [roomsDetails, setRoomsDetails] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = bookingStorage.getBookingData();
      setBookingData(data);

      // load customer via bookingStorage
      try {
        const savedCust = bookingStorage.getCustomer();
        setCustomer(savedCust && Object.values(savedCust).some(Boolean) ? savedCust : null);
      } catch (e) {
        console.error('Error loading saved customer:', e);
        setCustomer(null);
      }

      // fetch villa details
      if (data?.villa) {
        try {
          const r = await axios.get(`/api/villas/${data.villa}`);
          setVillaDetails(r.data);
        } catch (e) {
            console.error('Error fetching villa details:', e);
          setVillaDetails(null);
        }
      }

      // fetch rooms details
      if (Array.isArray(data?.selectedRooms) && data.selectedRooms.length > 0) {
        try {
          const promises = data.selectedRooms.map(id => axios.get(`/api/rooms/${id}`).catch(() => null));
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

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <span className="ml-3 text-gray-600">Loading summary...</span>
    </div>
  );

  if (!bookingData) return (
    <div className="bg-white p-6 rounded-lg shadow-md text-center">
      <p className="text-gray-600">No booking data found. Please start from the beginning.</p>
      <button onClick={onBack} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md">Go Back</button>
    </div>
  );

  const nights = bookingData.checkinDate && bookingData.checkoutDate
    ? Math.round((new Date(bookingData.checkoutDate) - new Date(bookingData.checkinDate)) / (1000*60*60*24))
    : 0;

  const renderAc = () => {
    if (bookingData.acStatus === 1) return 'AC';
    if (bookingData.acStatus === 0) return 'Non-AC';
    return 'Not selected';
  };

  return (
    <div className="w-full space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Review Booking</h3>
          <button onClick={onBack} className="text-blue-600 underline text-sm">← Edit</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Summary */}
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold">Dates</h4>
              <p className="text-sm text-gray-700">
                Check-in: {bookingData.checkinDate ? new Date(bookingData.checkinDate).toLocaleDateString() : '—'}
              </p>
              <p className="text-sm text-gray-700">
                Check-out: {bookingData.checkoutDate ? new Date(bookingData.checkoutDate).toLocaleDateString() : '—'}
              </p>
              <p className="text-sm text-gray-700">Nights: {nights}</p>
            </div>

            <div>
              <h4 className="font-semibold">Villa</h4>
              {villaDetails ? (
                <div className="text-sm text-gray-700">
                  <p className="font-medium">{villaDetails.villaName}</p>
                  <p className="text-xs text-gray-500">{villaDetails.villaId} — MongoID: {villaDetails._id}</p>
                  {villaDetails.villaLocation && <p className="text-xs">📍 {villaDetails.villaLocation}</p>}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No villa selected</p>
              )}
            </div>

            <div>
              <h4 className="font-semibold">Rooms ({bookingData.selectedRooms?.length || 0})</h4>
              {roomsDetails.length > 0 ? (
                <ul className="text-sm text-gray-700 list-disc list-inside">
                  {roomsDetails.map(r => (
                    <li key={r._id}>
                      <span className="font-medium">{r.roomName}</span> — {r.roomId} {r.type ? `(${r.type})` : ''}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No room details available</p>
              )}
            </div>

            <div>
              <h4 className="font-semibold">AC Preference</h4>
              <p className="text-sm text-gray-700">{renderAc()}</p>
            </div>
          </div>

          {/* Right: Customer */}
          <div className="space-y-4">
            <h4 className="font-semibold">Customer Details</h4>
            {customer ? (
              <div className="text-sm text-gray-700 space-y-1">
                <p><span className="font-medium">Name:</span> {customer.name || '—'}</p>
                <p><span className="font-medium">Email:</span> {customer.email || '—'}</p>
                <p><span className="font-medium">Contact:</span> {customer.contactNumber || '—'}</p>
                <p><span className="font-medium">NIC / Passport:</span> {customer.idNumber || '—'}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No customer details saved</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onBack} className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100">← Back</button>
          <button onClick={onNext} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
            Confirm & Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingSection3;