import React from 'react';
import { AlertCircle, XCircle } from 'lucide-react';

const QRErrors = ({ validationError, bookingDetails, data, onScanAgain, onClose }) => {
  if (!validationError) return null;

  return (
    <div className="text-center">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <XCircle className="w-12 h-12 text-red-600" />
      </div>

      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        Cannot Create Account
      </h3>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-red-800 mb-1">{validationError.reason}</h4>
            <p className="text-sm text-red-700">{validationError.message}</p>
          </div>
        </div>
      </div>

      {data?.bookingId && (
        <div className="mb-6 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="text-xs text-gray-600 mb-1">Booking ID</div>
          <div className="font-mono font-semibold text-gray-800">
            {bookingDetails?.bookingId || data.bookingId || bookingDetails?._id}
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h5 className="text-sm font-semibold text-blue-900 mb-2">What to do next:</h5>
        <ul className="text-sm text-blue-800 space-y-1 text-left">
          {validationError.reason === 'Check-in Date Mismatch' && (
            <>
              <li>• Wait until your check-in date to create an account</li>
              <li>• Keep your booking QR code safe</li>
              <li>• Scan the QR code on your check-in date</li>
            </>
          )}
          {validationError.reason === 'Account Already Created' && (
            <>
              <li>• Use your existing account credentials to log in</li>
              <li>• Contact support if you forgot your password</li>
              <li>• Do not create duplicate accounts</li>
            </>
          )}
          {validationError.reason === 'Payment Not Completed' && (
            <>
              <li>• Complete your payment through the booking platform</li>
              <li>• Contact support for payment assistance</li>
              <li>• Return here after payment is confirmed</li>
            </>
          )}
        </ul>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => {
            if (onScanAgain) onScanAgain();
            if (onClose) onClose();
          }}
          className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 transition-colors font-medium"
        >
          Scan Another Code
        </button>
        <button
          onClick={onClose}
          className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors font-medium"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default QRErrors;
