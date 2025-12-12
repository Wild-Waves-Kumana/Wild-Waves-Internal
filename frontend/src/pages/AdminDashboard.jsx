//import React, { useContext } from 'react';
import React from 'react';
import CreationButtons from '../components/admin-dashboard-components/CreationButtons';
import DashboardCounters from '../components/admin-dashboard-components/DashboardCounters';
import TotalBookingsCalander from '../components/admin-dashboard-components/TotalBookingsCalander';
import { TrendingUp } from 'lucide-react';

const AdminDashboard = () => {
  //const { username } = useContext(UserContext);

  return (
    <div className=" w-full ">
      <div className="max-w-6xl mx-auto px-4 ">
        {/* Quick Actions Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
            Quick Actions
          </h2>
          <CreationButtons />
        </div>
        
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Dashboard Counters - 2/3 width */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-red-600 rounded-full"></span>
            Dashboard Counters
          </h2>
            <DashboardCounters />
          </div>
          
          {/* Booking Calendar - 1/3 width */}
          <div className="md:col-span-1">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-green-600 rounded-full"></span>
            Total Bookings
          </h2>
            <TotalBookingsCalander />
          </div>
        </div>

        

        
        
      
        
      </div>
    </div>
  );
};

export default AdminDashboard;
