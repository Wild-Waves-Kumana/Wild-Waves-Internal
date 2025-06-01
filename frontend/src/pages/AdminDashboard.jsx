import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { username, logout } = useContext(UserContext);
  const token = localStorage.getItem('token');

  //Display token in console
  console.log('JWT Token:', token);

  const handleLogout = () => {
    logout();            // clear login state
    navigate('/');       // go back to login
  };

   const signup = () => {
    navigate('/signup');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold mb-6 text-blue-700">Welcome to Admin Dashboard</h1>
      <h1 className="text-3xl pb-4 font-bold">Welcome, {username} 👋</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-4xl">
        <div className="bg-white p-6 rounded shadow text-center">
          <h2 className="text-xl font-semibold">Users</h2>
          <p className="text-gray-500">Manage user accounts</p>
        </div>
        <div className="bg-white p-6 rounded shadow text-center">
          <h2 className="text-xl font-semibold">Reports</h2>
          <p className="text-gray-500">View system reports</p>
        </div>
        <div className="bg-white p-6 rounded shadow text-center">
          <h2 className="text-xl font-semibold">Settings</h2>
          <p className="text-gray-500">Configure system preferences</p>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="mt-8 bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600">
        Logout
      </button>

      <button
        onClick={signup}
        className="px-6 py-2 my-3 bg-blue-600 text-white rounded hover:bg-blue-700">
        Go to Signup
      </button>

    </div>
  );
};

export default AdminDashboard;
