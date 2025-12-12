import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Home, Cpu, Utensils, Calendar } from 'lucide-react';

const CreationButtons = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
      <button
        onClick={() => navigate('/signup-options')}
        className="group bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl shadow-xl p-8 flex flex-col items-center hover:scale-105 transition-transform duration-200"
      >
        <UserPlus className="w-8 h-8 text-cyan-100 mb-2" />
        <h2 className="text-xl font-semibold text-white mb-1">Create User</h2>
        <p className="text-white/90 text-sm text-center">Add a new user to your company</p>
      </button>

      <button
        onClick={() => navigate('/create-equipment')}
        className="group bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl shadow-xl p-8 flex flex-col items-center hover:scale-105 transition-transform duration-200"
      >
        <Cpu className="w-8 h-8 text-emerald-100 mb-2" />
        <h2 className="text-xl font-semibold text-white mb-1">Create Equipment</h2>
        <p className="text-white/90 text-sm text-center">Register new equipment</p>
      </button>

      <button
        onClick={() => navigate('/create-room')}
        className="group bg-gradient-to-br from-indigo-500 to-blue-400 rounded-2xl shadow-xl p-8 flex flex-col items-center hover:scale-105 transition-transform duration-200"
      >
        <Home className="w-8 h-8 text-indigo-100 mb-2" />
        <h2 className="text-xl font-semibold text-white mb-1">Create Room</h2>
        <p className="text-white/90 text-sm text-center">Add a new room</p>
      </button>

      <button
        onClick={() => navigate('/create-foods')}
        className="group bg-gradient-to-br from-pink-500 to-orange-400 rounded-2xl shadow-xl p-8 flex flex-col items-center hover:scale-105 transition-transform duration-200"
      >
        <Utensils className="w-8 h-8 text-pink-100 mb-2" />
        <h2 className="text-xl font-semibold text-white mb-1">Create Food</h2>
        <p className="text-white/90 text-sm text-center">Add a new food item</p>
      </button>

      <button
        onClick={() => navigate('/create-booking')}
        className="group bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-xl p-8 flex flex-col items-center hover:scale-105 transition-transform duration-200"
      >
        <Calendar className="w-8 h-8 text-purple-100 mb-2" />
        <h2 className="text-xl font-semibold text-white mb-1">Create Booking</h2>
        <p className="text-white/90 text-sm text-center">Make a new reservation</p>
      </button>
    </div>
  );
};

export default CreationButtons;