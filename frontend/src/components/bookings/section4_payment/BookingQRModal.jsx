import React, { useRef } from 'react';
import Modal from '../../common/Modal';
import QRGenerator from '../../common/QRGenerator';
import { Download, QrCode, CheckCircle, FileText } from 'lucide-react';
import html2canvas from 'html2canvas';
import { downloadPDF } from '../../../utils/pdfUtils';
import BookingPDFTemplate from './BookingPDFTemplate';

const BookingQRModal = ({ 
  isOpen, 
  onClose, 
  bookingId, 
  mongoId,
  bookingData,
  companyDetails,
  villaDetails,
  roomsDetails,
  prices,
  confirmation
}) => {
  const qrRef = useRef(null);

  const handleDownloadQR = async () => {
    if (!qrRef.current) return;

    try {
      const canvas = await html2canvas(qrRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });

      const link = document.createElement('a');
      link.download = `booking-qr-${bookingId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error downloading QR code:', error);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      // Wait for QR code to render
      await new Promise(resolve => setTimeout(resolve, 500));
      await downloadPDF('booking-pdf-template', `booking-${bookingId}.pdf`);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  return (
    <>
      <Modal isVisible={isOpen} onClose={onClose} width="max-w-md">
        <div className="text-center">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-800">Booking Confirmed!</h2>
            </div>
            <p className="text-sm text-gray-600">Your booking has been successfully processed</p>
          </div>

          {/* QR Code Section */}
          <div ref={qrRef} className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-blue-200 mb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <QrCode className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-800">Booking QR Code</h3>
            </div>
            
            <div className="bg-white p-4 rounded-lg inline-block shadow-md">
              <QRGenerator 
                value={mongoId}
                size={200}
              />
            </div>

            <div className="mt-4 space-y-2">
              <div className="bg-white p-3 rounded-md border border-blue-200">
                <p className="text-xs text-gray-600 mb-1">Booking ID</p>
                <p className="font-mono font-bold text-blue-600 text-lg">{bookingId}</p>
              </div>
              {mongoId && (
                <div className="bg-white p-2 rounded-md border border-gray-200">
                  <p className="font-mono text-xs text-gray-600 break-all">{mongoId}</p>
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
            <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Important Information
            </h4>
            <ul className="text-xs text-yellow-800 space-y-1 list-disc list-inside">
              <li>Save or screenshot this QR code for check-in</li>
              <li>Show this QR code at the property entrance</li>
              <li>A confirmation email has been sent to your registered email</li>
              <li>Keep your Booking ID for reference</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <button
              onClick={handleDownloadQR}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              QR Image
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              PDF
            </button>
          </div>
          
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Close
          </button>

          {/* Additional Info */}
          <p className="text-xs text-gray-500 mt-4">
            You can access this QR code anytime from your booking history
          </p>
        </div>
      </Modal>

      {/* Hidden PDF Template */}
      {isOpen && (
        <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
          <BookingPDFTemplate
            bookingData={bookingData}
            savedBookingId={bookingId}
            mongoId={mongoId}
            companyDetails={companyDetails}
            villaDetails={villaDetails}
            roomsDetails={roomsDetails}
            prices={prices}
            confirmation={confirmation}
          />
        </div>
      )}
    </>
  );
};

export default BookingQRModal;