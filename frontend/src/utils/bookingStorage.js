export const BOOKING_STORAGE_KEYS = {
  // Booking Dates Section
  BOOKING_DATES: 'booking_dates',
  
  // Room Selection Section
  ROOM_SELECTION: 'room_selection',
  
  // Prices Section
  PRICES: 'prices',
  
  // Customer Section
  CUSTOMER: 'customer'
};

export const bookingStorage = {
  // ==================== BOOKING DATES SECTION ====================
  saveBookingDates: (data) => {
    // data should have: checkInDate, checkOutDate, dates (array), nights
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
    // data should have: villaId (ObjectId), acStatus (boolean 1/0), rooms (array of {roomId, roomName, capacity})
    try {
      const roomData = {
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
    // data should have: villaPrice, roomPrices (array), nights, totalPrice
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
      const customerData = {
        name: data.name || '',
        email: data.email || '',
        contactNumber: data.contactNumber || '',
        identification: {
          nic: data.identification?.nic || data.nic || '',
          passport: data.identification?.passport || data.passport || ''
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
      
      // Handle backward compatibility with old idNumber field
      if (parsed.idNumber && !parsed.identification) {
        return {
          ...parsed,
          identification: {
            nic: parsed.idNumber || '',
            passport: ''
          }
        };
      }
      
      return parsed;
    } catch (e) {
      console.error('Failed to get customer:', e);
      return null;
    }
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

  // ==================== CLEAR ALL ====================
  clearAll: () => {
    Object.values(BOOKING_STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
};

export default bookingStorage;