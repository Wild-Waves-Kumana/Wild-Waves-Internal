//import React, { useContext } from 'react';
import { UserContext } from '../context/UserContext';
import CreationButtons from '../components/admin-dashboard-components/CreationButtons';

const AdminDashboard = () => {
  //const { username } = useContext(UserContext);

  return (
    <div className=" w-full ">
      <div className="max-w-6xl mx-auto px-4 ">
        

        {/* Quick Actions Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
            Quick Actions
          </h2>
          <CreationButtons />
        </div>
        
      
        
      </div>
    </div>
  );
};

export default AdminDashboard;
