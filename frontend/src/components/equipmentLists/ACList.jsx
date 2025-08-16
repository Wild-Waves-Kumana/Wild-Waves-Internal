import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Modal from "../Modal";
import { jwtDecode } from "jwt-decode";

const ACList = ({ userId: propUserId, selectedRoomId, roomIds, role: propRole }) => {
  const [acs, setAcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(propRole || ""); // <-- use propRole if provided
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAC, setSelectedAC] = useState(null);
  const [editForm, setEditForm] = useState({
    itemName: "",
    itemCode: "",
    temperaturelevel: "",
    mode: "",
    fanSpeed: "",
    status: false, // boolean
    access: false, // boolean
  });

  // Fetch ACs for rooms if roomIds is provided, otherwise use user logic
  const fetchACs = useCallback(async () => {
    try {
      if (roomIds && Array.isArray(roomIds) && roomIds.length > 0) {
        // Fetch all ACs and filter by roomIds
        const acRes = await axios.get("http://localhost:5000/api/equipment/air-conditioners");
        const filtered = acRes.data.filter(ac => ac.roomId && roomIds.includes(ac.roomId._id));
        setAcs(filtered);
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
        setAcs([]);
        setLoading(false);
        return;
      }

      // Fetch all rooms and filter by user's room ids
      const allRoomsRes = await axios.get('http://localhost:5000/api/rooms/all');
      const userRooms = allRoomsRes.data.filter(room => user.rooms.includes(room._id));

      // Collect all airConditioner ObjectIds from user's rooms
      const acIds = userRooms.flatMap(room => room.airConditioners || []);

      if (acIds.length === 0) {
        setAcs([]);
        setLoading(false);
        return;
      }

      // Fetch all ACs and filter by acIds
      const acRes = await axios.get("http://localhost:5000/api/equipment/air-conditioners");
      const filtered = acRes.data.filter(ac => acIds.includes(ac._id));

      setAcs(filtered);
    } catch (err) {
      console.error("Failed to fetch air conditioners:", err);
      setAcs([]);
    } finally {
      setLoading(false);
    }
  }, [propUserId, roomIds]);

  useEffect(() => {
    fetchACs();
  }, [propUserId, fetchACs]);

  const openEditModal = (ac) => {
    setSelectedAC(ac);
    setEditForm({
      itemName: ac.itemName || "",
      itemCode: ac.itemCode || "",
      temperaturelevel: ac.temperaturelevel || "",
      mode: ac.mode || "",
      fanSpeed: ac.fanSpeed || "",
      status: ac.status === true, // ensure boolean
      access: ac.access === true, // ensure boolean
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : (name === "status" || name === "access" ? value === "true" : value),
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:5000/api/equipment/air-conditioners/${selectedAC._id}`,
        editForm
      );
      setShowEditModal(false);
      await fetchACs();
    } catch (err) {
      console.error("Failed to update AC:", err);
      alert("Failed to update AC.");
    }
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

  // Filter ACs by selectedRoomId if provided
  const filteredAcs = selectedRoomId
    ? acs.filter(ac => ac.roomId && ac.roomId._id === selectedRoomId)
    : acs;

  if (loading) return <div>Loading...</div>;

  return (
    <div className=" mx-auto my-4 bg-white shadow rounded p-6">
      <h2 className="text-2xl font-bold mb-4">Air Conditioners</h2>
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="border px-4 py-2">Item Name</th>
            <th className="border px-4 py-2">Item Code</th>
            <th className="border px-4 py-2">Room</th>
            <th className="border px-4 py-2">Temp</th>
            <th className="border px-4 py-2">Mode</th>
            <th className="border px-4 py-2">Fan Speed</th>
            <th className="border px-4 py-2">Status</th>
            <th className="border px-4 py-2">Access</th>
            {(role === "admin" || role === "superadmin") && (
              <th className="border px-4 py-2">Edit</th>
            )}
          </tr>
        </thead>
        <tbody>
          {filteredAcs.map((ac) => (
            <tr key={ac._id}>
              <td className="border px-4 py-2">{ac.itemName}</td>
              <td className="border px-4 py-2">{ac.itemCode}</td>
              <td className="border px-4 py-2">{ac.roomId?.roomName || "N/A"}</td>
              <td className="border px-4 py-2">{ac.temperaturelevel}</td>
              <td className="border px-4 py-2">{ac.mode}</td>
              <td className="border px-4 py-2">{ac.fanSpeed}</td>
              <td className="border px-4 py-2">
                {ac.status === true ? "ON" : "OFF"}
              </td>
              <td className="border px-4 py-2">
                <span className={`px-2 py-1 rounded ${ac.access === true ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {ac.access === true ? "Enabled" : "Disabled"}
                </span>
              </td>
              {(role === "admin" || role === "superadmin") && (
                <td className="border px-4 py-2">
                  <button
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-700"
                    onClick={() => openEditModal(ac)}
                  >
                    Edit
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {filteredAcs.length === 0 && (
        <div className="mt-4 text-gray-500">No air conditioners found for this user.</div>
      )}

      <Modal isVisible={showEditModal} onClose={() => setShowEditModal(false)} width="w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Edit Air Conditioner</h2>
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

          <label className="block font-medium">Temperature Level</label>
          <div className="flex items-center gap-4 mb-2">
            <input
              type="range"
              min={16}
              max={26}
              step={1}
              name="temperaturelevel"
              value={editForm.temperaturelevel || 16}
              onChange={e => setEditForm({ ...editForm, temperaturelevel: Number(e.target.value) })}
              className="flex-1"
              disabled={!editForm.access}
            />
            <span className="w-12 text-center">{editForm.temperaturelevel || 16}°C</span>
          </div>

          {/* Mode */}
          <label className="block font-medium">Mode</label>
          <div className="flex gap-2 mb-2">
            {["No Mode", "Cool", "Heat", "Fan", "Dry"].map((modeOption) => (
              <button
                key={modeOption}
                type="button"
                className={`px-4 py-2 rounded border 
                  ${editForm.mode === modeOption
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"}
                  ${!editForm.access ? "opacity-50 cursor-not-allowed" : ""}
                `}
                onClick={() => editForm.access && setEditForm({ ...editForm, mode: modeOption })}
                disabled={!editForm.access}
              >
                {modeOption}
              </button>
            ))}
          </div>

          <label className="block font-medium">Fan Speed</label>
          <div className="flex gap-2 mb-2">
            {["Low", "Medium", "High"].map((speed) => (
              <button
                key={speed}
                type="button"
                className={`px-4 py-2 rounded border 
                  ${editForm.fanSpeed === speed
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"}
                  ${!editForm.access ? "opacity-50 cursor-not-allowed" : ""}
                `}
                onClick={() => editForm.access && setEditForm({ ...editForm, fanSpeed: speed })}
                disabled={!editForm.access}
              >
                {speed}
              </button>
            ))}
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

export default ACList;