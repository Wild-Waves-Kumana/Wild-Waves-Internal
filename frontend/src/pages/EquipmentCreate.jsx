// src/pages/EquipmentCreate.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const EquipmentCreate = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);            // dropdown list
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    category: "Doors",
    itemName: "",
    itemCode: "",
    assignedTo: "",
    status: "ON",                                     // default ON
  });

  // ⬇️ fetch users for the dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users"); // adjust URL
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to load users", err);
      }
    };
    fetchUsers();
  }, []);

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
    const { category, itemName, itemCode, assignedTo, status } = formData;

    // simple client-side required-field check
    if (!itemName || !itemCode || !assignedTo) {
      setMessage("Please fill in all required fields.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/equipment/create", {
        category,
        itemName,
        itemCode,
        assignedTo,
        status,
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
        <select
          name="assignedTo"
          value={formData.assignedTo}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring"
        >
          <option value="">-- Select User --</option>
          {users.map((u) => (
            <option key={u._id} value={u._id}>
              {u.roomname}
            </option>
          ))}
        </select>

        {/* Status */}
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring"
        >
          <option value="ON">ON</option>
          <option value="OFF">OFF</option>
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
