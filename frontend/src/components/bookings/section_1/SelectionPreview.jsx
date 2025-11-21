import React from 'react';
import { FaUserFriends } from 'react-icons/fa';
import { Folder } from 'lucide-react';

const SelectionPreview = ({
  checkin,
  checkout,
  nights,
  passengers,
  handlePassengerChange,
  selectedVilla,
  acStatus,
  handleAcToggle,
  handleBackToVillas,
  selectedRoomIds,
  getSelectedRooms,
  handleRoomToggle
}) => {
  const totalPassengers = passengers.adults + passengers.children;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
      <h3 className="text-lg font-semibold mb-2">Booking Details</h3>

      {/* Dates Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Check-in Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date</label>
          <div className="w-full px-3 py-2 border border-slate-400 rounded-md bg-white text-gray-700">
            {checkin ? (
              <div className="flex flex-col leading-tight">
                <span className="text-base font-semibold">
                  {checkin.toLocaleDateString('en-US', { day: 'numeric' })}
                </span>
                <span className="text-xs text-gray-500">
                  {checkin.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
              </div>
            ) : (
              <span className="text-gray-400 text-sm">Select date</span>
            )}
          </div>
        </div>

        {/* Check-out Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Date</label>
          <div className="w-full px-3 py-2 border border-slate-400 rounded-md bg-white text-gray-700">
            {checkout ? (
              <div className="flex flex-col leading-tight">
                <span className="text-base font-semibold">
                  {checkout.toLocaleDateString('en-US', { day: 'numeric' })}
                </span>
                <span className="text-xs text-gray-500">
                  {checkout.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
              </div>
            ) : (
              <span className="text-gray-400 text-sm">Select date</span>
            )}
          </div>
        </div>

        {/* Nights Count */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nights</label>
          <div className="px-3 py-2 border border-slate-400 rounded-md bg-blue-50 text-center">
            <div className="text-xs text-gray-600">Total</div>
            <div className="text-base font-semibold text-blue-600">
              {nights} {nights === 1 ? 'Night' : 'Nights'}
            </div>
          </div>
        </div>
      </div>

      {/* Passengers Section */}
      <div className="bg-white border border-slate-400 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FaUserFriends className="w-5 h-5 text-purple-500" />
          Number of Passengers <span className="text-red-500">*</span>
        </h4>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Adults</label>
            <input
              type="number"
              min="0"
              value={passengers.adults}
              onChange={(e) => handlePassengerChange('adults', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Children</label>
            <input
              type="number"
              min="0"
              value={passengers.children}
              onChange={(e) => handlePassengerChange('children', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition"
              placeholder="0"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center border-gray-100 pt-3">
          <span className="text-sm text-gray-700">Total Passengers</span>
          <span className={`text-base font-semibold ${totalPassengers > 0 ? 'text-purple-600' : 'text-gray-500'}`}>
            {totalPassengers}
          </span>
        </div>
      </div>

      {/* Villa and Rooms Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-lg border border-slate-400">
        {/* LEFT COLUMN — Villa + AC/Non AC + Prices */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Selected Villa
          </label>

          {selectedVilla ? (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-blue-900">{selectedVilla.villaName}</p>
                  <p className="text-xs text-blue-600">{selectedVilla.villaId}</p>
                </div>

                <button
                  onClick={handleBackToVillas}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Change Villa
                </button>
              </div>

              {/* Price List — now also the selector */}
              <div className="mt-4">
                <p className="text-sm text-gray-700 font-medium mb-1">
                  Room Type <span className="text-red-600">*</span>
                </p>

                <ul className="space-y-1 text-sm">
                  {selectedVilla?.villaBasePrice?.withAC !== undefined && (
                    <li
                      onClick={() => handleAcToggle(1)}
                      className={`p-2 rounded-md border flex justify-between cursor-pointer transition 
                        ${
                          acStatus === 1
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-800 border-gray-200 hover:border-blue-400"
                        }`}
                    >
                      <span>AC</span>
                      <span className={`font-semibold ${acStatus === 1 ? "text-white" : "text-gray-700"}`}>
                        LKR {selectedVilla.villaBasePrice.withAC}
                      </span>
                    </li>
                  )}

                  {selectedVilla?.villaBasePrice?.withoutAC !== undefined && (
                    <li
                      onClick={() => handleAcToggle(0)}
                      className={`p-2 rounded-md border flex justify-between cursor-pointer transition 
                        ${
                          acStatus === 0
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-800 border-gray-200 hover:border-blue-400"
                        }`}
                    >
                      <span>Non-AC</span>
                      <span className={`font-semibold ${acStatus === 0 ? "text-white" : "text-gray-700"}`}>
                        LKR {selectedVilla.villaBasePrice.withoutAC}
                      </span>
                    </li>
                  )}
                </ul>

                {/* Warning if nothing selected */}
                {acStatus === null && (
                  <p className="text-xs text-red-500 mt-2">
                    Please select a room type to continue
                  </p>
                )}

                {acStatus !== null && (
                  <p className="mt-2 text-sm text-green-700">
                    Selected price: LKR{" "}
                    {acStatus === 1
                      ? selectedVilla.villaBasePrice.withAC
                      : selectedVilla.villaBasePrice.withoutAC}{" "}
                    / night
                  </p>
                )}

                {acStatus === null && (
                  <p className="mt-2 text-sm text-gray-500">
                    Choose AC / Non-AC to view the final price
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-md p-4 text-center">
              <Folder className="w-10 h-10 text-yellow-500 mx-auto mb-2" />
              <p className="text-sm text-yellow-700 font-medium">No villa selected</p>
              <p className="text-xs text-yellow-600 mt-1">
                Please select a villa from the available options below
              </p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN — Selected Rooms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Selected Rooms ({selectedRoomIds.length})
          </label>

          {selectedRoomIds.length > 0 ? (
            <div className="space-y-2">
              {getSelectedRooms().map((room) => (
                <div
                  key={room._id}
                  className="bg-green-50 border border-green-200 rounded-lg p-2 flex justify-between items-center"
                >
                  <div>
                    <p className="text-sm font-medium text-green-900">{room.roomName}</p>
                    <p className="text-xs text-green-600">{room.roomId}</p>
                  </div>
                  <button
                    onClick={() => handleRoomToggle(room)}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-md p-4 text-center flex items-center justify-center">
              <div>
                <Folder className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No rooms selected</p>
                <p className="text-xs text-gray-400 mt-1">
                  {selectedVilla ? 'Select rooms from below' : 'Select a villa first'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelectionPreview;