import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { jwtDecode } from 'jwt-decode';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { username, logout } = useContext(UserContext);

  // Get user id from the JWT token
  const token = localStorage.getItem('token');
  let userId = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      userId = decoded.id; // or decoded._id depending on your backend
      console.log('User ID:', userId);
    } catch (err) {
      console.error('Invalid token:', err);
    }
  }

  const handleLogout = () => {
    logout();            // clear login state
    navigate('/');       // go back to login
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold text-green-800">Welcome to User Dashboard 🎉</h1>
      <h1 className="text-3xl pb-4 font-bold">Welcome, {username} 👋</h1>
      <div>
        <button
          onClick={handleLogout}
          className="mt-8 bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600">
          Logout
        </button>
      </div>
    </div>
  )
}

export default UserDashboard
