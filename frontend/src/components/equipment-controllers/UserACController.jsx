import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Minus, Snowflake, Flame, Fan, Droplets, Wind, Power, ChevronLeft, ChevronRight } from 'lucide-react';

const MIN_TEMP = 16;
const MAX_TEMP = 26;
const ANGLE_RANGE = 270;
const ANGLE_OFFSET = -135;

const MODE_OPTIONS = [
  { mode: 'No Mode', icon: <Minus size={20} /> },
  { mode: 'Cool', icon: <Snowflake size={20} /> },
  { mode: 'Heat', icon: <Flame size={20} /> },
  { mode: 'Fan', icon: <Fan size={20} /> },
  { mode: 'Dry', icon: <Droplets size={20} /> },
];

const FAN_SPEED_OPTIONS = [
  { speed: 'Low', icon: <Wind size={16} /> },
  { speed: 'Medium', icon: <Wind size={18} /> },
  { speed: 'High', icon: <Wind size={20} /> },
];

const UserACController = ({ selectedRoom, onACUpdate }) => {
  const [acs, setAcs] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [dragIdx, setDragIdx] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [slideDirection, setSlideDirection] = useState('');
  const containerRef = useRef(null);

  // Fetch ACs for the selected room
  useEffect(() => {
    const fetchRoomACs = async () => {
      if (!selectedRoom) {
        setAcs([]);
        setCurrentIdx(0);
        return;
      }

      try {
        const { data } = await axios.get('/api/equipment/air-conditioners');
        const roomACs = data.filter(
          ac => selectedRoom.airConditioners?.includes(ac._id) && ac.access === true
        );
        setAcs(roomACs);
        setCurrentIdx(0);
      } catch (err) {
        console.error('Failed to fetch ACs:', err);
        setAcs([]);
        setCurrentIdx(0);
      }
    };

    fetchRoomACs();
  }, [selectedRoom]);

  // Update AC field with optimistic update
  const handleFieldChange = useCallback(async (ac, idx, field, value) => {
    // Optimistic update
    setAcs(prev => prev.map((item, i) => 
      i === idx ? { ...item, [field]: value } : item
    ));

    try {
      await axios.put(`/api/equipment/air-conditioners/${ac._id}`, { [field]: value });
      if (onACUpdate) onACUpdate();
    } catch (err) {
      console.error(`Failed to update ${field}:`, err);
      alert(`Failed to update AC ${field}.`);
      
      // Revert optimistic update on error
      setAcs(prev => prev.map((item, i) => 
        i === idx ? ac : item
      ));
    }
  }, [onACUpdate]);

  // Convert mouse angle to temperature value
  const angleToTemp = useCallback((mouseAngle) => {
    // Normalize angle to range [-135, 135]
    let adjustedAngle = mouseAngle + 90;
    while (adjustedAngle > 180) adjustedAngle -= 360;
    while (adjustedAngle < -180) adjustedAngle += 360;
    
    const clampedAngle = Math.max(ANGLE_OFFSET, Math.min(-ANGLE_OFFSET, adjustedAngle));
    const progress = (clampedAngle - ANGLE_OFFSET) / ANGLE_RANGE;
    
    return Math.round(MIN_TEMP + (progress * (MAX_TEMP - MIN_TEMP)));
  }, []);

  // Get angle from mouse/touch event
  const getAngleFromEvent = useCallback((e) => {
    if (!containerRef.current) return 0;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    return Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
  }, []);

  // Start temperature drag
  const handleMouseDown = useCallback((e, ac, idx) => {
    if (ac.access !== true || ac.status !== true) return;

    setDragIdx(idx);
    setDragging(true);

    const angle = getAngleFromEvent(e);
    const newTemp = angleToTemp(angle);
    handleFieldChange(ac, idx, 'temperaturelevel', Math.max(MIN_TEMP, Math.min(MAX_TEMP, newTemp)));
  }, [getAngleFromEvent, angleToTemp, handleFieldChange]);

  // Handle temperature drag movement
  const handleMouseMove = useCallback((e) => {
    if (dragIdx === null || !dragging) return;

    const ac = acs[dragIdx];
    if (!ac || ac.access !== true || ac.status !== true) return;

    const angle = getAngleFromEvent(e);
    const newTemp = angleToTemp(angle);
    handleFieldChange(ac, dragIdx, 'temperaturelevel', Math.max(MIN_TEMP, Math.min(MAX_TEMP, newTemp)));
  }, [dragIdx, dragging, acs, getAngleFromEvent, angleToTemp, handleFieldChange]);

  // End temperature drag
  const handleMouseUp = useCallback(() => {
    setDragging(false);
    setDragIdx(null);
  }, []);

  // Attach/detach drag event listeners
  useEffect(() => {
    if (!dragging) return;

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleMouseMove);
    document.addEventListener('touchend', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [dragging, handleMouseMove, handleMouseUp]);

  // Navigation handlers
  const handlePrev = useCallback(() => {
    if (currentIdx > 0) {
      setSlideDirection('slide-right');
      setCurrentIdx(currentIdx - 1);
    }
  }, [currentIdx]);

  const handleNext = useCallback(() => {
    if (currentIdx < acs.length - 1) {
      setSlideDirection('slide-left');
      setCurrentIdx(currentIdx + 1);
    }
  }, [currentIdx, acs.length]);

  const goToAC = useCallback((index) => {
    if (index !== currentIdx && index >= 0 && index < acs.length) {
      setSlideDirection(index > currentIdx ? 'slide-left' : 'slide-right');
      setCurrentIdx(index);
    }
  }, [currentIdx, acs.length]);

  // Reset slide animation after transition
  useEffect(() => {
    if (slideDirection) {
      const timer = setTimeout(() => setSlideDirection(''), 300);
      return () => clearTimeout(timer);
    }
  }, [slideDirection]);

  // Keyboard navigation
  useEffect(() => {
    if (acs.length <= 1) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [acs.length, handlePrev, handleNext]);

  // Early return if no ACs
  if (acs.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-2xl p-8 bg-gradient-to-br from-blue-100 to-cyan-100">
        <h3 className="text-xl font-bold mb-2 text-gray-600">Your Air Conditioners</h3>
        <div className="text-gray-400">No ACs assigned to this room.</div>
      </div>
    );
  }

  const currentAC = acs[currentIdx];
  const isDisabled = currentAC.access !== true || currentAC.status !== true;
  const hasMultipleACs = acs.length > 1;
  const tempProgress = (currentAC.temperaturelevel - MIN_TEMP) / (MAX_TEMP - MIN_TEMP);
  const arcLength = tempProgress * (ANGLE_RANGE * (85 * 2 * Math.PI) / 360);

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 bg-gradient-to-br from-blue-100 to-cyan-100">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="relative">
          <div className="grid grid-cols-3 items-center mb-8">
            {/* AC Info - Left */}
            <div className={`flex flex-col transition-all duration-300 ${
              slideDirection === 'slide-left' ? 'transform -translate-x-full opacity-0' :
              slideDirection === 'slide-right' ? 'transform translate-x-full opacity-0' : ''
            }`}>
              <h2 className="text-xl font-medium text-gray-700">{currentAC.itemName}</h2>
              <p className="text-sm text-gray-500">Code: {currentAC.itemCode}</p>
            </div>

            {/* AC Indicators - Center */}
            <div>
              {hasMultipleACs && (
                <>
                  <div className="flex justify-center">
                    <div className="flex space-x-2 bg-white/50 rounded-full px-4 py-2 backdrop-blur-sm">
                      {acs.map((ac, idx) => (
                        <button
                          key={ac._id}
                          onClick={() => goToAC(idx)}
                          className={`w-2 h-2 rounded-full transition-all duration-300 transform hover:scale-125 ${
                            idx === currentIdx
                              ? 'bg-blue-500 w-6'
                              : 'bg-gray-300 hover:bg-gray-400'
                          }`}
                          aria-label={`Go to ${ac.itemName}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-center mt-2">
                    <div className="text-xs text-blue-600 font-medium bg-blue-100 px-3 py-1 rounded-full">
                      {currentIdx + 1} of {acs.length}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Power Button - Right */}
            <div className="flex justify-end">
              <button
                onClick={() => handleFieldChange(currentAC, currentIdx, 'status', !currentAC.status)}
                disabled={currentAC.access !== true}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${
                  currentAC.status
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl'
                    : 'bg-red-500 text-gray-200 shadow-md hover:bg-red-600'
                } ${currentAC.access !== true ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-label="Toggle Power"
              >
                <Power size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Temperature Controller with Navigation */}
        <div className="flex items-center justify-center gap-6">
          {/* Left Arrow */}
          {hasMultipleACs && (
            <button
              onClick={handlePrev}
              disabled={currentIdx === 0}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 ${
                currentIdx === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                  : 'bg-white/90 text-blue-600 hover:bg-white shadow-lg hover:shadow-xl backdrop-blur-sm'
              }`}
              aria-label="Previous AC"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Temperature Controller */}
          <div
            ref={containerRef}
            className={`relative w-48 h-48 transition-all duration-300 ${
              isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            } ${
              slideDirection === 'slide-left' ? 'transform -translate-x-full opacity-0' :
              slideDirection === 'slide-right' ? 'transform translate-x-full opacity-0' : ''
            }`}
            onMouseDown={e => handleMouseDown(e, currentAC, currentIdx)}
            onTouchStart={e => handleMouseDown(e, currentAC, currentIdx)}
          >
            {/* Temperature Range Labels */}
            <div className="absolute text-sm text-gray-500 font-medium" style={{ left: '-10px', bottom: '20px' }}>
              {MIN_TEMP}°
            </div>
            <div className="absolute text-sm text-gray-500 font-medium" style={{ right: '-10px', bottom: '20px' }}>
              {MAX_TEMP}°
            </div>

            {/* Center Display */}
            <div className="absolute inset-6 bg-gradient-to-br from-white to-gray-50 rounded-full shadow-xl flex flex-col items-center justify-center transition-all duration-300 hover:shadow-2xl">
              <div className="text-gray-500 text-xs font-semibold mb-1 tracking-wider">
                {currentAC.status === true
                  ? (currentAC.mode && currentAC.mode !== 'No Mode'
                    ? currentAC.mode.toUpperCase()
                    : 'NO MODE')
                  : 'OFF'}
              </div>
              <div className="text-4xl font-light text-gray-700 mb-2">
                {currentAC.temperaturelevel}
                <span className="text-lg">°</span>
              </div>
              <div className="text-blue-500">
                <Snowflake size={24} />
              </div>
            </div>

            {/* Temperature Arc Indicator */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200" style={{ transform: 'rotate(-225deg)' }}>
              {/* Background arc */}
              <circle
                cx="100"
                cy="100"
                r="85"
                fill="none"
                stroke="rgba(59, 130, 246, 0.2)"
                strokeWidth="4"
              />
              {/* Active arc */}
              <circle
                cx="100"
                cy="100"
                r="85"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="6"
                strokeDasharray={`${currentAC.status === true ? arcLength : 0} ${85 * 2 * Math.PI}`}
                strokeDashoffset={0}
                strokeLinecap="round"
                className="transition-all duration-500 drop-shadow-sm"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgb(59, 130, 246)" />
                  <stop offset="100%" stopColor="rgb(147, 197, 253)" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Right Arrow */}
          {hasMultipleACs && (
            <button
              onClick={handleNext}
              disabled={currentIdx === acs.length - 1}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 ${
                currentIdx === acs.length - 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                  : 'bg-white/90 text-blue-600 hover:bg-white shadow-lg hover:shadow-xl backdrop-blur-sm'
              }`}
              aria-label="Next AC"
            >
              <ChevronRight size={24} />
            </button>
          )}
        </div>

        {/* Mode Selection */}
        <ModeSelector
          currentMode={currentAC.mode}
          isDisabled={isDisabled}
          slideDirection={slideDirection}
          onModeChange={(mode) => handleFieldChange(currentAC, currentIdx, 'mode', mode)}
        />

        {/* Fan Speed Selection */}
        <FanSpeedSelector
          currentSpeed={currentAC.fanSpeed}
          isDisabled={isDisabled}
          slideDirection={slideDirection}
          onSpeedChange={(speed) => handleFieldChange(currentAC, currentIdx, 'fanSpeed', speed)}
        />
      </div>
    </div>
  );
};

// Extracted Mode Selector Component
const ModeSelector = ({ currentMode, isDisabled, slideDirection, onModeChange }) => (
  <div className={`transition-all duration-300 ${
    slideDirection === 'slide-left' ? 'transform -translate-x-full opacity-0' :
    slideDirection === 'slide-right' ? 'transform translate-x-full opacity-0' : ''
  }`}>
    <h3 className="text-center text-sm font-semibold text-cyan-700 mb-4 tracking-wide">MODE</h3>
    <div className="flex justify-center gap-3">
      {MODE_OPTIONS.map(({ mode, icon }) => (
        <div
          key={mode}
          className={`flex flex-col items-center transition-all duration-200 ${
            isDisabled ? 'opacity-40' : 'opacity-100'
          }`}
        >
          <button
            onClick={() => !isDisabled && onModeChange(mode)}
            disabled={isDisabled}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${
              currentMode === mode
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200'
                : 'bg-white/80 text-gray-400 hover:text-gray-600 shadow-md hover:shadow-lg backdrop-blur-sm'
            }`}
            aria-label={`Set mode to ${mode}`}
          >
            {icon}
          </button>
          <span className={`mt-2 text-xs font-medium transition-colors duration-200 ${
            currentMode === mode ? 'text-blue-600' : 'text-gray-500'
          }`}>
            {mode}
          </span>
        </div>
      ))}
    </div>
  </div>
);

// Extracted Fan Speed Selector Component
const FanSpeedSelector = ({ currentSpeed, isDisabled, slideDirection, onSpeedChange }) => (
  <div className={`transition-all duration-300 ${
    slideDirection === 'slide-left' ? 'transform -translate-x-full opacity-0' :
    slideDirection === 'slide-right' ? 'transform translate-x-full opacity-0' : ''
  }`}>
    <h3 className="text-center text-sm font-semibold text-cyan-700 mb-4 tracking-wide">FAN SPEED</h3>
    <div className="flex justify-center gap-4">
      {FAN_SPEED_OPTIONS.map(({ speed, icon }) => (
        <div
          key={speed}
          className={`flex flex-col items-center transition-all duration-200 ${
            isDisabled ? 'opacity-40' : 'opacity-100'
          }`}
        >
          <button
            onClick={() => !isDisabled && onSpeedChange(speed)}
            disabled={isDisabled}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${
              currentSpeed === speed
                ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-200'
                : 'bg-white/80 text-gray-400 hover:text-gray-600 shadow-md hover:shadow-lg backdrop-blur-sm'
            }`}
            aria-label={`Set fan speed to ${speed}`}
          >
            {icon}
          </button>
          <span className={`mt-2 text-xs font-medium transition-colors duration-200 ${
            currentSpeed === speed ? 'text-cyan-600' : 'text-gray-500'
          }`}>
            {speed}
          </span>
        </div>
      ))}
    </div>
  </div>
);

export default UserACController;