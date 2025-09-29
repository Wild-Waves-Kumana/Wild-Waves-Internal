import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import ReusableTable from '../common/ReusableTable';

const VillaList = ({ companyId: propCompanyId }) => {
  const [villas, setVillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVillas = async () => {
      try {
        let companyId = propCompanyId;
        if (!companyId) {
          const token = localStorage.getItem('token');
          if (!token) return setLoading(false);
          const decoded = jwtDecode(token);
          const adminId = decoded.id;
          const role = decoded.role;

          // Fetch all villas
          const villasRes = await axios.get("/api/villas/all");

          if (role === "superadmin") {
            setVillas(villasRes.data); // Super admin sees all villas
            setLoading(false);
            return;
          } else {
            // Fetch admin to get companyId
            const adminRes = await axios.get(`/api/admin/${adminId}`);
            companyId = adminRes.data.companyId?._id || adminRes.data.companyId;
          }
        }

        // Fetch all villas
        const villasRes = await axios.get("/api/villas/all");
        // Filter villas by companyId
        const filteredVillas = villasRes.data.filter(
          (v) =>
            v.companyId === companyId ||
            v.companyId?._id === companyId
        );
        setVillas(filteredVillas);
      } catch (err) {
        console.error(err);
        setVillas([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVillas();
  }, [propCompanyId]);

  useEffect(() => {
    // Fetch all rooms once
    const fetchRooms = async () => {
      try {
        const res = await axios.get("/api/rooms/all");
        setRooms(res.data);
      } catch {
        setRooms([]);
      }
    };
    fetchRooms();
  }, []);

  // Helper to get room names for a villa
  const getVillaRooms = (villa) => {
    if (!villa.rooms || !Array.isArray(villa.rooms)) return [];
    return rooms.filter(room => villa.rooms.includes(room._id));
  };

  // Prepare columns for ReusableTable
  const columns = useMemo(() => [
    { key: "villaName", header: "Villa Name" },
    { key: "villaId", header: "Villa ID" },
    {
      key: "rooms",
      header: "Rooms",
      render: (_, row) => (
        <div className="relative">
          <button
            className="bg-gray-200 text-gray-600 px-3 py-1 rounded hover:bg-gray-300"
            onClick={() => setOpenDropdown(openDropdown === row._id ? null : row._id)}
          >
            {openDropdown === row._id ? "Hide Rooms" : "Show Rooms"}
          </button>
          {openDropdown === row._id && (
            <div className="absolute z-10 mt-2 bg-white border rounded shadow w-48 max-h-48 overflow-auto">
              {getVillaRooms(row).length > 0 ? (
                <ul>
                  {getVillaRooms(row).map(room => (
                    <li key={room._id} className="px-4 py-2 hover:bg-gray-100">{room.roomName}</li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-2 text-gray-400">No rooms</div>
              )}
            </div>
          )}
        </div>
      )
    },
    {
      key: "profile",
      header: "Profile",
      render: (_, row) => (
        <button
          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-700"
          onClick={() => navigate(`/villa-profile/${row._id}`)}
        >
          View Profile
        </button>
      )
    }
  ], [rooms, openDropdown, navigate]);

  return (
    <div className="mx-auto mt-10 bg-white shadow rounded p-6">
      <h2 className="text-2xl font-bold mb-4">
        Villas {villas.length > 0 && `(Total: ${villas.length})`}
      </h2>
      <ReusableTable
        columns={columns}
        data={villas}
        loading={loading}
        pagination={true}
        pageSize={10}
        emptyMessage="No villas found."
      />
    </div>
  );
};

export default VillaList;