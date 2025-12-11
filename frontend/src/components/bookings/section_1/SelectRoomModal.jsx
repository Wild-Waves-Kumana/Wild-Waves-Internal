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
    <Modal isVisible={isVisible} onClose={onClose} width="max-w-3xl w-full">
      <div className="relative">
        {/* Header */}
        <div className="mb-4 pb-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Home className="w-5 h-5 text-blue-600" />
                Select Bedrooms
                {selectedVilla && <span className="text-sm font-normal text-gray-600">- {selectedVilla.villaName}</span>}
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                Choose one or more bedrooms for your booking
              </p>
            </div>
            <div className="bg-blue-100 text-blue-700 text-xs px-3 py-1.5 rounded-full font-medium">
              Selected: {selectedRoomIds.length}
            </div>
          </div>
        </div>

        {/* Body */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
            <span className="ml-2 text-sm text-gray-600">Loading bedrooms...</span>
          </div>
        ) : bedrooms.length === 0 ? (
          <div className="text-center py-8">
            <Home className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 font-medium">No bedrooms available</p>
            <p className="text-xs text-gray-400 mt-1">for the selected villa</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto pr-2">
            {bedrooms.map((room) => {
              const selected = selectedRoomIds.includes(room._id);
              return (
                <div
                  key={room._id}
                  className={`border-2 rounded-lg p-3 transition-all ${
                    selected 
                      ? 'border-green-600 bg-green-50 shadow-md' 
                      : 'border-gray-300 bg-white hover:shadow-md hover:border-blue-400'
                  }`}
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-gray-800 truncate">
                        {room.roomName}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">{room.roomId}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-md font-medium ml-2 flex-shrink-0 ${
                      room.status === 'available' 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {room.status}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 mb-2">
                    {room.bedroomType && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-600">Type:</span>
                        <span className="text-gray-800 font-medium capitalize">
                          {room.bedroomType}
                        </span>
                      </div>
                    )}

                    {room.capacity && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-600">Capacity:</span>
                        <span className="flex items-center gap-1 text-gray-800 font-semibold">
                          <Users className="w-3 h-3" />
                          {room.capacity} {room.capacity === 1 ? 'person' : 'persons'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Amenities */}
                  {room.amenities && room.amenities.length > 0 && (
                    <div className="mb-2">
                      <div className="flex flex-wrap gap-1">
                        {room.amenities.slice(0, 3).map((a, i) => (
                          <span 
                            key={i} 
                            className="bg-gray-100 text-gray-700 text-xs px-1.5 py-0.5 rounded border border-gray-300"
                          >
                            {a}
                          </span>
                        ))}
                        {room.amenities.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{room.amenities.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Price */}
                  {room.roomBasePrice && (
                    <div className="border-t border-gray-300 pt-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Price/Night:</span>
                        <span className="text-sm font-bold text-green-600">
                          LKR {room.roomBasePrice.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Select Button */}
                  <button
                    type="button"
                    onClick={() => onRoomToggle(room)}
                    disabled={room.status !== 'available'}
                    className={`w-full mt-2 py-1.5 rounded-lg transition-colors text-xs font-medium ${
                      selected 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : room.status === 'available' 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-gray-400 text-white cursor-not-allowed'
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
        <div className="mt-4 pt-3 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SelectRoomModal;