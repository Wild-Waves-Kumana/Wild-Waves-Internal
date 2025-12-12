import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Home, Cpu, Utensils, Calendar } from 'lucide-react';

const CreationButtons = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
      {/* Create User */}
      <button
        onClick={() => navigate('/signup-options')}
        className="group relative flex items-center gap-3 p-4 rounded-xl bg-white border-2 border-cyan-400 hover:border-cyan-500 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all duration-300 transform hover:-translate-y-1"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <UserPlus className="w-5 h-5 text-cyan-600 relative z-10" />
        <div className="text-left relative z-10">
          <div className="text-sm font-semibold text-gray-800">Create User</div>
          <div className="text-xs text-gray-500 hidden sm:block">Add new user</div>
        </div>
      </button>

      {/* Create Equipment */}
      <button
        onClick={() => navigate('/create-equipment')}
        className="group relative flex items-center gap-3 p-4 rounded-xl bg-white border-2 border-emerald-400 hover:border-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all duration-300 transform hover:-translate-y-1"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 to-green-400/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <Cpu className="w-5 h-5 text-emerald-600 relative z-10" />
        <div className="text-left relative z-10">
          <div className="text-sm font-semibold text-gray-800">Create Equipment</div>
          <div className="text-xs text-gray-500 hidden sm:block">Register device</div>
        </div>
      </button>

      {/* Create Room */}
      <button
        onClick={() => navigate('/create-room')}
        className="group relative flex items-center gap-3 p-4 rounded-xl bg-white border-2 border-indigo-400 hover:border-indigo-500 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all duration-300 transform hover:-translate-y-1"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/10 to-blue-400/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <Home className="w-5 h-5 text-indigo-600 relative z-10" />
        <div className="text-left relative z-10">
          <div className="text-sm font-semibold text-gray-800">Create Room</div>
          <div className="text-xs text-gray-500 hidden sm:block">Add a room</div>
        </div>
      </button>

      {/* Create Food */}
      <button
        onClick={() => navigate('/create-foods')}
        className="group relative flex items-center gap-3 p-4 rounded-xl bg-white border-2 border-pink-400 hover:border-pink-500 hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all duration-300 transform hover:-translate-y-1"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-pink-400/10 to-rose-400/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <Utensils className="w-5 h-5 text-pink-600 relative z-10" />
        <div className="text-left relative z-10">
          <div className="text-sm font-semibold text-gray-800">Create Food</div>
          <div className="text-xs text-gray-500 hidden sm:block">Add food item</div>
        </div>
      </button>

      {/* Create Booking */}
      <button
        onClick={() => navigate('/create-booking')}
        className="group relative flex items-center gap-3 p-4 rounded-xl bg-white border-2 border-purple-400 hover:border-purple-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all duration-300 transform hover:-translate-y-1"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-violet-400/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <Calendar className="w-5 h-5 text-purple-600 relative z-10" />
        <div className="text-left relative z-10">
          <div className="text-sm font-semibold text-gray-800">Create Booking</div>
          <div className="text-xs text-gray-500 hidden sm:block">Make reservation</div>
        </div>
      </button>
    </div>
  );
};

export default CreationButtons;