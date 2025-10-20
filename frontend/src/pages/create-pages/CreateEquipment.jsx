// src/pages/EquipmentCreate.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';

const EquipmentCreation = () => {
  const navigate = useNavigate();
  const [villas, setVillas] = useState([]);
  const [selectedVillaRooms, setSelectedVillaRooms] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [generatedItemCode, setGeneratedItemCode] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [message, setMessage] = useState("");
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
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { category, itemName, villaId, access } = formData;

    if (!itemName || !villaId) {
      setMessage("Please fill in all required fields.");
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
      
      // Show success message with generated item code
      setMessage(`Equipment created successfully with Item Code: ${response.data.equipment.itemCode}`);
      
      // Navigate after a short delay to show the success message
      setTimeout(() => {
        navigate("/AdminDashboard");
      }, 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to create equipment.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md space-y-4"
      >
        <h2 className="text-2xl font-semibold text-center">Create Equipment</h2>
        {message && (
          <p className={`text-center text-sm ${
            message.includes('successfully') ? 'text-green-600' : 'text-red-600'
          }`}>
            {message}
          </p>
        )}

        {/* Category */}
        <div>
          <label className="block font-medium mb-1">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring"
          >
            <option value="Doors">Doors</option>
            <option value="Air Conditioner">Air Conditioner</option>
            <option value="Lights">Lights</option>
          </select>
        </div>

        {/* Item Code Display */}
        <div>
          <label className="block font-medium mb-1">Item Code</label>
          <div className="w-full px-4 py-2 border rounded-md bg-gray-50 text-gray-600 flex items-center">
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Generating...
              </div>
            ) : (
              <span className="font-mono text-lg">{generatedItemCode}</span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Next available item code for {formData.category}
          </p>
        </div>

        {/* Villa Selection as buttons */}
        <div>
          <label className="block font-medium mb-1">Select Villa</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {villas.map((villa) => (
              <button
                key={villa._id}
                type="button"
                className={`px-4 py-2 rounded border
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
            <label className="block font-medium mb-1">Select Room (Optional)</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedVillaRooms.map((room) => (
                <button
                  key={room._id}
                  type="button"
                  className={`px-4 py-2 rounded border
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
              { label: "Enable", value: true },
              { label: "Disable", value: false }
            ].map((option) => (
              <button
                key={option.label}
                type="button"
                className={`px-4 py-2 rounded border
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

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
        >
          Create Equipment
        </button>
      </form>
    </div>
  );
};

export default EquipmentCreation;
