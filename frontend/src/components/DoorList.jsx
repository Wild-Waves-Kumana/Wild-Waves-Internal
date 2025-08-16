import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Modal from './Modal';

const DoorList = ({ userId: propUserId, selectedRoomId, roomIds, role: propRole }) => {
  const [doors, setDoors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(propRole || "");
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDoor, setSelectedDoor] = useState(null);
  const [editForm, setEditForm] = useState({
    itemName: "",
    itemCode: "",
    status: false, // boolean
    access: false, // boolean
    lockStatus: false, // boolean
  });

  // Fetch doors for rooms if roomIds is provided, otherwise use user logic
  const fetchDoors = useCallback(async () => {
    try {
      if (roomIds && Array.isArray(roomIds) && roomIds.length > 0) {
        const doorRes = await axios.get('http://localhost:5000/api/equipment/doors');
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
      const userRes = await axios.get(`http://localhost:5000/api/users/${userId}`);
      const user = userRes.data;
      if (!user.rooms || user.rooms.length === 0) {
        setDoors([]);
        setLoading(false);
        return;
      }

      // Fetch all rooms and filter by user's room ids
      const allRoomsRes = await axios.get('http://localhost:5000/api/rooms/all');
      const userRooms = allRoomsRes.data.filter(room => user.rooms.includes(room._id));

      // Collect all door ObjectIds from user's rooms
      const doorIds = userRooms.flatMap(room => room.doors || []);

      if (doorIds.length === 0) {
        setDoors([]);
        setLoading(false);
        return;
      }

      // Fetch all doors and filter by doorIds
      const doorRes = await axios.get('http://localhost:5000/api/equipment/doors');
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
        lockStatus: false, // lock the door automatically when access is disabled (false means Locked)
      }));
    }
  }, [editForm.access]);

  // Submit the form
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      // Ensure status, access, and lockStatus are booleans
      const payload = {
        ...editForm,
        status: Boolean(editForm.status),
        access: Boolean(editForm.access),
        lockStatus: Boolean(editForm.lockStatus),
      };
      await axios.put(
        `http://localhost:5000/api/equipment/doors/${selectedDoor._id}`,
        payload
      );
      setShowEditModal(false);
      await fetchDoors();
    } catch (err) {
      console.error("Failed to update door:", err);
      alert("Failed to update door.");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="mx-auto my-4 bg-white shadow rounded p-6">
      <h2 className="text-2xl font-bold mb-4">Doors</h2>
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="border px-4 py-2">Item Name</th>
            <th className="border px-4 py-2">Item Code</th>
            <th className="border px-4 py-2">Room</th>
            <th className="border px-4 py-2">Lock Status</th>
            <th className="border px-4 py-2">Status</th>
            <th className="border px-4 py-2">Access</th>
            {(role === "admin" || role === "superadmin") && (
              <th className="border px-4 py-2">Edit</th>
            )}
          </tr>
        </thead>
        <tbody>
          {filteredDoors.map((door) => (
            <tr key={door._id}>
              <td className="border px-4 py-2">{door.itemName}</td>
              <td className="border px-4 py-2">{door.itemCode}</td>
              <td className="border px-4 py-2">{door.roomId?.roomName || "N/A"}</td>
              <td className="border px-4 py-2">{door.lockStatus === true ? "Unlocked" : "Locked"}</td>
              <td className="border px-4 py-2">{door.status === true ? "ON" : "OFF"}</td>
              <td className="border px-4 py-2">
                <span className={`px-2 py-1 rounded ${door.access === true ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {door.access === true ? "Enabled" : "Disabled"}
                </span>
              </td>
              {(role === "admin" || role === "superadmin") && (
                <td className="border px-4 py-2">
                  <div className="flex justify-center">
                    <button
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-700 active:bg-yellow-800"
                      onClick={() => openEditModal(door)}
                    >
                      Edit
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {filteredDoors.length === 0 && (
        <div className="mt-4 text-gray-500">No doors found for this user.</div>
      )}

      <Modal isVisible={showEditModal} onClose={() => setShowEditModal(false)} width="w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit Door</h2>
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

          <label className="block font-medium">Lock Status</label>
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              className={`px-4 py-2 rounded border 
                ${editForm.lockStatus === true
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"}
                ${!editForm.access ? "opacity-50 cursor-not-allowed" : ""}
              `}
              onClick={() => editForm.access && setEditForm({ ...editForm, lockStatus: true })}
              disabled={!editForm.access}
            >
              Unlocked
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded border 
                ${editForm.lockStatus === false
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"}
                ${!editForm.access ? "opacity-50 cursor-not-allowed" : ""}
              `}
              onClick={() => editForm.access && setEditForm({ ...editForm, lockStatus: false })}
              disabled={!editForm.access}
            >
              Locked
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
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Save
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DoorList;
