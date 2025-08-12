// src/pages/EquipmentCreate.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';

const EquipmentCreate = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [message, setMessage] = useState("");
  const token = localStorage.getItem('token');

  const [formData, setFormData] = useState({
    category: "Doors",
    itemName: "",
    itemCode: "",
    assignedUser: "",
    roomId: "",
    access: "Enabled",
  });

  // Filtering logic for users (same as UserList)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Get adminId from token
        if (!token) return;
        const decoded = jwtDecode(token);
        const adminId = decoded.id;

        // Fetch admin details to get companyId
        const adminRes = await axios.get(`http://localhost:5000/api/admin/${adminId}`);
        const companyId = adminRes.data.companyId?._id || adminRes.data.companyId;

        // Fetch all users
        const usersRes = await axios.get("http://localhost:5000/api/users");

        // Filter users by companyId (same as UserList)
        const filteredUsers = usersRes.data.filter(
          (u) =>
            u.companyId === companyId ||
            u.companyId?._id === companyId
        );
        setUsers(filteredUsers);
      } catch (err) {
        setUsers([]);
        console.error("Failed to load users", err);
      }
    };
    fetchUsers();
  }, [token]);

  // form change handler
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { category, itemName, itemCode, assignedUser, access } = formData;

    // simple client-side required-field check
    if (!itemName || !itemCode || !assignedUser) {
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
        assignedUser,
        roomId: formData.roomId,
        access,
        adminId,
      });
      navigate("/AdminDashboard");        // or wherever you show the list
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

        {/* Assigned User */}
        <label className="block font-medium">Assigned User</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {users.map((u) => (
            <button
              key={u._id}
              type="button"
              className={`px-4 py-2 rounded border
                ${formData.assignedUser === u._id
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"}
              `}
              onClick={async () => {
                setFormData((prev) => ({ ...prev, assignedUser: u._id, roomId: "" }));
                try {
                  const res = await axios.get(`http://localhost:5000/api/rooms/user/${u._id}`);
                  setRooms(res.data);
                } catch {
                  setRooms([]);
                }
              }}
            >
              {u.villaName}
            </button>
          ))}
        </div>

        {/* Room selection - NEW CODE BLOCK */}
        {formData.assignedUser && (
          <>
            <label className="block font-medium">Select Room</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {rooms.length === 0 && (
                <span className="text-gray-400">No rooms found for this user.</span>
              )}
              {rooms.map((room) => (
                <button
                  key={room._id}
                  type="button"
                  className={`px-4 py-2 rounded border
                    ${formData.roomId === room._id
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-green-100"}
                  `}
                  onClick={() => setFormData((prev) => ({ ...prev, roomId: room._id }))}
                >
                  {room.roomName}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Status */}
        <select
          name="access"
          value={formData.access}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring"
        >
          <option value="Enabled">Enable</option>
          <option value="Disabled">Disable</option>
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

export default EquipmentCreate;
