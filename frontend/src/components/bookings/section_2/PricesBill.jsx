import React, { useState, useEffect } from 'react';
import { bookingStorage } from '../../../utils/bookingStorage';

const formatLKR = (val) => {
  if (val === null || val === undefined) return '0';
  return Number(val).toLocaleString('en-US');
};

const PricesBill = () => {
  const [prices, setPrices] = useState(bookingStorage.getPrices());
  const [acStatus, setAcStatus] = useState(bookingStorage.getAcStatus());

  useEffect(() => {
    const onStorage = (e) => {
      // update when relevant keys change from other tabs
      if (!e.key) {
        setPrices(bookingStorage.getPrices());
        setAcStatus(bookingStorage.getAcStatus());
        return;
      }
      const interesting = [
        'booking_price_villa_per_night',
        'booking_price_rooms_per_night',
        'booking_price_per_night_total',
        'booking_price_nights',
        'booking_price_total',
        'booking_price_rooms_details',
        'booking_ac_status'
      ];
      if (interesting.includes(e.key)) {
        setPrices(bookingStorage.getPrices());
        setAcStatus(bookingStorage.getAcStatus());
      }
    };

    window.addEventListener('storage', onStorage);
    const interval = setInterval(() => {
      // poll in same-tab changes (optional)
      setPrices(bookingStorage.getPrices());
      setAcStatus(bookingStorage.getAcStatus());
    }, 1000);

    return () => {
      window.removeEventListener('storage', onStorage);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mt-4">
      <h4 className="font-semibold mb-3">Price Bill</h4>

      <div className="text-sm text-gray-700 space-y-2">
        <div className="flex justify-between">
          <span>Villa price / night</span>
          <span className="font-medium">LKR {formatLKR(prices.villaPricePerNight)}</span>
        </div>

        <div className="flex justify-between">
          <span>Rooms price / night</span>
          <span className="font-medium">LKR {formatLKR(prices.roomsPricePerNight)}</span>
        </div>

        {Array.isArray(prices.roomsDetails) && prices.roomsDetails.length > 0 && (
          <div className="text-xs text-gray-600 mt-2">
            <div className="font-medium mb-1">Rooms breakdown</div>
            <ul className="list-disc list-inside">
              {prices.roomsDetails.map(r => (
                <li key={r._id}>
                  {r.roomName} — LKR {formatLKR(r.roomBasePrice)}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="border-t pt-2 mt-2 flex justify-between">
          <span>Per night total</span>
          <span className="font-medium">LKR {formatLKR(prices.perNightTotal)}</span>
        </div>

        <div className="flex justify-between">
          <span>Nights</span>
          <span className="font-medium">{prices.nights}</span>
        </div>

        <div className="border-t pt-3 mt-3 flex justify-between items-center">
          <span className="font-semibold">Total</span>
          <span className="text-lg font-bold text-green-600">LKR {formatLKR(prices.total)}</span>
        </div>

        <div className="text-xs text-gray-500 mt-2">
          <div>AC Preference: {acStatus === 1 ? 'AC' : acStatus === 0 ? 'Non-AC' : 'Not selected'}</div>
        </div>
      </div>
    </div>
  );
};

export default PricesBill;