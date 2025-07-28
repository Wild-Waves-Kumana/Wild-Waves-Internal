import React from "react";

const Navbar = () => {
  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");

  return (
    <nav className="flex items-center justify-between bg-white shadow px-6 py-4">
      <div className="text-2xl font-bold text-blue-700">Wild Waves</div>
      <div className="flex items-center gap-6">
        <span className="text-gray-700">
          {role ? `Role: ${role}` : ""}
        </span>
        <span className="text-gray-700">
          {username ? `User: ${username}` : ""}
        </span>
      </div>
    </nav>
  );
};

export default Navbar;