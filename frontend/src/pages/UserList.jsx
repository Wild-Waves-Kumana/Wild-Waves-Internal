import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [adminCompanyId, setAdminCompanyId] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get adminId from token
        const token = localStorage.getItem('token');
        if (!token) return setLoading(false);
        const decoded = jwtDecode(token);
        const adminId = decoded.id;

        // Fetch admin details to get companyId
        const adminRes = await axios.get(`http://localhost:5000/api/admin/${adminId}`);
        const companyId = adminRes.data.companyId?._id || adminRes.data.companyId;
        setAdminCompanyId(companyId);

        // Fetch all users
        const usersRes = await axios.get('http://localhost:5000/api/users');
        // Fetch all companies
        const companiesRes = await axios.get('http://localhost:5000/api/company/all');
        setCompanies(companiesRes.data);

        // Filter users by companyId
        const filteredUsers = usersRes.data.filter(
          (u) =>
            u.companyId === companyId ||
            u.companyId?._id === companyId
        );
        setUsers(filteredUsers);
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper to get company name by ID
  const getCompanyName = (companyId) => {
    if (!companyId) return 'N/A';
    const found = companies.find(
      (c) => c._id === companyId || c.companyId === companyId
    );
    return found ? found.companyName : 'N/A';
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white shadow rounded p-6">
      <h2 className="text-2xl font-bold mb-4">Users in Your Company</h2>
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="border px-4 py-2">Username</th>
            <th className="border px-4 py-2">Room Name</th>
            <th className="border px-4 py-2">Room ID</th>
            <th className="border px-4 py-2">Company</th>
            <th className="border px-4 py-2">Profile</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td className="border px-4 py-2">{u.username}</td>
              <td className="border px-4 py-2">{u.roomname}</td>
              <td className="border px-4 py-2">{u.roomid}</td>
              <td className="border px-4 py-2">
                {getCompanyName(u.companyId?._id || u.companyId)}
              </td>
              <td className="border px-4 py-2">
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-700"
                  onClick={() => navigate(`/user-profile/${u._id}`)}
                >
                  View Profile
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && <div className="mt-4 text-gray-500">No users found for your company.</div>}
    </div>
  );
};

export default UserList;
