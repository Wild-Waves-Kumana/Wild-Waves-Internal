import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import UserACList from '../components/UserACList';

const UserProfile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const adminId = localStorage.getItem('adminId');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/users/${userId}`);
        setUser(res.data);
      } catch (err) {
        console.error('Failed to fetch user:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found.</div>;

  return (
    <div>
      <div className="max-w-md mx-auto mt-10 bg-white shadow rounded p-6">
        <h2 className="text-2xl font-bold mb-4">User Profile</h2>
        <div className="mb-2"><strong>Username:</strong> {user.username}</div>
        <div className="mb-2"><strong>Room Name:</strong> {user.roomname}</div>
        <div className="mb-2"><strong>Room ID:</strong> {user.roomid}</div>
        <div className="mb-2"><strong>Role:</strong> {user.role}</div>
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to User List
        </button>
      </div>
      <div className="mt-4">
        <UserACList userId={userId} adminId={adminId} />
      </div>
    </div>
  );
};

export default UserProfile;
