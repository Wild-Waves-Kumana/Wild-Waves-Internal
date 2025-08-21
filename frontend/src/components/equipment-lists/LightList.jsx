import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Modal from '../Modal';
import ReusableTable from '../common/ReusableTable';

const LightList = ({ userId: propUserId, selectedRoomId, roomIds, role: propRole }) => {
  const [lights, setLights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(propRole || "");
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLight, setSelectedLight] = useState(null);
  const [editForm, setEditForm] = useState({
    itemName: "",
    itemCode: "",
    brightness: 100,
    status: false,
    access: false,
  });

  // Fetch lights for rooms if roomIds is provided, otherwise use user logic
  const fetchLights = useCallback(async () => {
    try {
      if (roomIds && Array.isArray(roomIds) && roomIds.length > 0) {
        const lightRes = await axios.get('http://localhost:5000/api/equipment/lights');
        const filtered = lightRes.data.filter(light => light.roomId && roomIds.includes(light.roomId._id));
        setLights(filtered);
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) return setLoading(false);
      const decoded = jwtDecode(token);
      const loggedUserId = decoded.id;
      const userRole = decoded.role;
      setRole(userRole);

      let userId = loggedUserId;
      if (userRole === "admin" || userRole === "superadmin") {
        userId = propUserId;
      }

      // Fetch user to get rooms
      const userRes = await axios.get(`http://localhost:5000/api/users/${userId}`);
      const user = userRes.data;
      if (!user.rooms || user.rooms.length === 0) {
        setLights([]);
        setLoading(false);
        return;
      }

      // Fetch all rooms and filter by user's room ids
      const allRoomsRes = await axios.get('http://localhost:5000/api/rooms/all');
      const userRooms = allRoomsRes.data.filter(room => user.rooms.includes(room._id));

      // Collect all light ObjectIds from user's rooms
      const lightIds = userRooms.flatMap(room => room.lights || []);

      if (lightIds.length === 0) {
        setLights([]);
        setLoading(false);
        return;
      }

      // Fetch all lights and filter by lightIds
      const lightRes = await axios.get('http://localhost:5000/api/equipment/lights');
      const filtered = lightRes.data.filter(light => lightIds.includes(light._id));

      setLights(filtered);
    } catch (err) {
      console.error("Failed to fetch lights:", err);
      setLights([]);
    } finally {
      setLoading(false);
    }
  }, [propUserId, roomIds]);

  useEffect(() => {
    fetchLights();
  }, [propUserId, fetchLights]);

  // Open modal and prefill form
  const openEditModal = (light) => {
    setSelectedLight(light);
    setEditForm({
      itemName: light.itemName || "",
      itemCode: light.itemCode || "",
      brightness: light.brightness ?? 100,
      status: light.status === true,
      access: light.access === true,
    });
    setShowEditModal(true);
  };

  // Handle form changes
  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : (["status", "access"].includes(name) ? value === "true" : value),
    }));
  };

  // If access is false (Disabled), force status to false (OFF)
  useEffect(() => {
    if (editForm.access === false) {
      setEditForm((prev) => ({
        ...prev,
        status: false,
      }));
    }
  }, [editForm.access]);

  // Submit the form
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      // Ensure status and access are booleans
      const payload = {
        ...editForm,
        status: Boolean(editForm.status),
        access: Boolean(editForm.access),
      };
      await axios.put(
        `http://localhost:5000/api/equipment/lights/${selectedLight._id}`,
        payload
      );
      setShowEditModal(false);
      await fetchLights();
    } catch (err) {
      console.error("Failed to update light:", err);
      alert("Failed to update light.");
    }
  };

  // Filter lights by selectedRoomId if provided
  const filteredLights = selectedRoomId
    ? lights.filter(light => light.roomId && light.roomId._id === selectedRoomId)
    : lights;

  // Prepare columns for ReusableTable
  const columns = [
    { key: "itemName", header: "Item Name" },
    { key: "itemCode", header: "Item Code" },
    { key: "roomName", header: "Room" },
    { key: "brightness", header: "Brightness" },
    {
      key: "status",
      header: "Status",
      render: (value) => value === true ? "ON" : "OFF"
    },
    {
      key: "access",
      header: "Access",
      render: (value) =>
        <span className={`px-2 py-1 rounded ${value === true ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {value === true ? "Enabled" : "Disabled"}
        </span>
    },
  ];

  if (role === "admin" || role === "superadmin") {
    columns.push({
      key: "edit",
      header: "Edit",
      render: (_, row) => (
        <button
          className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-700"
          onClick={() => openEditModal(row)}
        >
          Edit
        </button>
      )
    });
  }

  // Prepare data for ReusableTable
  const tableData = filteredLights.map(light => ({
    ...light,
    roomName: light.roomId?.roomName || "N/A",
  }));

  if (loading) return <div>Loading...</div>;

  return (
    <div className="mx-auto my-4 bg-white shadow rounded p-6">
      <h2 className="text-2xl font-bold mb-4">Lights</h2>
      <ReusableTable
        columns={columns}
        data={tableData}
        pagination={true}
        pageSize={5}
        pageSizeOptions={[5, 10, 20, 50]}
      />
      {filteredLights.length === 0 && (
        <div className="mt-4 text-gray-500">No lights found for this user.</div>
      )}

      <Modal isVisible={showEditModal} onClose={() => setShowEditModal(false)} width="w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit Light</h2>
        <form onSubmit={handleEditSubmit} className="space-y-3">
          <input
            type="text"
            name="itemName"
            value={editForm.itemName}
            onChange={handleEditChange}
            placeholder="Item Name"
            className="w-full border px-3 py-2 rounded"
          />
          <input
            type="text"
            name="itemCode"
            value={editForm.itemCode}
            onChange={handleEditChange}
            placeholder="Item Code"
            className="w-full border px-3 py-2 rounded"
          />

          <label className="block font-medium">Brightness</label>
          <div className="flex items-center gap-4 mb-2">
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              name="brightness"
              value={editForm.brightness}
              onChange={handleEditChange}
              className="flex-1"
              disabled={!editForm.access}
            />
            <span className="w-12 text-center">{editForm.brightness}%</span>
          </div>

          <label className="block font-medium">Status</label>
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              className={`px-4 py-2 rounded border 
                ${editForm.status === true
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"}
                ${!editForm.access ? "opacity-50 cursor-not-allowed" : ""}
              `}
              onClick={() => editForm.access && setEditForm({ ...editForm, status: true })}
              disabled={!editForm.access}
            >
              ON
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded border 
                ${editForm.status === false
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"}
                ${!editForm.access ? "opacity-50 cursor-not-allowed" : ""}
              `}
              onClick={() => editForm.access && setEditForm({ ...editForm, status: false })}
              disabled={!editForm.access}
            >
              OFF
            </button>
          </div>

          <label className="block font-medium">Access</label>
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              className={`px-4 py-2 rounded border 
                ${editForm.access === true
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"}
              `}
              onClick={() => setEditForm({ ...editForm, access: true })}
            >
              Enabled
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded border 
                ${editForm.access === false
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"}
              `}
              onClick={() => setEditForm({ ...editForm, access: false })}
            >
              Disabled
            </button>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LightList;