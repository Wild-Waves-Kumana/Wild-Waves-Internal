import React, { useRef, useEffect, useState } from 'react';
import { Download, QrCode, CheckCircle, FileText } from 'lucide-react';
import html2canvas from 'html2canvas';
import { generateBookingPDF } from '../../../utils/generateBookingPDF';
import QRCode from 'qrcode';
import QRGenerator from '../../common/QRGenerator';
import axios from 'axios';

const formatLKR = (val) => {
  if (val === null || val === undefined) return '0';
  return Number(val).toLocaleString('en-US');
};

const PaymentSuccessful = ({ 
  bookingId, 
  mongoId,
  confirmation,
  totalAmount,
  bookingData,
  companyDetails,
  villaDetails,
  roomsDetails,
  prices
}) => {
  const qrRef = useRef(null);
  const [villaBookingUpdated, setVillaBookingUpdated] = useState(false);

  useEffect(() => {
    const updateVillaBooking = async () => {
      try {
        const response = await axios.post('/api/villa-bookings/update', {
          bookingId: mongoId
        });
        
        if (response.data.success) {
          setVillaBookingUpdated(true);
          console.log('Villa booking updated:', response.data.data);
        }
      } catch (error) {
        console.error('Error updating villa booking:', error);
      }
    };

    if (mongoId) {
      updateVillaBooking();
    }
  }, [mongoId]);

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
      alert('Failed to download QR code. Please try again.');
    }
  };

  const handleDownloadPDF = async () => {
    try {
      // Generate QR code as data URL
      const qrDataUrl = await QRCode.toDataURL(mongoId || bookingId, {
        width: 512,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H'
      });

      await generateBookingPDF(
        bookingData,
        bookingId,
        mongoId,
        companyDetails,
        villaDetails,
        roomsDetails,
        prices,
        confirmation,
        qrDataUrl
      );
      
      console.log('PDF downloaded successfully');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Success Header */}
      <div className="p-6 bg-green-50 border-2 border-green-200 rounded-lg">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
          <div>
            <h4 className="font-bold text-green-800 text-lg">Payment Successful!</h4>
            <p className="text-sm text-green-700">Your booking has been confirmed</p>
          </div>
        </div>
        
        <div className="space-y-2 text-sm bg-white rounded-md p-4 border border-green-200 mb-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Payment Reference:</span>
            <span className="font-mono font-semibold text-gray-900">{confirmation}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Booking ID:</span>
            <span className="font-mono font-semibold text-blue-600">{bookingId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Amount Paid:</span>
            <span className="font-bold text-green-600">LKR {formatLKR(totalAmount)}</span>
          </div>
        </div>

        {/* Villa Booking Status */}
        {villaBookingUpdated && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-blue-600" />
            <p className="text-xs text-blue-800">
              Villa booking calendar updated successfully
            </p>
          </div>
        )}
      </div>

      {/* QR Code Section */}
      <div>
        <div className="text-center">
          <div className="mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <QrCode className="w-6 h-6 text-indigo-600" />
              <h3 className="text-xl font-bold text-gray-800">Booking QR Code</h3>
            </div>
            <p className="text-sm text-gray-600">Present this QR code at check-in</p>
          </div>

          {/* QR Code Display */}
          <div ref={qrRef} className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-blue-200 mb-6">
            <div className="bg-white p-4 rounded-lg inline-block shadow-md">
              <QRGenerator 
                value={mongoId}
                size={200}
              />
            </div>

            <div className="mt-4 space-y-2">
              {mongoId && (
                <div>
                  <p className="font-mono text-xs text-gray-600 break-all">{mongoId}</p>
                </div>
              )}
              <div className="bg-white p-3 rounded-md border border-blue-200">
                <p className="text-xs text-gray-600 mb-1">Booking ID</p>
                <p className="font-mono font-bold text-blue-600 text-lg">{bookingId}</p>
              </div>
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

          {/* Download Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleDownloadQR}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download QR
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Download PDF
            </button>
          </div>

          {/* Additional Info */}
          <p className="text-xs text-gray-500 mt-4">
            You can access this QR code anytime from your booking history
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessful;