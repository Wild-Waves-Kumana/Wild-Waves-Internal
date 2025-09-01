import React, { useContext } from "react";
import { FaUserFriends, FaUser, FaBuilding } from "react-icons/fa";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

const SuperAdminDashboard = () => {
  const { username } = useContext(UserContext);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full ">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-blue-800 mb-2">
              Super Admin Dashboard
            </h1>
            <p className="text-lg text-cyan-700 font-medium">
              Welcome,{" "}
              <span className="font-bold">{username}</span> 👋
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <button
            onClick={() => navigate("/create-company")}
            className="group bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-xl p-8 flex flex-col items-center hover:scale-105 transition-transform duration-200"
          >
            <FaUserFriends className="w-10 h-10 text-cyan-100 mb-4" />
            <h2 className="text-xl font-semibold text-white mb-1">Create Companies</h2>
            <p className="text-white/90 text-sm text-center">
              Manage and create companies
            </p>
          </button>
          <button
            onClick={() => navigate("/create-admin")}
            className="group bg-gradient-to-br from-emerald-500 to-blue-400 rounded-2xl shadow-xl p-8 flex flex-col items-center hover:scale-105 transition-transform duration-200"
          >
            <FaUser className="w-10 h-10 text-emerald-100 mb-4" />
            <h2 className="text-xl font-semibold text-white mb-1">Create Admins</h2>
            <p className="text-white/90 text-sm text-center">
              View and create admin users
            </p>
          </button>
          <div className="group bg-gradient-to-br from-indigo-500 to-purple-400 rounded-2xl shadow-xl p-8 flex flex-col items-center">
            <FaBuilding className="w-10 h-10 text-indigo-100 mb-4" />
            <h2 className="text-xl font-semibold text-white mb-1">
              System Overview
            </h2>
            <p className="text-white/90 text-sm text-center">
              Get insights and statistics about the platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;