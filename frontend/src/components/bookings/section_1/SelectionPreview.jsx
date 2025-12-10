import React, { useState } from 'react';
import { FaUserFriends, FaBuilding } from 'react-icons/fa';
import { Folder, Edit } from 'lucide-react';
import SelectVillaModal from './SelectVillaModal';
import SelectRoomModal from './SelectRoomModal';

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
  handleRoomToggle,
  companies,
  selectedCompany,
  handleCompanyChange,
  loadingCompanies,
  villas,
  loading,
  handleVillaSelect,
  rooms, // Add this prop
  loadingRooms // Add this prop
}) => {
  const [showVillaModal, setShowVillaModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const totalPassengers = passengers.adults + passengers.children;

  const openVillaModal = () => {
    if (villas && villas.length > 0) {
      setShowVillaModal(true);
    }
  };

  const openRoomModal = () => {
    if (selectedVilla && rooms && rooms.length > 0) {
      setShowRoomModal(true);
    }
  };

  return (
    <>
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

        {/* Company Selection Section */}
        <div className="bg-white border border-slate-400 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaBuilding className="w-5 h-5 text-blue-500" />
            Select Company <span className="text-red-500">*</span>
          </h4>

          {loadingCompanies ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-600">Loading companies...</span>
            </div>
          ) : (
            <select
              value={selectedCompany || ''}
              onChange={(e) => handleCompanyChange(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
            >
              <option value="">-- Select a Company --</option>
              {companies.map((company) => (
                <option key={company._id} value={company._id}>
                  {company.companyName} ({company.companyId})
                </option>
              ))}
            </select>
          )}

          {selectedCompany && (
            <div className="mt-2 text-xs text-green-600">
              ✓ Company selected
            </div>
          )}
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
                    onClick={openVillaModal}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <Edit className="w-3 h-3" />
                    Change
                  </button>
                </div>

                {/* Selected AC Status Display */}
                {acStatus !== null && (
                  <div className="mt-3 p-2 bg-white border border-blue-200 rounded-md">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Room Type:</span>
                      <span className="text-sm font-semibold text-blue-600">
                        {acStatus === 1 ? 'AC' : 'Non-AC'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-600">Price per night:</span>
                      <span className="text-sm font-bold text-blue-700">
                        LKR {acStatus === 1 
                          ? selectedVilla.villaBasePrice?.withAC 
                          : selectedVilla.villaBasePrice?.withoutAC}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-md p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors" onClick={openVillaModal}>
                <Folder className="w-10 h-10 text-yellow-500 mx-auto mb-2" />
                <p className="text-sm text-yellow-700 font-medium">No villa selected</p>
                <p className="text-xs text-yellow-600 mt-1">
                  {selectedCompany ? 'Click to select a villa' : 'Please select a company first'}
                </p>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN — Selected Rooms */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Selected Rooms ({selectedRoomIds.length})
              </label>
              {selectedVilla && (
                <button
                  onClick={openRoomModal}
                  className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 font-medium"
                >
                  <Edit className="w-3 h-3" />
                  {selectedRoomIds.length > 0 ? 'Edit' : 'Select'}
                </button>
              )}
            </div>

            {selectedRoomIds.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {getSelectedRooms().map((room) => (
                  <div
                    key={room._id}
                    className="bg-green-50 border border-green-200 rounded-lg p-2 flex justify-between items-center"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-900">{room.roomName}</p>
                      <p className="text-xs text-green-600">{room.roomId}</p>
                    </div>
                    {room.capacity && (
                      <span className="text-xs text-green-700 mr-2">
                        {room.capacity} persons
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-md p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors" onClick={openRoomModal}>
                <Folder className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No rooms selected</p>
                <p className="text-xs text-gray-400 mt-1">
                  {selectedVilla ? 'Click to select rooms' : 'Select a villa first'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Villa Selection Modal */}
      <SelectVillaModal
        isVisible={showVillaModal}
        onClose={() => setShowVillaModal(false)}
        villas={villas}
        onVillaSelect={handleVillaSelect}
        selectedVilla={selectedVilla}
        acStatus={acStatus}
        onAcToggle={handleAcToggle}
        loading={loading}
      />

      {/* Room Selection Modal */}
      <SelectRoomModal
        isVisible={showRoomModal}
        onClose={() => setShowRoomModal(false)}
        rooms={rooms}
        selectedRoomIds={selectedRoomIds}
        onRoomToggle={handleRoomToggle}
        loading={loadingRooms}
        selectedVilla={selectedVilla}
      />
    </>
  );
};

export default SelectionPreview;