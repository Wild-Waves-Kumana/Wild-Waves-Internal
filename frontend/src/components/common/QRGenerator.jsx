import React from 'react';
import QRCode from 'react-qr-code';

const QRGenerator = ({ 
  value = '',
  size = 180,
  className = '',
  ...rest
}) => {
  if (!value) return null;

  return (
    <div 
      className={className} 
      style={{ width: size, height: size }}
    >
      <QRCode
        value={String(value)}
        style={{ height: "100%", width: "100%" }}
        {...rest}
      />
    </div>
  );
};

export default QRGenerator;
