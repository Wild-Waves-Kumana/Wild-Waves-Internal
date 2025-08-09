import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const UserLightList = ({ userId: propUserId }) => {
  const [lights, setLights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLights = async () => {
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
    };
    fetchLights();
  }, [propUserId]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="mx-auto mt-10 bg-white shadow rounded p-6">
      <h2 className="text-2xl font-bold mb-4">User's Lights</h2>
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="border px-4 py-2">Item Name</th>
            <th className="border px-4 py-2">Item Code</th>
            <th className="border px-4 py-2">Room Name</th>
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
              <td className="border px-4 py-2">{light.roomname} ({light.assignedUser?.username || light.assignedUser || 'N/A'})</td>
              <td className="border px-4 py-2">{light.brightness}</td>
              <td className="border px-4 py-2">{light.status}</td>
              <td className="border px-4 py-2">{light.access}</td>
              {(role === "admin" || role === "superadmin") && (
                <td className="border px-4 py-2">
                  <button
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-700"
                    onClick={() => navigate(`/edit-light/${light._id}`)}
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
    </div>
  );
};

export default UserLightList;