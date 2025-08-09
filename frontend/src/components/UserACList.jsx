import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const UserACList = ({ userId: propUserId }) => {
  const [acs, setAcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("");

  useEffect(() => {
    const fetchACs = async () => {
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

          // Fetch admin's companyId
          const adminRes = await axios.get(`http://localhost:5000/api/admin/${loggedUserId}`);
          adminCompanyId = adminRes.data.companyId?._id || adminRes.data.companyId;
        }

        // Fetch all air conditioners
        const res = await axios.get("http://localhost:5000/api/equipment/air-conditioners");

        // Filter ACs assigned to the user
        let filtered = res.data.filter(
          (ac) =>
            (ac.assignedUser === userId) ||
            (ac.assignedUser && ac.assignedUser._id === userId)
        );

        // If admin, further filter by companyId
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
    };
    fetchACs();
  }, [propUserId]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className=" mx-auto mt-10 bg-white shadow rounded p-6">
      <h2 className="text-2xl font-bold mb-4">User's Air Conditioners</h2>
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="border px-4 py-2">Item Name</th>
            <th className="border px-4 py-2">Item Code</th>
            <th className="border px-4 py-2">Room Name</th>
            <th className="border px-4 py-2">Temperature</th>
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
              <td className="border px-4 py-2">{ac.roomname}</td>
              <td className="border px-4 py-2">{ac.temperaturelevel}</td>
              <td className="border px-4 py-2">{ac.mode}</td>
              <td className="border px-4 py-2">{ac.fanSpeed}</td>
              <td className="border px-4 py-2">{ac.status}</td>
              <td className="border px-4 py-2">{ac.access}</td>
              {(role === "admin" || role === "superadmin") && (
                <td className="border px-4 py-2">
                  <button
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-700"
                    onClick={() => window.location.href = `/edit-ac/${ac._id}`}
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
    </div>
  );
};

export default UserACList;