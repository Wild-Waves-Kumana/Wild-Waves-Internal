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
    const convertSvgToCanvas = () => {
      if (!qrRef.current || !canvasRef.current) return;

      const svg = qrRef.current.querySelector('svg');
      if (!svg) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      canvas.width = 180;
      canvas.height = 180;

      const svgData = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, 180, 180);
        ctx.drawImage(img, 0, 0, 180, 180);
        URL.revokeObjectURL(url);
        
        if (qrRef.current) {
          qrRef.current.style.display = 'none';
        }
        canvas.style.display = 'block';
      };

      img.src = url;
    };

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
      padding: '24px',
      width: '210mm',
      minHeight: '297mm',
      fontFamily: 'Arial, sans-serif',
      color: '#000000',
      fontSize: '11px'
    },
    header: {
      textAlign: 'center',
      marginBottom: '20px',
      paddingBottom: '12px',
      borderBottom: '3px solid #2563eb'
    },
    sectionBox: {
      border: '1.5px solid #e5e7eb',
      borderRadius: '6px',
      padding: '12px',
      marginBottom: '12px',
      backgroundColor: '#fafafa'
    },
    row: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '6px',
      alignItems: 'flex-start'
    },
    label: {
      color: '#6b7280',
      fontSize: '10px',
      fontWeight: '500'
    },
    value: {
      color: '#1f2937',
      fontSize: '10px',
      fontWeight: '600',
      textAlign: 'right'
    },
    sectionTitle: {
      fontSize: '12px',
      fontWeight: '700',
      color: '#1f2937',
      marginBottom: '10px',
      paddingBottom: '6px',
      borderBottom: '1px solid #d1d5db',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    }
  };

  return (
    <div id="booking-pdf-template" style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '6px' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>Wild Waves Resort</h1>
        </div>
        <h2 style={{ fontSize: '14px', fontWeight: '600', color: '#2563eb', margin: '4px 0' }}>BOOKING CONFIRMATION</h2>
        <p style={{ fontSize: '9px', color: '#6b7280', margin: '4px 0 0 0' }}>
          Issued on: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* QR Code & Booking IDs Section */}
      <div style={{ ...styles.sectionBox, display: 'flex', gap: '16px', alignItems: 'center', padding: '16px', backgroundColor: '#eff6ff', border: '2px solid #3b82f6' }}>
        {/* QR Code */}
        <div style={{ flex: '0 0 auto' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '10px', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div ref={qrRef} style={{ height: '180px', width: '180px' }}>
              <QRCode
                value={mongoId || savedBookingId}
                size={180}
                level="H"
                style={{ height: '100%', width: '100%' }}
                fgColor="#000000"
                bgColor="#FFFFFF"
              />
            </div>
            <canvas ref={canvasRef} width={180} height={180} style={{ display: 'none' }} />
          </div>
          <p style={{ fontSize: '8px', color: '#6b7280', textAlign: 'center', marginTop: '6px', margin: '6px 0 0 0' }}>Scan at Check-in</p>
        </div>

        {/* Booking Details */}
        <div style={{ flex: '1' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '10px', borderRadius: '6px', marginBottom: '8px', border: '1px solid #bfdbfe' }}>
            <p style={{ fontSize: '9px', color: '#6b7280', margin: '0 0 4px 0', fontWeight: '500' }}>BOOKING ID</p>
            <p style={{ fontFamily: 'monospace', fontSize: '18px', fontWeight: 'bold', color: '#2563eb', margin: 0, letterSpacing: '1px' }}>
              {savedBookingId}
            </p>
          </div>

          {mongoId && (
            <div style={{ backgroundColor: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}>
              <p style={{ fontSize: '8px', color: '#9ca3af', margin: '0 0 4px 0', fontWeight: '500' }}>REFERENCE ID</p>
              <p style={{ fontFamily: 'monospace', fontSize: '8px', color: '#6b7280', margin: 0, wordBreak: 'break-all', lineHeight: '1.3' }}>
                {mongoId}
              </p>
            </div>
          )}

          <div style={{ backgroundColor: '#fef3c7', padding: '8px', borderRadius: '4px', marginTop: '8px', border: '1px solid #fbbf24' }}>
            <p style={{ fontSize: '8px', color: '#92400e', margin: 0, textAlign: 'center', fontWeight: '600' }}>
              ⚠️ PLEASE PRESENT THIS QR CODE AT CHECK-IN
            </p>
          </div>
        </div>
      </div>

      {/* Customer & Booking Information - Compact 3 Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
        {/* Customer Info */}
        <div style={styles.sectionBox}>
          <h4 style={styles.sectionTitle}>👤 Guest Information</h4>
          <div style={styles.row}>
            <span style={styles.label}>Name:</span>
            <span style={styles.value}>{customer?.name || '—'}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Email:</span>
            <span style={{ ...styles.value, fontSize: '9px' }}>{customer?.email || '—'}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Contact:</span>
            <span style={styles.value}>{customer?.contactNumber || '—'}</span>
          </div>
          {customer?.identification?.nic && (
            <div style={styles.row}>
              <span style={styles.label}>NIC:</span>
              <span style={styles.value}>{customer.identification.nic}</span>
            </div>
          )}
          {customer?.identification?.passport && (
            <div style={styles.row}>
              <span style={styles.label}>Passport:</span>
              <span style={styles.value}>{customer.identification.passport}</span>
            </div>
          )}
        </div>

        {/* Booking Dates */}
        <div style={styles.sectionBox}>
          <h4 style={styles.sectionTitle}>📅 Stay Period</h4>
          <div style={styles.row}>
            <span style={styles.label}>Check-in:</span>
            <span style={styles.value}>
              {bookingDates?.checkInDate 
                ? new Date(bookingDates.checkInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : '—'}
            </span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Check-out:</span>
            <span style={styles.value}>
              {bookingDates?.checkOutDate 
                ? new Date(bookingDates.checkOutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : '—'}
            </span>
          </div>
          <div style={{ ...styles.row, paddingTop: '6px', borderTop: '1px solid #d1d5db', marginTop: '4px' }}>
            <span style={{ ...styles.label, fontWeight: '600' }}>Total Nights:</span>
            <span style={{ ...styles.value, fontSize: '14px', color: '#2563eb' }}>{bookingDates?.nights || 0}</span>
          </div>
        </div>

        {/* Passengers */}
        <div style={styles.sectionBox}>
          <h4 style={styles.sectionTitle}>👥 Guests</h4>
          <div style={styles.row}>
            <span style={styles.label}>Adults:</span>
            <span style={styles.value}>{customer?.passengers?.adults || 0}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Children:</span>
            <span style={styles.value}>{customer?.passengers?.children || 0}</span>
          </div>
          <div style={{ ...styles.row, paddingTop: '6px', borderTop: '1px solid #d1d5db', marginTop: '4px' }}>
            <span style={{ ...styles.label, fontWeight: '600' }}>Total Guests:</span>
            <span style={{ ...styles.value, fontSize: '14px', color: '#9333ea' }}>
              {(customer?.passengers?.adults || 0) + (customer?.passengers?.children || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Property Details - 2 Column */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
        {/* Company */}
        <div style={styles.sectionBox}>
          <h4 style={styles.sectionTitle}>🏢 Property Owner</h4>
          <div style={styles.row}>
            <span style={styles.label}>Company:</span>
            <span style={styles.value}>{companyDetails?.companyName || 'N/A'}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>ID:</span>
            <span style={{ ...styles.value, fontSize: '9px' }}>{companyDetails?.companyId || '—'}</span>
          </div>
        </div>

        {/* Villa */}
        <div style={styles.sectionBox}>
          <h4 style={styles.sectionTitle}>🏠 Villa Details</h4>
          <div style={styles.row}>
            <span style={styles.label}>Villa Name:</span>
            <span style={styles.value}>{villaDetails?.villaName || 'N/A'}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Location:</span>
            <span style={{ ...styles.value, fontSize: '9px' }}>{villaDetails?.villaLocation || '—'}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Type:</span>
            <span style={styles.value}>
              {roomSelection?.acStatus === 1 ? '❄️ AC' : roomSelection?.acStatus === 0 ? '🌬️ Non-AC' : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Rooms */}
      {roomsDetails && roomsDetails.length > 0 && (
        <div style={{ ...styles.sectionBox, marginBottom: '12px' }}>
          <h4 style={styles.sectionTitle}>🛏️ Room Selection ({roomsDetails.length} Rooms)</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
            {roomsDetails.map((room, idx) => (
              <div key={room._id || idx} style={{ 
                backgroundColor: '#f0fdf4', 
                border: '1px solid #86efac', 
                borderRadius: '4px', 
                padding: '6px', 
                fontSize: '9px',
                textAlign: 'center'
              }}>
                <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '2px' }}>{room.roomName}</div>
                {room.capacity > 0 && (
                  <div style={{ fontSize: '8px', color: '#6b7280' }}>
                    Cap: {room.capacity}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pricing Summary */}
      <div style={{ ...styles.sectionBox, backgroundColor: '#f9fafb', border: '2px solid #d1d5db' }}>
        <h4 style={styles.sectionTitle}>💰 Payment Summary</h4>
        
        <div style={styles.row}>
          <span style={styles.label}>Villa (per night):</span>
          <span style={styles.value}>LKR {formatLKR(prices?.villaPrice)}</span>
        </div>

        {prices?.roomPrices && prices.roomPrices.length > 0 && (
          <>
            <div style={styles.row}>
              <span style={styles.label}>Rooms (per night):</span>
              <span style={styles.value}>
                LKR {formatLKR(prices.roomPrices.reduce((sum, r) => sum + (r.price || 0), 0))}
              </span>
            </div>
            <div style={{ marginLeft: '10px', fontSize: '8px', color: '#6b7280', marginBottom: '6px' }}>
              {prices.roomPrices.map((rp, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span>• {rp.roomName}</span>
                  <span>LKR {formatLKR(rp.price)}</span>
                </div>
              ))}
            </div>
          </>
        )}

        <div style={{ ...styles.row, borderTop: '1px dashed #9ca3af', paddingTop: '6px', marginTop: '4px' }}>
          <span style={styles.label}>Subtotal (per night):</span>
          <span style={styles.value}>LKR {formatLKR(perNightTotal)}</span>
        </div>

        <div style={styles.row}>
          <span style={styles.label}>Number of nights:</span>
          <span style={{ ...styles.value, fontSize: '11px' }}>× {bookingDates?.nights || 0}</span>
        </div>

        <div style={{ 
          ...styles.row, 
          borderTop: '2px solid #16a34a', 
          paddingTop: '8px', 
          marginTop: '6px',
          backgroundColor: '#f0fdf4',
          padding: '8px',
          borderRadius: '4px',
          margin: '6px -12px 0 -12px'
        }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#1f2937' }}>GRAND TOTAL:</span>
          <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#16a34a' }}>
            LKR {formatLKR(prices?.totalPrice)}
          </span>
        </div>

        {confirmation && (
          <div style={{ 
            ...styles.row, 
            borderTop: '1px solid #d1d5db', 
            paddingTop: '6px', 
            marginTop: '6px',
            backgroundColor: '#dbeafe',
            padding: '6px',
            borderRadius: '4px',
            margin: '6px -12px 0 -12px'
          }}>
            <span style={{ fontSize: '9px', color: '#1e40af', fontWeight: '600' }}>Payment Reference:</span>
            <span style={{ fontFamily: 'monospace', fontSize: '10px', fontWeight: '700', color: '#1e40af' }}>{confirmation}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ 
        marginTop: '16px', 
        paddingTop: '10px', 
        borderTop: '2px solid #d1d5db', 
        textAlign: 'center',
        fontSize: '9px',
        color: '#6b7280'
      }}>
        <p style={{ margin: '0 0 4px 0', fontWeight: '600' }}>
          📞 Contact: +94 XX XXX XXXX | ✉️ Email: support@wildwaves.com
        </p>
        <p style={{ margin: '4px 0 0 0', fontSize: '8px', color: '#9ca3af' }}>
          This is a computer-generated document. Please preserve this confirmation for check-in purposes.
        </p>
        <p style={{ margin: '4px 0 0 0', fontSize: '8px', color: '#9ca3af' }}>
          © 2024 Wild Waves Resort. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default BookingPDFTemplate;