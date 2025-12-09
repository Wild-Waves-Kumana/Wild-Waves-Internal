import React from 'react';
import UserBookingSummary from './UserBookingSummary';
import UserAccountCreation from './UserAccountCreation';

const BookingSignupSec2 = ({ bookingId}) => {
  return (
    <div className="max-w-7xl mx-auto">
      {/* <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Review & Create Account</h3>
        <p className="text-gray-600">
          Review your booking details and create your account to complete the signup process.
        </p>
      </div> */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side - Booking Summary */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <h4 className="text-xl font-bold text-gray-800 mb-4">Booking Summary</h4>
          <div className=" overflow-y-auto pr-2">
            <UserBookingSummary bookingId={bookingId} />
          </div>
        </div>

        {/* Right Side - Account Creation */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <h4 className="text-xl font-bold text-gray-800 mb-4">Create Your Account</h4>
          <UserAccountCreation bookingId={bookingId} />
        </div>
      </div>


    </div>
  );
};

export default BookingSignupSec2;
