import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Lock, Unlock, Power, ChevronLeft, ChevronRight } from 'lucide-react';

const UserDoorController = ({ selectedRoom, onDoorUpdate }) => {
  const [doors, setDoors] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [slideDirection, setSlideDirection] = useState('');

  // Ref to keep latest doors for timer closures
  const doorsRef = useRef([]);
  // Ref to store the auto-unlock timer id
  const autoUnlockTimerRef = useRef(null);

  // keep ref synced with state
  useEffect(() => {
    doorsRef.current = doors;
  }, [doors]);

  // Fetch Doors for the selected room
  useEffect(() => {
    const fetchRoomDoors = async () => {
      if (!selectedRoom) {
        setDoors([]);
        setCurrentIdx(0);
        return;
      }
      try {
        // selectedRoom.doors is an array of Door ObjectIds
        // Fetch all doors and filter by selectedRoom.doors and access === true
        const doorRes = await axios.get('/api/equipment/doors');
        const roomDoors = doorRes.data.filter(door =>
          selectedRoom.doors &&
          selectedRoom.doors.includes(door._id) &&
          door.access === true
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

  // Clear any pending auto-unlock timer on unmount
  useEffect(() => {
    return () => {
      if (autoUnlockTimerRef.current) {
        clearTimeout(autoUnlockTimerRef.current);
        autoUnlockTimerRef.current = null;
      }
    };
  }, []);

  const handleFieldChange = async (door, idx, field, value) => {
    const updated = { ...doors[idx], [field]: value };
    setDoors(prev =>
      prev.map((item, i) =>
        i === idx ? updated : item
      )
    );

    try {
      await axios.put(
        `/api/equipment/doors/${door._id}`,
        { [field]: value }
      );

      // If lockStatus was changed manually to false, cancel any auto-unlock timer
      if (field === 'lockStatus' && value === false) {
        if (autoUnlockTimerRef.current) {
          clearTimeout(autoUnlockTimerRef.current);
          autoUnlockTimerRef.current = null;
        }
      }

      // If lockStatus was changed to true, schedule auto-unlock after 10s
      if (field === 'lockStatus' && value === true) {
        // Clear any previous timer to avoid duplicates
        if (autoUnlockTimerRef.current) {
          clearTimeout(autoUnlockTimerRef.current);
          autoUnlockTimerRef.current = null;
        }

        // Schedule auto-unlock in 10 seconds
        autoUnlockTimerRef.current = setTimeout(async () => {
          try {
            // Find latest door object from ref to ensure user didn't change it manually
            const latestDoor = doorsRef.current.find(d => d._id === door._id);
            if (!latestDoor) {
              autoUnlockTimerRef.current = null;
              return;
            }

            // If door is still locked (lockStatus === true), perform auto-unlock
            if (latestDoor.lockStatus === true) {
              await axios.put(`/api/equipment/doors/${door._id}`, { lockStatus: false });

              // Update local state
              setDoors(prev => prev.map(d => d._id === door._id ? { ...d, lockStatus: false } : d));

              // notify parent if provided
              if (onDoorUpdate) onDoorUpdate();
            }
          } catch (err) {
            console.error('Auto-unlock failed:', err);
          } finally {
            autoUnlockTimerRef.current = null;
          }
        }, 10000); // 10 seconds
      }

      if (onDoorUpdate) onDoorUpdate();
    } catch (err) {
      console.error('Failed to update Door:', err);
      alert("Failed to update Door.");
      // Revert the change if update fails
      setDoors(prev => prev.map((item, i) => (i === idx ? door : item)));
    }
  };

  // Enhanced Navigation handlers
  const handlePrev = () => {
    if (currentIdx > 0) {
      setSlideDirection('slide-right');
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < doors.length - 1) {
      setSlideDirection('slide-left');
      setCurrentIdx(currentIdx + 1);
    }
  };

  // Navigate directly to specific door
  const goToDoor = (index) => {
    if (index !== currentIdx) {
      setSlideDirection(index > currentIdx ? 'slide-left' : 'slide-right');
      setCurrentIdx(index);
    }
  };

  // Reset slide animation after transition
  useEffect(() => {
    if (slideDirection) {
      const timer = setTimeout(() => setSlideDirection(''), 300);
      return () => clearTimeout(timer);
    }
  }, [slideDirection]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (doors.length > 1) {
        if (e.key === "ArrowLeft") handlePrev();
        if (e.key === "ArrowRight") handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [doors.length, currentIdx]);

  // inject keyframes for slow scale pulse once
  useEffect(() => {
    if (!document.getElementById('door-scale-keyframes')) {
      const style = document.createElement('style');
      style.id = 'door-scale-keyframes';
      style.innerHTML = `
        @keyframes doorScalePulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  if (doors.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-2xl p-8 bg-gradient-to-br from-fuchsia-100 to-red-100">
        <h3 className="text-xl font-bold mb-6 text-gray-600">Your Doors</h3>
        <div className="text-gray-400">No doors assigned to this room.</div>
      </div>
    );
  }

  const currentDoor = doors[currentIdx];

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 bg-gradient-to-br from-fuchsia-100 to-red-100">
      <div className="space-y-6">
        {/* Enhanced Header with Navigation */}
        <div className="relative">
          {/* Main Header */}
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

            <div className=''>
              {/* Door Indicator Dots */}
              {doors.length > 1 && (
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
              )}

              {/* Counter - Center */}
              {doors.length > 1 && (
                <div className="flex justify-center mt-2">
                  <div className="text-xs text-blue-600 font-medium bg-blue-100 px-3 py-1 rounded-full">
                    {currentIdx + 1} of {doors.length}
                  </div>
                </div>
              )}
            </div>

            {/* Power Button - Right */}
            <div className="flex justify-end">
              <button
                onClick={() =>
                  currentDoor.access === true &&
                  handleFieldChange(currentDoor, currentIdx, "status", !currentDoor.status)
                }
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${
                  currentDoor.status
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl'
                    : 'bg-red-500 text-gray-200 shadow-md hover:bg-red-600'
                } ${currentDoor.access !== true ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={currentDoor.access !== true}
                aria-label="Toggle Power"
              >
                <Power size={20} className='' />
              </button>
            </div>
          </div>
        </div>

        {/* Lock Controller with Side Navigation */}
        <div className="flex items-center justify-center gap-6 z-10">
          {/* Left Arrow */}
          {doors.length > 1 && (
            <button
              onClick={handlePrev}
              disabled={currentIdx === 0}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 ${
                currentIdx === 0
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed opacity-50"
                  : "bg-white/90 text-pink-600 hover:bg-white shadow-lg hover:shadow-xl backdrop-blur-sm"
              }`}
              aria-label="Previous Door"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Smart Lock/Unlock Button */}
          <div className={`flex flex-col items-center transition-all duration-300 ${
            slideDirection === 'slide-left' ? 'transform -translate-x-full opacity-0' :
            slideDirection === 'slide-right' ? 'transform translate-x-full opacity-0' : ''
          }`}>
            <div className="relative">
              {/* Outer glow ring */}
              <div className={`absolute inset-0 rounded-full transition-all duration-500 ${
                currentDoor.access !== true || currentDoor.status !== true
                  ? 'bg-transparent'
                  : currentDoor.lockStatus
                    ? 'bg-green-400/20 animate-pulse'
                    : 'bg-red-400/20 animate-pulse'
              }`} style={{ width: '120px', height: '120px', top: '-12px', left: '-12px' }}></div>
              
              {/* Main button */}
              <button
                onClick={() => {
                  const isDisabled = currentDoor.access !== true || currentDoor.status !== true;
                  if (!isDisabled) {
                    handleFieldChange(currentDoor, currentIdx, "lockStatus", !currentDoor.lockStatus);
                  }
                }}
                className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 transform hover:scale-105 active:scale-95 ${
                  currentDoor.access !== true || currentDoor.status !== true
                    ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-500 cursor-not-allowed opacity-60'
                    : currentDoor.lockStatus
                      ? 'bg-gradient-to-br from-emerald-400 via-green-500 to-green-600 text-white shadow-2xl shadow-green-400/50 hover:shadow-green-400/70'
                      : 'bg-gradient-to-br from-red-400 via-red-500 to-red-600 text-white shadow-2xl shadow-red-400/50 hover:shadow-red-400/70'
                }`}
                disabled={currentDoor.access !== true || currentDoor.status !== true}
                aria-label={currentDoor.lockStatus ? "Unlock Door" : "Lock Door"}
                style={{
                  background: currentDoor.access === true && currentDoor.status === true 
                    ? currentDoor.lockStatus
                      ? 'conic-gradient(from 0deg, #10b981, #059669, #047857, #10b981)'
                      : 'conic-gradient(from 0deg, #ef4444, #dc2626, #b91c1c, #ef4444)'
                    : undefined,
                  // apply slow zoom in/out animation when lockStatus is true
                  animation: currentDoor.lockStatus ? 'doorScalePulse 2.5s ease-in-out infinite' : undefined
                }}
              >
                {/* Inner highlight */}
                <div className="absolute inset-1 rounded-full bg-white/20 opacity-50"></div>
                
                {/* Icon with animation */}
                <div className={`transform transition-all duration-300 ${
                  currentDoor.lockStatus ? 'rotate-0' : 'rotate-0'
                }`}>
                  {currentDoor.lockStatus ? <Unlock size={28} /> : <Lock size={28} />}
                </div>
              </button>
            </div>
          </div>

          {/* Right Arrow */}
          {doors.length > 1 && (
            <button
              onClick={handleNext}
              disabled={currentIdx === doors.length - 1}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 ${
                currentIdx === doors.length - 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed opacity-50"
                  : "bg-white/90 text-pink-600 hover:bg-white shadow-lg hover:shadow-xl backdrop-blur-sm"
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