// src/pages/EquipmentCreate.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import Modal from '../../components/common/Modal';
import Toaster from '../../components/common/Toaster';

const EquipmentCreation = () => {
  const navigate = useNavigate();
  const [villas, setVillas] = useState([]);
  const [selectedVillaRooms, setSelectedVillaRooms] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [generatedItemCode, setGeneratedItemCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdEquipment, setCreatedEquipment] = useState(null);
  const [roomEquipments, setRoomEquipments] = useState([]);
  const [loadingEquipments, setLoadingEquipments] = useState(false);
  
  const [message, setMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState('info');
  const token = localStorage.getItem('token');

  const [formData, setFormData] = useState({
    category: "Doors",
    itemName: "",
    villaId: "",
    roomId: "",
    access: true,
  });

  // Fetch villas for the admin's company
  useEffect(() => {
    const fetchVillas = async () => {
      try {
        if (!token) return;
        const decoded = jwtDecode(token);
        const adminId = decoded.id;

        // Fetch admin details to get companyId
        const adminRes = await axios.get(`/api/admin/${adminId}`);
        const companyId = adminRes.data.companyId?._id || adminRes.data.companyId;

        // Fetch all villas
        const villasRes = await axios.get("/api/villas/all");
        // Filter villas by companyId
        const filteredVillas = villasRes.data.filter(
          (v) =>
            v.companyId === companyId ||
            v.companyId?._id === companyId
        );
        setVillas(filteredVillas);
      } catch (err) {
        setVillas([]);
        console.error("Failed to load villas", err);
      }
    };
    fetchVillas();
  }, [token]);

  // Fetch rooms for all villas on mount
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axios.get("/api/rooms/all");
        setRooms(res.data);
      } catch (err) {
        console.error("Failed to fetch rooms", err);
        setRooms([]);
      }
    };
    fetchRooms();
  }, []);

  // Generate next item code when category changes
  useEffect(() => {
    const generateNextItemCode = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/equipment/next-item-code/${formData.category}`);
        setGeneratedItemCode(response.data.nextItemCode);
      } catch (err) {
        console.error("Failed to generate item code:", err);
        // Fallback to placeholder with hyphen format
        const prefixes = {
          "Doors": "D",
          "Lights": "L", 
          "Air Conditioner": "A",
        };
        const prefix = prefixes[formData.category] || "E";
        setGeneratedItemCode(`${prefix}-0001`);
      } finally {
        setLoading(false);
      }
    };
    generateNextItemCode();
  }, [formData.category]);

  // Fetch room equipments when room is selected
  useEffect(() => {
    const fetchRoomEquipments = async () => {
      if (!formData.roomId) {
        setRoomEquipments([]);
        return;
      }

      setLoadingEquipments(true);
      try {
        // Fetch equipments from all three collections
        const [doorsRes, lightsRes, acsRes] = await Promise.all([
          axios.get('/api/equipment/doors'),
          axios.get('/api/equipment/lights'),
          axios.get('/api/equipment/air-conditioners')
        ]);

        // Filter equipments by selected room
        const roomDoors = doorsRes.data.filter(door => door.roomId?._id === formData.roomId);
        const roomLights = lightsRes.data.filter(light => light.roomId?._id === formData.roomId);
        const roomACs = acsRes.data.filter(ac => ac.roomId?._id === formData.roomId);

        // Combine and add category info
        const allEquipments = [
          ...roomDoors.map(item => ({ ...item, category: 'Door' })),
          ...roomLights.map(item => ({ ...item, category: 'Light' })),
          ...roomACs.map(item => ({ ...item, category: 'Air Conditioner' }))
        ];

        setRoomEquipments(allEquipments);
      } catch (err) {
        console.error("Failed to fetch room equipments:", err);
        setRoomEquipments([]);
      } finally {
        setLoadingEquipments(false);
      }
    };

    fetchRoomEquipments();
  }, [formData.roomId]);

  // form change handler
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // When a villa is selected, update selectedVillaRooms
  const handleVillaSelect = (villa) => {
    setFormData((prev) => ({ ...prev, villaId: villa._id, roomId: "" }));
    // Find room objects that match the villa's rooms array
    const villaRoomObjs = rooms.filter((room) =>
      villa.rooms.includes(room._id)
    );
    setSelectedVillaRooms(villaRoomObjs);
  };

  // submit handler
  const handleSubmit = async () => {
    const { category, itemName, villaId, access } = formData;

    if (!itemName || !villaId) {
      setMessage("Please fill in all required fields.");
      setToastType('error');
      setShowToast(true);
      return;
    }

    let adminId = null;
    if (token) {
      try {
        const decoded = jwtDecode(token);
        adminId = decoded.id;
      } catch (err) {
        console.error('Invalid token:', err);
      }
    }

    try {
      const response = await axios.post("/api/equipment/create", {
        category,
        itemName,
        villaId,
        roomId: formData.roomId,
        access,
        adminId,
      });
      setCreatedEquipment(response.data.equipment);
      setShowSuccessModal(true);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to create equipment.");
      setToastType('error');
      setShowToast(true);
    }
  };

  // Find selected villa and room objects for display
  const selectedVilla = villas.find(v => v._id === formData.villaId);
  const selectedRoom = selectedVillaRooms.find(r => r._id === formData.roomId);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className=" mx-auto">
        {/* Use flex instead of grid for equal height columns */}
        <div className="flex flex-col lg:flex-row gap-8 h-full">
          
          {/* Left Column - Form */}
          <div className="flex-1 bg-white p-6 rounded-lg shadow-md flex flex-col">
            <h2 className="text-2xl font-semibold mb-6">Create Equipment</h2>
            <Toaster
              message={message}
              type={toastType}
              isVisible={showToast && !!message}
              onClose={() => setShowToast(false)}
              duration={4000}
              position="top-right"
            />

            <div className="space-y-4 flex-1">
              {/* Category & Item Code in same row */}
              <div className="flex flex-col md:flex-row gap-4">
                {/* Category as 3 buttons in a grid */}
                <div>
                  <label className="block font-medium mb-1">Category</label>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {["Doors", "Air Conditioner", "Lights"].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        className={`px-4 py-2 rounded border text-sm
                          ${formData.category === cat
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"}
                        `}
                        onClick={() => setFormData((prev) => ({ ...prev, category: cat }))}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Item Code Display */}
                <div className="flex-1">
                  <label className="block font-medium mb-1">Item Code</label>
                  <div className="w-full px-4 py-1 border rounded-md bg-gray-50 text-gray-600 flex items-center">
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        Generating...
                      </div>
                    ) : (
                      <span className="font-mono text-lg">{generatedItemCode}</span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">
                    Next available item code for {formData.category}
                  </p>
                </div>
              </div>

              {/* Villa Selection as buttons */}
              <div>
                <label className="block font-medium mb-1">Select Villa</label>
                <div className="grid grid-cols-3 gap-2 mb-2 max-h-32 overflow-y-auto">
                  {villas.map((villa) => (
                    <button
                      key={villa._id}
                      type="button"
                      className={`px-4 py-2 rounded border text-sm
                        ${formData.villaId === villa._id
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"}
                      `}
                      onClick={() => handleVillaSelect(villa)}
                    >
                      {villa.villaName} ({villa.villaId})
                    </button>
                  ))}
                </div>
              </div>

              {/* Room Selection for selected villa as buttons */}
              {formData.villaId && (
                <div>
                  <label className="block font-medium mb-1">Select Room</label>
                  <div className="grid grid-cols-3 gap-2 mb-2 max-h-32 overflow-y-auto">
                    {selectedVillaRooms.map((room) => (
                      <button
                        key={room._id}
                        type="button"
                        className={`px-4 py-2 rounded border text-sm
                          ${formData.roomId === room._id
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"}
                        `}
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, roomId: room._id }))
                        }
                      >
                        {room.roomName}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Item Name */}
              <div>
                <label className="block font-medium mb-1">Item Name</label>
                <input
                  type="text"
                  name="itemName"
                  placeholder="Enter item name"
                  value={formData.itemName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring"
                />
              </div>

              {/* Access as selectable buttons */}
              <div>
                <label className="block font-medium mb-1">Access</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {[
                    {
                      label: "Enable",
                      value: true
                    },
                    {
                      label: "Disable",
                      value: false
                    }
                  ].map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      className={`px-4 py-2 rounded border text-sm
                        ${formData.access === option.value
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"}
                      `}
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, access: option.value }))
                      }
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Preview/Information */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              {/* Preview */}
              <div className="flex-1 bg-white p-8 rounded-lg shadow-md">
                <h3 className="text-md font-semibold mb-6">Equipment Preview</h3>
                
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-sm text-gray-700">Category</h4>
                    <p className="font-medium">{formData.category}</p>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-sm text-gray-700">Item Code</h4>
                    <p className="text-medium font-mono">{generatedItemCode || 'Generating...'}</p>
                  </div>

                  <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-sm text-gray-700">Item Name</h4>
                    <p className="text-medium">{formData.itemName || 'Not specified'}</p>
                  </div>

                  <div className="border-l-4 border-orange-500 pl-4">
                    <h4 className="font-sm text-gray-700">Villa</h4>
                    <p className="text-medium">
                      {selectedVilla ? `${selectedVilla.villaName} (${selectedVilla.villaId})` : 'Not selected'}
                    </p>
                  </div>

                  <div className="border-l-4 border-yellow-500 pl-4">
                    <h4 className="font-sm text-gray-700">Room</h4>
                    <p className="text-medium">{selectedRoom ? selectedRoom.roomName : 'Not assigned'}</p>
                  </div>

                  <div className="border-l-4 border-red-500 pl-4">
                    <h4 className="font-sm text-gray-700">Access</h4>
                    <p className="text-medium">
                      <span className={`px-2 py-1 rounded text-sm ${
                        formData.access ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {formData.access ? 'Enabled' : 'Disabled'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Existing Room Equipments or Instructions */}
              <div className="flex-1 bg-white px-4 py-8 rounded-lg shadow-md flex flex-col">
                <div className="flex-1">
                  {formData.roomId ? (
                    <div>
                      <h3 className="text-md font-semibold mb-6">Existing Equipment in {selectedRoom?.roomName}</h3>
                      
                      {loadingEquipments ? (
                        <div className="flex items-center justify-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                          <span className="ml-2 text-gray-600">Loading equipments...</span>
                        </div>
                      ) : roomEquipments.length > 0 ? (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {roomEquipments.map((equipment) => (
                            <div key={`${equipment.category}-${equipment._id}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-1 text-xs rounded font-medium ${
                                    equipment.category === 'Door' ? 'bg-blue-100 text-blue-800' :
                                    equipment.category === 'Light' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                                  }`}>
                                    {equipment.category}
                                  </span>
                                  <span className="font-mono text-sm text-gray-600">{equipment.itemCode}</span>
                                </div>
                                <p className="font-medium text-gray-800">{equipment.itemName}</p>
                              </div>
                              <div className="text-right">
                                <span className={`px-2 py-1 text-xs rounded ${
                                  equipment.access ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {equipment.access ? 'Enabled' : 'Disabled'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>No equipment found in this room</p>
                          <p className="text-sm mt-1">This will be the first equipment in {selectedRoom?.roomName}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Instructions when no room is selected */
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">Instructions</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Select a category to generate item code</li>
                        <li>• Choose a villa to assign the equipment</li>
                        <li>• Room assignment is required</li>
                        <li>• Item name is required</li>
                        <li>• Access control can be enabled/disabled</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
            >
              Create Equipment
            </button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <Modal isVisible={showSuccessModal} onClose={() => setShowSuccessModal(false)} width="max-w-lg">
        <h2 className="text-xl font-bold mb-4 text-center">Equipment Created Successfully</h2>
        {createdEquipment && (
          <div className="space-y-2">
            <div>
              <span className="font-semibold">Item Code:</span> {createdEquipment.itemCode}
            </div>
            <div>
              <span className="font-semibold">Category:</span> {formData.category}
            </div>
            <div>
              <span className="font-semibold">Item Name:</span> {createdEquipment.itemName}
            </div>
            <div>
              <span className="font-semibold">Villa:</span> {selectedVilla ? `${selectedVilla.villaName} (${selectedVilla.villaId})` : '-'
              }
            </div>
            <div>
              <span className="font-semibold">Room:</span> {selectedRoom ? selectedRoom.roomName : 'Not assigned'}
            </div>
            <div>
              <span className="font-semibold">Access:</span> {formData.access ? 'Enabled' : 'Disabled'}
            </div>
          </div>
        )}
        <div className="flex justify-end gap-2 mt-6">
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => {
              setShowSuccessModal(false);
              navigate('/admindashboard');
            }}
          >
            OK
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default EquipmentCreation;
