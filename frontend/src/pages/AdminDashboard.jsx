import React, { useContext } from 'react';
import { UserContext } from '../context/UserContext';
import CreationButtons from '../components/admin-dashboard-components/CreationButtons';

const AdminDashboard = () => {
  const { username } = useContext(UserContext);

  return (
    <div className=" w-full ">
      <div className="max-w-6xl mx-auto px-4 ">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
          <div>
            <p className="text-lg text-cyan-700 font-medium">
              Welcome, <span className="font-bold">{username}</span> 👋
            </p>
          </div>
        </div>

        <CreationButtons />
        
      </div>
    </div>
  );
};

export default AdminDashboard;
