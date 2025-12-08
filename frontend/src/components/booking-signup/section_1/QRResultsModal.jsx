import React from 'react';
import Modal from '../../common/Modal';
import { CheckCircle } from 'lucide-react';

const QRResultsModal = ({ isVisible, onClose, data, onScanAgain, onContinue }) => {
  return (
    <Modal isVisible={isVisible} onClose={onClose} width="max-w-md w-full">
      <div className="text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          QR Code Scanned Successfully!
        </h3>
        <p className="text-gray-600 mb-6">
          Your booking information has been detected. Review and continue to complete signup.
        </p>

        <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
          <h4 className="font-semibold text-gray-900 mb-3">Booking Details:</h4>
          <div className="space-y-2 text-sm">
            <DetailRow label="Booking ID" value={data?.bookingId} />
            <DetailRow label="Villa" value={data?.villaName} />
            <DetailRow label="Check-in" value={data?.checkIn} />
            <DetailRow label="Check-out" value={data?.checkOut} />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              if (onScanAgain) onScanAgain();
              if (onClose) onClose();
            }}
            className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 transition-colors font-medium"
          >
            Scan Again
          </button>
          <button
            onClick={() => {
              if (onContinue) onContinue();
            }}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg font-medium"
          >
            Continue
          </button>
        </div>
      </div>
    </Modal>
  );
};

const DetailRow = ({ label, value }) => (
  <div className="flex justify-between">
    <span className="text-gray-600">{label}:</span>
    <span className="font-medium text-gray-900">{value || 'N/A'}</span>
  </div>
);

export default QRResultsModal;
