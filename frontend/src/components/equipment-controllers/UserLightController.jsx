import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Lightbulb, Power, ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react';

const UserLightController = ({ selectedRoom, onLightUpdate }) => {
  const [lights, setLights] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [slideDirection, setSlideDirection] = useState('');

  // Fetch Lights for the selected room
  useEffect(() => {
    const fetchRoomLights = async () => {
      if (!selectedRoom) {
        setLights([]);
        setCurrentIdx(0);
        return;
      }
      try {
        // selectedRoom.lights is an array of Light ObjectIds
        // Fetch all lights and filter by selectedRoom.lights and access === true
        const lightRes = await axios.get('/api/equipment/lights');
        const roomLights = lightRes.data.filter(light =>
          selectedRoom.lights &&
          selectedRoom.lights.includes(light._id) &&
          light.access === true
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

  const handleFieldChange = async (light, idx, field, value) => {
    // If brightness, round to nearest 10 and clamp 0-100
    let sendValue = value;
    if (field === 'brightness') {
      sendValue = Math.round(Number(value) / 10) * 10;
      sendValue = Math.max(0, Math.min(100, sendValue));
    }

    const updated = { ...lights[idx], [field]: sendValue };
    setLights(prev =>
      prev.map((item, i) =>
        i === idx ? updated : item
      )
    );
    
    try {
      await axios.put(
        `/api/equipment/lights/${light._id}`,
        { [field]: sendValue }
      );
      if (onLightUpdate) onLightUpdate();
    } catch (err) {
      console.error('Failed to update light:', err);
      alert("Failed to update Light.");
      // Revert the change if update fails
      setLights(prev => prev.map((item, i) => (i === idx ? light : item)));
    }
  };

  // Enhanced Navigation handlers
  const handlePrev = () => {
    if (currentIdx > 1) {
      setSlideDirection('slide-right');
      setCurrentIdx(currentIdx - 2);
    }
  };

  const handleNext = () => {
    if (currentIdx < lights.length - 2) {
      setSlideDirection('slide-left');
      setCurrentIdx(currentIdx + 2);
    }
  };

  // Navigate directly to specific light pair
  // const goToLightPair = (index) => {
  //   if (index !== currentIdx) {
  //     setSlideDirection(index > currentIdx ? 'slide-left' : 'slide-right');
  //     setCurrentIdx(index);
  //   }
  // };

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
      if (lights.length > 2) {
        if (e.key === "ArrowLeft") handlePrev();
        if (e.key === "ArrowRight") handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lights.length, currentIdx]);

  if (lights.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-2xl p-8 bg-gradient-to-br from-orange-100 to-yellow-100">
        <h3 className="text-xl font-bold mb-6 text-gray-500">Your Lights</h3>
        <div className="text-gray-400">No lights assigned to this room.</div>
      </div>
    );
  }

  // Get current pair of lights to display
  const currentLights = lights.slice(currentIdx, currentIdx + 2);
  // const totalPairs = Math.ceil(lights.length / 2);
  // const currentPairIdx = Math.floor(currentIdx / 2);

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 bg-gradient-to-br from-orange-100 to-yellow-100">
      <div className="space-y-6">
        {/* Enhanced Header with Navigation */}
        {/* {lights.length > 2 && (
          <div className="relative mb-8">
            <div className="flex justify-center">
              <div className="flex space-x-2 bg-white/50 rounded-full px-4 py-2 backdrop-blur-sm">
                {Array.from({ length: totalPairs }, (_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToLightPair(idx * 2)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 transform hover:scale-125 ${
                      idx === currentPairIdx
                        ? 'bg-yellow-500 w-6'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to light pair ${idx + 1}`}
                  />
                ))}
              </div>
            </div> */}

            {/* Counter */}
            {/* <div className="flex justify-center mt-2">
              <div className="text-xs text-yellow-600 font-medium bg-yellow-100 px-3 py-1 rounded-full">
                {currentPairIdx + 1} of {totalPairs}
              </div>
            </div>
          </div>
        )} */}

        {/* Light Controllers with Side Navigation */}
        <div className="flex items-center justify-center gap-6">
          {/* Left Arrow */}
          {lights.length > 2 && (
            <button
              onClick={handlePrev}
              disabled={currentIdx === 0}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 ${
                currentIdx === 0
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed opacity-50"
                  : "bg-white/90 text-yellow-600 hover:bg-white shadow-lg hover:shadow-xl backdrop-blur-sm"
              }`}
              aria-label="Previous Light Pair"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Light Controllers Row */}
          <div className={`grid ${currentLights.length === 2 ? 'grid-cols-2' : 'grid-cols-1'} gap-8 transition-all duration-300 ${
            slideDirection === 'slide-left' ? 'transform -translate-x-full opacity-0' :
            slideDirection === 'slide-right' ? 'transform translate-x-full opacity-0' : ''
          }`}>
            {currentLights.map((light, idx) => (
              <div key={light._id} className="flex flex-col items-center space-y-4">
                {/* Light Info Header */}
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-700">{light.itemName}</h3>
                  <p className="text-sm text-gray-500">Code: {light.itemCode}</p>
                </div>

                {/* Power Button */}
                {/* <button
                  onClick={() =>
                    light.access === true &&
                    handleFieldChange(light, currentIdx + idx, "status", !light.status)
                  }
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${
                    light.status
                      ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg hover:shadow-xl'
                      : 'bg-red-500 text-gray-200 shadow-md hover:bg-red-600'
                  } ${light.access !== true ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={light.access !== true}
                  aria-label="Toggle Power"
                >
                  <Power size={16} />
                </button> */}

                {/* Smart Light Control */}
                <div className="flex flex-col items-center">
                  {/* Main Light Button */}
                  <div className="relative mb-4">
                    {/* Outer glow ring */}
                    <div className={`absolute inset-0 rounded-full transition-all duration-500 ${
                      light.access !== true || light.status !== true
                        ? 'bg-transparent'
                        : 'bg-yellow-400/30 animate-pulse'
                    }`} style={{ 
                      width: '100px', 
                      height: '100px', 
                      top: '-10px', 
                      left: '-10px',
                      opacity: light.status && light.access ? light.brightness / 100 : 0
                    }}></div>
                    
                    {/* Main light button */}
                    <button
                      onClick={() => {
                        const isDisabled = light.access !== true;
                        if (!isDisabled) {
                          handleFieldChange(light, currentIdx + idx, "status", !light.status);
                        }
                      }}
                      className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 transform hover:scale-105 active:scale-95 ${
                        light.access !== true
                          ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-500 cursor-not-allowed opacity-60'
                          : light.status
                            ? 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 text-white shadow-2xl shadow-yellow-400/50 hover:shadow-yellow-400/70'
                            : 'bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 text-white shadow-xl shadow-gray-400/50 hover:shadow-gray-400/70'
                      }`}
                      disabled={light.access !== true}
                      aria-label={light.status ? "Turn Off Light" : "Turn On Light"}
                      style={{
                        background: light.access === true 
                          ? light.status
                            ? `conic-gradient(from 0deg, #fbbf24, #f59e0b, #d97706, #fbbf24)`
                            : 'conic-gradient(from 0deg, #6b7280, #4b5563, #374151, #6b7280)'
                          : undefined,
                        opacity: light.status && light.access ? Math.max(0.6, light.brightness / 100) : light.access ? 0.8 : 0.6
                      }}
                    >
                      {/* Inner highlight */}
                      <div className="absolute inset-1 rounded-full bg-white/20 opacity-50"></div>
                      
                      {/* Icon */}
                      <div className="transform transition-all duration-300">
                        <Lightbulb size={24} />
                      </div>
                    </button>
                  </div>

                  {/* Intensity Slider */}
                  <div className="w-32">
                    <div className="flex items-center justify-between mb-2">
                      <Moon size={14} className="text-gray-400" />
                      <span className="text-xs font-medium text-gray-600">
                        {light.brightness ?? 0}%
                      </span>
                      <Sun size={14} className="text-yellow-500" />
                    </div>
                    
                    <div className="relative">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={light.brightness ?? 0}
                        onChange={(e) => {
                          const isDisabled = light.access !== true || light.status !== true;
                          if (!isDisabled) {
                            handleFieldChange(light, currentIdx + idx, "brightness", parseInt(e.target.value));
                          }
                        }}
                        disabled={light.access !== true || light.status !== true}
                        className={`w-full h-2 rounded-lg appearance-none cursor-pointer transition-all duration-300 ${
                          light.access !== true || light.status !== true
                            ? 'bg-gray-300 opacity-50 cursor-not-allowed'
                            : 'bg-gradient-to-r from-gray-300 to-yellow-500 hover:shadow-md'
                        }`}
                        style={{
                          background: light.access === true && light.status === true
                            ? `linear-gradient(to right, 
                                #fbbf24 0%, 
                                #fbbf24 ${light.brightness ?? 0}%, 
                                #d1d5db ${light.brightness ?? 0}%, 
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
                          background: ${light.access === true ? '#f59e0b' : '#9ca3af'};
                          cursor: pointer;
                          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                          border: 2px solid white;
                          transition: all 0.3s ease;
                        }
                        
                        input[type="range"]::-webkit-slider-thumb:hover {
                          transform: scale(1.2);
                          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                        }
                        
                        input[type="range"]::-moz-range-thumb {
                          width: 20px;
                          height: 20px;
                          border-radius: 50%;
                          background: ${light.access === true ? '#f59e0b' : '#9ca3af'};
                          cursor: pointer;
                          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                          border: 2px solid white;
                          transition: all 0.3s ease;
                        }
                      `}</style>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Arrow */}
          {lights.length > 2 && (
            <button
              onClick={handleNext}
              disabled={currentIdx >= lights.length - 2}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 ${
                currentIdx >= lights.length - 2
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed opacity-50"
                  : "bg-white/90 text-yellow-600 hover:bg-white shadow-lg hover:shadow-xl backdrop-blur-sm"
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

export default UserLightController;