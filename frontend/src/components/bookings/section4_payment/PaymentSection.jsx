import React, { useState } from 'react';
import { CreditCard, CheckCircle, DollarSign, QrCode } from 'lucide-react';
import BookingQRModal from './BookingQRModal';

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

  // Calculate per night total
  const perNightTotal = (prices?.villaPrice || 0) + 
    (prices?.roomPrices?.reduce((sum, rp) => sum + (rp.price || 0), 0) || 0);

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-6 text-gray-800">Payment</h3>

        {/* Pricing Section */}
        <div className="mb-6 pb-6 border-b border-gray-300">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-500" />
            Pricing Details
          </h4>
          <div className="space-y-2 text-sm bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between">
              <span className="text-gray-600">Villa (per night):</span>
              <span className="font-medium text-gray-800">
                LKR {formatLKR(prices?.villaPrice)}
              </span>
            </div>
            
            {prices?.roomPrices && prices.roomPrices.length > 0 && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rooms (per night):</span>
                  <span className="font-medium text-gray-800">
                    LKR {formatLKR(prices.roomPrices.reduce((sum, r) => sum + (r.price || 0), 0))}
                  </span>
                </div>
                <div className="ml-4 text-xs text-gray-600">
                  {prices.roomPrices.map((rp, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>• {rp.roomName}</span>
                      <span>LKR {formatLKR(rp.price)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="border-t pt-2 flex justify-between">
              <span className="text-gray-600">Per night total:</span>
              <span className="font-medium text-gray-800">LKR {formatLKR(perNightTotal)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Number of nights:</span>
              <span className="font-medium text-gray-800">{nights || 0}</span>
            </div>

            <div className="flex justify-between pt-3 border-t-2 border-gray-300 mt-2">
              <span className="text-base font-semibold text-gray-800">Total Amount:</span>
              <span className="text-xl font-bold text-green-600">
                LKR {formatLKR(totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Select Payment Method</h4>
          <div className="space-y-4">
            <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
              <input 
                type="radio" 
                name="method" 
                value="card" 
                checked={method === 'card'} 
                onChange={() => setMethod('card')}
                disabled={paid}
                className="w-4 h-4 text-blue-600"
              />
              <CreditCard className="w-5 h-5 text-gray-600" />
              <div className="flex-1">
                <div className="font-medium text-gray-900">Credit/Debit Card</div>
                <div className="text-xs text-gray-500">Pay securely with your card</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
              <input 
                type="radio" 
                name="method" 
                value="bank" 
                checked={method === 'bank'} 
                onChange={() => setMethod('bank')}
                disabled={paid}
                className="w-4 h-4 text-blue-600"
              />
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
              </svg>
              <div className="flex-1">
                <div className="font-medium text-gray-900">Bank Transfer</div>
                <div className="text-xs text-gray-500">Direct bank transfer</div>
              </div>
            </label>
          </div>
        </div>

        {/* Info Box */}
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
          <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-yellow-800">
            <p className="font-semibold mb-1">Demo Payment</p>
            <p className="text-xs">This is a dummy payment section. No real payment is processed.</p>
          </div>
        </div>

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