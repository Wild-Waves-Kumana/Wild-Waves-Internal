// Local Storage Keys
export const BOOKING_STORAGE_KEYS = {
  SELECTED_DATES: 'booking_selected_dates',
  CHECKIN_DATE: 'booking_checkin_date',
  CHECKOUT_DATE: 'booking_checkout_date',
  SELECTED_VILLA_ID: 'booking_selected_villa_id',
  SELECTED_ROOM_IDS: 'booking_selected_room_ids',
  SELECTED_AC_STATUS: 'booking_ac_status',
  // customer keys
  CUSTOMER_NAME: 'booking_customer_name',
  CUSTOMER_EMAIL: 'booking_customer_email',
  CUSTOMER_CONTACT: 'booking_customer_contact',
  CUSTOMER_ID_NUMBER: 'booking_customer_id_number',
  // price keys (new)
  PRICE_VILLA_PER_NIGHT: 'booking_price_villa_per_night',
  PRICE_ROOMS_PER_NIGHT: 'booking_price_rooms_per_night',
  PRICE_PER_NIGHT_TOTAL: 'booking_price_per_night_total',
  PRICE_NIGHTS: 'booking_price_nights',
  PRICE_TOTAL: 'booking_price_total',
  PRICE_ROOMS_DETAILS: 'booking_price_rooms_details' // JSON array of room price details
};

// Utility functions for booking storage
export const bookingStorage = {
  // Save selected dates
  saveDates: (dates) => {
    const serializedDates = dates.map(date => date.toISOString());
    localStorage.setItem(BOOKING_STORAGE_KEYS.SELECTED_DATES, JSON.stringify(serializedDates));
  },

  // Get selected dates
  getDates: () => {
    const stored = localStorage.getItem(BOOKING_STORAGE_KEYS.SELECTED_DATES);
    if (!stored) return [];
    try {
      const parsed = JSON.parse(stored);
      return parsed.map(dateStr => new Date(dateStr));
    } catch (error) {
      console.error('Error parsing dates from localStorage:', error);
      return [];
    }
  },

  // Save check-in date
  saveCheckin: (date) => {
    if (date) {
      localStorage.setItem(BOOKING_STORAGE_KEYS.CHECKIN_DATE, date.toISOString());
    }
  },

  // Get check-in date
  getCheckin: () => {
    const stored = localStorage.getItem(BOOKING_STORAGE_KEYS.CHECKIN_DATE);
    return stored ? new Date(stored) : null;
  },

  // Save check-out date
  saveCheckout: (date) => {
    if (date) {
      localStorage.setItem(BOOKING_STORAGE_KEYS.CHECKOUT_DATE, date.toISOString());
    }
  },

  // Get check-out date
  getCheckout: () => {
    const stored = localStorage.getItem(BOOKING_STORAGE_KEYS.CHECKOUT_DATE);
    return stored ? new Date(stored) : null;
  },

  // Save selected villa ID
  saveVillaId: (villaId) => {
    if (villaId) {
      localStorage.setItem(BOOKING_STORAGE_KEYS.SELECTED_VILLA_ID, villaId);
    } else {
      localStorage.removeItem(BOOKING_STORAGE_KEYS.SELECTED_VILLA_ID);
    }
  },

  // Get selected villa ID
  getVillaId: () => {
    return localStorage.getItem(BOOKING_STORAGE_KEYS.SELECTED_VILLA_ID) || null;
  },

  // Save selected room IDs (array)
  saveRoomIds: (roomIds) => {
    localStorage.setItem(BOOKING_STORAGE_KEYS.SELECTED_ROOM_IDS, JSON.stringify(roomIds));
  },

  // Get selected room IDs
  getRoomIds: () => {
    const stored = localStorage.getItem(BOOKING_STORAGE_KEYS.SELECTED_ROOM_IDS);
    try {
      return stored ? JSON.parse(stored) : []; // ✅ Returns array
    } catch (error) {
      console.error('Error parsing room IDs from localStorage:', error);
      return [];
    }
  },

  // Add a room ID to selected rooms
  addRoomId: (roomId) => {
    const currentRoomIds = bookingStorage.getRoomIds();
    if (!currentRoomIds.includes(roomId)) {
      const updatedRoomIds = [...currentRoomIds, roomId];
      bookingStorage.saveRoomIds(updatedRoomIds);
      return updatedRoomIds;
    }
    return currentRoomIds;
  },

  // Remove a room ID from selected rooms
  removeRoomId: (roomId) => {
    const currentRoomIds = bookingStorage.getRoomIds();
    const updatedRoomIds = currentRoomIds.filter(id => id !== roomId);
    bookingStorage.saveRoomIds(updatedRoomIds);
    return updatedRoomIds;
  },

  // Toggle room ID selection
  toggleRoomId: (roomId) => {
    const currentRoomIds = bookingStorage.getRoomIds();
    if (currentRoomIds.includes(roomId)) {
      return bookingStorage.removeRoomId(roomId);
    } else {
      return bookingStorage.addRoomId(roomId);
    }
  },

  // Save AC status (1 = AC, 0 = Non-AC)
  saveAcStatus: (status) => {
    if (status === 1 || status === 0) {
      localStorage.setItem(BOOKING_STORAGE_KEYS.SELECTED_AC_STATUS, String(status));
    } else {
      localStorage.removeItem(BOOKING_STORAGE_KEYS.SELECTED_AC_STATUS);
    }
  },

  // Get AC status, returns 1, 0 or null
  getAcStatus: () => {
    const stored = localStorage.getItem(BOOKING_STORAGE_KEYS.SELECTED_AC_STATUS);
    if (stored === null) return null;
    return stored === '1' ? 1 : 0;
  },

  // Customer individual fields
  saveCustomerName: (name) => {
    if (name && name !== '') localStorage.setItem(BOOKING_STORAGE_KEYS.CUSTOMER_NAME, name);
    else localStorage.removeItem(BOOKING_STORAGE_KEYS.CUSTOMER_NAME);
  },
  getCustomerName: () => {
    return localStorage.getItem(BOOKING_STORAGE_KEYS.CUSTOMER_NAME) || '';
  },

  saveCustomerEmail: (email) => {
    if (email && email !== '') localStorage.setItem(BOOKING_STORAGE_KEYS.CUSTOMER_EMAIL, email);
    else localStorage.removeItem(BOOKING_STORAGE_KEYS.CUSTOMER_EMAIL);
  },
  getCustomerEmail: () => {
    return localStorage.getItem(BOOKING_STORAGE_KEYS.CUSTOMER_EMAIL) || '';
  },

  saveCustomerContact: (contact) => {
    if (contact && contact !== '') localStorage.setItem(BOOKING_STORAGE_KEYS.CUSTOMER_CONTACT, contact);
    else localStorage.removeItem(BOOKING_STORAGE_KEYS.CUSTOMER_CONTACT);
  },
  getCustomerContact: () => {
    return localStorage.getItem(BOOKING_STORAGE_KEYS.CUSTOMER_CONTACT) || '';
  },

  saveCustomerIdNumber: (idNumber) => {
    if (idNumber && idNumber !== '') localStorage.setItem(BOOKING_STORAGE_KEYS.CUSTOMER_ID_NUMBER, idNumber);
    else localStorage.removeItem(BOOKING_STORAGE_KEYS.CUSTOMER_ID_NUMBER);
  },
  getCustomerIdNumber: () => {
    return localStorage.getItem(BOOKING_STORAGE_KEYS.CUSTOMER_ID_NUMBER) || '';
  },

  // Save/get full customer object (convenience)
  saveCustomer: (customer = {}) => {
    bookingStorage.saveCustomerName(customer.name || '');
    bookingStorage.saveCustomerEmail(customer.email || '');
    bookingStorage.saveCustomerContact(customer.contactNumber || '');
    bookingStorage.saveCustomerIdNumber(customer.idNumber || '');
  },
  getCustomer: () => {
    return {
      name: bookingStorage.getCustomerName(),
      email: bookingStorage.getCustomerEmail(),
      contactNumber: bookingStorage.getCustomerContact(),
      idNumber: bookingStorage.getCustomerIdNumber(),
    };
  },

  // Get all booking data for submission
  getBookingData: () => {
    const dates = bookingStorage.getDates();
    const checkin = bookingStorage.getCheckin();
    const checkout = bookingStorage.getCheckout();
    const villaId = bookingStorage.getVillaId();
    const roomIds = bookingStorage.getRoomIds();
    const acStatus = bookingStorage.getAcStatus();
    const customer = bookingStorage.getCustomer();

    return {
      selectedDates: dates,
      checkinDate: checkin,
      checkoutDate: checkout,
      villa: villaId,
      selectedRooms: roomIds,
      acStatus,
      customer,
    };
  },

  // Clear all booking data
  clearAll: () => {
    Object.values(BOOKING_STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },

  // Check if booking data exists
  hasBookingData: () => {
    return bookingStorage.getDates().length > 0 || 
           bookingStorage.getVillaId() !== null ||
           bookingStorage.getRoomIds().length > 0;
  },

  // Prices helpers
  saveVillaPricePerNight: (val) => {
    if (val === null || val === undefined) localStorage.removeItem(BOOKING_STORAGE_KEYS.PRICE_VILLA_PER_NIGHT);
    else localStorage.setItem(BOOKING_STORAGE_KEYS.PRICE_VILLA_PER_NIGHT, String(val));
  },
  getVillaPricePerNight: () => {
    const v = localStorage.getItem(BOOKING_STORAGE_KEYS.PRICE_VILLA_PER_NIGHT);
    return v !== null ? Number(v) : 0;
  },

  saveRoomsPricePerNight: (val) => {
    if (val === null || val === undefined) localStorage.removeItem(BOOKING_STORAGE_KEYS.PRICE_ROOMS_PER_NIGHT);
    else localStorage.setItem(BOOKING_STORAGE_KEYS.PRICE_ROOMS_PER_NIGHT, String(val));
  },
  getRoomsPricePerNight: () => {
    const v = localStorage.getItem(BOOKING_STORAGE_KEYS.PRICE_ROOMS_PER_NIGHT);
    return v !== null ? Number(v) : 0;
  },

  savePerNightTotal: (val) => {
    if (val === null || val === undefined) localStorage.removeItem(BOOKING_STORAGE_KEYS.PRICE_PER_NIGHT_TOTAL);
    else localStorage.setItem(BOOKING_STORAGE_KEYS.PRICE_PER_NIGHT_TOTAL, String(val));
  },
  getPerNightTotal: () => {
    const v = localStorage.getItem(BOOKING_STORAGE_KEYS.PRICE_PER_NIGHT_TOTAL);
    return v !== null ? Number(v) : 0;
  },

  saveNightsCount: (n) => {
    if (n === null || n === undefined) localStorage.removeItem(BOOKING_STORAGE_KEYS.PRICE_NIGHTS);
    else localStorage.setItem(BOOKING_STORAGE_KEYS.PRICE_NIGHTS, String(n));
  },
  getNightsCount: () => {
    const v = localStorage.getItem(BOOKING_STORAGE_KEYS.PRICE_NIGHTS);
    return v !== null ? Number(v) : 0;
  },

  saveTotalPrice: (val) => {
    if (val === null || val === undefined) localStorage.removeItem(BOOKING_STORAGE_KEYS.PRICE_TOTAL);
    else localStorage.setItem(BOOKING_STORAGE_KEYS.PRICE_TOTAL, String(val));
  },
  getTotalPrice: () => {
    const v = localStorage.getItem(BOOKING_STORAGE_KEYS.PRICE_TOTAL);
    return v !== null ? Number(v) : 0;
  },

  saveRoomsPriceDetails: (arr) => {
    if (!arr || arr.length === 0) localStorage.removeItem(BOOKING_STORAGE_KEYS.PRICE_ROOMS_DETAILS);
    else localStorage.setItem(BOOKING_STORAGE_KEYS.PRICE_ROOMS_DETAILS, JSON.stringify(arr));
  },
  getRoomsPriceDetails: () => {
    const v = localStorage.getItem(BOOKING_STORAGE_KEYS.PRICE_ROOMS_DETAILS);
    if (!v) return [];
    try { return JSON.parse(v); } catch (e) { return []; }
  },

  // Save all prices at once (convenience)
  savePrices: (prices = {}) => {
    // expected fields: villaPricePerNight, roomsPricePerNight, perNightTotal, nights, total, roomsDetails
    bookingStorage.saveVillaPricePerNight(prices.villaPricePerNight ?? null);
    bookingStorage.saveRoomsPricePerNight(prices.roomsPricePerNight ?? null);
    bookingStorage.savePerNightTotal(prices.perNightTotal ?? null);
    bookingStorage.saveNightsCount(prices.nights ?? null);
    bookingStorage.saveTotalPrice(prices.total ?? null);
    bookingStorage.saveRoomsPriceDetails(prices.roomsDetails ?? []);
  },

  // Get all saved prices as object
  getPrices: () => {
    return {
      villaPricePerNight: bookingStorage.getVillaPricePerNight(),
      roomsPricePerNight: bookingStorage.getRoomsPricePerNight(),
      perNightTotal: bookingStorage.getPerNightTotal(),
      nights: bookingStorage.getNightsCount(),
      total: bookingStorage.getTotalPrice(),
      roomsDetails: bookingStorage.getRoomsPriceDetails()
    };
  },
};

export default bookingStorage;