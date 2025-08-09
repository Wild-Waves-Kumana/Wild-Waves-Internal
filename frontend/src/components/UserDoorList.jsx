import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const UserDoorList = ({ userId: propUserId }) => {
  const [doors, setDoors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoors = async () => {
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
    };
    fetchDoors();
  }, [propUserId]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="mx-auto mt-10 bg-white shadow rounded p-6">
      <h2 className="text-2xl font-bold mb-4">User's Doors</h2>
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="border px-4 py-2">Item Name</th>
            <th className="border px-4 py-2">Item Code</th>
            <th className="border px-4 py-2">Room Name</th>
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
              <td className="border px-4 py-2">{door.roomname} ({door.assignedUser?.username || door.assignedUser || 'N/A'})</td>
              <td className="border px-4 py-2">{door.status}</td>
              <td className="border px-4 py-2">{door.access}</td>
              {(role === "admin" || role === "superadmin") && (
                <td className="border px-4 py-2">
                  <div className="flex justify-center">
                    <button
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-700 active:bg-yellow-800"
                      onClick={() => navigate(`/edit-door/${door._id}`)}
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
    </div>
  );
};

export default UserDoorList;
