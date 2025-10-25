import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import CreateVillaModal from '../../components/modals/CreateVillaModal';

const CreateRoom = () => {
  const navigate = useNavigate();
  const [villas, setVillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedVillaId, setSelectedVillaId] = useState('');
  const [showCreateVillaModal, setShowCreateVillaModal] = useState(false);

  const [formData, setFormData] = useState({
    roomName: '',
    roomId: '',
    type: '',
    bedroomType: '',
    amenities: '', // comma separated
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.roomName || !formData.villaId) {
      setMessage('Room name and villa are required.');
      return;
    }
    try {
      await axios.post('/api/rooms/create', {
        ...formData,
        amenities: formData.amenities, // backend will parse string to array if needed
      });
      setMessage('Room created successfully.');
      // optional: navigate back to villa page or reset form
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
          <div className="grid grid-cols-3 gap-2 mb-4 max-h-32 overflow-y-auto">
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

                {/* Create Villa button shown as last grid item — open modal */}
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Room ID (optional)</label>
                <input name="roomId" value={formData.roomId} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
              </div>
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Bedroom Type</label>
                <div className="grid grid-cols-5 gap-2">
                  {["single", "double", "queen", "king", "suite"].map((bt) => (
                    <button
                      key={bt}
                      type="button"
                      className={`px-3 py-2 rounded border text-sm text-center ${
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
                <label className="block text-sm font-medium mb-1">Capacity</label>
                <input name="capacity" value={formData.capacity} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Amenities (comma separated)</label>
              <input name="amenities" value={formData.amenities} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
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
