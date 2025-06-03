import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

const Unauthorized = () => {
  const navigate = useNavigate();
  const { logout } = useContext(UserContext);

  return (
    <div className="text-center mt-10 text-xl text-red-600 space-y-4">
      <p>❌ You do not have permission to access this page.</p>

      <div className="space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Go Back
        </button>

        <button
          onClick={() => {
            logout();
            navigate('/'); // Redirect to login or homepage after logout
          }}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
