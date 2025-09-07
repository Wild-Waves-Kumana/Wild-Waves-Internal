import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Modal from '../common/Modal';
import ReusableTable from '../common/ReusableTable';
import EditLightModal from "../modals/EditLightModal";

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

      <EditLightModal
        isVisible={showEditModal}
        onClose={() => setShowEditModal(false)}
        editForm={editForm}
        setEditForm={setEditForm}
        handleEditChange={handleEditChange}
        handleEditSubmit={handleEditSubmit}
      />
    </div>
  );
};

export default LightList;