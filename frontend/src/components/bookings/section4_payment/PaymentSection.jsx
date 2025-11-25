import React from 'react';
import { CreditCard } from 'lucide-react';
import PricingDetails from './PricingDetails';
import PaymentMethods from './PaymentMethods';
import PaymentSuccessful from './PaymentSuccessful';

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
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {/* If payment is successful, show PaymentSuccessful component */}
      {paid && confirmation ? (
        <PaymentSuccessful 
          bookingId={savedBookingId}
          mongoId={mongoId}
          confirmation={confirmation}
          totalAmount={totalAmount}
          bookingData={bookingData}
          companyDetails={companyDetails}
          villaDetails={villaDetails}
          roomsDetails={roomsDetails}
          prices={prices}
        />
      ) : (
        <>
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

          {/* Additional Info */}
          <div className="mt-6 text-xs text-gray-500 text-center">
            <p>By proceeding with payment, you agree to our terms and conditions.</p>
          </div>
        </>
      )}
    </div>
  );
};

export default PaymentSection;