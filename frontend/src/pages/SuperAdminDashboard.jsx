import React, { useContext } from "react";
import { FaUserFriends, FaUser, FaBuilding } from "react-icons/fa";
import { UserContext } from "../context/UserContext";

const SuperAdminDashboard = () => {
  const { username } = useContext(UserContext);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Super Admin Dashboard</h1>
      <p className="mb-8 text-lg">Welcome, {username}! 👋</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white  rounded-lg shadow p-6 flex flex-col items-center">
          <FaUserFriends className="text-4xl text-blue-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Companies</h2>
          <p className="text-gray-600 dark:text-gray-300">Manage all companies in the system.</p>
        </div>
        <div className="bg-white  rounded-lg shadow p-6 flex flex-col items-center">
          <FaUser className="text-4xl text-green-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Admins</h2>
          <p className="text-gray-600 dark:text-gray-300">View and manage admin users.</p>
        </div>
        <div className="bg-white  rounded-lg shadow p-6 flex flex-col items-center">
          <FaBuilding className="text-4xl text-purple-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">System Overview</h2>
          <p className="text-gray-600 dark:text-gray-300">Get insights and statistics about the platform.</p>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;