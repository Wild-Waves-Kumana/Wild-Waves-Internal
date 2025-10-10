import React, { useEffect, useState } from "react";
import {
  FaCog,
  FaHome,
  FaSignOutAlt,
  FaUser,
  FaUsers,
  FaTools,
  FaUtensils,
  FaShoppingCart,
  FaBuilding,
  FaUserShield,
} from "react-icons/fa";
import { NavLink} from "react-router-dom";
import { UserContext } from '../context/UserContext';
import {jwtDecode} from 'jwt-decode';
import Modal from "./common/Modal";
import Logo from "../assets/logo.png";

const Sidebar = ({ open, setOpen, confirmLogout }) => {
  const [companyId, setCompanyId] = useState(null);

  const token = localStorage.getItem('token');
  let userRole = null;
  let userId = null;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      userRole = decoded.role;
      userId = decoded.id || decoded.userId || null;
    } catch {
      userRole = null;
      userId = null;
    }
  }

  useEffect(() => {
    // Only fetch for admin/superadmin
    if ((userRole === 'admin' || userRole === 'superadmin') && userId) {
      fetch(`/api/admin/${userId}`)
        .then(res => res.json())
        .then(data => {
          // companyId can be an object or string
          if (data.companyId && typeof data.companyId === "object") {
            setCompanyId(data.companyId._id || data.companyId);
          } else {
            setCompanyId(data.companyId);
          }
        })
        .catch(() => setCompanyId(null));
    }
  }, [userRole, userId]);

  return (
    <>
      {/* Overlay to detect clicks outside sidebar */}
      <div
        className={`fixed inset-0  bg-opacity-40  transition-opacity duration-300 ${open ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />

      
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'}
          bg-gradient-to-br from-slate-800/90 via-blue-900/80 to-indigo-900/90
          backdrop-blur-xl border-r border-white/10`}
      >
        {/* Glass overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 via-transparent to-cyan-400/5"></div>
        
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-32 h-32 bg-blue-400/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-20 right-0 w-24 h-24 bg-cyan-300/20 rounded-full blur-lg animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-indigo-400/20 rounded-full blur-md animate-pulse delay-500"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 p-6 h-full flex flex-col">
          {/* Close button */}
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors duration-200"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>

          {/* Logo */}
          <div className="mb-4">
            <img src={Logo} alt="Wild Waves Kumana" className="w-40 mb-4 select-none filter drop-shadow-lg" />
          </div>

          {/* Navigation */}
          <nav className="flex-1">
            <ul className="space-y-2">
              <li>
                <NavLink
                  to={userRole === 'user' ? "/userdashboard": userRole === 'admin' ? "/admindashboard" : userRole === 'superadmin' ? "/superadmindashboard" : "/unauthorized"}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/20"
                        : "text-white/80 hover:text-white hover:bg-white/10 hover:backdrop-blur-sm"
                    }`
                  }
                >
                  <FaHome className="text-lg" /> 
                  <span className="font-medium">Dashboard</span>
                </NavLink>
              </li>
              <li>
                    <NavLink
                      to={userRole === 'user' ? `/user-profile/${userId}` : userRole === 'admin' ? `/admin-profile/${userId}` : userRole === 'superadmin' ? `/superadmin-profile/` : "/unauthorized"}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                          isActive
                            ? "bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/20"
                            : "text-white/80 hover:text-white hover:bg-white/10 hover:backdrop-blur-sm"
                        }`
                      }
                    >
                      <FaUser className="text-lg" /> 
                      <span className="font-medium">Profile</span>
                    </NavLink>
                  </li>

              {userRole === 'user' && (
                <>
                  
                  <li>
                    <NavLink
                      to="/equipment"
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                          isActive
                            ? "bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/20"
                            : "text-white/80 hover:text-white hover:bg-white/10 hover:backdrop-blur-sm"
                        }`
                      }
                    >
                      <FaTools className="text-lg" /> 
                      <span className="font-medium">Equipments</span>
                    </NavLink>
                  </li>
                </>
              )}

              {userRole === 'admin' && (
                <>
                  
                  <li>
                    <NavLink
                      to="/users"
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                          isActive
                            ? "bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/20"
                            : "text-white/80 hover:text-white hover:bg-white/10 hover:backdrop-blur-sm"
                        }`
                      }
                    >
                      <FaUsers className="text-lg" /> 
                      <span className="font-medium">Users</span>
                    </NavLink>
                  </li>
                </>
              )}

              <li>
                <NavLink
                  to={userRole === 'user' ? "/food-menu" : userRole === 'admin' ? "/company-foods" : userRole === 'superadmin' ? "/company-foods" : "/unauthorized"}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/20"
                        : "text-white/80 hover:text-white hover:bg-white/10 hover:backdrop-blur-sm"
                    }`
                  }
                >
                  <FaUtensils className="text-lg" /> 
                  <span className="font-medium">Foods</span>
                </NavLink>
              </li>

              {userRole !== 'user' && (
                <li>
                  <NavLink
                    to="/company-food-orders"
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        isActive
                          ? "bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/20"
                          : "text-white/80 hover:text-white hover:bg-white/10 hover:backdrop-blur-sm"
                      }`
                    }
                  >
                    <FaShoppingCart className="text-lg" /> 
                    <span className="font-medium">Food Orders</span>
                  </NavLink>
                </li>
              )}

              {userRole === 'superadmin' && (
                <>
                  <li>
                    <NavLink
                      to="/company-dashboard"
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                          isActive
                            ? "bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/20"
                            : "text-white/80 hover:text-white hover:bg-white/10 hover:backdrop-blur-sm"
                        }`
                      }
                    >
                      <FaBuilding className="text-lg" /> 
                      <span className="font-medium">Companies</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/admin-users"
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                          isActive
                            ? "bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/20"
                            : "text-white/80 hover:text-white hover:bg-white/10 hover:backdrop-blur-sm"
                        }`
                      }
                    >
                      <FaUserShield className="text-lg" /> 
                      <span className="font-medium">Admins</span>
                    </NavLink>
                  </li>
                </>
              )}

              <li>
                <NavLink
                  to="/settings"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/20"
                        : "text-white/80 hover:text-white hover:bg-white/10 hover:backdrop-blur-sm"
                    }`
                  }
                >
                  <FaCog className="text-lg" /> 
                  <span className="font-medium">Settings</span>
                </NavLink>
              </li>

              <li>
                <button
                  onClick={confirmLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-300 hover:text-red-200 hover:bg-red-500/20 transition-all duration-200"
                >
                  <FaSignOutAlt className="text-lg" /> 
                  <span className="font-medium">Logout</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Bottom glow */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
      </aside>
    </>
  );
};

export default Sidebar;