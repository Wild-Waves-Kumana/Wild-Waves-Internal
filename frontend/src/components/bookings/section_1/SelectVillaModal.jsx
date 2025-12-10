import React, { useState, useEffect } from 'react';
import Modal from '../../common/Modal';
import { Users, MapPin, Home, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { FaBuilding } from 'react-icons/fa';
import { bookingStorage } from '../../../utils/bookingStorage';

const SelectVillaModal = ({ 
  isVisible, 
  onClose, 
  villas, 
  onVillaSelect,
  selectedVilla,
  acStatus,
  onAcToggle,
  loading 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [tempAcSelection, setTempAcSelection] = useState(null);

  // Initialize carousel position when modal opens
  useEffect(() => {
    if (isVisible && villas.length > 0) {
      if (selectedVilla) {
        const index = villas.findIndex(v => v._id === selectedVilla._id);
        setCurrentIndex(index >= 0 ? index : 0);
        setTempAcSelection(acStatus);
      } else {
        setCurrentIndex(0);
        setTempAcSelection(null);
      }
    }
  }, [isVisible, villas, selectedVilla, acStatus]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : villas.length - 1));
    setTempAcSelection(null);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < villas.length - 1 ? prev + 1 : 0));
    setTempAcSelection(null);
  };

  const handleAcSelect = (value) => {
    setTempAcSelection(value);
  };

  const handleConfirmSelection = () => {
    const villa = villas[currentIndex];
    
    // If villa has only one price option, auto-select it
    const hasWithAC = villa.villaBasePrice?.withAC !== undefined;
    const hasWithoutAC = villa.villaBasePrice?.withoutAC !== undefined;
    
    let finalAcStatus = tempAcSelection;
    
    if (hasWithAC && !hasWithoutAC) {
      finalAcStatus = 1;
    } else if (!hasWithAC && hasWithoutAC) {
      finalAcStatus = 0;
    }

    if (finalAcStatus === null) {
      alert('Please select AC or Non-AC option');
      return;
    }

    // Update parent state
    onAcToggle(finalAcStatus);
    onVillaSelect(villa);

    // Save to localStorage
    const currentRoomSelection = bookingStorage.getRoomSelection() || {};
    bookingStorage.saveRoomSelection({
      ...currentRoomSelection,
      villaId: villa._id,
      acStatus: finalAcStatus
    });

    console.log('✓ Villa and AC status saved to localStorage:', {
      villaId: villa._id,
      villaName: villa.villaName,
      acStatus: finalAcStatus
    });

    onClose();
  };

  const currentVilla = villas[currentIndex];

  if (!isVisible) return null;

  return (
    <Modal isVisible={isVisible} onClose={onClose} width="max-w-4xl">
      <div className="relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 z-10 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6 border-b pb-4">
          <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <FaBuilding className="w-6 h-6 text-blue-500" />
            Select Your Villa
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Browse through available villas and select AC/Non-AC preference
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading villas...</span>
          </div>
        ) : villas.length === 0 ? (
          <div className="text-center py-12">
            <FaBuilding className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No villas available</p>
            <p className="text-sm text-gray-400 mt-2">Please check your date selection or company</p>
          </div>
        ) : (
          <>
            {/* Carousel Navigation Counter */}
            <div className="text-center mb-4">
              <span className="text-sm font-medium text-gray-600">
                Villa {currentIndex + 1} of {villas.length}
              </span>
            </div>

            {/* Carousel Container */}
            <div className="relative">
              {/* Previous Button */}
              <button
                onClick={handlePrevious}
                disabled={villas.length <= 1}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white border-2 border-gray-300 rounded-full p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>

              {/* Villa Card */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200 shadow-xl">
                {/* Villa Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h4 className="text-2xl font-bold text-gray-800 mb-1">
                      {currentVilla.villaName}
                    </h4>
                    <p className="text-sm text-gray-500 font-mono">{currentVilla.villaId}</p>
                  </div>

                  {/* Capacity Badge */}
                  {currentVilla.maxCapacity !== undefined && (
                    <div className="flex items-center gap-2 bg-purple-100 border border-purple-300 rounded-lg px-3 py-2">
                      <Users className="w-5 h-5 text-purple-600" />
                      <span className="font-semibold text-purple-900">
                        {currentVilla.maxCapacity} {currentVilla.maxCapacity === 1 ? 'Person' : 'Persons'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Villa Location */}
                {currentVilla.villaLocation && (
                  <div className="flex items-center gap-2 mb-3 text-gray-700">
                    <MapPin className="w-5 h-5 text-red-500" />
                    <span className="text-base">{currentVilla.villaLocation}</span>
                  </div>
                )}

                {/* Villa Description */}
                {currentVilla.description && (
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {currentVilla.description}
                  </p>
                )}

                {/* AC/Non-AC Selection */}
                <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200 mt-4">
                  <h5 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Home className="w-5 h-5 text-blue-500" />
                    Select Room Type <span className="text-red-500">*</span>
                  </h5>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* AC Option */}
                    {currentVilla.villaBasePrice?.withAC !== undefined && (
                      <button
                        onClick={() => handleAcSelect(1)}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          tempAcSelection === 1
                            ? 'border-blue-600 bg-blue-50 shadow-lg scale-105'
                            : 'border-gray-300 bg-white hover:border-blue-400 hover:shadow-md'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-gray-800 flex items-center gap-2">
                            <Home className="w-4 h-4 text-blue-500" />
                            Air Conditioned
                          </span>
                          {tempAcSelection === 1 && (
                            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                              ✓ Selected
                            </span>
                          )}
                        </div>
                        <p className="text-2xl font-bold text-blue-600">
                          LKR {currentVilla.villaBasePrice.withAC}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">per night</p>
                      </button>
                    )}

                    {/* Non-AC Option */}
                    {currentVilla.villaBasePrice?.withoutAC !== undefined && (
                      <button
                        onClick={() => handleAcSelect(0)}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          tempAcSelection === 0
                            ? 'border-green-600 bg-green-50 shadow-lg scale-105'
                            : 'border-gray-300 bg-white hover:border-green-400 hover:shadow-md'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-gray-800 flex items-center gap-2">
                            <Home className="w-4 h-4 text-green-500" />
                            Non-AC
                          </span>
                          {tempAcSelection === 0 && (
                            <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                              ✓ Selected
                            </span>
                          )}
                        </div>
                        <p className="text-2xl font-bold text-green-600">
                          LKR {currentVilla.villaBasePrice.withoutAC}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">per night</p>
                      </button>
                    )}
                  </div>

                  {tempAcSelection === null && (
                    <p className="text-sm text-red-600 mt-3 flex items-center gap-2">
                      <span className="text-red-500">⚠️</span>
                      Please select a room type to continue
                    </p>
                  )}
                </div>
              </div>

              {/* Next Button */}
              <button
                onClick={handleNext}
                disabled={villas.length <= 1}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white border-2 border-gray-300 rounded-full p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all"
              >
                <ChevronRight className="w-6 h-6 text-gray-700" />
              </button>
            </div>

            {/* Carousel Dots Indicator */}
            {villas.length > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {villas.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentIndex(index);
                      setTempAcSelection(null);
                    }}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentIndex
                        ? 'bg-blue-600 w-8'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSelection}
                disabled={tempAcSelection === null}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Selection
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default SelectVillaModal;
