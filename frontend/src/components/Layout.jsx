import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar on the left */}
      <Sidebar />
      {/* Main content area */}
      <div className="flex flex-col flex-1">
        {/* Navbar at the top of main area */}
        <Navbar />
        <main className="flex-1 p-6 bg-gray-100">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
