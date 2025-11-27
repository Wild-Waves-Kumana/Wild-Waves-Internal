import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from '../common/Modal';

const ClearBookingStorageConfirmationModal = ({ isVisible, onClose, onConfirm }) => {
  return (
    <Modal isVisible={isVisible} onClose={onClose} width="max-w-md">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Clear Booking Selections?
        </h3>
        
        <p className="text-sm text-gray-600 mb-6">
          This will delete all booking data including dates, room selections, customer information, and prices. This action cannot be undone.
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            Clear Selections
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ClearBookingStorageConfirmationModal;