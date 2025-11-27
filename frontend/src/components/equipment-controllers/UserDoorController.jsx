import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Lock, Unlock, Power, ChevronLeft, ChevronRight } from 'lucide-react';

const UserDoorController = ({ selectedRoom, onDoorUpdate }) => {
  const [doors, setDoors] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [slideDirection, setSlideDirection] = useState('');

  // Refs for managing state in async callbacks
  const doorsRef = useRef([]);
  const autoUnlockTimerRef = useRef(null);

  // Keep ref synced with state for timer callbacks
  useEffect(() => {
    doorsRef.current = doors;
  }, [doors]);

  // Inject CSS keyframes for door animation (only once)
  useEffect(() => {
    if (!document.getElementById('door-scale-keyframes')) {
      const style = document.createElement('style');
      style.id = 'door-scale-keyframes';
      style.innerHTML = `
        @keyframes doorScalePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Fetch doors for selected room
  useEffect(() => {
    const fetchRoomDoors = async () => {
      if (!selectedRoom) {
        setDoors([]);
        setCurrentIdx(0);
        return;
      }

      try {
        const { data } = await axios.get('/api/equipment/doors');
        const roomDoors = data.filter(door =>
          selectedRoom.doors?.includes(door._id) && door.access === true
        );
        setDoors(roomDoors);
        setCurrentIdx(0);
      } catch (err) {
        console.error('Failed to fetch room doors:', err);
        setDoors([]);
        setCurrentIdx(0);
      }
    };

    fetchRoomDoors();
  }, [selectedRoom]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoUnlockTimerRef.current) {
        clearTimeout(autoUnlockTimerRef.current);
      }
    };
  }, []);

  // Auto-unlock handler
  const scheduleAutoUnlock = useCallback((doorId) => {
    // Clear any existing timer
    if (autoUnlockTimerRef.current) {
      clearTimeout(autoUnlockTimerRef.current);
    }

    // Schedule auto-unlock after 10 seconds
    autoUnlockTimerRef.current = setTimeout(async () => {
      try {
        const latestDoor = doorsRef.current.find(d => d._id === doorId);
        
        if (latestDoor?.lockStatus === true) {
          await axios.put(`/api/equipment/doors/${doorId}`, { lockStatus: false });
          
          setDoors(prev => prev.map(d => 
            d._id === doorId ? { ...d, lockStatus: false } : d
          ));

          if (onDoorUpdate) onDoorUpdate();
        }
      } catch (err) {
        console.error('Auto-unlock failed:', err);
      } finally {
        autoUnlockTimerRef.current = null;
      }
    }, 10000);
  }, [onDoorUpdate]);

  // Handle field changes (status, lockStatus)
  const handleFieldChange = useCallback(async (door, idx, field, value) => {
    // Optimistic update
    setDoors(prev => prev.map((item, i) => 
      i === idx ? { ...item, [field]: value } : item
    ));

    try {
      await axios.put(`/api/equipment/doors/${door._id}`, { [field]: value });

      // Handle lock status logic
      if (field === 'lockStatus') {
        if (value === false && autoUnlockTimerRef.current) {
          // Manual unlock - clear auto-unlock timer
          clearTimeout(autoUnlockTimerRef.current);
          autoUnlockTimerRef.current = null;
        } else if (value === true) {
          // Lock activated - schedule auto-unlock
          scheduleAutoUnlock(door._id);
        }
      }

      if (onDoorUpdate) onDoorUpdate();
    } catch (err) {
      console.error(`Failed to update ${field}:`, err);
      alert(`Failed to update door ${field}.`);
      
      // Revert optimistic update on error
      setDoors(prev => prev.map((item, i) => 
        i === idx ? door : item
      ));
    }
  }, [onDoorUpdate, scheduleAutoUnlock]);

  // Navigation handlers
  const handlePrev = useCallback(() => {
    if (currentIdx > 0) {
      setSlideDirection('slide-right');
      setCurrentIdx(currentIdx - 1);
    }
  }, [currentIdx]);

  const handleNext = useCallback(() => {
    if (currentIdx < doors.length - 1) {
      setSlideDirection('slide-left');
      setCurrentIdx(currentIdx + 1);
    }
  }, [currentIdx, doors.length]);

  const goToDoor = useCallback((index) => {
    if (index !== currentIdx && index >= 0 && index < doors.length) {
      setSlideDirection(index > currentIdx ? 'slide-left' : 'slide-right');
      setCurrentIdx(index);
    }
  }, [currentIdx, doors.length]);

  // Reset slide animation after transition
  useEffect(() => {
    if (slideDirection) {
      const timer = setTimeout(() => setSlideDirection(''), 300);
      return () => clearTimeout(timer);
    }
  }, [slideDirection]);

  // Keyboard navigation
  useEffect(() => {
    if (doors.length <= 1) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [doors.length, handlePrev, handleNext]);

  // Early return if no doors
  if (doors.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-2xl p-8 bg-gradient-to-br from-fuchsia-100 to-red-100">
        <h3 className="text-xl font-bold mb-6 text-gray-600">Your Doors</h3>
        <div className="text-gray-400">No doors assigned to this room.</div>
      </div>
    );
  }

  const currentDoor = doors[currentIdx];
  const isDisabled = currentDoor.access !== true || currentDoor.status !== true;
  const hasMultipleDoors = doors.length > 1;

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 bg-gradient-to-br from-fuchsia-100 to-red-100">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="relative">
          <div className="grid grid-cols-3 items-center mb-8">
            {/* Door Info - Left */}
            <div className={`flex flex-col transition-all duration-300 ${
              slideDirection === 'slide-left' ? 'transform -translate-x-full opacity-0' :
              slideDirection === 'slide-right' ? 'transform translate-x-full opacity-0' : ''
            }`}>
              <h2 className="text-xl font-medium text-gray-700">
                {currentDoor.itemName}
              </h2>
              <p className="text-sm text-gray-500">
                Code: {currentDoor.itemCode}
              </p>
            </div>

            {/* Door Indicators - Center */}
            <div>
              {hasMultipleDoors && (
                <>
                  <div className="flex justify-center">
                    <div className="flex space-x-2 bg-white/50 rounded-full px-4 py-2 backdrop-blur-sm">
                      {doors.map((door, idx) => (
                        <button
                          key={door._id}
                          onClick={() => goToDoor(idx)}
                          className={`w-2 h-2 rounded-full transition-all duration-300 transform hover:scale-125 ${
                            idx === currentIdx
                              ? 'bg-blue-500 w-6'
                              : 'bg-gray-300 hover:bg-gray-400'
                          }`}
                          aria-label={`Go to ${door.itemName}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-center mt-2">
                    <div className="text-xs text-blue-600 font-medium bg-blue-100 px-3 py-1 rounded-full">
                      {currentIdx + 1} of {doors.length}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Power Button - Right */}
            <div className="flex justify-end">
              <button
                onClick={() => handleFieldChange(currentDoor, currentIdx, 'status', !currentDoor.status)}
                disabled={currentDoor.access !== true}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${
                  currentDoor.status
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl'
                    : 'bg-red-500 text-gray-200 shadow-md hover:bg-red-600'
                } ${currentDoor.access !== true ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-label="Toggle Power"
              >
                <Power size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Lock Controller with Navigation */}
        <div className="flex items-center justify-center gap-6">
          {/* Left Arrow */}
          {hasMultipleDoors && (
            <button
              onClick={handlePrev}
              disabled={currentIdx === 0}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 ${
                currentIdx === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                  : 'bg-white/90 text-pink-600 hover:bg-white shadow-lg hover:shadow-xl backdrop-blur-sm'
              }`}
              aria-label="Previous Door"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Lock/Unlock Button */}
          <div className={`flex flex-col items-center transition-all duration-300 ${
            slideDirection === 'slide-left' ? 'transform -translate-x-full opacity-0' :
            slideDirection === 'slide-right' ? 'transform translate-x-full opacity-0' : ''
          }`}>
            <div className="relative">
              {/* Outer glow ring */}
              <div 
                className={`absolute inset-0 rounded-full transition-all duration-500 ${
                  !isDisabled && currentDoor.lockStatus
                    ? 'bg-green-400/20 animate-pulse'
                    : !isDisabled && !currentDoor.lockStatus
                    ? 'bg-red-400/20 animate-pulse'
                    : 'bg-transparent'
                }`}
                style={{ width: '120px', height: '120px', top: '-12px', left: '-12px' }}
              />
              
              {/* Main button */}
              <button
                onClick={() => !isDisabled && handleFieldChange(currentDoor, currentIdx, 'lockStatus', !currentDoor.lockStatus)}
                disabled={isDisabled}
                className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 transform hover:scale-105 active:scale-95 ${
                  isDisabled
                    ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-500 cursor-not-allowed opacity-60'
                    : currentDoor.lockStatus
                      ? 'bg-gradient-to-br from-emerald-400 via-green-500 to-green-600 text-white shadow-2xl shadow-green-400/50 hover:shadow-green-400/70'
                      : 'bg-gradient-to-br from-red-400 via-red-500 to-red-600 text-white shadow-2xl shadow-red-400/50 hover:shadow-red-400/70'
                }`}
                aria-label={currentDoor.lockStatus ? 'Unlock Door' : 'Lock Door'}
                style={{
                  background: !isDisabled
                    ? currentDoor.lockStatus
                      ? 'conic-gradient(from 0deg, #10b981, #059669, #047857, #10b981)'
                      : 'conic-gradient(from 0deg, #ef4444, #dc2626, #b91c1c, #ef4444)'
                    : undefined,
                  animation: currentDoor.lockStatus && !isDisabled
                    ? 'doorScalePulse 2.5s ease-in-out infinite'
                    : undefined
                }}
              >
                <div className="absolute inset-1 rounded-full bg-white/20 opacity-50" />
                <div className="transform transition-all duration-300">
                  {currentDoor.lockStatus ? <Unlock size={28} /> : <Lock size={28} />}
                </div>
              </button>
            </div>
          </div>

          {/* Right Arrow */}
          {hasMultipleDoors && (
            <button
              onClick={handleNext}
              disabled={currentIdx === doors.length - 1}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 ${
                currentIdx === doors.length - 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                  : 'bg-white/90 text-pink-600 hover:bg-white shadow-lg hover:shadow-xl backdrop-blur-sm'
              }`}
              aria-label="Next Door"
            >
              <ChevronRight size={24} />
            </button>
          )}
        </div>

        {/* Lock Status Section */}
        <div className={`transition-all duration-300 ${
          slideDirection === 'slide-left' ? 'transform -translate-x-full opacity-0' :
          slideDirection === 'slide-right' ? 'transform translate-x-full opacity-0' : ''
        }`}>
          <div className="text-center">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
              currentDoor.lockStatus
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {currentDoor.lockStatus ? <Unlock size={16} /> : <Lock size={16} />}
              <span className="text-sm font-medium">
                {currentDoor.lockStatus ? 'Door is Unlocked' : 'Door is Locked'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDoorController;