import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar: always overlays, auto-hide on close */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      {/* Main content area */}
      <div className="flex flex-col flex-1">
        {/* Navbar with hamburger */}
        <Navbar setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 p-6 bg-gray-100">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
