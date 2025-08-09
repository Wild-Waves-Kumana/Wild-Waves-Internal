import React, { useState, useContext } from "react";
import {
  FaCog,
  FaDoorOpen,
  FaHome,
  FaSignOutAlt,
  FaUser,
  FaUserFriends,
} from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import { UserContext } from '../context/UserContext';
import {jwtDecode} from 'jwt-decode';

const Sidebar = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  let userRole = null;
  let username = null;
  let userId = null;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      userRole = decoded.role;
      username = decoded.username;
      userId = decoded.id || decoded.userId || null; // Adjust according to your token structure
    } catch {
      userRole = null;
      username = null;
      userId = null;
    }
  }

  const { logout } = useContext(UserContext);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const confirmLogout = () => {
    setShowLogoutModal(true);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <aside className="w-64 bg-slate-200 min-h-screen p-6 flex flex-col">
      <h1 className="text-3xl pb-4 font-bold">Welcome, {username} 👋</h1>
      <nav className="flex-1">
        <ul className="space-y-6">
          <li>
            <NavLink
              to={userRole === 'user' ? "/userdashboard": userRole === 'admin' ? "/admindashboard" : userRole === 'superadmin' ? "/superadmindashboard" : "/unauthorized"}
              className={({ isActive }) =>
                isActive
                  ? " text-blue-600 flex items-center gap-4 dark:text-blue-400"
                  : "text-gray-600 flex items-center gap-2 dark:text-slate-400"
              }
            >
              <FaHome /> Dashboard
            </NavLink>
          </li>
           {userRole === 'user' && (
            <>
              <li>
                <NavLink
                  to={`/user-profile/${userId}`}
                  className={({ isActive }) =>
                    isActive
                      ? " text-blue-600 flex items-center gap-4 dark:text-blue-400"
                      : "text-gray-600 flex items-center gap-2 dark:text-slate-400"
                  }
                >
                  <FaUser /> Profile
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/equipment"
                  className={({ isActive }) =>
                    isActive
                      ? " text-blue-600 flex items-center gap-4 dark:text-blue-400"
                      : "text-gray-600 flex items-center gap-2 dark:text-slate-400"
                  }
                >
                  <FaUserFriends /> Equipments
                </NavLink>
              </li>
              </>
          )}
          {userRole !== 'user' && (
            <>
              <li>
                <NavLink
                  to="/userlist"
                  className={({ isActive }) =>
                    isActive
                      ? " text-blue-600 flex items-center gap-4 dark:text-blue-400"
                      : "text-gray-600 flex items-center gap-2 dark:text-slate-400"
                  }
                >
                  <FaUserFriends /> Users List
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin-profile"
                  className={({ isActive }) =>
                    isActive
                      ? " text-blue-600 flex items-center gap-4 dark:text-blue-400"
                      : "text-gray-600 flex items-center gap-2 dark:text-slate-400"
                  }
                >
                  <FaUser /> Admin Profile
                </NavLink>
              </li>

              {/* <li>
                <NavLink
                  to="/doors"
                  className={({ isActive }) =>
                    isActive
                      ? " text-blue-600 flex items-center gap-4 dark:text-blue-400"
                      : "text-gray-600 flex items-center gap-2 dark:text-slate-400"
                  }
                >
                  <FaDoorOpen /> Doors
                </NavLink>
              </li> */}
            </>
          )}
          {userRole === 'superadmin' && (
            <>
              <li>
                <NavLink
                  to="/company-list"
                  className={({ isActive }) =>
                    isActive
                      ? " text-blue-600 flex items-center gap-4 dark:text-blue-400"
                  : "text-gray-600 flex items-center gap-2 dark:text-slate-400"
                  }
                >
                  <FaUserFriends /> Companies
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin-users"
                  className={({ isActive }) =>
                    isActive
                      ? " text-blue-600 flex items-center gap-4 dark:text-blue-400"
                  : "text-gray-600 flex items-center gap-2 dark:text-slate-400"
                  }
                >
                  <FaUser /> Admins
                </NavLink>
              </li>
            </>
          )}
          <li>
                <NavLink
                  to="/settings"
                  className={({ isActive }) =>
                    isActive
                      ? " text-blue-600 flex items-center gap-4 dark:text-blue-400"
                      : "text-gray-600 flex items-center gap-2 dark:text-slate-400"
                  }
                >
                  <FaCog /> Settings
                </NavLink>
              </li>
          <li>
            <button
              onClick={confirmLogout}
              className="text-gray-600 flex items-center gap-2 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <FaSignOutAlt /> Logout
            </button>
          </li>
        </ul>
      </nav>

      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-50">
          <div className="bg-slate-600  dark:text-slate-200 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Confirm Logout</h2>
            <p className="mb-4">Are you sure you want to logout?</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={cancelLogout}
                className="px-4 py-2 bg-gray-300 text-slate-800 dark:bg-slate-600 dark:text-slate-200  rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;