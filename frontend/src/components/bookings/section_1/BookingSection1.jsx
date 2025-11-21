import React, { useState, useMemo, useEffect, useCallback } from 'react';
import axios from 'axios';
import BookingCalendar from './BookingCalender';
import BookingPrices from './BookingPrices';
import SelectionPreview from './SelectionPreview';
import VillaRoomSelection from './VillaRoomSelection';
import { bookingStorage } from '../../../utils/bookingStorage';

const BookingSection1 = ({ onNext }) => {
  const [selectedDates, setSelectedDates] = useState([]);
  const [villas, setVillas] = useState([]);
  const [selectedVilla, setSelectedVilla] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [selectedRoomIds, setSelectedRoomIds] = useState([]);
  const [acStatus, setAcStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  
  const [passengers, setPassengers] = useState({
    adults: 0,
    children: 0
  });

  const normalize = (d) => {
    const dt = new Date(d);
    dt.setHours(0, 0, 0, 0);
    return dt;
  };

  const { checkin, checkout, nights } = useMemo(() => {
    if (selectedDates.length === 0) return { checkin: null, checkout: null, nights: 0 };
    const sorted = [...selectedDates].map(normalize).sort((a, b) => a - b);
    const chkIn = sorted[0];
    const chkOut = sorted[sorted.length - 1];
    const diff = Math.round((chkOut - chkIn) / (1000 * 60 * 60 * 24));
    
    return { checkin: chkIn, checkout: chkOut, nights: diff };
  }, [selectedDates]);

  const fetchRoomsForVilla = useCallback(async (villaId) => {
    setLoadingRooms(true);
    try {
      const response = await axios.get(`/api/rooms/user/${villaId}`);
      setRooms(response.data);
      console.log('Fetched rooms:', response.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setRooms([]);
    } finally {
      setLoadingRooms(false);
    }
  }, []);

  const fetchVillaById = useCallback(async (villaId) => {
    try {
      const response = await axios.get(`/api/villas/${villaId}`);
      console.log('Fetched villa:', response.data);
      setSelectedVilla(response.data);
      
      await fetchRoomsForVilla(response.data._id);
    } catch (error) {
      console.error('Error fetching villa:', error);
    }
  }, [fetchRoomsForVilla]);

  // Load data from localStorage on mount
  useEffect(() => {
    const bookingDates = bookingStorage.getBookingDates();
    const roomSelection = bookingStorage.getRoomSelection();
    const customer = bookingStorage.getCustomer();

    if (bookingDates?.dates && bookingDates.dates.length > 0) {
      setSelectedDates(bookingDates.dates);
    }

    if (roomSelection?.villaId) {
      fetchVillaById(roomSelection.villaId);
    }

    if (roomSelection?.rooms && roomSelection.rooms.length > 0) {
      setSelectedRoomIds(roomSelection.rooms.map(r => r.roomId));
    }

    if (roomSelection?.acStatus !== null && roomSelection?.acStatus !== undefined) {
      setAcStatus(roomSelection.acStatus);
    }

    // Load passenger count
    if (customer?.passengers) {
      setPassengers({
        adults: customer.passengers.adults || 0,
        children: customer.passengers.children || 0
      });
    }
  }, [fetchVillaById]);

  // Save dates whenever they change
  useEffect(() => {
    if (selectedDates.length > 0 && checkin && checkout) {
      bookingStorage.saveBookingDates({
        checkInDate: checkin,
        checkOutDate: checkout,
        dates: selectedDates,
        nights: nights
      });
    }
  }, [selectedDates, checkin, checkout, nights]);

  // Save passenger count whenever it changes
  useEffect(() => {
    const existingCustomer = bookingStorage.getCustomer() || {};
    bookingStorage.saveCustomer({
      ...existingCustomer,
      passengers: passengers
    });
  }, [passengers]);

  const handlePassengerChange = (type, value) => {
    const numValue = parseInt(value) || 0;
    setPassengers(prev => ({
      ...prev,
      [type]: Math.max(0, numValue) // Ensure non-negative
    }));
  };

  const handleVillaSelect = async (villa) => {
    console.log('Selected villa object:', villa);
    setSelectedVilla(villa);

    // Clear previously selected rooms
    setSelectedRoomIds([]);
    
    // Save room selection with new villa
    bookingStorage.saveRoomSelection({
      villaId: villa._id,
      acStatus: acStatus,
      rooms: []
    });

    await fetchRoomsForVilla(villa._id);
  };

  const handleAcToggle = (value) => {
    setAcStatus(value);
    
    // Update room selection with AC status
    const currentSelection = bookingStorage.getRoomSelection() || {};
    bookingStorage.saveRoomSelection({
      ...currentSelection,
      acStatus: value
    });
  };

  const getSelectedRooms = () => {
    return rooms.filter(room => selectedRoomIds.includes(room._id));
  };

  const handleRoomToggle = (room) => {
    console.log('Toggling room:', room);
    
    const isSelected = selectedRoomIds.includes(room._id);
    let updatedIds;
    
    if (isSelected) {
      updatedIds = selectedRoomIds.filter(id => id !== room._id);
    } else {
      updatedIds = [...selectedRoomIds, room._id];
    }
    
    setSelectedRoomIds(updatedIds);

    // Get updated rooms array with details
    const updatedRooms = rooms
      .filter(r => updatedIds.includes(r._id))
      .map(r => ({
        roomId: r._id,
        roomName: r.roomName,
        capacity: r.capacity || 0
      }));

    // Save room selection
    const currentSelection = bookingStorage.getRoomSelection() || {};
    bookingStorage.saveRoomSelection({
      villaId: currentSelection.villaId || selectedVilla?._id,
      acStatus: currentSelection.acStatus,
      rooms: updatedRooms
    });
  };

  // Save prices whenever relevant data changes
  useEffect(() => {
    const selectedRooms = getSelectedRooms();
    
    const villaPrice = (() => {
      if (!selectedVilla?.villaBasePrice) return 0;
      if (acStatus === 1 && selectedVilla.villaBasePrice.withAC !== undefined) {
        return Number(selectedVilla.villaBasePrice.withAC) || 0;
      }
      if (acStatus === 0 && selectedVilla.villaBasePrice.withoutAC !== undefined) {
        return Number(selectedVilla.villaBasePrice.withoutAC) || 0;
      }
      return Number(selectedVilla.villaBasePrice.withAC ?? selectedVilla.villaBasePrice.withoutAC ?? 0) || 0;
    })();

    const roomPrices = selectedRooms.map(r => ({
      roomId: r._id,
      roomName: r.roomName,
      price: Number(r.roomBasePrice) || 0
    }));

    const roomsTotal = roomPrices.reduce((sum, rp) => sum + rp.price, 0);
    const perNightTotal = villaPrice + roomsTotal;
    const totalPrice = perNightTotal * Math.max(0, Number(nights) || 0);

    // Save prices
    bookingStorage.savePrices({
      villaPrice,
      roomPrices,
      nights,
      totalPrice
    });
  }, [selectedVilla, selectedRoomIds, nights, acStatus, rooms]); // eslint-disable-line

  // build continuous range between two dates (inclusive)
  const buildRange = (a, b) => {
    const start = new Date(Math.min(a, b));
    const end = new Date(Math.max(a, b));
    const days = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    return days;
  };

  const toggleDateSelection = (date) => {
    const d = normalize(date);

    if (selectedDates.length === 0) {
      const newSel = [d];
      setSelectedDates(newSel);
      return;
    }

    if (selectedDates.length === 1 && normalize(selectedDates[0]).getTime() === d.getTime()) {
      setSelectedDates([]);
      return;
    }

    const anchor = normalize(selectedDates[0]);
    const range = buildRange(anchor, d);
    setSelectedDates(range);
  };

 

  useEffect(() => {
    if (selectedDates.length > 0) {
      fetchVillas();
    } else {
      setVillas([]);
      setSelectedVilla(null);
      setRooms([]);
    }
  }, [selectedDates]);

  const fetchVillas = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/villas/all');
      console.log('Fetched villas:', response.data);
      setVillas(response.data);
    } catch (error) {
      console.error('Error fetching villas:', error);
      setVillas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToVillas = () => {
    setSelectedVilla(null);
    setRooms([]);
    setSelectedRoomIds([]);
    
    // Clear villa from room selection
    const currentSelection = bookingStorage.getRoomSelection() || {};
    bookingStorage.saveRoomSelection({
      ...currentSelection,
      villaId: null,
      rooms: []
    });
  };

  const isRoomSelected = (roomId) => {
    return selectedRoomIds.includes(roomId);
  };

  const handleNext = () => {
    if (isSelectionComplete && onNext) {
      const bookingData = bookingStorage.getBookingData();
      console.log('Final booking data:', bookingData);
      
      onNext();
    }
  };

  // Check if all required selections are made - UPDATED to include AC status and passenger count
  const isSelectionComplete = useMemo(() => {
    const totalPassengers = passengers.adults + passengers.children;
    return selectedDates.length > 0 && 
           selectedVilla !== null && 
           selectedRoomIds.length > 0 &&
           acStatus !== null && // AC selection is mandatory
           totalPassengers > 0; // At least one passenger required
  }, [selectedDates, selectedVilla, selectedRoomIds, acStatus, passengers]);

  const totalPassengers = passengers.adults + passengers.children;

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Selection Preview */}
        <SelectionPreview
          checkin={checkin}
          checkout={checkout}
          nights={nights}
          passengers={passengers}
          handlePassengerChange={handlePassengerChange}
          selectedVilla={selectedVilla}
          acStatus={acStatus}
          handleAcToggle={handleAcToggle}
          handleBackToVillas={handleBackToVillas}
          selectedRoomIds={selectedRoomIds}
          getSelectedRooms={getSelectedRooms}
          handleRoomToggle={handleRoomToggle}
        />

        {/* Right Column - Calendar and Prices */}
        <div>
          <BookingCalendar
            selectedDates={selectedDates}
            onDateToggle={toggleDateSelection}
          />

          <div>
            <BookingPrices
              selectedVilla={selectedVilla}
              selectedRooms={getSelectedRooms()}
              nights={nights}
              acStatus={acStatus}
            />
          </div>
        </div>
      </div>

      {/* Villa and Room Selection Section */}
      <VillaRoomSelection
        selectedDates={selectedDates}
        selectedVilla={selectedVilla}
        loading={loading}
        villas={villas}
        acStatus={acStatus}
        handleVillaSelect={handleVillaSelect}
        loadingRooms={loadingRooms}
        rooms={rooms}
        isRoomSelected={isRoomSelected}
        handleRoomToggle={handleRoomToggle}
        handleBackToVillas={handleBackToVillas}
      />

      {/* Next Button Section */}
      {selectedDates.length > 0 && selectedVilla && selectedRoomIds.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-end">
            <button
              onClick={handleNext}
              disabled={!isSelectionComplete}
              className={`px-8 py-3 rounded-md transition-colors font-medium text-lg flex items-center gap-2 ${
                isSelectionComplete 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-gray-400 text-white cursor-not-allowed'
              }`}
              title={
                !isSelectionComplete 
                  ? (acStatus === null 
                      ? 'Please select AC preference' 
                      : totalPassengers === 0 
                        ? 'Please enter passenger count' 
                        : '') 
                  : ''
              }
            >
              Next: Customer Details
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
          {!isSelectionComplete && (
            <div className="text-sm text-red-600 text-right mt-2">
              {acStatus === null && <p>⚠️ Please select AC or Non-AC preference</p>}
              {totalPassengers === 0 && <p>⚠️ Please enter the number of passengers</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingSection1;