import React, { useState, useContext } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import LogoutModal from './modals/LogoutModal';
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

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
    <div className="flex min-h-screen">
      <Sidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        confirmLogout={confirmLogout}
      />
      <div className="flex flex-col flex-1">
        <Navbar setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 p-6 bg-gray-100">{children}</main>
      </div>
      {/* Global Logout Modal */}
      <LogoutModal
        isVisible={showLogoutModal}
        onClose={cancelLogout}
        onLogout={handleLogout}
      />
    </div>
  );
};

export default Layout;
