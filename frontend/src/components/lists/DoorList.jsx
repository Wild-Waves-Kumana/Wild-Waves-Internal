import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Modal from '../common/Modal';
import ReusableTable from '../common/ReusableTable';
import EditDoorModal from "../modals/EditDoorModal";

const DoorList = ({ userId: propUserId, selectedRoomId, roomIds, role: propRole }) => {
  const [doors, setDoors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(propRole || "");
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDoor, setSelectedDoor] = useState(null);
  const [editForm, setEditForm] = useState({
    itemName: "",
    itemCode: "",
    status: false,
    access: false,
    lockStatus: false,
  });

  // Fetch doors for rooms if roomIds is provided, otherwise use user logic
  const fetchDoors = useCallback(async () => {
    try {
      if (roomIds && Array.isArray(roomIds) && roomIds.length > 0) {
        const doorRes = await axios.get('/api/equipment/doors');
        const filtered = doorRes.data.filter(door => door.roomId && roomIds.includes(door.roomId._id));
        setDoors(filtered);
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
      const userRes = await axios.get(`/api/users/${userId}`);
      const user = userRes.data;
      if (!user.rooms || user.rooms.length === 0) {
        setDoors([]);
        setLoading(false);
        return;
      }

      // Fetch all rooms and filter by user's room ids
      const allRoomsRes = await axios.get('/api/rooms/all');
      const userRooms = allRoomsRes.data.filter(room => user.rooms.includes(room._id));

      // Collect all door ObjectIds from user's rooms
      const doorIds = userRooms.flatMap(room => room.doors || []);

      if (doorIds.length === 0) {
        setDoors([]);
        setLoading(false);
        return;
      }

      // Fetch all doors and filter by doorIds
      const doorRes = await axios.get('/api/equipment/doors');
      const filtered = doorRes.data.filter(door => doorIds.includes(door._id));

      setDoors(filtered);
    } catch (err) {
      console.error("Failed to fetch doors:", err);
      setDoors([]);
    } finally {
      setLoading(false);
    }
  }, [propUserId, roomIds]);

  useEffect(() => {
    fetchDoors();
  }, [propUserId, fetchDoors]);

  // Filter doors by selectedRoomId if provided
  const filteredDoors = selectedRoomId
    ? doors.filter(door => door.roomId && door.roomId._id === selectedRoomId)
    : doors;

  // Open modal and prefill form
  const openEditModal = (door) => {
    setSelectedDoor(door);
    setEditForm({
      itemName: door.itemName || "",
      itemCode: door.itemCode || "",
      status: door.status === true,
      access: door.access === true,
      lockStatus: door.lockStatus === true,
    });
    setShowEditModal(true);
  };

  // Handle form changes
  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : (["status", "access", "lockStatus"].includes(name) ? value === "true" : value),
    }));
  };

  // If access is false (Disabled), force status to false (OFF) and lockStatus to false (Locked)
  useEffect(() => {
    if (editForm.access === false) {
      setEditForm((prev) => ({
        ...prev,
        status: false,
        lockStatus: false,
      }));
    }
  }, [editForm.access]);

  // Submit the form
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...editForm,
        status: Boolean(editForm.status),
        access: Boolean(editForm.access),
        lockStatus: Boolean(editForm.lockStatus),
      };
      await axios.put(
        `/api/equipment/doors/${selectedDoor._id}`,
        payload
      );
      setShowEditModal(false);
      await fetchDoors();
    } catch (err) {
      console.error("Failed to update door:", err);
      alert("Failed to update door.");
    }
  };

  // Prepare columns for ReusableTable
  const columns = [
    { key: "itemName", header: "Item Name" },
    { key: "itemCode", header: "Item Code" },
    { key: "roomName", header: "Room" },
    {
      key: "lockStatus",
      header: "Lock Status",
      render: (value) => value === true ? "Unlocked" : "Locked"
    },
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
  const tableData = filteredDoors.map(door => ({
    ...door,
    roomName: door.roomId?.roomName || "N/A",
  }));

  if (loading) return <div>Loading...</div>;

  return (
    <div className="mx-auto my-4 bg-white shadow rounded p-6">
      <h2 className="text-2xl font-bold mb-4">Doors</h2>
      <ReusableTable
        columns={columns}
        data={tableData}
        pagination={true}
        pageSize={5}
        pageSizeOptions={[5, 10, 20, 50]}
      />
      {filteredDoors.length === 0 && (
        <div className="mt-4 text-gray-500">No doors found for this user.</div>
      )}

      <EditDoorModal
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

export default DoorList;
