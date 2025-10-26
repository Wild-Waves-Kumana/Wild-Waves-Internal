import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import CreateVillaModal from '../../components/modals/CreateVillaModal';

const CreateRoom = () => {
  
  const [villas, setVillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedVillaId, setSelectedVillaId] = useState('');
  const [showCreateVillaModal, setShowCreateVillaModal] = useState(false);
  const [generatedRoomId, setGeneratedRoomId] = useState('');
  const [roomIdLoading, setRoomIdLoading] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  const amenitiesList = [
    "Air Conditioning",
    "Wi-Fi",
    "Television",
    "Mini Fridge",
    "Sounds Setup",
  ];

  const [formData, setFormData] = useState({
    roomName: '',
    roomId: '',
    type: '',
    bedroomType: '',
    amenities: '', // will be converted from selectedAmenities
    capacity: '',
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
      setFormData((p) => ({ ...p, bedroomType: '', capacity: '' }));
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
      }

      await axios.post('/api/rooms/create', submitData);
      setMessage('Room created successfully.');
      
      // Reset form
      setFormData({
        roomName: '',
        roomId: '',
        type: '',
        bedroomType: '',
        amenities: '',
        capacity: '',
        status: 'available',
        villaId: '',
      });
      setSelectedVillaId('');
      setGeneratedRoomId('');
      setSelectedAmenities([]);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to create room.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Create Room</h2>

          <label className="block font-medium mb-2">Select Villa</label>
          <div className="grid grid-cols-5 gap-2 mb-4 max-h-32 overflow-y-auto">
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
                      className={`px-3 py-2 rounded border text-sm text-left ${
                        selectedVillaId === villa._id
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-50'
                      }`}
                    >
                      <div className="font-medium">{villa.villaName}</div>
                      <div className="text-xs text-gray-500 mt-1">{villa.villaId}</div>
                    </button>
                  ))
                )}

                {/* Create Villa button */}
                <button
                  type="button"
                  onClick={() => setShowCreateVillaModal(true)}
                  className="px-3 py-2 rounded border text-sm flex flex-col items-start justify-center bg-green-50 text-green-800 border-green-200 hover:bg-green-100"
                >
                  <div className="font-medium">+ Create Villa</div>
                  <div className="text-xs text-green-600 mt-1">Add new villa</div>
                </button>
              </>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">Select type</option>
                  <option value="bedroom">Bedroom</option>
                  <option value="living room">Living Room</option>
                  <option value="kitchen">Kitchen</option>
                  <option value="bathroom">Bathroom</option>
                  <option value="other">Other</option>
                </select>
              </div>
              {/* Generated Room ID Display */}
              <div>
                <label className="block text-sm font-medium mb-1">Room ID</label>
                <div className="w-full px-3 py-2 border rounded-md bg-gray-50 text-gray-700 flex items-center">
                  {roomIdLoading ? (
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      Generating...
                    </div>
                  ) : (
                    <span className="font-mono text-lg">{generatedRoomId || 'Select villa first'}</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {generatedRoomId ? 'Next available room ID' : 'Auto-generated after villa selection'}
                </p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Room Name</label>
              <input
                name="roomName"
                value={formData.roomName}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>

            {/* Bedroom Type and Capacity - Only visible when type is bedroom */}
            {formData.type === 'bedroom' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Bedroom Type (Optional)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["single", "double", "queen", "king", "suite"].map((bt) => (
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
                <div>
                  <label className="block text-sm font-medium mb-1">Capacity (Optional)</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={decrementCapacity}
                      className="px-3 py-2 border rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
                    >
                      −
                    </button>
                    <input 
                      name="capacity" 
                      type="number"
                      value={formData.capacity}
                      onChange={handleChange}
                      min="0"
                      max="99"
                      className="flex-1 px-3 py-2 border rounded text-center" 
                      placeholder="0"
                    />
                    <button
                      type="button"
                      onClick={incrementCapacity}
                      className="px-3 py-2 border rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Amenities</label>
              <div className="grid grid-cols-5 gap-2">
                {amenitiesList.map((amenity) => (
                  <button
                    key={amenity}
                    type="button"
                    className={`px-3 py-2 rounded border text-sm text-center ${
                      selectedAmenities.includes(amenity)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-50"
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

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border rounded">
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            {message && <div className="text-sm text-center text-gray-700">{message}</div>}

            <div className="pt-2">
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                Create Room
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Create Villa Modal */}
      <CreateVillaModal
        isOpen={showCreateVillaModal}
        onClose={() => setShowCreateVillaModal(false)}
        onCreated={handleVillaCreated}
      />
    </div>
  );
};

export default CreateRoom;
