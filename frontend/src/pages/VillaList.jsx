import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const VillaList = () => {
  const [villas, setVillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVillas = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return setLoading(false);
        const decoded = jwtDecode(token);
        const adminId = decoded.id;
        const role = decoded.role;

        // Fetch all villas
        const villasRes = await axios.get("http://localhost:5000/api/villas/all");

        if (role === "superadmin") {
          setVillas(villasRes.data); // Super admin sees all villas
        } else {
          // Fetch admin to get companyId
          const adminRes = await axios.get(`http://localhost:5000/api/admin/${adminId}`);
          const companyId = adminRes.data.companyId?._id || adminRes.data.companyId;
          // Filter villas by companyId
          const filteredVillas = villasRes.data.filter(
            (v) =>
              v.companyId === companyId ||
              v.companyId?._id === companyId
          );
          setVillas(filteredVillas);
        }
      } catch (err) {
        console.error(err);
        setVillas([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVillas();
  }, []);

  useEffect(() => {
    // Fetch all rooms once
    const fetchRooms = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/rooms/all");
        setRooms(res.data);
      } catch {
        setRooms([]);
      }
    };
    fetchRooms();
  }, []);

  const getVillaRooms = (villa) => {
    if (!villa.rooms || !Array.isArray(villa.rooms)) return [];
    return rooms.filter(room => villa.rooms.includes(room._id));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="mx-auto mt-10 bg-white shadow rounded p-6 max-w-2xl">
      <h2 className="text-2xl font-bold mb-4">Villas {villas.length > 0 && "(Total: " + villas.length + ")"}</h2>
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="border px-4 py-2">Villa Name</th>
            <th className="border px-4 py-2">Villa ID</th>
            <th className="border px-4 py-2">Rooms</th>
            <th className="border px-4 py-2">Profile</th>
          </tr>
        </thead>
        <tbody>
          {villas.map((villa) => (
            <tr key={villa._id}>
              <td className="border px-4 py-2">{villa.villaName}</td>
              <td className="border px-4 py-2">{villa.villaId}</td>
              <td className="border px-4 py-2">
                <div className="relative">
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-700"
                    onClick={() => setOpenDropdown(openDropdown === villa._id ? null : villa._id)}
                  >
                    {openDropdown === villa._id ? "Hide Rooms" : "Show Rooms"}
                  </button>
                  {openDropdown === villa._id && (
                    <div className="absolute z-10 mt-2 bg-white border rounded shadow w-48 max-h-48 overflow-auto">
                      {getVillaRooms(villa).length > 0 ? (
                        <ul>
                          {getVillaRooms(villa).map(room => (
                            <li key={room._id} className="px-4 py-2 hover:bg-gray-100">{room.roomName}</li>
                          ))}
                        </ul>
                      ) : (
                        <div className="px-4 py-2 text-gray-400">No rooms</div>
                      )}
                    </div>
                  )}
                </div>
              </td>
              <td className="border px-4 py-2">
                <button
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-700"
                  onClick={() => navigate(`/villa-profile/${villa._id}`)}
                >
                  View Profile
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {villas.length === 0 && <div className="mt-4 text-gray-500">No villas found.</div>}
    </div>
  );
};

export default VillaList;