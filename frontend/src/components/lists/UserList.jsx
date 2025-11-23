import React, { useMemo, useEffect, useState } from 'react';
import ReusableTable from '../common/ReusableTable';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [villas, setVillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch all data inside UserList (like LightList)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get adminId from token
        const token = localStorage.getItem('token');
        if (!token) return setLoading(false);
        const decoded = jwtDecode(token);
        const adminId = decoded.id;

        // Fetch admin details to get companyId
        const adminRes = await axios.get(`/api/admin/${adminId}`);
        const companyId = adminRes.data.companyId?._id || adminRes.data.companyId;

        // Fetch all users, companies, and villas
        const [usersRes, companiesRes, villasRes] = await Promise.all([
          axios.get('/api/users'),
          axios.get('/api/companies/all'),
          axios.get('/api/villas/all')
        ]);
        setCompanies(companiesRes.data);
        setVillas(villasRes.data);

        // Filter users by companyId
        const filteredUsers = usersRes.data.filter(
          (u) =>
            u.companyId === companyId ||
            u.companyId?._id === companyId
        );
        setUsers(filteredUsers);
      } catch (err) {
        console.error('Failed to fetch users, companies, or villas:', err);
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

  // Helper to get villa name by villaId
  const getVillaName = (villaId) => {
    if (!villaId) return 'N/A';
    const found = villas.find(
      (v) => v._id === villaId || v.villaId === villaId
    );
    return found ? found.villaName : 'N/A';
  };

  // Prepare columns for ReusableTable
  const columns = useMemo(() => [
    { key: "username", header: "Username" },
    {
      key: "villaId",
      header: "Villa Name",
      render: (value) => getVillaName(value)
    },
    {
      key: "companyId",
      header: "Company",
      render: (value) => getCompanyName(value?._id || value)
    },
    
    {
      key: "checkinDate",
      header: "Check-In",
      render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
    },
    {
      key: "checkoutDate",
      header: "Check-Out",
      render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
    },
    

    {
      key: "access",
      header: "Access",
      render: (value) => (
        <span className={`px-2 py-1 rounded ${value === true ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {value === true ? "Enabled" : "Disabled"}
        </span>
      )
    },
    {
      key: "profile",
      header: "Profile",
      render: (_, row) => (
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-700"
          onClick={() => navigate(`/user-profile/${row._id}`)}
        >
          View Profile
        </button>
      )
    }
  ], [companies, villas, navigate]);

  return (
    <div className="mx-auto  bg-white shadow rounded p-6">
      <h2 className="text-2xl font-bold mb-4">Users in Your Company</h2>
      <ReusableTable
        columns={columns}
        data={users}
        loading={loading}
        pagination={true}
        pageSize={10}
        emptyMessage="No users found for your company."
      />
    </div>
  );
};

export default UserList;