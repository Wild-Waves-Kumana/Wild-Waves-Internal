import React, { useState, useEffect } from 'react';
import { bookingStorage } from '../../../utils/bookingStorage';

const formatLKR = (val) => {
  if (val === null || val === undefined) return '0';
  return Number(val).toLocaleString('en-US');
};

const PricesBill = () => {
  const [prices, setPrices] = useState(bookingStorage.getPrices());
  const [acStatus, setAcStatus] = useState(() => {
    const roomSelection = bookingStorage.getRoomSelection();
    return roomSelection?.acStatus ?? null;
  });

  useEffect(() => {
    const onStorage = (e) => {
      // update when relevant keys change from other tabs
      if (!e.key) {
        setPrices(bookingStorage.getPrices());
        const roomSelection = bookingStorage.getRoomSelection();
        setAcStatus(roomSelection?.acStatus ?? null);
        return;
      }
      const interesting = [
        'booking_dates',
        'room_selection',
        'prices',
        'customer'
      ];
      if (interesting.includes(e.key)) {
        setPrices(bookingStorage.getPrices());
        const roomSelection = bookingStorage.getRoomSelection();
        setAcStatus(roomSelection?.acStatus ?? null);
      }
    };

    window.addEventListener('storage', onStorage);
    const interval = setInterval(() => {
      // poll in same-tab changes (optional)
      setPrices(bookingStorage.getPrices());
      const roomSelection = bookingStorage.getRoomSelection();
      setAcStatus(roomSelection?.acStatus ?? null);
    }, 1000);

    return () => {
      window.removeEventListener('storage', onStorage);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <h4 className="font-semibold mb-3">Price Bill</h4>

      <div className="text-sm text-gray-700 space-y-2">
        <div className="flex justify-between">
          <span>Villa price / night</span>
          <span className="font-medium">LKR {formatLKR(prices?.villaPrice)}</span>
        </div>

        <div className="flex justify-between">
          <span>Rooms price / night</span>
          <span className="font-medium">
            LKR {formatLKR(prices?.roomPrices?.reduce((sum, rp) => sum + (rp.price || 0), 0))}
          </span>
        </div>

        {Array.isArray(prices?.roomPrices) && prices.roomPrices.length > 0 && (
          <div className="text-xs text-gray-600 mt-2 bg-gray-50 p-2 rounded">
            <div className="font-medium mb-1">Rooms breakdown:</div>
            <ul className="list-disc list-inside space-y-0.5">
              {prices.roomPrices.map(r => (
                <li key={r.roomId}>
                  {r.roomName} — LKR {formatLKR(r.price)}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="border-t pt-2 mt-2 flex justify-between">
          <span>Per night total</span>
          <span className="font-medium">
            LKR {formatLKR((prices?.villaPrice || 0) + (prices?.roomPrices?.reduce((sum, rp) => sum + (rp.price || 0), 0) || 0))}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Nights</span>
          <span className="font-medium">{prices?.nights || 0}</span>
        </div>

        <div className="border-t pt-3 mt-3 flex justify-between items-center">
          <span className="font-semibold">Total Amount</span>
          <span className="text-lg font-bold text-green-600">LKR {formatLKR(prices?.totalPrice)}</span>
        </div>

        <div className="text-xs text-gray-500 mt-2 pt-2 border-t">
          <div className="flex justify-between">
            <span>AC Preference:</span>
            <span className="font-medium">
              {acStatus === 1 ? '✓ AC' : acStatus === 0 ? 'Non-AC' : 'Not selected'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricesBill;