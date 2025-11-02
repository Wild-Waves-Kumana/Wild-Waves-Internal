// Local Storage Keys
export const BOOKING_STORAGE_KEYS = {
  SELECTED_DATES: 'booking_selected_dates',
  CHECKIN_DATE: 'booking_checkin_date',
  CHECKOUT_DATE: 'booking_checkout_date',
  SELECTED_VILLA_ID: 'booking_selected_villa_id',
  SELECTED_ROOM_IDS: 'booking_selected_room_ids',
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

  // Get all booking data for submission
  getBookingData: () => {
    const dates = bookingStorage.getDates();
    const checkin = bookingStorage.getCheckin();
    const checkout = bookingStorage.getCheckout();
    const villaId = bookingStorage.getVillaId();
    const roomIds = bookingStorage.getRoomIds();

    return {
      selectedDates: dates,
      checkinDate: checkin,
      checkoutDate: checkout,
      villa: villaId,
      selectedRooms: roomIds,
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
};

export default bookingStorage;