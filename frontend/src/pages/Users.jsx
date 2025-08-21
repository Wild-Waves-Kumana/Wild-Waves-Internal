import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import UserList from '../components/lists/UserList';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [villas, setVillas] = useState([]);
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

        // Fetch all users, companies, and villas
        const [usersRes, companiesRes, villasRes] = await Promise.all([
          axios.get('http://localhost:5000/api/users'),
          axios.get('http://localhost:5000/api/company/all'),
          axios.get('http://localhost:5000/api/villas/all')
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

  return (
    <UserList
      users={users}
      companies={companies}
      villas={villas}
      loading={loading}
      navigate={navigate}
    />
  );
};

export default Users;
