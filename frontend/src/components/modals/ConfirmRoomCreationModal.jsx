import React from 'react';
import Modal from '../common/Modal';

const ConfirmRoomCreationModal = ({ isOpen, onClose, onConfirm, roomData, villaName, loading }) => {
  return (
    <Modal isVisible={isOpen} onClose={onClose} width="max-w-2xl min-w-1/3">
      <div className="w-full">
        <h2 className="text-2xl font-semibold text-center mb-4">Confirm Room Creation</h2>
        <p className="text-center text-gray-600 mb-6">Please review the room details before creating</p>

        <div className="space-y-4 bg-gray-50 p-4 rounded-lg">

          <div className="flex flex-col md:flex-row gap-4">

            {/* Villa Info */}
          <div className="flex-1 border-l-4 border-blue-500 pl-4">
            <h4 className="text-sm font-medium text-gray-700">Villa</h4>
            <p className="text-lg font-semibold">{villaName || 'Not selected'}</p>
          </div>

          {/* Room Name */}
            <div className="flex-1 border-l-4 border-purple-500 pl-4">
              <h4 className="text-sm font-medium text-gray-700">Room Name</h4>
              <p className="text-lg font-semibold">{roomData.roomName || 'Not specified'}</p>
            </div>
          </div>
          

          <div className="flex flex-col md:flex-row gap-4">

            {/* Room ID */}
            <div className="flex-1 border-l-4 border-green-500 pl-4">
              <h4 className="text-sm font-medium text-gray-700">Room ID</h4>
              <p className="text-lg font-mono">{roomData.roomId || 'Not generated'}</p>
            </div>

            

          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 border-l-4 border-orange-500 pl-4">
            <h4 className="text-sm font-medium text-gray-700">Type</h4>
            <p className="text-lg capitalize">{roomData.type || 'Not specified'}</p>
          </div>

          {/* Bedroom Type (if applicable) */}
          {roomData.bedroomType && (
            <div className="flex-1 border-l-4 border-pink-500 pl-4">
              <h4 className="text-sm font-medium text-gray-700">Bedroom Type</h4>
              <p className="text-lg capitalize">{roomData.bedroomType}</p>
            </div>
          )}

          </div>
          {/* Type */}
          

          {/* Capacity (if applicable) */}
          {roomData.capacity && roomData.capacity > 0 && (
            <div className="border-l-4 border-indigo-500 pl-4">
              <h4 className="text-sm font-medium text-gray-700">Capacity</h4>
              <p className="text-lg">{roomData.capacity} person(s)</p>
            </div>
          )}

          {/* Amenities */}
          <div className="border-l-4 border-teal-500 pl-4">
            <h4 className="text-sm font-medium text-gray-700">Amenities</h4>
            {roomData.amenities && roomData.amenities.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-2">
                {roomData.amenities.split(', ').map((amenity, idx) => (
                  <span key={idx} className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                    {amenity}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-lg text-gray-500">No amenities selected</p>
            )}
          </div>

          {/* Status */}
          <div className="border-l-4 border-yellow-500 pl-4">
            <h4 className="text-sm font-medium text-gray-700">Status</h4>
            <span className={`inline-block px-3 py-1 text-sm rounded-full ${
              roomData.status === 'available' ? 'bg-green-100 text-green-800' :
              roomData.status === 'occupied' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {roomData.status}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end mt-6">
          <button
            type="button"
            className="px-6 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </span>
            ) : (
              'Confirm & Create'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmRoomCreationModal;