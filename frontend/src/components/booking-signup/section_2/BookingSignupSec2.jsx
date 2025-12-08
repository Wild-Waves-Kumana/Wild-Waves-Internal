import React from 'react';
import UserBookingSummary from './UserBookingSummary';

const BookingSignupSec2 = ({ bookingId, onBack, onNext }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Review Your Booking</h3>
          <p className="text-gray-600">
            Please review your booking details below before proceeding to create your account.
          </p>
        </div>

        {/* Full Booking Summary */}
        <UserBookingSummary bookingId={bookingId} />

        {/* Action Buttons */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={onBack}
            className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 transition-colors font-medium"
          >
            Back to Scan
          </button>
          <button
            onClick={onNext}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg font-medium"
          >
            Continue to Signup
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingSignupSec2;
