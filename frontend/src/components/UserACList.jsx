import React, { useEffect, useState } from "react";
import axios from "axios";
import Modal from "./Modal";
import { jwtDecode } from "jwt-decode";

const UserACList = ({ userId: propUserId }) => {
  const [acs, setAcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAC, setSelectedAC] = useState(null);
  const [editForm, setEditForm] = useState({
    itemName: "",
    itemCode: "",
    temperaturelevel: "",
    mode: "",
    fanSpeed: "",
    status: "",
    access: "",
  });

  // Move fetchACs outside useEffect so it can be called elsewhere
  const fetchACs = React.useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return setLoading(false);
      const decoded = jwtDecode(token);
      const loggedUserId = decoded.id;
      const userRole = decoded.role;
      setRole(userRole);

      let userId = loggedUserId;
      let adminCompanyId = null;

      if (userRole === "admin" || userRole === "superadmin") {
        userId = propUserId;
        const adminRes = await axios.get(`http://localhost:5000/api/admin/${loggedUserId}`);
        adminCompanyId = adminRes.data.companyId?._id || adminRes.data.companyId;
      }

      const res = await axios.get("http://localhost:5000/api/equipment/air-conditioners");

      let filtered = res.data.filter(
        (ac) =>
          (ac.assignedUser === userId) ||
          (ac.assignedUser && ac.assignedUser._id === userId)
      );

      if (userRole === "admin" && adminCompanyId) {
        filtered = filtered.filter(
          (ac) =>
            ac.companyId === adminCompanyId ||
            (ac.companyId && ac.companyId._id === adminCompanyId)
        );
      }

      setAcs(filtered);
    } catch (err) {
      console.error("Failed to fetch air conditioners:", err);
      setAcs([]);
    } finally {
      setLoading(false);
    }
  }, [propUserId]);

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
      status: ac.status || "",
      access: ac.access || "",
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
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
       // <-- Refetch the AC list after saving
    } catch (err) {
      console.error("Failed to update AC:", err);
      alert("Failed to update AC.");
    }
  };

  // Add this useEffect inside your component to auto-set status to OFF if access is Disabled
  useEffect(() => {
    if (editForm.access === "Disabled") {
      setEditForm((prev) => ({
        ...prev,
        status: "OFF",
      }));
    }
  }, [editForm.access]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className=" mx-auto mt-10 bg-white shadow rounded p-6">
      <h2 className="text-2xl font-bold mb-4">User's Air Conditioners</h2>
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="border px-4 py-2">Item Name</th>
            <th className="border px-4 py-2">Item Code</th>
            <th className="border px-4 py-2">Villa Name</th>
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
          {acs.map((ac) => (
            <tr key={ac._id}>
              <td className="border px-4 py-2">{ac.itemName}</td>
              <td className="border px-4 py-2">{ac.itemCode}</td>
              <td className="border px-4 py-2">{ac.villaName} ({ac.assignedUser?.username || ac.assignedUser || 'N/A'})</td>
              <td className="border px-4 py-2">{ac.roomId?.roomName || "N/A"}</td>
              <td className="border px-4 py-2">{ac.temperaturelevel}</td>
              <td className="border px-4 py-2">{ac.mode}</td>
              <td className="border px-4 py-2">{ac.fanSpeed}</td>
              <td className="border px-4 py-2">{ac.status}</td>
              <td className="border px-4 py-2">{ac.access}</td>
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
      {acs.length === 0 && (
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
                disabled={editForm.access === "Disabled"}
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
                    ${editForm.access === "Disabled" ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                  onClick={() => editForm.access !== "Disabled" && setEditForm({ ...editForm, mode: modeOption })}
                  disabled={editForm.access === "Disabled"}
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
                    ${editForm.access === "Disabled" ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                  onClick={() => editForm.access !== "Disabled" && setEditForm({ ...editForm, fanSpeed: speed })}
                  disabled={editForm.access === "Disabled"}
                >
                  {speed}
                </button>
              ))}
            </div> 

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

export default UserACList;