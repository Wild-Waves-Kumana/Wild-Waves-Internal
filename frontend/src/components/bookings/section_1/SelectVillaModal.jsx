import React, { useState, useEffect } from 'react';
import Modal from '../../common/Modal';
import { Users, MapPin } from 'lucide-react';
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
  const [selectedVillaId, setSelectedVillaId] = useState(null);
  const [tempAcSelection, setTempAcSelection] = useState(null);

  // Initialize selection when modal opens
  useEffect(() => {
    if (isVisible) {
      if (selectedVilla) {
        setSelectedVillaId(selectedVilla._id);
        setTempAcSelection(acStatus);
      } else {
        setSelectedVillaId(null);
        setTempAcSelection(null);
      }
    }
  }, [isVisible, selectedVilla, acStatus]);

  const handleVillaClick = (villa) => {
    setSelectedVillaId(villa._id);
    
    // Auto-select AC option if villa has only one
    const hasWithAC = villa.villaBasePrice?.withAC !== undefined;
    const hasWithoutAC = villa.villaBasePrice?.withoutAC !== undefined;
    
    if (hasWithAC && !hasWithoutAC) {
      setTempAcSelection(1);
    } else if (!hasWithAC && hasWithoutAC) {
      setTempAcSelection(0);
    } else {
      setTempAcSelection(null);
    }
  };

  const handleAcSelect = (value) => {
    setTempAcSelection(value);
  };

  const handleConfirmSelection = () => {
    if (!selectedVillaId) {
      alert('Please select a villa');
      return;
    }

    const villa = villas.find(v => v._id === selectedVillaId);
    if (!villa) return;

    if (tempAcSelection === null) {
      alert('Please select AC or Non-AC option');
      return;
    }

    // Update parent state
    onAcToggle(tempAcSelection);
    onVillaSelect(villa);

    // Save to localStorage
    const currentRoomSelection = bookingStorage.getRoomSelection() || {};
    bookingStorage.saveRoomSelection({
      ...currentRoomSelection,
      villaId: villa._id,
      acStatus: tempAcSelection
    });

    console.log('✓ Villa and AC status saved to localStorage:', {
      villaId: villa._id,
      villaName: villa.villaName,
      acStatus: tempAcSelection
    });

    onClose();
  };

  const currentSelectedVilla = villas.find(v => v._id === selectedVillaId);

  return (
    <Modal isVisible={isVisible} onClose={onClose} width="max-w-4xl w-full">
      <div className="relative">
        {/* Modal Header */}
        <div className="mb-4 pb-3 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FaBuilding className="w-5 h-5 text-blue-600" />
            Select Your Villa
          </h3>
          <p className="text-xs text-gray-600 mt-1">
            Choose a villa and select AC/Non-AC preference
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600">Loading villas...</span>
          </div>
        ) : villas.length === 0 ? (
          <div className="text-center py-8">
            <FaBuilding className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 font-medium">No villas available</p>
            <p className="text-xs text-gray-400 mt-1">Please check your date selection or company</p>
          </div>
        ) : (
          <>
            {/* Villa Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[50vh] overflow-y-auto pr-2 mb-4">
              {villas.map((villa) => (
                <div
                  key={villa._id}
                  onClick={() => handleVillaClick(villa)}
                  className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                    selectedVillaId === villa._id
                      ? 'border-blue-600 bg-blue-50 shadow-md'
                      : 'border-gray-300 bg-white hover:border-blue-400 hover:shadow-sm'
                  }`}
                >
                  {/* Villa Header */}
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-800 truncate">
                        {villa.villaName}
                      </h4>
                      <p className="text-xs text-gray-500 font-mono">{villa.villaId}</p>
                    </div>

                    {/* Selection Indicator */}
                    {selectedVillaId === villa._id && (
                      <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium ml-2">
                        ✓
                      </div>
                    )}
                  </div>

                  {/* Villa Location */}
                  {villa.villaLocation && (
                    <div className="flex items-center gap-1 text-gray-700 mb-2">
                      <MapPin className="w-3 h-3 text-red-500 flex-shrink-0" />
                      <span className="text-xs truncate">{villa.villaLocation}</span>
                    </div>
                  )}

                  {/* Capacity */}
                  {villa.maxCapacity !== undefined && (
                    <div className="flex items-center gap-1 bg-gray-100 border border-gray-300 rounded-md px-2 py-1 w-fit">
                      <Users className="w-3 h-3 text-gray-600" />
                      <span className="text-xs font-semibold text-gray-800">
                        {villa.maxCapacity} {villa.maxCapacity === 1 ? 'Person' : 'Persons'}
                      </span>
                    </div>
                  )}

                  {/* Pricing Preview */}
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="text-xs text-gray-600 space-y-0.5">
                      {villa.villaBasePrice?.withAC !== undefined && (
                        <div className="flex justify-between">
                          <span>AC:</span>
                          <span className="font-semibold text-blue-600">
                            LKR {villa.villaBasePrice.withAC.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {villa.villaBasePrice?.withoutAC !== undefined && (
                        <div className="flex justify-between">
                          <span>Non-AC:</span>
                          <span className="font-semibold text-green-600">
                            LKR {villa.villaBasePrice.withoutAC.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* AC/Non-AC Selection Panel */}
            {currentSelectedVilla && (
              <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 mb-4">
                <h5 className="text-sm font-semibold text-gray-800 mb-3">
                  Select Room Type for {currentSelectedVilla.villaName} <span className="text-red-500">*</span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* AC Option */}
                  {currentSelectedVilla.villaBasePrice?.withAC !== undefined && (
                    <label
                      className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        tempAcSelection === 1
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300 bg-white hover:border-blue-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="acSelection"
                          checked={tempAcSelection === 1}
                          onChange={() => handleAcSelect(1)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <div className="font-semibold text-gray-800 text-sm">AC</div>
                          <div className="text-xs text-gray-500">Air Conditioned</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-bold text-blue-600">
                          {currentSelectedVilla.villaBasePrice.withAC.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">LKR/night</div>
                      </div>
                    </label>
                  )}

                  {/* Non-AC Option */}
                  {currentSelectedVilla.villaBasePrice?.withoutAC !== undefined && (
                    <label
                      className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        tempAcSelection === 0
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-300 bg-white hover:border-green-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="acSelection"
                          checked={tempAcSelection === 0}
                          onChange={() => handleAcSelect(0)}
                          className="w-4 h-4 text-green-600 focus:ring-green-500"
                        />
                        <div>
                          <div className="font-semibold text-gray-800 text-sm">Non-AC</div>
                          <div className="text-xs text-gray-500">Natural ventilation</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-bold text-green-600">
                          {currentSelectedVilla.villaBasePrice.withoutAC.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">LKR/night</div>
                      </div>
                    </label>
                  )}
                </div>

                {tempAcSelection === null && (
                  <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                    <span>⚠️</span>
                    Please select a room type to continue
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-3 border-t border-gray-200">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSelection}
                disabled={!selectedVillaId || tempAcSelection === null}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
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
