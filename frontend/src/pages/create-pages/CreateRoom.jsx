import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import CreateVillaModal from '../../components/modals/CreateVillaModal';
import ConfirmRoomCreationModal from '../../components/modals/ConfirmRoomCreationModal';
import Toaster from '../../components/common/Toaster';

const CreateRoom = () => {
  const navigate = useNavigate();
  
  const [villas, setVillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedVillaId, setSelectedVillaId] = useState('');
  const [showCreateVillaModal, setShowCreateVillaModal] = useState(false);
  const [generatedRoomId, setGeneratedRoomId] = useState('');
  const [roomIdLoading, setRoomIdLoading] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [villaRooms, setVillaRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  
  // Toast state
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  const amenitiesList = [
    "AC",
    "Wi-Fi",
    "Television",
    "Mini Fridge",
    "Sounds Setup",
  ];

  const roomTypes = [
    { value: "bedroom", label: "Bedroom" },
    { value: "living room", label: "Living Room" },
    { value: "kitchen", label: "Kitchen" },
    { value: "bathroom", label: "Bathroom" },
    { value: "other", label: "Other" }
  ];

  const [formData, setFormData] = useState({
    roomName: '',
    roomId: '',
    type: '',
    bedroomType: '',
    amenities: '',
    capacity: '',
    basePrice: '',
    status: 'available',
    villaId: '',
  });

  useEffect(() => {
    const fetchVillas = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setVillas([]);
          setLoading(false);
          return;
        }
        const decoded = jwtDecode(token);
        const adminId = decoded.id;

        // get admin to find companyId
        const adminRes = await axios.get(`/api/admin/${adminId}`);
        const companyId = adminRes.data.companyId?._id || adminRes.data.companyId;

        const villasRes = await axios.get('/api/villas/all');
        const filtered = villasRes.data.filter(
          (v) => v.companyId === companyId || v.companyId?._id === companyId
        );
        setVillas(filtered);
      } catch (err) {
        console.error('Failed to load villas', err);
        setVillas([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVillas();
  }, []);

  // Fetch next room ID when villa is selected
  useEffect(() => {
    const fetchNextRoomId = async () => {
      if (!formData.villaId) {
        setGeneratedRoomId('');
        return;
      }
      setRoomIdLoading(true);
      try {
        const res = await axios.get(`/api/rooms/next-id/${formData.villaId}`);
        if (res.data?.nextRoomId) {
          setGeneratedRoomId(res.data.nextRoomId);
        }
      } catch (err) {
        console.error('Failed to fetch next room ID', err);
        setGeneratedRoomId('');
      } finally {
        setRoomIdLoading(false);
      }
    };
    fetchNextRoomId();
  }, [formData.villaId]);

  // Fetch villa rooms when villa is selected
  useEffect(() => {
    const fetchVillaRooms = async () => {
      if (!formData.villaId) {
        setVillaRooms([]);
        return;
      }
      setLoadingRooms(true);
      try {
        const res = await axios.get('/api/rooms/all');
        const filtered = res.data.filter(room => room.villaId === formData.villaId);
        setVillaRooms(filtered);
      } catch (err) {
        console.error('Failed to fetch villa rooms', err);
        setVillaRooms([]);
      } finally {
        setLoadingRooms(false);
      }
    };
    fetchVillaRooms();
  }, [formData.villaId]);

  const handleVillaSelect = (villa) => {
    setSelectedVillaId(villa._id);
    setFormData((p) => ({ ...p, villaId: villa._id }));
  };

  // callback when modal creates a villa
  const handleVillaCreated = (newVilla) => {
    if (!newVilla) return;
    // add to list and select it
    setVillas((prev) => [newVilla, ...prev]);
    setSelectedVillaId(newVilla._id);
    setFormData((p) => ({ ...p, villaId: newVilla._id }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    
    // Reset bedroom-specific fields when type changes away from bedroom
    if (name === 'type' && value !== 'bedroom') {
      setFormData((p) => ({ ...p, bedroomType: '', capacity: '', basePrice: '' }));
    }
  };

  const handleTypeSelect = (type) => {
    setFormData((p) => ({ ...p, type }));
    
    // Reset bedroom-specific fields when type changes away from bedroom
    if (type !== 'bedroom') {
      setFormData((p) => ({ ...p, bedroomType: '', capacity: '', basePrice: '' }));
    }
  };

  const toggleAmenity = (amenity) => {
    setSelectedAmenities((prev) => {
      if (prev.includes(amenity)) {
        return prev.filter((a) => a !== amenity);
      } else {
        return [...prev, amenity];
      }
    });
  };

  const incrementCapacity = () => {
    setFormData((p) => ({
      ...p,
      capacity: p.capacity === '' ? 1 : Math.min(parseInt(p.capacity) + 1, 99)
    }));
  };

  const decrementCapacity = () => {
    setFormData((p) => ({
      ...p,
      capacity: p.capacity === '' ? 0 : Math.max(parseInt(p.capacity) - 1, 0)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.roomName || !formData.villaId) {
      setMessage('Room name and villa are required.');
      return;
    }
    // Open confirmation modal instead of directly creating
    setShowConfirmModal(true);
  };

  const handleConfirmCreate = async () => {
    setSubmitLoading(true);
    try {
      // Prepare data - only include bedroom fields if type is bedroom
      const submitData = {
        roomName: formData.roomName,
        roomId: generatedRoomId,
        type: formData.type,
        amenities: selectedAmenities.join(', '),
        status: formData.status,
        villaId: formData.villaId,
      };

      // Only add bedroom-specific fields if type is bedroom
      if (formData.type === 'bedroom') {
        if (formData.bedroomType) {
          submitData.bedroomType = formData.bedroomType;
        }
        if (formData.capacity) {
          submitData.capacity = parseInt(formData.capacity);
        }
        if (formData.basePrice) {
          submitData.basePrice = parseFloat(formData.basePrice);
        }
      }

      await axios.post('/api/rooms/create', submitData);
      
      // Close modal
      setShowConfirmModal(false);
      
      // Show success toast
      setToast({
        show: true,
        message: `Room "${formData.roomName}" created successfully!`,
        type: 'success'
      });
      
      // Wait for toast to be visible then navigate
      setTimeout(() => {
        navigate('/create-room');
        // Force page refresh to reset state
        window.location.reload();
      }, 2000);
      
    } catch (err) {
      setShowConfirmModal(false);
      setToast({
        show: true,
        message: err.response?.data?.message || 'Failed to create room.',
        type: 'error'
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const selectedVilla = villas.find(v => v._id === selectedVillaId);

  return (
    <div className="min-h-screen bg-gray-100">

      <div className="mx-auto">

        <h2 className="text-2xl font-semibold py-2">Create Room</h2>
        <div className="flex flex-col lg:flex-row gap-6 h-full">
          
          {/* Left Column - Form */}
          <div className="flex-1 bg-white p-6 rounded-lg shadow-md flex flex-col">
            

            <div className="space-y-4 flex-1">
              {/* Villa Selection */}
              <div>
                <label className="block font-medium mb-1">Select Villa</label>
                <div className="grid grid-cols-5 gap-2 mb-2 max-h-32 overflow-y-auto">
                  {loading ? (
                    <div className="col-span-3 text-center text-gray-500">Loading villas...</div>
                  ) : (
                    <>
                      {villas.length === 0 ? (
                        <div className="col-span-3 text-center text-gray-500">No villas available</div>
                      ) : (
                        villas.map((villa) => (
                          <button
                            key={villa._id}
                            type="button"
                            onClick={() => handleVillaSelect(villa)}
                            className={`px-4 py-2 rounded border text-xs ${
                              selectedVillaId === villa._id
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100'
                            }`}
                          >
                            {villa.villaName} ({villa.villaId})
                          </button>
                        ))
                      )}
                      <button
                        type="button"
                        onClick={() => setShowCreateVillaModal(true)}
                        className="px-3 py-2 rounded border text-sm bg-green-50 text-green-800 border-green-200 hover:bg-green-100"
                      >
                        + Create Villa
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Room Type Selection as Buttons */}
              <div>
                <label className="block font-medium mb-1">Room Type</label>
                <div className="grid grid-cols-5 gap-2 mb-2">
                  {roomTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      className={`px-4 py-2 rounded border text-sm ${
                        formData.type === type.value
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100'
                      }`}
                      onClick={() => handleTypeSelect(type.value)}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Room Name & Room ID */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block font-medium mb-1">Room Name</label>
                  <input
                    name="roomName"
                    value={formData.roomName}
                    onChange={handleChange}
                    placeholder="Enter room name"
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring"
                    required
                  />
                </div>

                <div className="flex-1">
                  <label className="block font-medium mb-1">Room ID</label>
                  <div className="w-full px-4 py-2 border rounded-md bg-gray-50 text-gray-600 flex items-center">
                    {roomIdLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        Generating...
                      </div>
                    ) : (
                      <span className="font-mono text-md">{generatedRoomId || 'Select villa first'}</span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">
                    {generatedRoomId ? 'Next available room ID' : 'Auto-generated after villa selection'}
                  </p>
                </div>
              </div>

              {/* Bedroom Type and Capacity - Only visible when type is bedroom */}
              {formData.type === 'bedroom' && (
                <div className="grid grid-cols-3 gap-10">
                  <div className="col-span-2">
                    <label className="block font-medium mb-2">Bedroom Type (Optional)</label>
                    <div className="grid grid-cols-4 gap-2">
                      {["single", "double", "king", "suite"].map((bt) => (
                        <button
                          key={bt}
                          type="button"
                          className={`px-3 py-2 rounded border text-xs text-center ${
                            formData.bedroomType === bt
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-50"
                          }`}
                          onClick={() => setFormData((p) => ({ ...p, bedroomType: bt }))}
                        >
                          {bt.charAt(0).toUpperCase() + bt.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-1">
                    <label className="block font-medium mb-1">Capacity (Optional)</label>

                    {/* Updated capacity control (matches provided quantity UI) */}
                    <div className="relative flex items-center ">
                      <button
                        type="button"
                        onClick={decrementCapacity}
                        className="bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-l-lg p-3 focus:ring-2 focus:outline-none"
                        aria-label="Decrease capacity"
                      >
                        <svg className="w-3 h-3 text-gray-900" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 2">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h16"/>
                        </svg>
                      </button>

                      <input
                        id="capacity-input"
                        name="capacity"
                        type="number"
                        min={0}
                        max={99}
                        value={formData.capacity === '' ? '' : formData.capacity}
                        onChange={(e) => {
                          const val = e.target.value;
                          // allow empty string to represent unset optional field
                          if (val === '') {
                            setFormData((p) => ({ ...p, capacity: '' }));
                            return;
                          }
                          // clamp and store numeric value
                          let num = parseInt(val, 10);
                          if (Number.isNaN(num)) {
                            num = '';
                          } else {
                            num = Math.max(0, Math.min(99, num));
                          }
                          setFormData((p) => ({ ...p, capacity: num }));
                        }}
                        className="bg-gray-50 border-x-0 border-gray-300  text-center text-gray-900 text-sm block w-full py-2.5"
                        placeholder="0"
                        aria-describedby="capacity-helper"
                      />

                      <button
                        type="button"
                        onClick={incrementCapacity}
                        className="bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-r-lg p-3 focus:ring-2 focus:outline-none"
                        aria-label="Increase capacity"
                      >
                        <svg className="w-3 h-3 text-gray-900" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 1v16M1 9h16"/>
                        </svg>
                      </button>
                    </div>

            
                  </div>
                </div>
              )}

              {/* Amenities */}
              <div>
                <label className="block font-medium mb-1">Amenities</label>
                <div className="grid grid-cols-5 gap-2 mb-2">
                  {amenitiesList.map((amenity) => (
                    <button
                      key={amenity}
                      type="button"
                      className={`px-4 py-2 rounded border text-xs ${
                        selectedAmenities.includes(amenity)
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"
                      }`}
                      onClick={() => toggleAmenity(amenity)}
                    >
                      {amenity}
                    </button>
                  ))}
                </div>
                {selectedAmenities.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Selected: {selectedAmenities.join(', ')}
                  </p>
                )}
              </div>

              {/* Status and Base Price Row */}
              <div className="flex flex-col md:flex-row gap-4">
                {/* Status */}
                <div className={formData.type === 'bedroom' ? 'flex-2' : 'flex-1'}>
                  <label className="block font-mono mb-1">Status</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {["available", "occupied", "maintenance"].map((status) => (
                      <button
                        key={status}
                        type="button"
                        className={`px-4 py-2 rounded border text-sm ${
                          formData.status === status
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"
                        }`}
                        onClick={() => setFormData((p) => ({ ...p, status }))}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Base Price - Only visible when type is bedroom */}
                {formData.type === 'bedroom' && (
                  <div className="flex-1">
                    <label className="block font-medium mb-1">Base Price (Optional)</label>
                    <div className="relative">
                      <input
                        type="number"
                        name="basePrice"
                        value={formData.basePrice}
                        onChange={handleChange}
                        min="0"
                        step="1"
                        placeholder="0.00"
                        className="w-full px-4 py-2 pr-16 border rounded-md focus:outline-none focus:ring"
                      />
                      <span className="absolute right-4 top-2.5 text-gray-500">LKR</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Per night rate</p>
                  </div>
                )}
              </div>

              {message && <div className="text-sm text-center text-gray-700">{message}</div>}
            </div>
          </div>

          {/* Right Column - Preview & Existing Rooms */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              {/* Preview */}
              <div className="flex-1 bg-white p-8 rounded-lg shadow-md">
                <h3 className="text-md font-semibold mb-6">Room Preview</h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-sm text-gray-700">Villa</h4>
                    <p className={`text-medium ${!selectedVilla ? 'bg-yellow-100 px-2 py-1 rounded' : ''}`}>
                      {selectedVilla ? `${selectedVilla.villaName} (${selectedVilla.villaId})` : 'Not selected'}
                    </p>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-sm text-gray-700">Room ID</h4>
                    <p className={`text-medium font-mono ${!generatedRoomId ? 'bg-yellow-100 px-2 py-1 rounded' : ''}`}>
                      {generatedRoomId || 'Not generated'}
                    </p>
                  </div>

                  <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-sm text-gray-700">Room Name</h4>
                    <p className={`text-medium ${!formData.roomName ? 'bg-yellow-100 px-2 py-1 rounded' : ''}`}>
                      {formData.roomName || 'Not specified'}
                    </p>
                  </div>

                  <div className="border-l-4 border-orange-500 pl-4">
                    <h4 className="font-sm text-gray-700">Type</h4>
                    <p className={`text-medium capitalize ${!formData.type ? 'bg-yellow-100 px-2 py-1 rounded' : ''}`}>
                      {formData.type || 'Not specified'}
                    </p>
                  </div>

                  {formData.bedroomType && (
                    <div className="border-l-4 border-pink-500 pl-4">
                      <h4 className="font-sm text-gray-700">Bedroom Type</h4>
                      <p className="text-medium capitalize">{formData.bedroomType}</p>
                    </div>
                  )}

                  {formData.capacity && formData.capacity > 0 && (
                    <div className="border-l-4 border-indigo-500 pl-4">
                      <h4 className="font-sm text-gray-700">Capacity</h4>
                      <p className="text-medium">{formData.capacity} person(s)</p>
                    </div>
                  )}

                  {formData.basePrice && formData.basePrice > 0 && (
                    <div className="border-l-4 border-emerald-500 pl-4">
                      <h4 className="font-sm text-gray-700">Base Price</h4>
                      <p className="text-medium">LKR {parseFloat(formData.basePrice).toFixed(2)} per night</p>
                    </div>
                  )}

                  <div className="border-l-4 border-teal-500 pl-4">
                    <h4 className="font-sm text-gray-700">Amenities</h4>
                    {selectedAmenities.length > 0 ? (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {selectedAmenities.map((amenity, idx) => (
                          <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-medium text-gray-500">No amenities</p>
                    )}
                  </div>

                  <div className="border-l-4 border-yellow-500 pl-4">
                    <h4 className="font-sm text-gray-700">Status</h4>
                    <span className={`inline-block px-2 py-1 text-sm rounded ${
                      formData.status === 'available' ? 'bg-green-100 text-green-800' :
                      formData.status === 'occupied' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {formData.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Existing Rooms */}
              <div className="flex-1 bg-white px-4 py-8 rounded-lg shadow-md flex flex-col">
                <div className="flex-1">
                  {!selectedVillaId ? (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">Instructions</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Select a villa to view its rooms</li>
                        <li>• Choose room type by clicking the buttons</li>
                        <li>• Room ID will be auto-generated</li>
                        <li>• Enter room name</li>
                        <li>• Configure bedroom-specific options if needed</li>
                        <li>• Select amenities and status</li>
                      </ul>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-md font-semibold mb-6">
                        Existing Rooms in {selectedVilla?.villaName}
                      </h3>
                      
                      {loadingRooms ? (
                        <div className="flex items-center justify-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                          <span className="ml-2 text-gray-600">Loading rooms...</span>
                        </div>
                      ) : villaRooms.length > 0 ? (
                        <div className="space-y-2  overflow-y-auto max-h-112 ">
                          {villaRooms.map((room) => (
                            <div key={room._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-1 text-xs rounded font-medium ${
                                    room.type === 'bedroom' ? 'bg-blue-100 text-blue-800' :
                                    room.type === 'living room' ? 'bg-green-100 text-green-800' :
                                    room.type === 'kitchen' ? 'bg-yellow-100 text-yellow-800' :
                                    room.type === 'bathroom' ? 'bg-purple-100 text-purple-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {room.type}
                                  </span>
                                  <span className="font-mono text-sm text-gray-600">{room.roomId}</span>
                                </div>
                                <p className="font-medium text-gray-800">{room.roomName}</p>
                                {room.bedroomType && (
                                  <p className="text-xs text-gray-600">Type: {room.bedroomType}</p>
                                )}
                              </div>
                              <span className={`px-2 py-1 text-xs rounded ${
                                room.status === 'available' ? 'bg-green-100 text-green-800' :
                                room.status === 'occupied' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {room.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>No rooms found in this villa</p>
                          <p className="text-sm mt-1">This will be the first room</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
            >
              Create Room
            </button>
          </div>

        </div>
      </div>

      <CreateVillaModal
        isOpen={showCreateVillaModal}
        onClose={() => setShowCreateVillaModal(false)}
        onCreated={handleVillaCreated}
      />

      <ConfirmRoomCreationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmCreate}
        roomData={{
          roomId: generatedRoomId,
          roomName: formData.roomName,
          type: formData.type,
          bedroomType: formData.bedroomType,
          capacity: formData.capacity,
          basePrice: formData.basePrice,
          amenities: selectedAmenities.join(', '),
          status: formData.status,
        }}
        villaName={selectedVilla?.villaName}
        loading={submitLoading}
      />

      {/* Toast Notification */}
      <Toaster
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
        duration={3000}
        position="top-right"
      />
    </div>
  );
};

export default CreateRoom;
