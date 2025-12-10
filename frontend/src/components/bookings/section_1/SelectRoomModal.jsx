import React, { useState, useEffect } from 'react';
import Modal from '../../common/Modal';
import { Users, Home, X, CheckCircle } from 'lucide-react';

const SelectRoomModal = ({ 
  isVisible, 
  onClose, 
  rooms, 
  selectedRoomIds,
  onRoomToggle,
  loading,
  selectedVilla
}) => {
  const [tempSelectedRoomIds, setTempSelectedRoomIds] = useState([]);

  // Initialize temporary selection when modal opens
  useEffect(() => {
    if (isVisible) {
      setTempSelectedRoomIds(selectedRoomIds);
    }
  }, [isVisible, selectedRoomIds]);

  // Filter to show only bedrooms
  const bedrooms = rooms.filter(room => room.type === 'bedroom');

  const handleRoomToggle = (roomId) => {
    setTempSelectedRoomIds(prev => {
      if (prev.includes(roomId)) {
        return prev.filter(id => id !== roomId);
      } else {
        return [...prev, roomId];
      }
    });
  };

  const handleConfirmSelection = () => {
    // Apply all changes at once
    const currentlySelected = new Set(selectedRoomIds);
    const newSelection = new Set(tempSelectedRoomIds);

    // Find rooms to add
    tempSelectedRoomIds.forEach(roomId => {
      if (!currentlySelected.has(roomId)) {
        const room = rooms.find(r => r._id === roomId);
        if (room) {
          onRoomToggle(room);
        }
      }
    });

    // Find rooms to remove
    selectedRoomIds.forEach(roomId => {
      if (!newSelection.has(roomId)) {
        const room = rooms.find(r => r._id === roomId);
        if (room) {
          onRoomToggle(room);
        }
      }
    });

    onClose();
  };

  const handleCancel = () => {
    setTempSelectedRoomIds(selectedRoomIds);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <Modal isVisible={isVisible} onClose={handleCancel} width="max-w-5xl">
      <div className="relative">
        {/* Close Button */}
        <button
          onClick={handleCancel}
          className="absolute -top-2 -right-2 z-10 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6 border-b pb-4">
          <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Home className="w-6 h-6 text-purple-500" />
            Select Bedrooms
          </h3>
          {selectedVilla && (
            <p className="text-sm text-gray-600 mt-1">
              Choose bedrooms from <span className="font-semibold">{selectedVilla.villaName}</span>
            </p>
          )}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              Selected: {tempSelectedRoomIds.length} {tempSelectedRoomIds.length === 1 ? 'Room' : 'Rooms'}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading rooms...</span>
          </div>
        ) : bedrooms.length === 0 ? (
          <div className="text-center py-12">
            <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No bedrooms available</p>
            <p className="text-sm text-gray-400 mt-2">Please select a different villa</p>
          </div>
        ) : (
          <>
            {/* Room Grid */}
            <div className="max-h-[60vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bedrooms.map((room) => {
                  const isSelected = tempSelectedRoomIds.includes(room._id);
                  const isAvailable = room.status === 'available';

                  return (
                    <button
                      key={room._id}
                      onClick={() => isAvailable && handleRoomToggle(room._id)}
                      disabled={!isAvailable}
                      className={`border-2 rounded-xl p-4 transition-all text-left relative ${
                        isSelected
                          ? 'border-green-500 bg-green-50 shadow-lg scale-105'
                          : isAvailable
                          ? 'border-gray-300 bg-white hover:border-purple-400 hover:shadow-md'
                          : 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-60'
                      }`}
                    >
                      {/* Selection Indicator */}
                      {isSelected && (
                        <div className="absolute -top-2 -right-2 bg-green-600 text-white rounded-full p-1 shadow-lg">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                      )}

                      {/* Room Header */}
                      <div className="mb-3">
                        <h4 className="font-semibold text-lg text-gray-800 mb-1">
                          {room.roomName}
                        </h4>
                        <p className="text-xs text-gray-500 font-mono">{room.roomId}</p>
                      </div>

                      {/* Status Badge */}
                      <div className="mb-3">
                        <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                          isAvailable
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {room.status}
                        </span>
                      </div>

                      {/* Room Details */}
                      <div className="space-y-2 mb-3">
                        {room.bedroomType && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Type:</span>
                            <span className="font-medium text-gray-800">{room.bedroomType}</span>
                          </div>
                        )}

                        {room.capacity && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Capacity:</span>
                            <span className="flex items-center gap-1 text-purple-900 font-semibold">
                              <Users className="w-3 h-3" />
                              {room.capacity} {room.capacity === 1 ? 'person' : 'persons'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Amenities */}
                      {room.amenities && room.amenities.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-gray-700 mb-1">Amenities:</p>
                          <div className="flex flex-wrap gap-1">
                            {room.amenities.slice(0, 3).map((amenity, idx) => (
                              <span 
                                key={idx} 
                                className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded border border-gray-300"
                              >
                                {amenity}
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

                      {/* Room Price */}
                      {room.roomBasePrice && (
                        <div className="border-t border-gray-200 pt-3 mt-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">Per Night:</span>
                            <span className="text-lg font-bold text-green-600">
                              LKR {room.roomBasePrice}
                            </span>
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Summary Bar */}
            {tempSelectedRoomIds.length > 0 && (
              <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-purple-900">
                    {tempSelectedRoomIds.length} {tempSelectedRoomIds.length === 1 ? 'Room' : 'Rooms'} Selected
                  </span>
                  <span className="text-sm text-purple-700">
                    Total Capacity: {bedrooms
                      .filter(r => tempSelectedRoomIds.includes(r._id))
                      .reduce((sum, r) => sum + (r.capacity || 0), 0)} persons
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCancel}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSelection}
                disabled={tempSelectedRoomIds.length === 0}
                className="flex-1 bg-gradient-to-r from-purple-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Selection ({tempSelectedRoomIds.length})
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default SelectRoomModal;
