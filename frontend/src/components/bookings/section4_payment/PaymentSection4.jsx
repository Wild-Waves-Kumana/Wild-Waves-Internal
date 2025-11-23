import React, { useState, useEffect } from 'react';
import { bookingStorage } from '../../../utils/bookingStorage';
import axios from 'axios';

const formatLKR = (val) => {
  if (val === null || val === undefined) return '0';
  return Number(val).toLocaleString('en-US');
};

const PaymentSection4 = ({ onBack }) => {
  const [savedBookingId, setSavedBookingId] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [method, setMethod] = useState('card');
  const [loading, setLoading] = useState(true);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [paid, setPaid] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookingData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get booking ID from localStorage
        const bookingId = bookingStorage.getSavedBookingId();
        
        if (!bookingId) {
          setError('No booking ID found. Please complete the booking process.');
          setLoading(false);
          return;
        }

        setSavedBookingId(bookingId);
        console.log('Fetching booking data for ID:', bookingId);

        // Fetch booking data from MongoDB (already populated)
        const response = await axios.get(`/api/bookings/id/${bookingId}`);
        console.log('Fetched booking data from MongoDB:', response.data);

        if (!response.data.success || !response.data.booking) {
          throw new Error('Invalid booking data received');
        }

        const booking = response.data.booking;
        setBookingData(booking);

        // Clear all booking data from localStorage EXCEPT booking ID
        bookingStorage.clearBookingData();
        console.log('✓ Booking data cleared from localStorage (kept booking ID)');

      } catch (err) {
        console.error('Error fetching booking data:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load booking data');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingData();
  }, []);

  const handlePayNow = async () => {
    setLoadingPayment(true);
    // simulate payment delay
    await new Promise(r => setTimeout(r, 1200));
    
    try {
      // Update booking status to confirmed and payment to paid
      await axios.patch(`/api/bookings/${bookingData._id}/status`, {
        status: 'confirmed',
        paymentStatus: 'paid'
      });

      const ref = `PAY${Date.now().toString().slice(-8)}`;
      setConfirmation(ref);
      setPaid(true);
      
      console.log('Payment successful!');
      console.log('Payment Reference:', ref);
      console.log('Booking ID:', savedBookingId);
      
      // After successful payment, you could clear everything including booking ID
      // bookingStorage.clearAll();
    } catch (err) {
      console.error('Error updating booking status:', err);
      setError('Payment processed but failed to update booking status');
    } finally {
      setLoadingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading payment details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-center text-red-600">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-semibold mb-2">Error Loading Payment</p>
          <p className="text-sm">{error}</p>
          <button 
            onClick={onBack} 
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!bookingData) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <p className="text-gray-600">No booking data found. Please start from the beginning.</p>
        <button onClick={onBack} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
          Go Back
        </button>
      </div>
    );
  }

  const { bookingDates, roomSelection, customer, prices } = bookingData;

  // Extract populated data (backend already populates these)
  const companyDetails = roomSelection?.companyId;
  const villaDetails = roomSelection?.villaId;
  const roomsDetails = roomSelection?.rooms?.map(r => r.roomId).filter(Boolean) || [];

  // Calculate per night total
  const perNightTotal = (prices?.villaPrice || 0) + 
    (prices?.roomPrices?.reduce((sum, rp) => sum + (rp.price || 0), 0) || 0);

  return (
    <div className="w-full space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xl font-semibold">Payment</h3>
            {savedBookingId && (
              <p className="text-sm text-gray-600 mt-1">
                Booking ID: <span className="font-mono font-medium text-blue-600">{savedBookingId}</span>
              </p>
            )}
            {bookingData.status && (
              <p className="text-xs text-gray-500 mt-1">
                Status: <span className="capitalize font-medium">{bookingData.status}</span>
                {' | '}
                Payment: <span className="capitalize font-medium">{bookingData.paymentStatus}</span>
              </p>
            )}
          </div>
          <button onClick={onBack} className="text-blue-600 underline text-sm">← Back</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Payment Details */}
          <div className="space-y-4">
            <h4 className="font-semibold">Payable Amount</h4>
            <div className="bg-gray-50 p-4 rounded border">
              <div className="flex justify-between">
                <span>Villa price / night</span>
                <span className="font-medium">LKR {formatLKR(prices?.villaPrice)}</span>
              </div>
              
              <div className="flex justify-between mt-2">
                <span>Rooms price / night</span>
                <span className="font-medium">
                  LKR {formatLKR(prices?.roomPrices?.reduce((sum, rp) => sum + (rp.price || 0), 0))}
                </span>
              </div>

              {prices?.roomPrices && prices.roomPrices.length > 0 && (
                <div className="text-xs text-gray-600 mt-2 ml-4">
                  {prices.roomPrices.map((rp, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>• {rp.roomName}</span>
                      <span>LKR {formatLKR(rp.price)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t pt-2 mt-2 flex justify-between">
                <span>Per night total</span>
                <span className="font-medium">LKR {formatLKR(perNightTotal)}</span>
              </div>

              <div className="flex justify-between mt-2">
                <span>Nights</span>
                <span className="font-medium">{prices?.nights || bookingDates?.nights || 0}</span>
              </div>

              <div className="border-t pt-3 mt-3 flex justify-between items-center">
                <span className="font-semibold">Total Amount</span>
                <span className="text-lg font-bold text-green-600">
                  LKR {formatLKR(prices?.totalPrice)}
                </span>
              </div>
            </div>

            {/* Booking Summary */}
            {bookingDates && (
              <div>
                <h4 className="font-semibold">Booking Details</h4>
                <div className="bg-gray-50 p-4 rounded border text-sm space-y-2">
                  {companyDetails && (
                    <div className="pb-2 border-b border-gray-300">
                      <span className="text-xs text-gray-600">Company:</span>
                      <p className="font-medium">{companyDetails.companyName}</p>
                      <p className="text-xs text-gray-500">{companyDetails.companyId}</p>
                    </div>
                  )}
                  
                  {villaDetails && (
                    <div className="pb-2 border-b border-gray-300">
                      <span className="text-xs text-gray-600">Villa:</span>
                      <p className="font-medium">{villaDetails.villaName}</p>
                      <p className="text-xs text-gray-500">{villaDetails.villaId}</p>
                      {villaDetails.villaLocation && (
                        <p className="text-xs text-gray-500">📍 {villaDetails.villaLocation}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {roomSelection?.acStatus === 1 ? 'AC' : roomSelection?.acStatus === 0 ? 'Non-AC' : 'AC preference not specified'}
                      </p>
                    </div>
                  )}

                  {roomsDetails.length > 0 && (
                    <div className="pb-2 border-b border-gray-300">
                      <span className="text-xs text-gray-600">Rooms ({roomsDetails.length}):</span>
                      {roomsDetails.map((room, idx) => (
                        <div key={idx} className="mt-1">
                          <p className="font-medium text-sm">{room.roomName}</p>
                          <p className="text-xs text-gray-500">{room.roomId}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-in:</span>
                    <span className="font-medium">
                      {bookingDates.checkInDate ? new Date(bookingDates.checkInDate).toLocaleDateString() : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-out:</span>
                    <span className="font-medium">
                      {bookingDates.checkOutDate ? new Date(bookingDates.checkOutDate).toLocaleDateString() : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nights:</span>
                    <span className="font-medium">{bookingDates.nights || 0}</span>
                  </div>
                </div>
              </div>
            )}

            <h4 className="font-semibold">Customer</h4>
            <div className="bg-gray-50 p-4 rounded border text-sm">
              <p className="font-medium">{customer?.name || '—'}</p>
              <p className="text-xs text-gray-600">{customer?.email || '—'}</p>
              <p className="text-xs text-gray-600">{customer?.contactNumber || '—'}</p>
              {customer?.identification?.nic && (
                <p className="text-xs text-gray-600">NIC: {customer.identification.nic}</p>
              )}
              {customer?.identification?.passport && (
                <p className="text-xs text-gray-600">Passport: {customer.identification.passport}</p>
              )}
              {customer?.passengers && (
                <div className="mt-2 pt-2 border-t border-gray-300">
                  <p className="text-xs text-gray-600">
                    Passengers: {customer.passengers.adults || 0} Adult(s), {customer.passengers.children || 0} Child(ren)
                  </p>
                  <p className="text-xs font-semibold text-gray-700">
                    Total: {(customer.passengers.adults || 0) + (customer.passengers.children || 0)} passengers
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Payment Method */}
          <div className="space-y-4">
            <h4 className="font-semibold">Payment Method</h4>
            <div className="bg-gray-50 p-4 rounded border space-y-3">
              <label className="flex items-center gap-3">
                <input 
                  type="radio" 
                  name="method" 
                  value="card" 
                  checked={method === 'card'} 
                  onChange={() => setMethod('card')}
                  disabled={paid}
                />
                <span>Card (dummy)</span>
              </label>

              <label className="flex items-center gap-3">
                <input 
                  type="radio" 
                  name="method" 
                  value="bank" 
                  checked={method === 'bank'} 
                  onChange={() => setMethod('bank')}
                  disabled={paid}
                />
                <span>Bank Transfer (dummy)</span>
              </label>

              <div className="text-xs text-gray-500 bg-yellow-50 p-2 rounded">
                ℹ️ This is a dummy payment section. No real payment is processed.
              </div>

              <div>
                <button
                  onClick={handlePayNow}
                  disabled={loadingPayment || paid}
                  className={`w-full px-4 py-2 rounded-md text-white font-medium ${
                    paid ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {loadingPayment ? 'Processing...' : paid ? '✓ Paid' : `Pay LKR ${formatLKR(prices?.totalPrice)}`}
                </button>
              </div>

              {paid && confirmation && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded text-sm">
                  <div className="font-medium text-green-800">✓ Payment Successful</div>
                  <div className="text-xs text-gray-700 mt-1">
                    Payment Reference: <span className="font-mono font-medium">{confirmation}</span>
                  </div>
                  <div className="text-xs text-gray-700">
                    Booking ID: <span className="font-mono font-medium">{savedBookingId}</span>
                  </div>
                  <div className="mt-2 text-xs text-green-700">
                    Your booking has been confirmed. You will receive a confirmation email shortly.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 text-right">
          <button 
            onClick={onBack} 
            className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100 mr-3"
            disabled={paid}
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSection4;