import React, { useState, useEffect } from 'react';
import { bookingStorage } from '../../../utils/bookingStorage';
import axios from 'axios';
import BookingSummary from './BookingSummary';
import PaymentSection from './PaymentSection';

const BookingSection4 = ({ onBack }) => {
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

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Booking Summary */}
        <BookingSummary 
          bookingData={bookingData}
          savedBookingId={savedBookingId}
        />

        {/* Right Column - Payment Section */}
        <PaymentSection 
          method={method}
          setMethod={setMethod}
          totalAmount={bookingData.prices?.totalPrice}
          prices={bookingData.prices}
          nights={bookingData.bookingDates?.nights}
          loading={loadingPayment}
          paid={paid}
          confirmation={confirmation}
          savedBookingId={savedBookingId}
          onPayNow={handlePayNow}
        />
      </div>

      {/* Navigation Buttons */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between">
          <button
            onClick={onBack}
            disabled={paid}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            Back
          </button>
          
          {paid && (
            <div className="flex items-center gap-2 text-green-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">Payment Completed</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingSection4;