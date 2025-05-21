import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const goToSignup = () => {
    navigate('/signup');
  }; 

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <button
        onClick={goToSignup}
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Go to Signup
      </button>
    </div>
  );
};

export default AdminDashboard;
