import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "../../utils/cropUtils";

/**
 * Simple ImageCropper Modal - Crop and Zoom only
 * @param {object} props
 * @param {string} props.imageSrc - Image source URL or data URL
 * @param {function} props.onCropComplete - Callback with cropped image result
 * @param {function} props.onCancel - Cancel callback
 * @param {object} props.aspectRatios - Dynamic aspect ratios object
 * @param {string} [props.cropShape="rect"] - "rect" or "round"
 * @param {string} [props.title="Crop Image"] - Modal title
 */
const ImageCropper = ({ 
  imageSrc, 
  onCropComplete, 
  onCancel, 
  aspectRatios = {
    "Square": 1,
    "Portrait": 3/4,
    "Landscape": 4/3,
    "Wide": 16/9
  },
  cropShape = "rect",
  title = "Crop Image"
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [currentAspect, setCurrentAspect] = useState(aspectRatios[Object.keys(aspectRatios)[0]]);
  const [isLoading, setIsLoading] = useState(false);

  const handleCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleDone = async () => {
    if (!croppedAreaPixels) return;
    
    setIsLoading(true);
    
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedImage);
    } catch (err) {
      console.error("Crop failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePresetSelect = (presetAspect) => {
    setCurrentAspect(presetAspect);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <button 
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Aspect Ratio Presets */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-2 justify-center">
              {Object.entries(aspectRatios).map(([name, ratio]) => (
                <button
                  key={name}
                  onClick={() => handlePresetSelect(ratio)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentAspect === ratio
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Cropper Container */}
          <div className="relative w-full h-80 bg-gray-900 rounded-xl overflow-hidden mb-4">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={currentAspect}
              cropShape={cropShape}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={handleCropComplete}
            />
          </div>

          {/* Zoom Control */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Zoom</label>
              <span className="text-sm text-gray-500">{zoom.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDone}
              disabled={isLoading || !croppedAreaPixels}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {isLoading && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              )}
              <span>{isLoading ? 'Processing...' : 'Crop Image'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Custom Slider Styles */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-webkit-slider-track {
          height: 8px;
          border-radius: 4px;
          background: #e5e7eb;
        }
      `}</style>
    </div>
  );
};

export default ImageCropper;