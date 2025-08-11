import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Modal from './Modal';

const UserLightList = ({ userId: propUserId }) => {
  const [lights, setLights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLight, setSelectedLight] = useState(null);
  const [editForm, setEditForm] = useState({
    itemName: "",
    itemCode: "",
    brightness: 100,
    status: "",
    access: "",
  });

  // Fetch lights logic
  const fetchLights = React.useCallback(async () => {
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

      const res = await axios.get('http://localhost:5000/api/equipment/lights');

      let filteredLights = res.data.filter(
        (light) =>
          (light.assignedUser === userId ||
            (light.assignedUser && light.assignedUser._id === userId))
      );

      if ((userRole === 'admin' || userRole === 'superadmin') && adminCompanyId) {
        filteredLights = filteredLights.filter(
          (light) =>
            light.companyId === adminCompanyId ||
            (light.companyId && light.companyId._id === adminCompanyId)
        );
      }

      setLights(filteredLights);
    } catch (err) {
      console.error("Failed to fetch lights:", err);
      setLights([]);
    } finally {
      setLoading(false);
    }
  }, [propUserId]);

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
      status: light.status || "",
      access: light.access || "",
    });
    setShowEditModal(true);
  };

  // Handle form changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: name === "brightness" ? Number(value) : value });
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
        `http://localhost:5000/api/equipment/lights/${selectedLight._id}`,
        editForm
      );
      setShowEditModal(false);
      await fetchLights();
    } catch (err) {
      console.error("Failed to update light:", err);
      alert("Failed to update light.");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="mx-auto mt-10 bg-white shadow rounded p-6">
      <h2 className="text-2xl font-bold mb-4">User's Lights</h2>
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="border px-4 py-2">Item Name</th>
            <th className="border px-4 py-2">Item Code</th>
            <th className="border px-4 py-2">Villa Name</th>
            <th className="border px-4 py-2">Brightness</th>
            <th className="border px-4 py-2">Status</th>
            <th className="border px-4 py-2">Access</th>
            {(role === "admin" || role === "superadmin") && (
              <th className="border px-4 py-2">Edit</th>
            )}
          </tr>
        </thead>
        <tbody>
          {lights.map((light) => (
            <tr key={light._id}>
              <td className="border px-4 py-2">{light.itemName}</td>
              <td className="border px-4 py-2">{light.itemCode}</td>
              <td className="border px-4 py-2">{light.villaName} ({light.assignedUser?.username || light.assignedUser || 'N/A'})</td>
              <td className="border px-4 py-2">{light.brightness}</td>
              <td className="border px-4 py-2">{light.status}</td>
              <td className="border px-4 py-2">{light.access}</td>
              {(role === "admin" || role === "superadmin") && (
                <td className="border px-4 py-2">
                  <button
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-700"
                    onClick={() => openEditModal(light)}
                  >
                    Edit
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {lights.length === 0 && (
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
              disabled={editForm.access === "Disabled"}
            />
            <span className="w-12 text-center">{editForm.brightness}%</span>
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

export default UserLightList;