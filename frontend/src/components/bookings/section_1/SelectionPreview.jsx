import React, { useState } from 'react';
import { FaUserFriends, FaBuilding } from 'react-icons/fa';
import { Folder, Edit, Home } from 'lucide-react';
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
  rooms,
  loadingRooms
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

        {/* Villa Selection Section - ROW 1 */}
        <div className="bg-white border border-slate-400 rounded-xl p-4">
          
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <FaBuilding className="w-5 h-5 text-blue-500" />
              Selected Villa
            </h4>
            {selectedVilla && (
              <button
                onClick={openVillaModal}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                <Edit className="w-3 h-3" />
                Change Villa
              </button>
            )}
          </div>
         

          {selectedVilla ? (
             
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <p className="font-semibold text-blue-900 text-base">{selectedVilla.villaName}</p>
                  <p className="text-xs text-blue-600 mt-1">{selectedVilla.villaId}</p>
                  {selectedVilla.villaLocation && (
                    <p className="text-xs text-gray-600 mt-1">{selectedVilla.villaLocation}</p>
                  )}
                </div>
              </div>

              {/* AC/Non-AC Status Display */}
              {acStatus !== null && (
                <div className="">
                  <div className="bg-white border border-blue-200 rounded-md p-2 mb-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-gray-600">Room Type:</span>
                      <span className={`text-sm font-bold ${acStatus === 1 ? 'text-blue-600' : 'text-green-600'}`}>
                        {acStatus === 1 ? 'Air Conditioned' : 'Non-AC'}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white border border-blue-200 rounded-md p-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-gray-600">Price per night:</span>
                      <span className="text-base font-bold text-blue-700">
                        LKR {acStatus === 1 
                          ? selectedVilla.villaBasePrice?.withAC?.toLocaleString()
                          : selectedVilla.villaBasePrice?.withoutAC?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              </div>

              
            </div>
          ) : (
            <div 
              className="rounded-lg border-2 border-dashed border-yellow-300 bg-yellow-50 p-6 text-center cursor-pointer hover:bg-yellow-100 transition-colors"
              onClick={openVillaModal}
            >
              <Folder className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
              <p className="text-sm text-yellow-700 font-medium">No villa selected</p>
              <p className="text-xs text-yellow-600 mt-1">
                {selectedCompany ? 'Click to select a villa' : 'Please select a company first'}
              </p>
            </div>
          )}
        </div>

        {/* Rooms Selection Section - ROW 2 */}
        <div className="bg-white border border-slate-400 rounded-xl p-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Home className="w-5 h-5 text-purple-500" />
              Selected Bedrooms
              {selectedRoomIds.length > 0 && (
                <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full font-medium">
                  {selectedRoomIds.length}
                </span>
              )}
            </h4>
            {selectedVilla && (
              <button
                onClick={openRoomModal}
                disabled={!selectedVilla}
                className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Edit className="w-3 h-3" />
                {selectedRoomIds.length > 0 ? 'Edit Rooms' : 'Select Rooms'}
              </button>
            )}
          </div>

          {selectedRoomIds.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {getSelectedRooms().map((room) => (
                <div
                  key={room._id}
                  className="bg-green-50 border border-green-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-green-900">{room.roomName}</p>
                      <p className="text-xs text-green-600 mt-0.5">{room.roomId}</p>
                    </div>
                    {room.capacity && (
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium ml-2">
                        {room.capacity}p
                      </span>
                    )}
                  </div>
                  {room.bedroomType && (
                    <p className="text-xs text-gray-600 capitalize">{room.bedroomType}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div 
              className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={openRoomModal}
            >
              <Folder className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 font-medium">No rooms selected</p>
              <p className="text-xs text-gray-400 mt-1">
                {selectedVilla ? 'Click to select bedrooms' : 'Select a villa first'}
              </p>
            </div>
          )}
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