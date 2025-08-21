import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Minus, Snowflake, Flame, Fan, Droplets, Wind, Power, ChevronLeft, ChevronRight } from 'lucide-react';

const minTemp = 16;
const maxTemp = 26;

const modeOptions = [
  { mode: 'No Mode', icon: <Minus size={20} /> },
  { mode: 'Cool', icon: <Snowflake size={20} /> },
  { mode: 'Heat', icon: <Flame size={20} /> },
  { mode: 'Fan', icon: <Fan size={20} /> },
  { mode: 'Dry', icon: <Droplets size={20} /> },
];

const fanSpeedOptions = [
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
        const { data } = await axios.get('http://localhost:5000/api/equipment/air-conditioners');
        const roomACs = data.filter(
          ac =>
            selectedRoom.airConditioners?.includes(ac._id) &&
            ac.access === true
        );
        setAcs(roomACs);
        setCurrentIdx(0);
      } catch {
        setAcs([]);
        setCurrentIdx(0);
      }
    };
    fetchRoomACs();
  }, [selectedRoom]);

  // Update AC field
  const handleFieldChange = async (ac, idx, field, value) => {
    const updated = { ...acs[idx], [field]: value };
    setAcs(prev => prev.map((item, i) => (i === idx ? updated : item)));
    try {
      await axios.put(
        `http://localhost:5000/api/equipment/air-conditioners/${ac._id}`,
        { [field]: value }
      );
      onACUpdate && onACUpdate();
    } catch {
      console.error(`Failed to update ${field} for AC ${ac._id}`);
      // Revert the change if update fails
      setAcs(prev => prev.map((item, i) => (i === idx ? ac : item)));
    }
  };

  // Circular Temperature Controller Logic
  const angleToTemp = (mouseAngle) => {
    let adjustedAngle = mouseAngle + 90;
    while (adjustedAngle > 180) adjustedAngle -= 360;
    while (adjustedAngle < -180) adjustedAngle += 360;
    let clampedAngle = Math.max(-135, Math.min(135, adjustedAngle));
    const progress = (clampedAngle + 135) / 270;
    return Math.round(minTemp + (progress * (maxTemp - minTemp)));
  };

  const getAngleFromEvent = (e) => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
  };

  // Drag logic for circular temperature controller
  const handleMouseDown = (e, ac, idx) => {
    if (ac.access !== true || ac.status !== true) return;
    setDragIdx(idx);
    setDragging(true);
    const angle = getAngleFromEvent(e);
    const newTemp = angleToTemp(angle);
    handleFieldChange(ac, idx, "temperaturelevel", Math.max(minTemp, Math.min(maxTemp, newTemp)));
  };

  const handleMouseMove = useCallback((e) => {
    if (dragIdx === null || !dragging) return;
    const ac = acs[dragIdx];
    if (!ac || ac.access !== true || ac.status !== true) return;
    const angle = getAngleFromEvent(e);
    const newTemp = angleToTemp(angle);
    handleFieldChange(ac, dragIdx, "temperaturelevel", Math.max(minTemp, Math.min(maxTemp, newTemp)));
  }, [dragIdx, dragging, acs]);

  const handleMouseUp = useCallback(() => {
    setDragging(false);
    setDragIdx(null);
  }, []);

  useEffect(() => {
    if (dragging) {
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
    }
  }, [dragging, handleMouseMove, handleMouseUp]);

  // Enhanced Navigation handlers
  const handlePrev = () => {
    if (currentIdx > 0) {
      setSlideDirection('slide-right');
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < acs.length - 1) {
      setSlideDirection('slide-left');
      setCurrentIdx(currentIdx + 1);
    }
  };

  // Navigate directly to specific AC
  const goToAC = (index) => {
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
      if (acs.length > 1) {
        if (e.key === "ArrowLeft") handlePrev();
        if (e.key === "ArrowRight") handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [acs.length, currentIdx]);

  if (acs.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-2xl p-8 bg-gradient-to-br from-blue-100 to-cyan-100">
        <h3 className="text-xl font-bold mb-2 text-gray-600">Your Air Conditioners</h3>
        <div className="text-gray-400">No ACs assigned to this room.</div>
      </div>
    );
  }

  const currentAC = acs[currentIdx];

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 bg-gradient-to-br from-blue-100 to-cyan-100">
      <div className="space-y-6">
        {/* Enhanced Header with Navigation */}
        <div className="relative">
          

          {/* Main Header */}
          <div className="grid grid-cols-3 items-center mb-8">
            {/* AC Info - Left */}
            <div className={`flex flex-col transition-all duration-300 ${
              slideDirection === 'slide-left' ? 'transform -translate-x-full opacity-0' :
              slideDirection === 'slide-right' ? 'transform translate-x-full opacity-0' : ''
            }`}>
              <h2 className="text-xl font-medium text-gray-700">
                {currentAC.itemName}
              </h2>
              <p className="text-sm text-gray-500">
                Code: {currentAC.itemCode}
              </p>
            </div>

          <div className=''>
            {/* AC Indicator Dots */}
          {acs.length > 1 && (
            <div className="flex justify-center">
              <div className="flex space-x-2 bg-white/50 rounded-full px-4 py-2 backdrop-blur-sm ">
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
          )}

            {/* Counter - Center */}
            {acs.length > 1 && (
              <div className="flex justify-center">
                <div className="text-xs text-blue-600 font-medium bg-blue-100 px-3 py-1 rounded-full">
                  {currentIdx + 1} of {acs.length}
                </div>
              </div>
            )}
            </div>

            {/* Power Button - Right */}
            <div className="flex justify-end">
              <button
                onClick={() =>
                  currentAC.access === true &&
                  handleFieldChange(currentAC, currentIdx, "status", !currentAC.status)
                }
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${
                  currentAC.status
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl'
                    : 'bg-red-500 text-gray-200 shadow-md hover:bg-red-600'
                } ${currentAC.access !== true ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={currentAC.access !== true}
                aria-label="Toggle Power"
              >
                <Power size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Temperature Controller with Side Navigation */}
        <div className="flex items-center justify-center gap-6">
          {/* Left Arrow */}
          {acs.length > 1 && (
            <button
              onClick={handlePrev}
              disabled={currentIdx === 0}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 ${
                currentIdx === 0
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed opacity-50"
                  : "bg-white/90 text-blue-600 hover:bg-white shadow-lg hover:shadow-xl backdrop-blur-sm"
              }`}
              aria-label="Previous AC"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Temperature Controller */}
          <div
            ref={containerRef}
            className={`relative w-48 h-48 cursor-pointer transition-all duration-300 ${
              slideDirection === 'slide-left' ? 'transform -translate-x-full opacity-0' :
              slideDirection === 'slide-right' ? 'transform translate-x-full opacity-0' : ''
            }`}
            onMouseDown={e => handleMouseDown(e, currentAC, currentIdx)}
            onTouchStart={e => handleMouseDown(e, currentAC, currentIdx)}
            style={{ opacity: currentAC.access !== true || currentAC.status !== true ? 0.5 : 1 }}
          >
            {/* Temperature labels */}
            <div className="absolute text-sm text-gray-500 font-medium" style={{ left: '-10px', bottom: '20px' }}>{minTemp}°</div>
            <div className="absolute text-sm text-gray-500 font-medium" style={{ right: '-10px', bottom: '20px' }}>{maxTemp}°</div>
            
            {/* Center circle */}
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
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z"/>
                </svg>
              </div>
            </div>
            
            {/* Enhanced active arc indicator */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200" style={{ transform: 'rotate(-225deg)' }}>
              <circle
                cx="100"
                cy="100"
                r="85"
                fill="none"
                stroke="rgba(59, 130, 246, 0.2)"
                strokeWidth="4"
              />
              <circle
                cx="100"
                cy="100"
                r="85"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="6"
                strokeDasharray={`${currentAC.status === true ? ((currentAC.temperaturelevel - minTemp) / (maxTemp - minTemp)) * (270 * (85 * 2 * Math.PI) / 360) : 0} ${85 * 2 * Math.PI}`}
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
          {acs.length > 1 && (
            <button
              onClick={handleNext}
              disabled={currentIdx === acs.length - 1}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 ${
                currentIdx === acs.length - 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed opacity-50"
                  : "bg-white/90 text-blue-600 hover:bg-white shadow-lg hover:shadow-xl backdrop-blur-sm"
              }`}
              aria-label="Next AC"
            >
              <ChevronRight size={24} />
            </button>
          )}
        </div>
        
        {/* Mode Selection */}
        <div className={`transition-all duration-300 ${
          slideDirection === 'slide-left' ? 'transform -translate-x-full opacity-0' :
          slideDirection === 'slide-right' ? 'transform translate-x-full opacity-0' : ''
        }`}>
          <h3 className="text-center text-sm font-semibold text-cyan-700 mb-4 tracking-wide">MODE</h3>
          <div className="flex justify-center gap-3">
            {modeOptions.map(({ mode: modeType, icon }) => {
              const isDisabled = currentAC.access !== true || currentAC.status !== true;
              return (
                <div
                  key={modeType}
                  className={`flex flex-col items-center transition-all duration-200 ${
                    isDisabled ? "opacity-40" : "opacity-100"
                  }`}
                >
                  <button
                    onClick={() =>
                      !isDisabled && handleFieldChange(currentAC, currentIdx, "mode", modeType)
                    }
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${
                      currentAC.mode === modeType
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200'
                        : 'bg-white/80 text-gray-400 hover:text-gray-600 shadow-md hover:shadow-lg backdrop-blur-sm'
                    }`}
                    disabled={isDisabled}
                    style={{ pointerEvents: isDisabled ? "none" : "auto" }}
                  >
                    {icon}
                  </button>
                  <span className={`mt-2 text-xs font-medium transition-colors duration-200 ${
                    currentAC.mode === modeType ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {modeType}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Fan Speed Selection */}
        <div className={`transition-all duration-300 ${
          slideDirection === 'slide-left' ? 'transform -translate-x-full opacity-0' :
          slideDirection === 'slide-right' ? 'transform translate-x-full opacity-0' : ''
        }`}>
          <h3 className="text-center text-sm font-semibold text-cyan-700 mb-4 tracking-wide">FAN SPEED</h3>
          <div className="flex justify-center gap-4">
            {fanSpeedOptions.map(({ speed, icon }) => {
              const isDisabled = currentAC.access !== true || currentAC.status !== true;
              return (
                <div
                  key={speed}
                  className={`flex flex-col items-center transition-all duration-200 ${
                    isDisabled ? "opacity-40" : "opacity-100"
                  }`}
                >
                  <button
                    onClick={() =>
                      !isDisabled && handleFieldChange(currentAC, currentIdx, "fanSpeed", speed)
                    }
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${
                      currentAC.fanSpeed === speed
                        ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-200'
                        : 'bg-white/80 text-gray-400 hover:text-gray-600 shadow-md hover:shadow-lg backdrop-blur-sm'
                    }`}
                    disabled={isDisabled}
                    style={{ pointerEvents: isDisabled ? "none" : "auto" }}
                  >
                    {icon}
                  </button>
                  <span className={`mt-2 text-xs font-medium transition-colors duration-200 ${
                    currentAC.fanSpeed === speed ? 'text-cyan-600' : 'text-gray-500'
                  }`}>
                    {speed}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserACController;