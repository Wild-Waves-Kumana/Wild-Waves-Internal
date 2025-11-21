import React from 'react';

const VillaRoomSelection = ({
  selectedDates,
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
  return (
    <>
      {/* Villa Selection Section */}
      {selectedDates.length > 0 && !selectedVilla && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Available Villas</h3>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading villas...</span>
            </div>
          ) : villas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {villas.map((villa) => (
                <div
                  key={villa._id}
                  className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-lg">{villa.villaName}</h4>
                      <p className="text-sm text-gray-500">{villa.villaId}</p>
                      
                    </div>
                    {villa.hasAC && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        AC
                      </span>
                    )}
                  </div>
                  
                  {villa.villaLocation && (
                    <p className="text-sm text-gray-600 mb-2">
                      📍 {villa.villaLocation}
                    </p>
                  )}
                  
                  {villa.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {villa.description}
                    </p>
                  )}
                  
                  {villa.villaBasePrice && (
                    <div className="border-t pt-2 mt-2">
                      <p className="text-xs text-gray-500 mb-1">Base Price per Night:</p>
                      <div className="flex gap-2 flex-wrap items-center">
                        {villa.villaBasePrice.withAC !== undefined && (
                          <span
                            className={`text-sm px-2 py-1 rounded ${
                              acStatus === 1 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            AC: LKR {villa.villaBasePrice.withAC}
                          </span>
                        )}
                        {villa.villaBasePrice.withoutAC !== undefined && (
                          <span
                            className={`text-sm px-2 py-1 rounded ${
                              acStatus === 0 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            Non-AC: LKR {villa.villaBasePrice.withoutAC}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => handleVillaSelect(villa)}
                    className="w-full mt-3 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Select Villa
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No villas available</p>
            </div>
          )}
        </div>
      )}

      {/* Room Selection Section */}
      {selectedVilla && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Rooms in {selectedVilla.villaName}
            </h3>
            <button
              onClick={handleBackToVillas}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              ← Back to Villas
            </button>
          </div>
          
          {loadingRooms ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading rooms...</span>
            </div>
          ) : rooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.map((room) => {
                const selected = isRoomSelected(room._id);
                return (
                  <div
                    key={room._id}
                    className={`border rounded-lg p-4 transition-all ${
                      selected 
                        ? 'border-green-500 bg-green-50 shadow-lg' 
                        : 'hover:shadow-lg'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-lg">{room.roomName}</h4>
                        <p className="text-sm text-gray-500">{room.roomId}</p>
                        <p className="text-xs text-gray-400">ID: {room._id}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        room.status === 'available' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {room.status}
                      </span>
                    </div>

                    <div className="space-y-2 mb-3">
                      <p className="text-sm">
                        <span className="font-medium">Type:</span>{' '}
                        <span className="text-gray-600 capitalize">{room.type}</span>
                      </p>
                      
                      {room.type === 'bedroom' && room.bedroomType && (
                        <p className="text-sm">
                          <span className="font-medium">Bedroom:</span>{' '}
                          <span className="text-gray-600">{room.bedroomType}</span>
                        </p>
                      )}

                      {room.type === 'bedroom' && room.capacity && (
                        <p className="text-sm">
                          <span className="font-medium">Capacity:</span>{' '}
                          <span className="text-gray-600">{room.capacity} persons</span>
                        </p>
                      )}

                      {room.amenities && room.amenities.length > 0 && (
                        <div className="text-sm">
                          <span className="font-medium">Amenities:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {room.amenities.map((amenity, idx) => (
                              <span key={idx} className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">
                                {amenity}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {room.type === 'bedroom' && room.roomBasePrice && (
                      <div className="border-t pt-2 mt-2">
                        <p className="text-xs text-gray-500 mb-1">Base Price per Night:</p>
                        <p className="text-lg font-semibold text-green-600">
                          LKR {room.roomBasePrice}
                        </p>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRoomToggle(room)}
                      disabled={room.status !== 'available'}
                      className={`w-full mt-3 py-2 rounded-md transition-colors text-sm font-medium ${
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
            <div className="text-center text-gray-500">
              <p>No rooms available in this villa</p>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default VillaRoomSelection;