import React, { useEffect, useRef } from 'react';
import QRCode from 'react-qr-code';

const formatLKR = (val) => {
  if (val === null || val === undefined) return '0';
  return Number(val).toLocaleString('en-US');
};

const BookingPDFTemplate = ({ 
  bookingData, 
  savedBookingId, 
  mongoId,
  companyDetails,
  villaDetails,
  roomsDetails,
  prices,
  confirmation
}) => {
  const qrRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    // Convert SVG QR code to canvas for better PDF rendering
    const convertSvgToCanvas = () => {
      if (!qrRef.current || !canvasRef.current) return;

      const svg = qrRef.current.querySelector('svg');
      if (!svg) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Set canvas size
      canvas.width = 150;
      canvas.height = 150;

      // Create image from SVG
      const svgData = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, 150, 150);
        ctx.drawImage(img, 0, 0, 150, 150);
        URL.revokeObjectURL(url);
        
        // Hide SVG, show canvas
        if (qrRef.current) {
          qrRef.current.style.display = 'none';
        }
        canvas.style.display = 'block';
      };

      img.src = url;
    };

    // Small delay to ensure QR code is rendered
    const timer = setTimeout(convertSvgToCanvas, 100);
    return () => clearTimeout(timer);
  }, [mongoId, savedBookingId]);

  if (!bookingData) return null;

  const { bookingDates, roomSelection, customer } = bookingData;

  const perNightTotal = (prices?.villaPrice || 0) + 
    (prices?.roomPrices?.reduce((sum, rp) => sum + (rp.price || 0), 0) || 0);

  const styles = {
    container: {
      backgroundColor: '#ffffff',
      padding: '32px',
      width: '210mm',
      minHeight: '297mm',
      fontFamily: 'Arial, sans-serif',
      color: '#000000'
    },
    header: {
      textAlign: 'center',
      marginBottom: '24px',
      paddingBottom: '16px',
      borderBottom: '4px solid #2563eb'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#1f2937',
      margin: '8px 0'
    },
    subtitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#2563eb',
      margin: '4px 0'
    },
    qrContainer: {
      width: '33.33%',
      margin: '0 auto 24px',
      background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)',
      padding: '24px',
      borderRadius: '8px',
      border: '2px solid #93c5fd',
      textAlign: 'center'
    },
    qrBox: {
      backgroundColor: '#ffffff',
      padding: '12px',
      borderRadius: '8px',
      display: 'inline-block',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      position: 'relative'
    },
    idBox: {
      backgroundColor: '#ffffff',
      padding: '8px',
      borderRadius: '6px',
      border: '1px solid #93c5fd',
      marginTop: '8px'
    },
    sectionTitle: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'center'
    },
    infoBox: {
      backgroundColor: '#f0f9ff',
      border: '1px solid #bae6fd',
      padding: '12px',
      borderRadius: '6px',
      fontSize: '12px'
    },
    gridContainer: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
      marginBottom: '16px'
    },
    label: {
      color: '#6b7280',
      fontSize: '12px'
    },
    value: {
      fontWeight: '500',
      color: '#1f2937',
      fontSize: '12px'
    },
    pricingBox: {
      backgroundColor: '#f9fafb',
      padding: '12px',
      borderRadius: '8px',
      fontSize: '12px'
    },
    totalRow: {
      borderTop: '2px solid #9ca3af',
      paddingTop: '8px',
      marginTop: '4px'
    },
    footer: {
      marginTop: '24px',
      paddingTop: '12px',
      borderTop: '1px solid #d1d5db',
      textAlign: 'center'
    }
  };

  return (
    <div id="booking-pdf-template" style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <h1 style={styles.title}>Wild Waves</h1>
        </div>
        <h2 style={styles.subtitle}>Booking Confirmation</h2>
        <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Thank you for choosing Wild Waves</p>
      </div>

      {/* QR Code Section */}
      <div >
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>Booking QR Code</h3>
        
        <div style={styles.qrBox}>
          {/* SVG QR Code (will be hidden after conversion) */}
          <div ref={qrRef} style={{ height: '200px', width: '200px', margin: '0 auto' }}>
            <QRCode
              value={mongoId || savedBookingId}
              size={150}
              level="H"
              style={{ height: '100%', width: '100%' }}
              fgColor="#000000"
              bgColor="#FFFFFF"
            />
          </div>
          
          {/* Canvas (will be shown for PDF) */}
          <canvas 
            ref={canvasRef}
            width={150}
            height={150}
            style={{ display: 'none', margin: '0 auto' }}
          />
        </div>

        <div style={{ marginTop: '16px' }}>
          <div style={{...styles.idBox, marginBottom: '8px'}}>
            <p style={{ fontSize: '10px', color: '#6b7280', margin: '0 0 4px 0' }}>Booking ID</p>
            <p style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#2563eb', margin: 0 }}>{savedBookingId}</p>
          </div>
          {mongoId && (
            <div style={{...styles.idBox, border: '1px solid #d1d5db'}}>
              <p style={{ fontSize: '9px', color: '#9ca3af', margin: '0 0 2px 0' }}>Reference ID</p>
              <p style={{ fontFamily: 'monospace', fontSize: '9px', color: '#6b7280', margin: 0, wordBreak: 'break-all' }}>{mongoId}</p>
            </div>
          )}
        </div>
      </div>

      {/* Booking Details */}
      <div style={styles.gridContainer}>
        {/* Dates */}
        <div>
          <h4 style={styles.sectionTitle}>📅 Booking Dates</h4>
          <div style={styles.infoBox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={styles.label}>Check-in:</span>
              <span style={styles.value}>
                {bookingDates?.checkInDate 
                  ? new Date(bookingDates.checkInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : '—'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={styles.label}>Check-out:</span>
              <span style={styles.value}>
                {bookingDates?.checkOutDate 
                  ? new Date(bookingDates.checkOutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : '—'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px', borderTop: '1px solid #d1d5db' }}>
              <span style={styles.label}>Nights:</span>
              <span style={{ fontWeight: '600', color: '#2563eb' }}>{bookingDates?.nights || 0}</span>
            </div>
          </div>
        </div>

        {/* Passengers */}
        <div>
          <h4 style={styles.sectionTitle}>👥 Passengers</h4>
          <div style={styles.infoBox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={styles.label}>Adults:</span>
              <span style={styles.value}>{customer?.passengers?.adults || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={styles.label}>Children:</span>
              <span style={styles.value}>{customer?.passengers?.children || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px', borderTop: '1px solid #d1d5db' }}>
              <span style={styles.label}>Total:</span>
              <span style={{ fontWeight: '600', color: '#9333ea' }}>
                {(customer?.passengers?.adults || 0) + (customer?.passengers?.children || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Company & Villa */}
      <div style={styles.gridContainer}>
        <div>
          <h4 style={styles.sectionTitle}>🏢 Company</h4>
          <div style={styles.infoBox}>
            <p style={{ fontWeight: '600', color: '#1f2937', margin: '0 0 4px 0' }}>{companyDetails?.companyName || 'N/A'}</p>
            <p style={{ fontSize: '10px', color: '#6b7280', margin: 0 }}>{companyDetails?.companyId || ''}</p>
          </div>
        </div>

        <div>
          <h4 style={styles.sectionTitle}>🏠 Villa</h4>
          <div style={styles.infoBox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontWeight: '600', color: '#1f2937', margin: 0 }}>{villaDetails?.villaName || 'N/A'}</p>
              <p style={{ fontSize: '10px', color: '#6b7280', margin: 0 }}>
                {roomSelection?.acStatus === 1 ? 'AC' : roomSelection?.acStatus === 0 ? 'Non-AC' : '—'}
              </p>
            </div>
            {villaDetails?.villaLocation && (
              <p style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px', margin: '4px 0 0 0' }}>{villaDetails.villaLocation}</p>
            )}
          </div>
        </div>
      </div>

      {/* Rooms */}
      {roomsDetails && roomsDetails.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <h4 style={styles.sectionTitle}>🛏️ Selected Rooms ({roomsDetails.length})</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            {roomsDetails.map((room, idx) => (
              <div key={room._id || idx} style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '6px', padding: '8px', fontSize: '11px' }}>
                <div style={{ fontWeight: '500', color: '#1f2937' }}>{room.roomName}</div>
                {room.capacity > 0 && (
                  <div style={{ fontSize: '9px', color: '#6b7280' }}>
                    Capacity: {room.capacity}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Customer Details */}
      <div style={{ marginBottom: '16px' }}>
        <h4 style={styles.sectionTitle}>👤 Customer Details</h4>
        <div style={{ backgroundColor: '#fff7ed', border: '1px solid #fed7aa', padding: '12px', borderRadius: '6px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
          <div>
            <span style={styles.label}>Name:</span>
            <p style={{ fontWeight: '500', color: '#1f2937', margin: '2px 0 0 0' }}>{customer?.name || '—'}</p>
          </div>
          <div>
            <span style={styles.label}>Email:</span>
            <p style={{ fontWeight: '500', color: '#374151', margin: '2px 0 0 0' }}>{customer?.email || '—'}</p>
          </div>
          <div>
            <span style={styles.label}>Contact:</span>
            <p style={{ fontWeight: '500', color: '#374151', margin: '2px 0 0 0' }}>{customer?.contactNumber || '—'}</p>
          </div>
          {(customer?.identification?.nic || customer?.identification?.passport) && (
            <div>
              <span style={styles.label}>Identification:</span>
              {customer?.identification?.nic && (
                <p style={{ color: '#374151', margin: '2px 0 0 0', fontSize: '11px' }}>NIC: {customer.identification.nic}</p>
              )}
              {customer?.identification?.passport && (
                <p style={{ color: '#374151', margin: '2px 0 0 0', fontSize: '11px' }}>Passport: {customer.identification.passport}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pricing Details */}
      <div style={{ borderTop: '2px solid #d1d5db', paddingTop: '12px' }}>
        <h4 style={styles.sectionTitle}>💰 Pricing Details</h4>
        <div style={styles.pricingBox}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={styles.label}>Villa (per night):</span>
            <span style={styles.value}>LKR {formatLKR(prices?.villaPrice)}</span>
          </div>
          
          {prices?.roomPrices && prices.roomPrices.length > 0 && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={styles.label}>Rooms (per night):</span>
                <span style={styles.value}>
                  LKR {formatLKR(prices.roomPrices.reduce((sum, r) => sum + (r.price || 0), 0))}
                </span>
              </div>
              <div style={{ marginLeft: '12px', fontSize: '10px', color: '#6b7280' }}>
                {prices.roomPrices.map((rp, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span>• {rp.roomName}</span>
                    <span>LKR {formatLKR(rp.price)}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          <div style={{ borderTop: '1px solid #d1d5db', paddingTop: '4px', display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
            <span style={styles.label}>Per night total:</span>
            <span style={styles.value}>LKR {formatLKR(perNightTotal)}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={styles.label}>Number of nights:</span>
            <span style={styles.value}>{bookingDates?.nights || 0}</span>
          </div>

          <div style={{ ...styles.totalRow, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: '600', color: '#1f2937' }}>Total Amount:</span>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#16a34a' }}>
              LKR {formatLKR(prices?.totalPrice)}
            </span>
          </div>

          {confirmation && (
            <div style={{ borderTop: '1px solid #d1d5db', paddingTop: '4px', display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
              <span style={styles.label}>Payment Reference:</span>
              <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>{confirmation}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 4px 0' }}>
          For inquiries, contact us at support@wildwaves.com | +94 XX XXX XXXX
        </p>
        <p style={{ fontSize: '10px', color: '#9ca3af', margin: 0 }}>
          This is an auto-generated document. Please preserve this for check-in.
        </p>
      </div>
    </div>
  );
};

export default BookingPDFTemplate;