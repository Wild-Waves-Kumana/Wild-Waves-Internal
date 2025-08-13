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
  
  const [message, setMessage] = useState("");
  const token = localStorage.getItem('token');

  const [formData, setFormData] = useState({
    category: "Doors",
    itemName: "",
    itemCode: "",
    villaId: "",
    roomId: "",
    access: "Enabled",
  });

  // Fetch villas for the admin's company
  useEffect(() => {
    const fetchVillas = async () => {
      try {
        if (!token) return;
        const decoded = jwtDecode(token);
        const adminId = decoded.id;

        // Fetch admin details to get companyId
        const adminRes = await axios.get(`http://localhost:5000/api/admin/${adminId}`);
        const companyId = adminRes.data.companyId?._id || adminRes.data.companyId;

        // Fetch all villas
        const villasRes = await axios.get("http://localhost:5000/api/villas/all");
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
        const res = await axios.get("http://localhost:5000/api/rooms/all");
        setRooms(res.data);
      } catch (err) {
        console.error("Failed to fetch rooms", err);
        setRooms([]);
      }
    };
    fetchRooms();
  }, []);

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
    const { category, itemName, itemCode, villaId, access } = formData;

    if (!itemName || !itemCode || !villaId) {
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
      await axios.post("http://localhost:5000/api/equipment/create", {
        category,
        itemName,
        itemCode,
        villaId,
        roomId: formData.roomId,
        access,
        adminId,
      });
      navigate("/AdminDashboard");
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
          <p className="text-center text-sm text-red-600">{message}</p>
        )}

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
            <label className="block font-medium mb-1">Select Room</label>
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

        {/* Category */}
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

        {/* Item Name */}
        <input
          type="text"
          name="itemName"
          placeholder="Item Name"
          value={formData.itemName}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring"
        />

        {/* Item Code */}
        <input
          type="text"
          name="itemCode"
          placeholder="Item Code"
          value={formData.itemCode}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring"
        />

        {/* Access */}
        <select
          name="access"
          value={formData.access ?? ""}
          onChange={e =>
            setFormData(prev => ({
              ...prev,
              access: e.target.value === "true"
            }))
          }
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring"
        >
          <option value="">Select Access</option>
          <option value="true">Enable</option>
          <option value="false">Disable</option>
        </select>
        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
        >
          Create
        </button>
      </form>
    </div>
  );
};

export default EquipmentCreation;
