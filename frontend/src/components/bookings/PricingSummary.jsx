import React from 'react';
import { DollarSign } from 'lucide-react';

const formatLKR = (val) => {
  if (val === null || val === undefined) return '0';
  return Number(val).toLocaleString('en-US');
};

const PricingSummary = ({ prices, nights, totalAmount }) => {
  // Calculate per night total
  const perNightTotal = (prices?.villaPrice || 0) + 
    (prices?.roomPrices?.reduce((sum, rp) => sum + (rp.price || 0), 0) || 0);

  return (
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
  );
};

export default PricingSummary;