import React, { useState, useContext } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import LogoutModal from './modals/LogoutModal';
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

const SIDEBAR_WIDTH = 256; // 64 * 4 (Tailwind w-64 = 16rem = 256px)

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { logout } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setShowLogoutModal(false);
    navigate('/');
  };

  const confirmLogout = () => setShowLogoutModal(true);
  const cancelLogout = () => setShowLogoutModal(false);

  return (
    <div className="relative min-h-screen">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} confirmLogout={confirmLogout} />
      <div
        className="transition-all duration-300"
        style={{
          marginLeft: sidebarOpen ? SIDEBAR_WIDTH : 0,
        }}
      >
        <Navbar setSidebarOpen={setSidebarOpen} />
        <main className="p-6 bg-gray-100">{children}</main>
      </div>
      <LogoutModal
        isVisible={showLogoutModal}
        onClose={cancelLogout}
        onLogout={handleLogout}
      />
    </div>
  );
};

export default Layout;
