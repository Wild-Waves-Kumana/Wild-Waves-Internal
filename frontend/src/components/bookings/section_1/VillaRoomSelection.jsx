import React from 'react';
import { Users, MapPin, Home } from 'lucide-react';
import { FaBuilding } from 'react-icons/fa';

const VillaRoomSelection = ({
  selectedDates,
  selectedCompany,
  selectedVilla,
  loading,
  villas,
  acStatus,
  handleVillaSelect,
  loadingRooms,
  rooms,
  isRoomSelected,
  handleRoomToggle,
  handleBackToVillas
}) => {
  // Filter to show only bedrooms
  const bedrooms = rooms.filter(room => room.type === 'bedroom');

  return (
    <>
      {/* Villa Selection Section */}
      {selectedDates.length > 0 && selectedCompany && !selectedVilla && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaBuilding className="w-5 h-5 text-blue-500" />
            Available Villas
          </h3>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-sm text-gray-600">Loading villas...</span>
            </div>
          ) : villas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {villas.map((villa) => (
                <div
                  key={villa._id}
                  className="border border-slate-400 rounded-lg p-4 hover:shadow-lg transition-shadow bg-white"
                >
                  {/* Villa Header */}
                  <div className="mb-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg text-gray-800">{villa.villaName}</h4>
                        <p className="text-xs text-gray-500">{villa.villaId}</p>
                      </div>

                      {/* AC and Capacity Badges */}
                        <div className="flex items-center gap-1">
                        {villa.hasAC && (
                            <span className="flex items-center text-xs gap-1 bg-blue-50 border border-blue-200 rounded-md px-2 py-1 text-blue-700 font-medium">
                            <Home className="w-3 h-3" />
                            AC Available
                            </span>
                        )}
                        {villa.maxCapacity !== undefined && (
                            <span className="flex items-center gap-1 text-xs bg-purple-50 border border-purple-200 rounded-md px-2 py-1">
                            <Users className="w-3 h-3 text-purple-600" />
                            <span className="font-semibold text-purple-900">
                                {villa.maxCapacity} {villa.maxCapacity === 1 ? 'Person' : 'Persons'}
                            </span>
                            </span>
                        )}
                        </div>
                    </div>

                    
                  </div>
                  
                  {/* Villa Location */}
                  {villa.villaLocation && (
                    <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span>{villa.villaLocation}</span>
                    </div>
                  )}
                  
                  {/* Villa Description */}
                  {villa.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {villa.description}
                    </p>
                  )}
                  
                  {/* Villa Pricing */}
                  {villa.villaBasePrice && (
                    <div className="border-t border-slate-300 pt-3 mt-3">
                      <p className="text-xs font-medium text-gray-700 mb-2">Base Price per Night:</p>
                      <div className="flex gap-2 flex-wrap items-center">
                        {villa.villaBasePrice.withAC !== undefined && (
                          <div className={`text-sm px-3 py-1.5 rounded-lg border transition-all ${
                            acStatus === 1 
                              ? 'bg-gray-100 text-gray-700 border-gray-300' 
                              : 'bg-gray-100 text-gray-700 border-gray-300'
                          }`}>
                            <span className="text-xs">AC</span>
                            <span className="ml-2">LKR {villa.villaBasePrice.withAC}</span>
                          </div>
                        )}
                        {villa.villaBasePrice.withoutAC !== undefined && (
                          <div className={`text-sm px-3 py-1.5 rounded-lg border transition-all ${
                            acStatus === 0 
                              ? 'bg-gray-100 text-gray-700 border-gray-300' 
                              : 'bg-gray-100 text-gray-700 border-gray-300'
                          }`}>
                            <span className="text-xs">Non-AC</span>
                            <span className="ml-2">LKR {villa.villaBasePrice.withoutAC}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Select Button */}
                  <button
                    type="button"
                    onClick={() => handleVillaSelect(villa)}
                    className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
                  >
                    Select Villa
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FaBuilding className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-500 font-medium">No villas available for the selected company</p>
            </div>
          )}
        </div>
      )}

      {/* Room Selection Section - Only Bedrooms */}
      {selectedVilla && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Home className="w-5 h-5 text-purple-500" />
              Bedrooms in {selectedVilla.villaName}
            </h3>
            <button
              onClick={handleBackToVillas}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium underline"
            >
              ← Back to Villas
            </button>
          </div>
          
          {loadingRooms ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-sm text-gray-600">Loading bedrooms...</span>
            </div>
          ) : bedrooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bedrooms.map((room) => {
                const selected = isRoomSelected(room._id);
                return (
                  <div
                    key={room._id}
                    className={`border rounded-lg p-4 transition-all ${
                      selected 
                        ? 'border-green-500 bg-green-50 shadow-lg' 
                        : 'border-slate-400 bg-white hover:shadow-lg'
                    }`}
                  >
                    {/* Room Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg text-gray-800">{room.roomName}</h4>
                        <p className="text-xs text-gray-500">{room.roomId}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                        room.status === 'available' 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {room.status}
                      </span>
                    </div>

                    {/* Room Details */}
                    <div className="flex justify-between space-y-2 mb-3">
                      {room.bedroomType && (
                        <div className="flex gap-2 items-center justify-between text-sm">
                          <span className="font-medium text-gray-700">Bedroom Type:  </span>
                          <span className="text-gray-600">{room.bedroomType}</span>
                        </div>
                      )}

                      {room.capacity && (
                        <div className="flex items-center justify-between text-sm  ">
                          {/* <span className="font-medium text-purple-700">Capacity:</span> */}
                          <span className="flex items-center gap-1 text-purple-900 font-semibold">
                            <Users className="w-3 h-3" />
                            {room.capacity} {room.capacity === 1 ? 'person' : 'persons'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Amenities */}
                    {room.amenities && room.amenities.length > 0 && (
                      <div className="mb-3">
                        {/* <p className="text-xs font-medium text-gray-700 mb-1">Amenities:</p> */}
                        <div className="flex flex-wrap gap-1">
                          {room.amenities.map((amenity, idx) => (
                            <span 
                              key={idx} 
                              className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded border border-gray-300"
                            >
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Room Price */}
                    {room.roomBasePrice && (
                      <div className="border-t border-slate-300 pt-3 mt-3">
                        <p className="text-xs font-medium text-gray-700 mb-1">Base Price per Night:</p>
                        <p className="text-lg font-semibold text-green-600">
                          LKR {room.roomBasePrice}
                        </p>
                      </div>
                    )}

                    {/* Select Button */}
                    <button
                      type="button"
                      onClick={() => handleRoomToggle(room)}
                      disabled={room.status !== 'available'}
                      className={`w-full mt-3 py-2 rounded-lg transition-colors text-sm font-medium shadow-sm ${
                        selected
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : room.status === 'available'
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-400 text-white cursor-not-allowed'
                      }`}
                    >
                      {selected ? '✓ Selected' : room.status === 'available' ? 'Select Room' : 'Not Available'}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Home className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-500 font-medium">No bedrooms available in this villa</p>
              <p className="text-xs text-gray-400 mt-1">for the selected company</p>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default VillaRoomSelection;