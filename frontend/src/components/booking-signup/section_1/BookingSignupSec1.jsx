import React from 'react';
import QRScanner from './QRScanner';

const BookingSignupSec1 = ({ onScanComplete }) => {
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-8">
      <QRScanner onScanComplete={onScanComplete} />
    </div>
  );
};

export default BookingSignupSec1;
