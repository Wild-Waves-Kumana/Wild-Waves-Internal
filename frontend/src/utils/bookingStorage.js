export const BOOKING_STORAGE_KEYS = {
  // Booking Dates Section
  BOOKING_DATES: 'booking_dates',
  
  // Room Selection Section
  ROOM_SELECTION: 'room_selection',
  
  // Prices Section
  PRICES: 'prices',
  
  // Customer Section
  CUSTOMER: 'customer',
  
  // Saved Booking ID (after successful creation)
  SAVED_BOOKING_ID: 'saved_booking_id',
  
  // Payment Status
  PAYMENT_STATUS: 'payment_status'
};

export const bookingStorage = {
  // ==================== BOOKING DATES SECTION ====================
  saveBookingDates: (data) => {
    try {
      const datesData = {
        dates: Array.isArray(data.dates) ? data.dates.map(d => new Date(d).toISOString()) : [],
        checkInDate: data.checkInDate ? new Date(data.checkInDate).toISOString() : null,
        checkOutDate: data.checkOutDate ? new Date(data.checkOutDate).toISOString() : null,
        nights: Number(data.nights) || 0
      };
      localStorage.setItem(BOOKING_STORAGE_KEYS.BOOKING_DATES, JSON.stringify(datesData));
    } catch (e) {
      console.error('Failed to save booking dates:', e);
    }
  },

  getBookingDates: () => {
    try {
      const stored = localStorage.getItem(BOOKING_STORAGE_KEYS.BOOKING_DATES);
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      return {
        dates: Array.isArray(parsed.dates) ? parsed.dates.map(d => new Date(d)) : [],
        checkInDate: parsed.checkInDate ? new Date(parsed.checkInDate) : null,
        checkOutDate: parsed.checkOutDate ? new Date(parsed.checkOutDate) : null,
        nights: Number(parsed.nights) || 0
      };
    } catch (e) {
      console.error('Failed to get booking dates:', e);
      return null;
    }
  },

  // ==================== ROOM SELECTION SECTION ====================
  saveRoomSelection: (data) => {
    try {
      const roomData = {
        companyId: data.companyId || null,
        villaId: data.villaId || null,
        acStatus: data.acStatus === 1 || data.acStatus === 0 ? Number(data.acStatus) : null,
        rooms: Array.isArray(data.rooms) ? data.rooms.map(r => ({
          roomId: r.roomId || r._id,
          roomName: r.roomName || '',
          capacity: Number(r.capacity) || 0
        })) : []
      };
      localStorage.setItem(BOOKING_STORAGE_KEYS.ROOM_SELECTION, JSON.stringify(roomData));
    } catch (e) {
      console.error('Failed to save room selection:', e);
    }
  },

  getRoomSelection: () => {
    try {
      const stored = localStorage.getItem(BOOKING_STORAGE_KEYS.ROOM_SELECTION);
      if (!stored) return null;
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to get room selection:', e);
      return null;
    }
  },

  // ==================== PRICES SECTION ====================
  savePrices: (data) => {
    try {
      const pricesData = {
        villaPrice: Number(data.villaPrice) || 0,
        roomPrices: Array.isArray(data.roomPrices) ? data.roomPrices.map(rp => ({
          roomId: rp.roomId || rp._id,
          roomName: rp.roomName || '',
          price: Number(rp.price || rp.roomBasePrice) || 0
        })) : [],
        nights: Number(data.nights) || 0,
        totalPrice: Number(data.totalPrice) || 0
      };
      localStorage.setItem(BOOKING_STORAGE_KEYS.PRICES, JSON.stringify(pricesData));
    } catch (e) {
      console.error('Failed to save prices:', e);
    }
  },

  getPrices: () => {
    try {
      const stored = localStorage.getItem(BOOKING_STORAGE_KEYS.PRICES);
      if (!stored) return null;
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to get prices:', e);
      return null;
    }
  },

  // ==================== CUSTOMER SECTION ====================
  saveCustomer: (data) => {
    try {
      const existing = bookingStorage.getCustomer() || {};
      const identificationFromData = data.identification || (data.nic || data.passport ? { nic: data.nic || '', passport: data.passport || '' } : {});
      const passengersFromData = data.passengers || {};

      const customerData = {
        name: data.name ?? existing.name ?? '',
        email: data.email ?? existing.email ?? '',
        contactNumber: data.contactNumber ?? existing.contactNumber ?? '',
        identification: {
          nic: identificationFromData.nic ?? existing.identification?.nic ?? '',
          passport: identificationFromData.passport ?? existing.identification?.passport ?? ''
        },
        passengers: {
          adults: Number(passengersFromData.adults ?? existing.passengers?.adults ?? 0),
          children: Number(passengersFromData.children ?? existing.passengers?.children ?? 0)
        }
      };

      localStorage.setItem(BOOKING_STORAGE_KEYS.CUSTOMER, JSON.stringify(customerData));
    } catch (e) {
      console.error('Failed to save customer:', e);
    }
  },

  getCustomer: () => {
    try {
      const stored = localStorage.getItem(BOOKING_STORAGE_KEYS.CUSTOMER);
      if (!stored) return null;
      const parsed = JSON.parse(stored);

      // Backward compatibility: support old idNumber field
      if (parsed.idNumber && !parsed.identification) {
        parsed.identification = { nic: parsed.idNumber || '', passport: '' };
      }

      // Ensure passengers object exists and numbers are normalized
      parsed.passengers = {
        adults: Number(parsed.passengers?.adults ?? 0),
        children: Number(parsed.passengers?.children ?? 0)
      };

      return parsed;
    } catch (e) {
      console.error('Failed to get customer:', e);
      return null;
    }
  },

  // ==================== SAVED BOOKING ID ====================
  saveSavedBookingId: (bookingId) => {
    try {
      localStorage.setItem(BOOKING_STORAGE_KEYS.SAVED_BOOKING_ID, bookingId);
    } catch (e) {
      console.error('Failed to save booking ID:', e);
    }
  },

  getSavedBookingId: () => {
    try {
      return localStorage.getItem(BOOKING_STORAGE_KEYS.SAVED_BOOKING_ID);
    } catch (e) {
      console.error('Failed to get saved booking ID:', e);
      return null;
    }
  },

  // ==================== PAYMENT STATUS ====================
  savePaymentStatus: (status) => {
    try {
      localStorage.setItem(BOOKING_STORAGE_KEYS.PAYMENT_STATUS, status ? 'paid' : 'pending');
    } catch (e) {
      console.error('Failed to save payment status:', e);
    }
  },

  getPaymentStatus: () => {
    try {
      return localStorage.getItem(BOOKING_STORAGE_KEYS.PAYMENT_STATUS);
    } catch (e) {
      console.error('Failed to get payment status:', e);
      return null;
    }
  },

  isPaymentCompleted: () => {
    return bookingStorage.getPaymentStatus() === 'paid';
  },

  // ==================== GET ALL BOOKING DATA ====================
  getBookingData: () => {
    return {
      bookingDates: bookingStorage.getBookingDates(),
      roomSelection: bookingStorage.getRoomSelection(),
      prices: bookingStorage.getPrices(),
      customer: bookingStorage.getCustomer()
    };
  },

  // ==================== CLEAR BOOKING DATA (keep saved booking ID) ====================
  clearBookingData: () => {
    localStorage.removeItem(BOOKING_STORAGE_KEYS.BOOKING_DATES);
    localStorage.removeItem(BOOKING_STORAGE_KEYS.ROOM_SELECTION);
    localStorage.removeItem(BOOKING_STORAGE_KEYS.PRICES);
    localStorage.removeItem(BOOKING_STORAGE_KEYS.CUSTOMER);
  },

  // ==================== CLEAR ALL ====================
  clearAll: () => {
    Object.values(BOOKING_STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    console.log('✓ All booking data cleared from localStorage');
  }
};

export default bookingStorage;