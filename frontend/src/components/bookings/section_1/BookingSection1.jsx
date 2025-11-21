import React, { useState, useMemo, useEffect, useCallback } from 'react';
import axios from 'axios';
import BookingCalendar from './BookingCalender';
import BookingPrices from './BookingPrices';
import SelectionPreview from './SelectionPreview';
import VillaRoomSelection from './VillaRoomSelection';
import { bookingStorage } from '../../../utils/bookingStorage';

const BookingSection1 = ({ onNext }) => {
  const [selectedDates, setSelectedDates] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [villas, setVillas] = useState([]);
  const [selectedVilla, setSelectedVilla] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [selectedRoomIds, setSelectedRoomIds] = useState([]);
  const [acStatus, setAcStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  
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

  // Fetch companies on mount
  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoadingCompanies(true);
    try {
      const response = await axios.get('/api/company/all');
      console.log('Fetched companies:', response.data);
      setCompanies(response.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
      setCompanies([]);
    } finally {
      setLoadingCompanies(false);
    }
  };

  const handleCompanyChange = (companyId) => {
    setSelectedCompany(companyId || null);
    
    // Reset villa and room selections when company changes
    setSelectedVilla(null);
    setRooms([]);
    setSelectedRoomIds([]);
    setVillas([]);
    
    // Clear storage
    bookingStorage.saveRoomSelection({
      villaId: null,
      acStatus: acStatus,
      rooms: []
    });
  };

  const fetchRoomsForVilla = useCallback(async (villaId) => {
    setLoadingRooms(true);
    try {
      const response = await axios.get(`/api/rooms/user/${villaId}`);
      const allRooms = response.data;
      
      // Filter rooms by selected company if a company is selected
      const filteredRooms = selectedCompany 
        ? allRooms.filter(room => room.companyId === selectedCompany)
        : allRooms;
      
      setRooms(filteredRooms);
      console.log('Fetched rooms:', filteredRooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setRooms([]);
    } finally {
      setLoadingRooms(false);
    }
  }, [selectedCompany]);

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
      [type]: Math.max(0, numValue)
    }));
  };

  const handleVillaSelect = async (villa) => {
    console.log('Selected villa object:', villa);
    setSelectedVilla(villa);
    setSelectedRoomIds([]);
    
    bookingStorage.saveRoomSelection({
      villaId: villa._id,
      acStatus: acStatus,
      rooms: []
    });

    await fetchRoomsForVilla(villa._id);
  };

  const handleAcToggle = (value) => {
    setAcStatus(value);
    
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

    const updatedRooms = rooms
      .filter(r => updatedIds.includes(r._id))
      .map(r => ({
        roomId: r._id,
        roomName: r.roomName,
        capacity: r.capacity || 0
      }));

    const currentSelection = bookingStorage.getRoomSelection() || {};
    bookingStorage.saveRoomSelection({
      villaId: currentSelection.villaId || selectedVilla?._id,
      acStatus: currentSelection.acStatus,
      rooms: updatedRooms
    });
  };

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

    bookingStorage.savePrices({
      villaPrice,
      roomPrices,
      nights,
      totalPrice
    });
  }, [selectedVilla, selectedRoomIds, nights, acStatus, rooms]); // eslint-disable-line

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

  // Fetch villas when dates and company are selected
  useEffect(() => {
    if (selectedDates.length > 0 && selectedCompany) {
      fetchVillas();
    } else {
      setVillas([]);
      setSelectedVilla(null);
      setRooms([]);
    }
  }, [selectedDates, selectedCompany]); // eslint-disable-line

  const fetchVillas = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/villas/all');
      console.log('Fetched all villas:', response.data);
      
      // Filter villas by selected company
      const filteredVillas = selectedCompany
        ? response.data.filter(villa => villa.companyId === selectedCompany)
        : response.data;
      
      console.log('Filtered villas for company:', filteredVillas);
      setVillas(filteredVillas);
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

  const isSelectionComplete = useMemo(() => {
    const totalPassengers = passengers.adults + passengers.children;
    return selectedCompany !== null &&
           selectedDates.length > 0 && 
           selectedVilla !== null && 
           selectedRoomIds.length > 0 &&
           acStatus !== null &&
           totalPassengers > 0;
  }, [selectedCompany, selectedDates, selectedVilla, selectedRoomIds, acStatus, passengers]);

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
          companies={companies}
          selectedCompany={selectedCompany}
          handleCompanyChange={handleCompanyChange}
          loadingCompanies={loadingCompanies}
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
        selectedCompany={selectedCompany}
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
                  ? (!selectedCompany
                      ? 'Please select a company'
                      : acStatus === null 
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
              {!selectedCompany && <p>⚠️ Please select a company</p>}
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