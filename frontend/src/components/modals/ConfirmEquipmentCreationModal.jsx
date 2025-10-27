import React from 'react';
import Modal from '../common/Modal';

const ConfirmEquipmentCreationModal = ({ isOpen, onClose, onConfirm, equipmentData, villaName, roomName, loading }) => {
  return (
    <Modal isVisible={isOpen} onClose={onClose} width="max-w-2xl min-w-1/3">
      <div className="w-full">
        <h2 className="text-2xl font-semibold text-center mb-4">Confirm Equipment Creation</h2>
        <p className="text-center text-gray-600 mb-6">Please review the equipment details before creating</p>

        <div className="space-y-4 bg-gray-50 p-4 rounded-lg">

          <div className="flex flex-col md:flex-row gap-4">
            {/* Category */}
            <div className="flex-1 border-l-4 border-blue-500 pl-4">
              <h4 className="text-sm font-medium text-gray-700">Category</h4>
              <p className="text-lg font-semibold">{equipmentData.category || 'Not specified'}</p>
            </div>

            {/* Item Code */}
            <div className="flex-1 border-l-4 border-green-500 pl-4">
              <h4 className="text-sm font-medium text-gray-700">Item Code</h4>
              <p className="text-lg font-mono">{equipmentData.itemCode || 'Not generated'}</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            {/* Item Name */}
            <div className="flex-1 border-l-4 border-purple-500 pl-4">
              <h4 className="text-sm font-medium text-gray-700">Item Name</h4>
              <p className="text-lg font-semibold">{equipmentData.itemName || 'Not specified'}</p>
            </div>

            {/* Access */}
            <div className="flex-1 border-l-4 border-red-500 pl-4">
              <h4 className="text-sm font-medium text-gray-700">Access</h4>
              <span className={`inline-block px-3 py-1 text-sm rounded-full ${
                equipmentData.access ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {equipmentData.access ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            {/* Villa Info */}
            <div className="flex-1 border-l-4 border-orange-500 pl-4">
              <h4 className="text-sm font-medium text-gray-700">Villa</h4>
              <p className="text-lg font-semibold">{villaName || 'Not selected'}</p>
            </div>

            {/* Room Info */}
            <div className="flex-1 border-l-4 border-yellow-500 pl-4">
              <h4 className="text-sm font-medium text-gray-700">Room</h4>
              <p className="text-lg font-semibold">{roomName || 'Not assigned'}</p>
            </div>
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

export default ConfirmEquipmentCreationModal;