import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../../common/Modal';
import { CheckCircle, Calendar, Clock, User, Home } from 'lucide-react';

const UserSignupResultModal = ({ isVisible, onClose, bookingData, userData }) => {
  const navigate = useNavigate();
  const [timeRemaining, setTimeRemaining] = useState('');

  // Calculate time remaining until check-in (1 PM)
  useEffect(() => {
    if (!bookingData?.bookingDates?.checkInDate) return;

    const calculateTimeRemaining = () => {
      const checkInDate = new Date(bookingData.bookingDates.checkInDate);
      checkInDate.setHours(13, 0, 0, 0); // Set to 1 PM

      const now = new Date();
      const diff = checkInDate - now;

      if (diff <= 0) {
        setTimeRemaining('Check-in time has passed');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [bookingData]);

  const handleDone = () => {
    if (onClose) onClose();
    navigate('/signup-options');
  };

  if (!bookingData) return null;

  return (
    <Modal isVisible={isVisible} onClose={onClose} width="max-w-2xl">
      <div className="flex flex-col max-h-[80vh]">
        {/* Scrollable Content */}
        <div className="overflow-y-auto custom-scrollbar flex-1">
          <div className="text-center px-2 pb-4">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>

            {/* Success Message */}
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Account Created Successfully!
            </h3>
            <p className="text-gray-600 mb-6">
              Your account has been created and linked to your booking. Welcome aboard!
            </p>

            {/* User Info Card */}
            {userData && (
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center gap-3 mb-3">
                  {userData.avatarUrl && (
                    <img 
                      src={userData.avatarUrl} 
                      alt="Avatar" 
                      className="w-12 h-12 rounded-full border-2 border-blue-500"
                    />
                  )}
                  <div className="text-left">
                    <div className="text-xs text-gray-600">Your Username</div>
                    <div className="font-mono font-bold text-blue-800 text-lg">{userData.username}</div>
                  </div>
                </div>
                <p className="text-xs text-gray-600">Use this username to log in to your account</p>
              </div>
            )}

            {/* Booking Summary */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6 text-left">
              <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Home className="w-4 h-4 text-blue-500" />
                Booking Summary
              </h4>

              <div className="space-y-3">
                {/* Booking ID */}
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Booking ID:</span>
                  <span className="font-mono font-semibold text-gray-900">{bookingData.bookingId}</span>
                </div>

                {/* Check-in Date */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-green-500" />
                    Check-in:
                  </span>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {new Date(bookingData.bookingDates?.checkInDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                    <div className="text-xs text-gray-500">at 1:00 PM</div>
                  </div>
                </div>

                {/* Check-out Date */}
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-red-500" />
                    Check-out:
                  </span>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {new Date(bookingData.bookingDates?.checkOutDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                    <div className="text-xs text-gray-500">by 11:00 AM</div>
                  </div>
                </div>

                {/* Total Nights */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Nights:</span>
                  <span className="font-semibold text-blue-600">
                    {bookingData.bookingDates?.nights || 0} {bookingData.bookingDates?.nights === 1 ? 'Night' : 'Nights'}
                  </span>
                </div>
              </div>
            </div>

            {/* Countdown Timer */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-5 mb-6 text-white">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-5 h-5" />
                <h5 className="font-semibold">Time Until Check-in</h5>
              </div>
              <div className="text-3xl font-bold font-mono tracking-wider">
                {timeRemaining}
              </div>
              <p className="text-xs text-blue-100 mt-2">Check-in starts at 1:00 PM on your arrival date</p>
            </div>

            {/* Important Notes */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
              <h5 className="text-sm font-semibold text-yellow-800 mb-2">Important Notes:</h5>
              <ul className="text-xs text-yellow-700 space-y-1">
                <li>• Please arrive between 1:00 PM - 6:00 PM on your check-in date</li>
                <li>• Bring a valid ID for verification</li>
                <li>• Check-out time is 11:00 AM on your departure date</li>
                <li>• Keep your booking ID handy for reference</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sticky Button at Bottom */}
        <div className="border-t border-gray-200 bg-white px-6 py-4 flex-shrink-0">
          <button
            onClick={handleDone}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg font-semibold"
          >
            Got it, Thanks!
          </button>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #7c3aed);
        }

        /* For Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #3b82f6 #f1f5f9;
        }
      `}</style>
    </Modal>
  );
};

export default UserSignupResultModal;
