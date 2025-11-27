import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Lightbulb, ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react';

const UserLightController = ({ selectedRoom, onLightUpdate }) => {
  const [lights, setLights] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [slideDirection, setSlideDirection] = useState('');

  // Fetch lights for selected room
  useEffect(() => {
    const fetchRoomLights = async () => {
      if (!selectedRoom) {
        setLights([]);
        setCurrentIdx(0);
        return;
      }

      try {
        const { data } = await axios.get('/api/equipment/lights');
        const roomLights = data.filter(light =>
          selectedRoom.lights?.includes(light._id) && light.access === true
        );
        setLights(roomLights);
        setCurrentIdx(0);
      } catch (err) {
        console.error('Failed to fetch room lights:', err);
        setLights([]);
        setCurrentIdx(0);
      }
    };

    fetchRoomLights();
  }, [selectedRoom]);

  // Handle field changes with brightness rounding
  const handleFieldChange = useCallback(async (light, idx, field, value) => {
    let sendValue = value;

    // Round brightness to nearest 10 and clamp between 0-100
    if (field === 'brightness') {
      sendValue = Math.round(Number(value) / 10) * 10;
      sendValue = Math.max(0, Math.min(100, sendValue));
    }

    // Optimistic update
    setLights(prev => prev.map((item, i) => 
      i === idx ? { ...item, [field]: sendValue } : item
    ));

    try {
      await axios.put(`/api/equipment/lights/${light._id}`, { [field]: sendValue });
      if (onLightUpdate) onLightUpdate();
    } catch (err) {
      console.error(`Failed to update ${field}:`, err);
      alert(`Failed to update light ${field}.`);
      
      // Revert optimistic update on error
      setLights(prev => prev.map((item, i) => 
        i === idx ? light : item
      ));
    }
  }, [onLightUpdate]);

  // Navigation handlers
  const handlePrev = useCallback(() => {
    if (currentIdx > 1) {
      setSlideDirection('slide-right');
      setCurrentIdx(currentIdx - 2);
    }
  }, [currentIdx]);

  const handleNext = useCallback(() => {
    if (currentIdx < lights.length - 2) {
      setSlideDirection('slide-left');
      setCurrentIdx(currentIdx + 2);
    }
  }, [currentIdx, lights.length]);

  // Reset slide animation after transition
  useEffect(() => {
    if (slideDirection) {
      const timer = setTimeout(() => setSlideDirection(''), 300);
      return () => clearTimeout(timer);
    }
  }, [slideDirection]);

  // Keyboard navigation
  useEffect(() => {
    if (lights.length <= 2) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lights.length, handlePrev, handleNext]);

  // Calculate current lights to display
  const currentLights = useMemo(() => 
    lights.slice(currentIdx, currentIdx + 2),
    [lights, currentIdx]
  );

  const hasMultiplePairs = lights.length > 2;

  // Early return if no lights
  if (lights.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-2xl p-8 bg-gradient-to-br from-orange-100 to-yellow-100">
        <h3 className="text-xl font-bold mb-6 text-gray-500">Your Lights</h3>
        <div className="text-gray-400">No lights assigned to this room.</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 bg-gradient-to-br from-orange-100 to-yellow-100">
      <div className="space-y-6">
        {/* Light Controllers with Side Navigation */}
        <div className="flex items-center justify-center gap-6">
          {/* Left Arrow */}
          {hasMultiplePairs && (
            <button
              onClick={handlePrev}
              disabled={currentIdx === 0}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 ${
                currentIdx === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                  : 'bg-white/90 text-yellow-600 hover:bg-white shadow-lg hover:shadow-xl backdrop-blur-sm'
              }`}
              aria-label="Previous Light Pair"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Light Controllers Grid */}
          <div className={`grid ${currentLights.length === 2 ? 'grid-cols-2' : 'grid-cols-1'} gap-8 transition-all duration-300 ${
            slideDirection === 'slide-left' ? 'transform -translate-x-full opacity-0' :
            slideDirection === 'slide-right' ? 'transform translate-x-full opacity-0' : ''
          }`}>
            {currentLights.map((light, idx) => {
              const actualIdx = currentIdx + idx;
              const isDisabled = light.access !== true;
              const isOff = !light.status;
              const brightness = light.brightness ?? 0;

              return (
                <LightControl
                  key={light._id}
                  light={light}
                  isDisabled={isDisabled}
                  isOff={isOff}
                  brightness={brightness}
                  onToggle={() => !isDisabled && handleFieldChange(light, actualIdx, 'status', !light.status)}
                  onBrightnessChange={(value) => 
                    !isDisabled && !isOff && handleFieldChange(light, actualIdx, 'brightness', value)
                  }
                />
              );
            })}
          </div>

          {/* Right Arrow */}
          {hasMultiplePairs && (
            <button
              onClick={handleNext}
              disabled={currentIdx >= lights.length - 2}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 ${
                currentIdx >= lights.length - 2
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                  : 'bg-white/90 text-yellow-600 hover:bg-white shadow-lg hover:shadow-xl backdrop-blur-sm'
              }`}
              aria-label="Next Light Pair"
            >
              <ChevronRight size={24} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Extracted Light Control Component
const LightControl = ({ light, isDisabled, isOff, brightness, onToggle, onBrightnessChange }) => {
  const glowOpacity = !isDisabled && !isOff ? brightness / 100 : 0;
  const buttonOpacity = !isOff && !isDisabled ? Math.max(0.6, brightness / 100) : isDisabled ? 0.6 : 0.8;

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Light Info Header */}
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-700">{light.itemName}</h3>
        <p className="text-sm text-gray-500">Code: {light.itemCode}</p>
      </div>

      {/* Smart Light Control */}
      <div className="flex flex-col items-center">
        {/* Main Light Button */}
        <div className="relative mb-4">
          {/* Outer glow ring */}
          <div 
            className="absolute inset-0 rounded-full transition-all duration-500 bg-yellow-400/30 animate-pulse"
            style={{ 
              width: '100px', 
              height: '100px', 
              top: '-10px', 
              left: '-10px',
              opacity: glowOpacity
            }}
          />
          
          {/* Main light button */}
          <button
            onClick={onToggle}
            disabled={isDisabled}
            className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 transform hover:scale-105 active:scale-95 ${
              isDisabled
                ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-500 cursor-not-allowed opacity-60'
                : !isOff
                  ? 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 text-white shadow-2xl shadow-yellow-400/50 hover:shadow-yellow-400/70'
                  : 'bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 text-white shadow-xl shadow-gray-400/50 hover:shadow-gray-400/70'
            }`}
            aria-label={!isOff ? "Turn Off Light" : "Turn On Light"}
            style={{
              background: !isDisabled
                ? !isOff
                  ? 'conic-gradient(from 0deg, #fbbf24, #f59e0b, #d97706, #fbbf24)'
                  : 'conic-gradient(from 0deg, #6b7280, #4b5563, #374151, #6b7280)'
                : undefined,
              opacity: buttonOpacity
            }}
          >
            {/* Inner highlight */}
            <div className="absolute inset-1 rounded-full bg-white/20 opacity-50" />
            
            {/* Icon */}
            <div className="transform transition-all duration-300">
              <Lightbulb size={24} />
            </div>
          </button>
        </div>

        {/* Brightness Slider */}
        <BrightnessSlider
          brightness={brightness}
          isDisabled={isDisabled || isOff}
          onChange={onBrightnessChange}
        />
      </div>
    </div>
  );
};

// Extracted Brightness Slider Component
const BrightnessSlider = ({ brightness, isDisabled, onChange }) => {
  return (
    <div className="w-32">
      <div className="flex items-center justify-between mb-2">
        <Moon size={14} className="text-gray-400" />
        <span className="text-xs font-medium text-gray-600">
          {brightness}%
        </span>
        <Sun size={14} className="text-yellow-500" />
      </div>
      
      <div className="relative">
        <input
          type="range"
          min="0"
          max="100"
          step="10"
          value={brightness}
          onChange={(e) => onChange(parseInt(e.target.value))}
          disabled={isDisabled}
          className={`w-full h-2 rounded-lg appearance-none cursor-pointer transition-all duration-300 ${
            isDisabled
              ? 'bg-gray-300 opacity-50 cursor-not-allowed'
              : 'hover:shadow-md'
          }`}
          style={{
            background: !isDisabled
              ? `linear-gradient(to right, 
                  #fbbf24 0%, 
                  #fbbf24 ${brightness}%, 
                  #d1d5db ${brightness}%, 
                  #d1d5db 100%)`
              : undefined
          }}
        />
        
        {/* Custom slider thumb styling */}
        <style>{`
          input[type="range"]::-webkit-slider-thumb {
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: ${!isDisabled ? '#f59e0b' : '#9ca3af'};
            cursor: ${!isDisabled ? 'pointer' : 'not-allowed'};
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            border: 2px solid white;
            transition: all 0.3s ease;
          }
          
          input[type="range"]:not(:disabled)::-webkit-slider-thumb:hover {
            transform: scale(1.2);
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          }
          
          input[type="range"]::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: ${!isDisabled ? '#f59e0b' : '#9ca3af'};
            cursor: ${!isDisabled ? 'pointer' : 'not-allowed'};
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            border: 2px solid white;
            transition: all 0.3s ease;
          }
        `}</style>
      </div>
    </div>
  );
};

export default UserLightController;