import React, { useState } from 'react';
import { CreditCard, CheckCircle, QrCode } from 'lucide-react';
import BookingQRModal from './BookingQRModal';
import PricingDetails from './PricingDetails';
import PaymentMethods from './PaymentMethods';

const formatLKR = (val) => {
  if (val === null || val === undefined) return '0';
  return Number(val).toLocaleString('en-US');
};

const PaymentSection = ({ 
  method, 
  setMethod, 
  totalAmount,
  prices,
  nights,
  loading, 
  paid, 
  confirmation, 
  savedBookingId,
  mongoId,
  bookingData,
  companyDetails,
  villaDetails,
  roomsDetails,
  onPayNow 
}) => {
  const [showQRModal, setShowQRModal] = useState(false);

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-6 text-gray-800">Payment</h3>

        {/* Pricing Section */}
        <PricingDetails 
          prices={prices}
          nights={nights}
          totalAmount={totalAmount}
        />

        {/* Payment Method Selection */}
        <PaymentMethods 
          method={method}
          setMethod={setMethod}
          disabled={paid}
        />

        {/* Payment Button */}
        {!paid && (
          <button
            onClick={onPayNow}
            disabled={loading}
            className={`w-full px-6 py-4 rounded-lg text-white font-semibold text-lg transition-all flex items-center justify-center gap-3 ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700 hover:shadow-lg'
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Processing Payment...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Pay LKR {formatLKR(totalAmount)}
              </>
            )}
          </button>
        )}

        {/* Payment Success */}
        {paid && confirmation && (
          <div className="p-6 bg-green-50 border-2 border-green-200 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <h4 className="font-bold text-green-800 text-lg">Payment Successful!</h4>
                <p className="text-sm text-green-700">Your booking has been confirmed</p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm bg-white rounded-md p-4 border border-green-200">
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Reference:</span>
                <span className="font-mono font-semibold text-gray-900">{confirmation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Booking ID:</span>
                <span className="font-mono font-semibold text-blue-600">{savedBookingId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-bold text-green-600">LKR {formatLKR(totalAmount)}</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-xs text-blue-800">
                📧 A confirmation email has been sent to your registered email address with the booking details.
              </p>
            </div>

            {/* View QR Code Button */}
            <button
              onClick={() => setShowQRModal(true)}
              className="w-full mt-4 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <QrCode className="w-5 h-5" />
              View Booking QR Code
            </button>
          </div>
        )}

        {/* Additional Info */}
        {!paid && (
          <div className="mt-6 text-xs text-gray-500 text-center">
            <p>By proceeding with payment, you agree to our terms and conditions.</p>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      <BookingQRModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        bookingId={savedBookingId}
        mongoId={mongoId}
        bookingData={bookingData}
        companyDetails={companyDetails}
        villaDetails={villaDetails}
        roomsDetails={roomsDetails}
        prices={prices}
        confirmation={confirmation}
      />
    </>
  );
};

export default PaymentSection;