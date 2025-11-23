import jsPDF from 'jspdf';
import 'jspdf-autotable';

const formatLKR = (val) => {
  if (val === null || val === undefined) return '0';
  return Number(val).toLocaleString('en-US');
};

export const generateBookingPDF = async (
  bookingData,
  savedBookingId,
  mongoId,
  companyDetails,
  villaDetails,
  roomsDetails,
  prices,
  confirmation,
  qrCodeDataUrl
) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let yPos = margin;

  const { bookingDates, roomSelection, customer } = bookingData;
  const perNightTotal = (prices?.villaPrice || 0) + 
    (prices?.roomPrices?.reduce((sum, rp) => sum + (rp.price || 0), 0) || 0);

  // Helper function to draw rounded rectangle
  const drawRoundedBox = (x, y, width, height, fillColor = [250, 250, 250], strokeColor = [229, 231, 235], lineWidth = 0.4) => {
    doc.setFillColor(...fillColor);
    doc.setDrawColor(...strokeColor);
    doc.setLineWidth(lineWidth);
    doc.roundedRect(x, y, width, height, 1.5, 1.5, 'FD');
  };

  // Helper function for section title with professional styling
  const addSectionTitle = (text, x, y, width, icon = '') => {
    // Optional icon badge
    if (icon) {
      doc.setFillColor(37, 99, 235);
      doc.circle(x + 1.5, y - 1.5, 1.5, 'F');
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(icon, x + 1.5, y - 0.8, { align: 'center' });
    }
    
    const textX = icon ? x + 5 : x;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text(text.toUpperCase(), textX, y);
    
    // Underline with gradient effect (thicker to thinner)
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(0.4);
    doc.line(textX, y + 1.8, textX + 30, y + 1.8);
    doc.setDrawColor(209, 213, 219);
    doc.setLineWidth(0.2);
    doc.line(textX + 30, y + 1.8, x + width - 4, y + 1.8);
  };

  // Helper function for row data with professional typography
  const addRow = (label, value, x, y, width, options = {}) => {
    const { labelSize = 8, valueSize = 8, valueBold = true, valueColor = [31, 41, 55] } = options;
    
    doc.setFontSize(labelSize);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text(label, x, y);
    
    doc.setFontSize(valueSize);
    doc.setFont('helvetica', valueBold ? 'bold' : 'normal');
    doc.setTextColor(...valueColor);
    doc.text(value, x + width - 4, y, { align: 'right' });
  };

  // Helper function for badge/label
  const addBadge = (text, x, y, bgColor = [37, 99, 235], textColor = [255, 255, 255]) => {
    const textWidth = doc.getTextWidth(text) + 4;
    doc.setFillColor(...bgColor);
    doc.roundedRect(x, y - 3, textWidth, 4.5, 0.5, 0.5, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...textColor);
    doc.text(text, x + 2, y);
  };

  // ==================== HEADER (SIMPLE STYLE) ====================
  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text('Wild Waves Resort', pageWidth / 2, yPos, { align: 'center' });
  
  // Subtitle
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235);
  doc.text('BOOKING CONFIRMATION', pageWidth / 2, yPos + 6, { align: 'center' });
  
  // Blue border line
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.75);
  doc.line(0, yPos + 9, pageWidth, yPos + 9);
  
  // Date
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  const dateText = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  doc.text(`Issued on: ${dateText}`, pageWidth / 2, yPos + 13, { align: 'center' });

  yPos = 33; // Updated position after header

  // ==================== QR CODE & BOOKING IDs SECTION ====================
  const qrSectionHeight = 55;
  drawRoundedBox(margin, yPos, pageWidth - 2 * margin, qrSectionHeight, [239, 246, 255], [59, 130, 246], 0.5);
  
  // QR Code container with shadow effect
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin + 4, yPos + 3, 50, 50, 2, 2, 'F');
  doc.setDrawColor(147, 197, 253);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin + 4, yPos + 3, 50, 50, 2, 2, 'S');

  // Add QR Code image
  if (qrCodeDataUrl) {
    try {
      doc.addImage(qrCodeDataUrl, 'PNG', margin + 9, yPos + 6, 40, 40);
    } catch (error) {
      console.error('Error adding QR code:', error);
    }
  }

  // "Scan at Check-in" label
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(107, 114, 128);
  doc.text('Scan this code at check-in', margin + 29, yPos + 51, { align: 'center' });

  // Booking IDs Section (Right side)
  const idX = margin + 59;
  const idWidth = pageWidth - margin - idX - 5;

  // Booking ID Box
  drawRoundedBox(idX, yPos + 5, idWidth, 16, [255, 255, 255], [191, 219, 254], 0.4);
  
  
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text('Booking Reference Number', idX + 3, yPos + 10);
  
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235);
  doc.text(savedBookingId, idX + 3, yPos + 16.5);

  // Reference ID Box (if mongoId exists)
  if (mongoId) {
    drawRoundedBox(idX, yPos + 23, idWidth, 11, [249, 250, 251], [209, 213, 219], 0.3);
    
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(107, 114, 128);
    doc.text('SYSTEM REFERENCE ID', idX + 3, yPos + 27);
    
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 85, 99);
    const lines = doc.splitTextToSize(mongoId, idWidth - 6);
    doc.text(lines, idX + 3, yPos + 30.5);
  }

  // Warning Banner
  const warningY = mongoId ? yPos + 36 : yPos + 23;
  drawRoundedBox(idX, warningY, idWidth, 9, [254, 243, 199], [251, 191, 36], 0.4);
  
  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(146, 64, 14);
  doc.text('IMPORTANT', idX + 3, warningY + 3.5);
  
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Please present this QR code or booking ID at check-in', idX + 3, warningY + 7);

  yPos += qrSectionHeight + 6;

  // ==================== 3 COLUMN SECTION: GUEST, STAY, PASSENGERS ====================
  const colWidth = (pageWidth - 2 * margin - 8) / 3;
  const col1X = margin;
  const col2X = margin + colWidth + 4;
  const col3X = col2X + colWidth + 4;
  const rowHeight = 30;

  // Guest Information
  drawRoundedBox(col1X, yPos, colWidth, rowHeight);
  addSectionTitle('Guest Information', col1X + 2, yPos + 5, colWidth, '1');
  
  let guestY = yPos + 11;
  addRow('Full Name', customer?.name || '—', col1X + 2, guestY, colWidth);
  guestY += 4.5;
  
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text('Email Address', col1X + 2, guestY);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  const emailLines = doc.splitTextToSize(customer?.email || '—', colWidth * 0.6);
  doc.text(emailLines, col1X + colWidth - 2, guestY, { align: 'right' });
  guestY += 4.5;
  
  addRow('Phone Number', customer?.contactNumber || '—', col1X + 2, guestY, colWidth);
  
  if (customer?.identification?.nic || customer?.identification?.passport) {
    guestY += 4.5;
    const idType = customer?.identification?.nic ? 'NIC' : 'Passport';
    const idValue = customer?.identification?.nic || customer?.identification?.passport;
    addRow(`${idType} Number`, idValue, col1X + 2, guestY, colWidth, { labelSize: 7, valueSize: 7 });
  }

  // Stay Period
  drawRoundedBox(col2X, yPos, colWidth, rowHeight);
  addSectionTitle('Stay Period', col2X + 2, yPos + 5, colWidth, '2');
  
  let stayY = yPos + 11;
  addRow('Check-In Date', 
    bookingDates?.checkInDate 
      ? new Date(bookingDates.checkInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : '—',
    col2X + 2, stayY, colWidth);
  stayY += 4.5;
  
  addRow('Check-Out Date', 
    bookingDates?.checkOutDate 
      ? new Date(bookingDates.checkOutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : '—',
    col2X + 2, stayY, colWidth);
  stayY += 6;
  
  // Highlight box for nights
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(col2X + 2, stayY - 3, colWidth - 4, 7.5, 1, 1, 'F');
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235);
  doc.text('Duration', col2X + 4, stayY + 1);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235);
  doc.text(`${bookingDates?.nights || 0} Night${(bookingDates?.nights || 0) !== 1 ? 's' : ''}`, 
    col2X + colWidth - 4, stayY + 1, { align: 'right' });

  // Guest Count
  drawRoundedBox(col3X, yPos, colWidth, rowHeight);
  addSectionTitle('Guest Details', col3X + 2, yPos + 5, colWidth, '3');
  
  let guestsY = yPos + 11;
  addRow('Adult Guests', String(customer?.passengers?.adults || 0), col3X + 2, guestsY, colWidth);
  guestsY += 4.5;
  addRow('Children', String(customer?.passengers?.children || 0), col3X + 2, guestsY, colWidth);
  guestsY += 6;
  
  // Highlight box for total
  doc.setFillColor(243, 232, 255);
  doc.roundedRect(col3X + 2, guestsY - 3, colWidth - 4, 7.5, 1, 1, 'F');
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(147, 51, 234);
  doc.text('Total Guests', col3X + 4, guestsY + 1);
  
  doc.setFontSize(12);
  doc.text(String((customer?.passengers?.adults || 0) + (customer?.passengers?.children || 0)), 
    col3X + colWidth - 4, guestsY + 1, { align: 'right' });

  yPos += rowHeight + 6;

  // ==================== 2 COLUMN SECTION: PROPERTY & ACCOMMODATION ====================
  const col2Width = (pageWidth - 2 * margin - 4) / 2;
  const villa1X = margin;
  const villa2X = margin + col2Width + 4;
  const villaHeight = 25;

  // Property Information
  drawRoundedBox(villa1X, yPos, col2Width, villaHeight, [252, 252, 253], [228, 228, 231], 0.4);
  addSectionTitle('Property Information', villa1X + 2, yPos + 5, col2Width);
  
  let ownerY = yPos + 11;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text('Property Owner', villa1X + 2, ownerY);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text(companyDetails?.companyName || 'N/A', villa1X + 2, ownerY + 4);
  
  ownerY += 8;
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text('Registration ID', villa1X + 2, ownerY);
  
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(75, 85, 99);
  const companyIdText = companyDetails?.companyId || '—';
  doc.text(companyIdText, villa1X + 2, ownerY + 3.5);

  // Accommodation Details
  drawRoundedBox(villa2X, yPos, col2Width, villaHeight, [252, 252, 253], [228, 228, 231], 0.4);
  addSectionTitle('Accommodation Details', villa2X + 2, yPos + 5, col2Width);
  
  let villaY = yPos + 11;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text('Villa Name', villa2X + 2, villaY);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text(villaDetails?.villaName || 'N/A', villa2X + 2, villaY + 4);
  
  villaY += 6.5;
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text('Location', villa2X + 2, villaY);
  
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  const locationLines = doc.splitTextToSize(villaDetails?.villaLocation || '—', col2Width * 0.95);
  doc.text(locationLines, villa2X + 2, villaY + 3.5);
  
  // AC Status Badge
  const acType = roomSelection?.acStatus === 1 ? 'Air Conditioned' : roomSelection?.acStatus === 0 ? 'Non-AC' : 'Standard';
  const badgeColor = roomSelection?.acStatus === 1 ? [59, 130, 246] : [107, 114, 128];
  addBadge(acType, villa2X + col2Width - doc.getTextWidth(acType) - 6, yPos + villaHeight - 3, badgeColor);

  yPos += villaHeight + 6;

  // ==================== ROOM SELECTION ====================
  if (roomsDetails && roomsDetails.length > 0) {
    const roomHeight = 22;
    drawRoundedBox(margin, yPos, pageWidth - 2 * margin, roomHeight, [248, 250, 252], [226, 232, 240], 0.4);
    addSectionTitle(`Selected Rooms`, margin + 2, yPos + 5, pageWidth - 2 * margin);
    
    // Room count badge
    addBadge(`${roomsDetails.length} ${roomsDetails.length === 1 ? 'Room' : 'Rooms'}`, 
      pageWidth - margin - 25, yPos + 4.5, [34, 197, 94]);
    
    const maxRoomsToShow = 4;
    const roomBoxWidth = (pageWidth - 2 * margin - 19) / maxRoomsToShow;
    const roomsToShow = roomsDetails.slice(0, maxRoomsToShow);
    
    roomsToShow.forEach((room, idx) => {
      const roomX = margin + 2 + idx * (roomBoxWidth + 5);
      
      // Room box with gradient effect
      doc.setFillColor(240, 253, 244);
      doc.roundedRect(roomX, yPos + 10, roomBoxWidth, 9.5, 1.5, 1.5, 'F');
      doc.setDrawColor(134, 239, 172);
      doc.setLineWidth(0.3);
      doc.roundedRect(roomX, yPos + 10, roomBoxWidth, 9.5, 1.5, 1.5, 'S');
      
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(22, 101, 52);
      doc.text(room.roomName, roomX + roomBoxWidth / 2, yPos + 14, { align: 'center' });
      
      if (room.capacity > 0) {
        doc.setFontSize(6);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(107, 114, 128);
        doc.text(`Capacity: ${room.capacity} pax`, roomX + roomBoxWidth / 2, yPos + 17.5, { align: 'center' });
      }
    });
    
    yPos += roomHeight + 6;
  }

  // ==================== PAYMENT SUMMARY ====================
  const summaryBaseHeight = 52;
  const roomPricesHeight = (prices?.roomPrices?.length || 0) * 3.5;
  const confirmationHeight = confirmation ? 9 : 0;
  const summaryHeight = summaryBaseHeight + roomPricesHeight + confirmationHeight;
  
  // Payment summary box with border
  doc.setFillColor(249, 250, 251);
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.6);
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, summaryHeight, 2, 2, 'FD');
  
  // Header with background
  doc.setFillColor(37, 99, 235);
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 7.5, 2, 2, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('PAYMENT SUMMARY', margin + 3, yPos + 5);
  
  let payY = yPos + 13;
  
  // Villa price
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  doc.text('Villa Rental (per night)', margin + 3, payY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text(`LKR ${formatLKR(prices?.villaPrice)}`, pageWidth - margin - 3, payY, { align: 'right' });
  
  if (prices?.roomPrices && prices.roomPrices.length > 0) {
    payY += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 85, 99);
    doc.text('Room Charges (per night)', margin + 3, payY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text(`LKR ${formatLKR(prices.roomPrices.reduce((sum, r) => sum + (r.price || 0), 0))}`, 
      pageWidth - margin - 3, payY, { align: 'right' });
    
    prices.roomPrices.forEach((rp) => {
      payY += 3.5;
      doc.setFontSize(7);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(107, 114, 128);
      doc.text(`${rp.roomName}`, margin + 8, payY);
      doc.setFont('helvetica', 'normal');
      doc.text(`LKR ${formatLKR(rp.price)}`, pageWidth - margin - 3, payY, { align: 'right' });
    });
    doc.setFontSize(8);
  }

  payY += 6;
  // Subtotal divider
  doc.setDrawColor(209, 213, 219);
  doc.setLineWidth(0.3);
  doc.line(margin + 3, payY - 2, pageWidth - margin - 3, payY - 2);
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(75, 85, 99);
  doc.text('Subtotal (per night)', margin + 3, payY + 2);
  doc.text(`LKR ${formatLKR(perNightTotal)}`, pageWidth - margin - 3, payY + 2, { align: 'right' });
  
  payY += 7;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  doc.text('Number of Nights', margin + 3, payY);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`× ${bookingDates?.nights || 0}`, pageWidth - margin - 3, payY, { align: 'right' });
  doc.setFontSize(8);

  payY += 7;
  // Grand total section
  doc.setFillColor(0, 153, 77);
  doc.roundedRect(margin + 2, payY - 4, pageWidth - 2 * margin - 4, 11, 1.5, 1.5, 'F');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('GRAND TOTAL', margin + 5, payY + 2.5);
  
  doc.setFontSize(15);
  doc.text(`LKR ${formatLKR(prices?.totalPrice)}`, pageWidth - margin - 5, payY + 2.5, { align: 'right' });

  if (confirmation) {
    payY += 13;
    doc.setFillColor(219, 234, 254);
    doc.roundedRect(margin + 2, payY - 4, pageWidth - 2 * margin - 4, 6.5, 1, 1, 'F');
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 64, 175);
    doc.text('PAYMENT REFERENCE:', margin + 5, payY - 0.5);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(confirmation, pageWidth - margin - 5, payY - 0.5, { align: 'right' });
  }

  yPos += summaryHeight + 10;

  // ==================== FOOTER ====================
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.8);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  
  yPos += 4;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235);
  doc.text('Wild Waves Resort', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 3.5;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  doc.text('Phone: +94 XX XXX XXXX  |  Email: reservations@wildwaves.com', 
    pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 4;
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(107, 114, 128);
  doc.text('This is a computer-generated document and does not require a signature.', 
    pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 3;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(156, 163, 175);
  doc.text('Please preserve this confirmation for check-in. Terms and conditions apply.', 
    pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 3.5;
  doc.setFontSize(6);
  doc.text('© 2024 Wild Waves Resort. All Rights Reserved.', 
    pageWidth / 2, yPos, { align: 'center' });

  // Save PDF
  doc.save(`WildWaves-Booking-${savedBookingId}.pdf`);
  return true;
};