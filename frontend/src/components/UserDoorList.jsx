import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Modal from './Modal';

const UserDoorList = ({ userId: propUserId }) => {
  const [doors, setDoors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDoor, setSelectedDoor] = useState(null);
  const [editForm, setEditForm] = useState({
    itemName: "",
    itemCode: "",
    status: "",
    access: "",
  });
  
  

  // Fetch doors logic
  const fetchDoors = React.useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return setLoading(false);
      const decoded = jwtDecode(token);
      const loggedUserId = decoded.id;
      const userRole = decoded.role;
      setRole(userRole);

      let userId = loggedUserId;
      let adminCompanyId = null;

      if (userRole === 'admin' || userRole === 'superadmin') {
        userId = propUserId;
        const adminRes = await axios.get(`http://localhost:5000/api/admin/${loggedUserId}`);
        adminCompanyId = adminRes.data.companyId?._id || adminRes.data.companyId;
      }

      const res = await axios.get('http://localhost:5000/api/equipment/doors');

      let filteredDoors = res.data.filter(
        (door) =>
          (door.assignedUser === userId ||
            (door.assignedUser && door.assignedUser._id === userId))
      );

      if ((userRole === 'admin' || userRole === 'superadmin') && adminCompanyId) {
        filteredDoors = filteredDoors.filter(
          (door) =>
            door.companyId === adminCompanyId ||
            (door.companyId && door.companyId._id === adminCompanyId)
        );
      }

      setDoors(filteredDoors);
    } catch (err) {
      console.error("Failed to fetch doors:", err);
      setDoors([]);
    } finally {
      setLoading(false);
    }
  }, [propUserId]);

  useEffect(() => {
    fetchDoors();
  }, [propUserId, fetchDoors]);

  // Open modal and prefill form
  const openEditModal = (door) => {
    setSelectedDoor(door);
    setEditForm({
      itemName: door.itemName || "",
      itemCode: door.itemCode || "",
      status: door.status || "",
      access: door.access || "",
    });
    setShowEditModal(true);
  };

  // Handle form changes
  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // If access is Disabled, force status to OFF
  useEffect(() => {
    if (editForm.access === "Disabled") {
      setEditForm((prev) => ({
        ...prev,
        status: "OFF",
      }));
    }
  }, [editForm.access]);

  // Submit the form
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:5000/api/equipment/doors/${selectedDoor._id}`,
        editForm
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
    <div className="mx-auto mt-10 bg-white shadow rounded p-6">
      <h2 className="text-2xl font-bold mb-4">User's Doors</h2>
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="border px-4 py-2">Item Name</th>
            <th className="border px-4 py-2">Item Code</th>
            <th className="border px-4 py-2">Villa Name</th>
            <th className="border px-4 py-2">Room Name</th>
            <th className="border px-4 py-2">Lock Status</th>
            <th className="border px-4 py-2">Status</th>
            <th className="border px-4 py-2">Access</th>
            {(role === "admin" || role === "superadmin") && (
              <th className="border px-4 py-2">Edit</th>
            )}
          </tr>
        </thead>
        <tbody>
          {doors.map((door) => (
            <tr key={door._id}>
              <td className="border px-4 py-2">{door.itemName}</td>
              <td className="border px-4 py-2">{door.itemCode}</td>
              <td className="border px-4 py-2">{door.villaName} ({door.assignedUser?.username || door.assignedUser || 'N/A'})</td>
              <td className="border px-4 py-2">{door.roomId?.roomName || "N/A"}</td>
              <td className="border px-4 py-2">{door.lockStatus === 1 ? "Locked" : "Unlocked"}</td>
              <td className="border px-4 py-2">{door.status}</td>
              <td className="border px-4 py-2">{door.access}</td>
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
      {doors.length === 0 && (
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
            {["ON", "OFF"].map((statusOption) => (
              <button
                key={statusOption}
                type="button"
                className={`px-4 py-2 rounded border 
                  ${editForm.status === statusOption
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"}
                  ${editForm.access === "Disabled" ? "opacity-50 cursor-not-allowed" : ""}
                `}
                onClick={() => editForm.access !== "Disabled" && setEditForm({ ...editForm, status: statusOption })}
                disabled={editForm.access === "Disabled"}
              >
                {statusOption}
              </button>
            ))}
          </div>

          <label className="block font-medium">Access</label>
          <div className="flex gap-2 mb-2">
            {["Enabled", "Disabled"].map((accessOption) => (
              <button
                key={accessOption}
                type="button"
                className={`px-4 py-2 rounded border 
                  ${editForm.access === accessOption
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"}
                `}
                onClick={() => setEditForm({ ...editForm, access: accessOption })}
              >
                {accessOption}
              </button>
            ))}
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

export default UserDoorList;
