import React, { useState, useCallback } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { QrCode, XCircle, Camera } from 'lucide-react';
import QRResultsModal from './QRResultsModal';

const QRScanner = ({ onScanComplete }) => {
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [handled, setHandled] = useState(false); // prevent duplicate handling

  // Robust extractor: supports strings, arrays and different barcode shapes
  const extractRaw = (result) => {
    if (!result) return null;
    if (typeof result === 'string') return result;
    if (Array.isArray(result) && result.length > 0) {
      const item = result[0];
      return item?.rawValue ?? item?.text ?? item?.data ?? (typeof item === 'string' ? item : null);
    }
    // object case
    return result?.rawValue ?? result?.text ?? result?.data ?? null;
  };

  // Try to turn a string into booking object. Accept JSON or simple values or URL with params
  const parseBookingData = (raw) => {
    if (!raw) return null;

    // try JSON
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    } catch (e) {
      console.error('JSON parse error:', e);
      // not JSON, continue
    }

    // if raw looks like URL with query params, parse them
    try {
      const url = new URL(raw);
      const params = Object.fromEntries(url.searchParams.entries());
      if (Object.keys(params).length) return params;
    } catch (e) {
      console.error('URL parse error:', e);
      // not a full URL
    }

    // fallback: treat raw as bookingId
    return { bookingId: raw };
  };

  // Handle QR code scan
  const handleScan = useCallback((result) => {
    if (handled) return;
    const raw = extractRaw(result);
    if (!raw) return;

    // avoid rapid repeated results
    setHandled(true);
    setLoading(true);

    // small timeout to allow UI feedback (original behavior)
    setTimeout(() => {
      const bookingData = parseBookingData(raw);
      if (bookingData) {
        setScannedData(bookingData);
        setError(null);
        setLoading(false);
        setModalVisible(true);
        setScanning(false);
        setHandled(false); // allow re-scan later if user chooses
      } else {
        setError('Invalid QR code format. Please scan a valid booking QR code.');
        setScannedData(null);
        setLoading(false);
        setHandled(false);
      }
    }, 300);
  }, [handled]);

  // Handle scan error
  const handleError = useCallback((err) => {
    console.error('QR Scanner Error:', err);
    setError('Failed to access camera. Please check permissions.');
  }, []);

  // Reset scanner state
  const handleReset = useCallback(() => {
    setScanning(false);
    setScannedData(null);
    setError(null);
    setModalVisible(false);
    setHandled(false);
  }, []);

  // Start scanning
  const startScanning = useCallback(() => {
    setScanning(true);
    setError(null);
    setScannedData(null);
    setModalVisible(false);
    setHandled(false);
  }, []);

  // Continue to next step from modal
  const handleContinue = useCallback(() => {
    if (onScanComplete && scannedData) {
      onScanComplete(scannedData);
      setModalVisible(false);
    }
  }, [onScanComplete, scannedData]);

  return (
    <>
      {/* Ready to Scan State */}
      {!scanning && !scannedData && !loading && (
        <ReadyToScan onStart={startScanning} />
      )}

      {/* Active Scanner State */}
      {scanning && (
        <ActiveScanner onScan={handleScan} onError={handleError} onCancel={handleReset} />
      )}

      {/* Loading State */}
      {loading && <LoadingState />}

      {/* Results shown in modal after successful scan */}
      <QRResultsModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        data={scannedData}
        onScanAgain={handleReset}
        onContinue={handleContinue}
      />

      {/* Error State */}
      {error && !loading && (
        <ErrorState error={error} onRetry={handleReset} />
      )}
    </>
  );
};

// Ready to Scan Component
const ReadyToScan = ({ onStart }) => (
  <div className="text-center">
    <div className="mb-6">
      <div className="w-40 h-40 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6">
        <Camera className="w-20 h-20 text-blue-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        Ready to Scan
      </h3>
      <p className="text-gray-600 mb-6">
        Click the button below to activate your camera and scan the booking QR code.
      </p>
    </div>

    <button
      onClick={onStart}
      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3.5 px-8 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-2 mx-auto"
    >
      <QrCode className="w-5 h-5" />
      Start Scanning
    </button>

    <ScanningTips />
  </div>
);

// Scanning Tips Component
const ScanningTips = () => (
  <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
    <h4 className="font-semibold text-blue-900 mb-2 text-sm">Scanning Tips:</h4>
    <ul className="text-sm text-blue-800 space-y-1 text-left">
      <li>• Ensure good lighting conditions</li>
      <li>• Hold your device steady</li>
      <li>• Keep QR code within the frame</li>
      <li>• Allow camera permissions when prompted</li>
    </ul>
  </div>
);

// Active Scanner Component
const ActiveScanner = ({ onScan, onError, onCancel }) => (
  <div className="space-y-4">
    <div className="relative rounded-xl overflow-hidden shadow-lg">
      <Scanner
        onScan={onScan}
        onError={onError}
        constraints={{ facingMode: 'environment', aspectRatio: 1 }}
        styles={{
          container: { width: '100%', paddingTop: '100%', position: 'relative' },
          video: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }
        }}
      />
      <ScannerOverlay />
    </div>
    <div className="text-center">
      <p className="text-gray-600 mb-4">Position the QR code within the frame</p>
      <button 
        onClick={onCancel} 
        className="bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-300 transition-colors font-medium"
      >
        Cancel Scanning
      </button>
    </div>
  </div>
);

// Scanner Overlay Component
const ScannerOverlay = () => (
  <div className="absolute inset-0 pointer-events-none">
    <div className="absolute inset-0 border-4 border-blue-500 rounded-xl">
      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg"></div>
    </div>
  </div>
);

// Loading State Component
const LoadingState = () => (
  <div className="text-center py-12">
    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
    <p className="text-gray-600 font-medium">Processing QR code...</p>
  </div>
);

// Success State Component
const SuccessState = ({ data, onReset, onContinue }) => (
  <div className="text-center">
    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <CheckCircle className="w-12 h-12 text-green-600" />
    </div>
    <h3 className="text-2xl font-bold text-gray-900 mb-2">
      QR Code Scanned Successfully!
    </h3>
    <p className="text-gray-600 mb-6">
      Your booking information has been verified.
    </p>

    <BookingDetails data={data} />

    <div className="flex gap-3">
      <button 
        onClick={onReset} 
        className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 transition-colors font-medium"
      >
        Scan Again
      </button>
      <button 
        onClick={onContinue} 
        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg font-medium"
      >
        Continue
      </button>
    </div>
  </div>
);

// Booking Details Component
const BookingDetails = ({ data }) => (
  <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
    <h4 className="font-semibold text-gray-900 mb-3">Booking Details:</h4>
    <div className="space-y-2 text-sm">
      <DetailRow label="Booking ID" value={data.bookingId} />
      <DetailRow label="Villa" value={data.villaName} />
      <DetailRow label="Check-in" value={data.checkIn} />
      <DetailRow label="Check-out" value={data.checkOut} />
    </div>
  </div>
);

// Detail Row Component
const DetailRow = ({ label, value }) => (
  <div className="flex justify-between">
    <span className="text-gray-600">{label}:</span>
    <span className="font-medium text-gray-900">{value || 'N/A'}</span>
  </div>
);

// Error State Component
const ErrorState = ({ error, onRetry }) => (
  <div className="text-center">
    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <XCircle className="w-12 h-12 text-red-600" />
    </div>
    <h3 className="text-2xl font-bold text-gray-900 mb-2">
      Scanning Failed
    </h3>
    <p className="text-red-600 mb-6">{error}</p>
    <button 
      onClick={onRetry} 
      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg font-medium"
    >
      Try Again
    </button>
  </div>
);

export default QRScanner;