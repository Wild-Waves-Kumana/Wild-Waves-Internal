import React from "react";
import { jwtDecode } from "jwt-decode";
import { User, Shield, Waves, ShoppingCart, Menu } from "lucide-react"; // <-- add Menu icon
import { useNavigate } from "react-router-dom";

const Navbar = ({ setSidebarOpen }) => {
  const token = localStorage.getItem("token");
  let username = "";
  let role = "";
  const navigate = useNavigate();

  if (token) {
    try {
      const decoded = jwtDecode(token);
      username = decoded.username;
      role = decoded.role;
    } catch {
      username = "";
      role = "";
    }
  }

  // Get role color, icon, and background gradient
  const getRoleConfig = (userRole) => {
    switch (userRole?.toLowerCase()) {
      case 'superadmin':
        return { 
          color: 'text-red-100 bg-red-500/20', 
          icon: <Shield size={16} />,
          background: 'bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400'
        };
      case 'admin':
        return { 
          color: 'text-orange-100 bg-orange-500/20', 
          icon: <Shield size={16} />,
          background: 'bg-gradient-to-r from-cyan-400 via-sky-600 to-blue-700'
        };
      case 'user':
        return { 
          color: 'text-green-100 bg-green-500/20', 
          icon: <User size={16} />,
          background: 'bg-gradient-to-r from-blue-400 via-cyan-600 to-emerald-500'
        };
      default:
        return { 
          color: 'text-gray-100 bg-gray-500/20', 
          icon: <User size={16} />,
          background: 'bg-gradient-to-r from-blue-400 via-indigo-800 to-cyan-700'
        };
    }
  };

  const roleConfig = getRoleConfig(role);

  return (
    <nav className={`relative ${roleConfig.background} shadow-lg`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
      </div>
      
      <div className="relative flex items-center justify-between px-6 py-4">
        {/* Hamburger for sidebar (always visible) */}
        <button
          className="p-2 mr-2"
          onClick={() => setSidebarOpen(open => !open)}
          aria-label="Open sidebar"
        >
          <Menu size={28} className="text-white" />
        </button>

        {/* Logo Section */}
        <div className="flex items-center gap-3 flex-1">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Wild Waves
            </h1>
            <p className="text-blue-100 text-xs font-medium">Smart Home Control</p>
          </div>
        </div>

        {/* User Info Section */}
        <div className="flex items-center gap-4">
          {role && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-full border ${roleConfig.color} border-white/20 backdrop-blur-sm`}>
              {roleConfig.icon}
              <span className="text-sm font-medium capitalize">
                {role}
              </span>
            </div>
          )}

          {/* Cart Button for user role */}
          {role && role.toLowerCase() === "user" && (
            <button
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/20 hover:bg-white/30 border border-white/20 text-white transition"
              title="View Cart"
              onClick={() => navigate("/food-cart")}
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="hidden sm:inline text-sm font-medium">Cart</span>
            </button>
          )}

          {username && (
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-white text-sm font-medium">
                  {username}
                </span>
                <span className="text-blue-100 text-xs">
                  Welcome back
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Border Glow */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
    </nav>
  );
};

export default Navbar;