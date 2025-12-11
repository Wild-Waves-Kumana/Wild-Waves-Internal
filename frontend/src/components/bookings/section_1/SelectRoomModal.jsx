import React from 'react';
import Modal from '../../common/Modal';
import { Home, Users } from 'lucide-react';

const SelectRoomModal = ({
  isVisible,
  onClose,
  rooms = [],
  selectedRoomIds = [],
  onRoomToggle,
  loading = false,
  selectedVilla = null
}) => {
  // show only bedrooms (consistent with VillaRoomSelection)
  const bedrooms = (rooms || []).filter(r => r.type === 'bedroom');

  return (
    <Modal isVisible={isVisible} onClose={onClose} width="max-w-4xl w-full">
      <div className="relative">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              Select Bedrooms {selectedVilla ? `- ${selectedVilla.villaName}` : ''}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Choose one or more bedrooms for your booking.
            </p>
          </div>
          <div className="text-sm text-gray-500">
            <div>
              Selected: <span className="font-semibold text-purple-700">{selectedRoomIds.length}</span>
            </div>
          </div>
        </div>

        {/* Body */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            <span className="ml-3 text-gray-600">Loading bedrooms...</span>
          </div>
        ) : bedrooms.length === 0 ? (
          <div className="text-center py-12">
            <Home className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-medium">No bedrooms available</p>
            <p className="text-xs text-gray-400 mt-1">for the selected villa / company</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bedrooms.map((room) => {
              const selected = selectedRoomIds.includes(room._id);
              return (
                <div
                  key={room._id}
                  className={`border rounded-lg p-4 transition-all ${
                    selected ? 'border-green-500 bg-green-50 shadow-lg' : 'border-slate-400 bg-white hover:shadow-lg'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg text-gray-800">{room.roomName}</h4>
                      <p className="text-xs text-gray-500">{room.roomId}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                      room.status === 'available' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {room.status}
                    </span>
                  </div>

                  <div className="flex justify-between space-y-2 mb-3">
                    {room.bedroomType && (
                      <div className="flex gap-2 items-center justify-between text-sm">
                        <span className="font-medium text-gray-700">Type:</span>
                        <span className="text-gray-600">{room.bedroomType}</span>
                      </div>
                    )}

                    {room.capacity && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1 text-purple-900 font-semibold">
                          <Users className="w-3 h-3" />
                          {room.capacity} {room.capacity === 1 ? 'person' : 'persons'}
                        </span>
                      </div>
                    )}
                  </div>

                  {room.amenities && room.amenities.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {room.amenities.map((a, i) => (
                          <span key={i} className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded border border-gray-300">
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {room.roomBasePrice && (
                    <div className="border-t border-slate-300 pt-3 mt-3">
                      <p className="text-xs font-medium text-gray-700 mb-1">Price per Night:</p>
                      <p className="text-lg font-semibold text-green-600">LKR {room.roomBasePrice}</p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => onRoomToggle(room)}
                    disabled={room.status !== 'available'}
                    className={`w-full mt-3 py-2 rounded-lg transition-colors text-sm font-medium shadow-sm ${
                      selected ? 'bg-green-600 text-white hover:bg-green-700' : room.status === 'available' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-400 text-white cursor-not-allowed'
                    }`}
                  >
                    {selected ? '✓ Selected' : room.status === 'available' ? 'Select Room' : 'Not Available'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-xl hover:bg-gray-300 transition-colors font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SelectRoomModal;