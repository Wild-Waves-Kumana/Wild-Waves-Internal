import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import ReusableTable from "../common/ReusableTable";
import EditAirConditionerModal from "../modals/EditAirConditionerModal";

const ACList = ({ userId: propUserId, selectedRoomId, roomIds, role: propRole }) => {
  const [acs, setAcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(propRole || "");
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAC, setSelectedAC] = useState(null);
  const [editForm, setEditForm] = useState({
    itemName: "",
    itemCode: "",
    temperaturelevel: "",
    mode: "",
    fanSpeed: "",
    status: false,
    access: false,
  });

  // Fetch ACs for rooms if roomIds is provided, otherwise use user logic
  const fetchACs = useCallback(async () => {
    try {
      if (roomIds && Array.isArray(roomIds) && roomIds.length > 0) {
        const acRes = await axios.get("/api/equipment/air-conditioners");
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

      const userRes = await axios.get(`/api/users/${userId}`);
      const user = userRes.data;
      if (!user.rooms || user.rooms.length === 0) {
        setAcs([]);
        setLoading(false);
        return;
      }

      const allRoomsRes = await axios.get('/api/rooms/all');
      const userRooms = allRoomsRes.data.filter(room => user.rooms.includes(room._id));
      const acIds = userRooms.flatMap(room => room.airConditioners || []);

      if (acIds.length === 0) {
        setAcs([]);
        setLoading(false);
        return;
      }

      const acRes = await axios.get("/api/equipment/air-conditioners");
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
      status: ac.status === true,
      access: ac.access === true,
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
        `/api/equipment/air-conditioners/${selectedAC._id}`,
        editForm
      );
      setShowEditModal(false);
      await fetchACs();
    } catch (err) {
      console.error("Failed to update AC:", err);
      alert("Failed to update AC.");
    }
  };

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

  // Prepare columns for ReusableTable
  const columns = [
    { key: "itemName", header: "Item Name" },
    { key: "itemCode", header: "Item Code" },
    { key: "roomName", header: "Room" },
    { key: "temperaturelevel", header: "Temp" },
    { key: "mode", header: "Mode" },
    { key: "fanSpeed", header: "Fan Speed" },
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
  const tableData = filteredAcs.map(ac => ({
    ...ac,
    roomName: ac.roomId?.roomName || "N/A",
  }));

  if (loading) return <div>Loading...</div>;

  return (
    <div className="mx-auto my-4 bg-white shadow rounded p-6">
      <h2 className="text-2xl font-bold mb-4">Air Conditioners</h2>

      <ReusableTable
        columns={columns}
        data={tableData}
        pagination={true}
        pageSize={5}
        pageSizeOptions={[5, 10, 20, 50]}
      />
      
      {filteredAcs.length === 0 && (
        <div className="mt-4 text-gray-500">No air conditioners found for this user.</div>
      )}

      <EditAirConditionerModal
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

export default ACList;