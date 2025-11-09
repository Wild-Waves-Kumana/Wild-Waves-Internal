import React from 'react';

/**
 * Props:
 * - selectedVilla: villa object (may contain villaBasePrice.withAC / withoutAC)
 * - selectedRooms: array of selected room objects (each may have roomBasePrice)
 * - nights: number
 * - acStatus: 1 | 0 | null
 */
const BookingPrices = ({ selectedVilla, selectedRooms = [], nights = 0, acStatus = null }) => {
  const villaPricePerNight = (() => {
    if (!selectedVilla?.villaBasePrice) return 0;
    if (acStatus === 1 && selectedVilla.villaBasePrice.withAC !== undefined) {
      return Number(selectedVilla.villaBasePrice.withAC) || 0;
    }
    if (acStatus === 0 && selectedVilla.villaBasePrice.withoutAC !== undefined) {
      return Number(selectedVilla.villaBasePrice.withoutAC) || 0;
    }
    // fallback: prefer withAC then withoutAC
    return Number(selectedVilla.villaBasePrice.withAC ?? selectedVilla.villaBasePrice.withoutAC ?? 0) || 0;
  })();

  const roomsPricePerNight = selectedRooms.reduce((sum, r) => {
    return sum + (Number(r.roomBasePrice) || 0);
  }, 0);

  const perNightTotal = villaPricePerNight + roomsPricePerNight;
  const total = perNightTotal * Math.max(0, Number(nights) || 0);

  const formatLKR = (val) => {
    try {
      return Number(val).toLocaleString('en-US');
    } catch {
      return String(val);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mt-4">
      <h4 className="font-semibold mb-2">Price Summary</h4>

      <div className="text-sm text-gray-700 space-y-2">
        <div className="flex justify-between">
          <span>Villa price / night</span>
          <span className="font-medium">LKR {formatLKR(villaPricePerNight)}</span>
        </div>

        <div>
          <div className="flex justify-between">
            <span>Rooms (per night)</span>
            <span className="font-medium">LKR {formatLKR(roomsPricePerNight)}</span>
          </div>

          {selectedRooms.length > 0 && (
            <ul className="mt-2 text-xs text-gray-600 list-disc list-inside">
              {selectedRooms.map(r => (
                <li key={r._id}>
                  {r.roomName} — LKR {formatLKR(r.roomBasePrice || 0)}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t pt-2 mt-2 flex justify-between text-sm">
          <span>Per night total</span>
          <span className="font-medium">LKR {formatLKR(perNightTotal)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span>Nights</span>
          <span className="font-medium">{nights}</span>
        </div>

        <div className="border-t pt-3 mt-3 flex justify-between items-center">
          <span className="font-semibold">Total</span>
          <span className="text-lg font-bold text-green-600">LKR {formatLKR(total)}</span>
        </div>

        {nights === 0 && (
          <p className="text-xs text-gray-500 mt-2">Select check-in and check-out dates to calculate total.</p>
        )}
        {(!selectedVilla || selectedRooms.length === 0) && (
          <p className="text-xs text-gray-500 mt-1">Select a villa and at least one room to see full pricing.</p>
        )}
      </div>
    </div>
  );
};

export default BookingPrices;