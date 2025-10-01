import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { User, Shield, ShoppingCart, Menu } from "lucide-react";
import { useNavigate, NavLink } from "react-router-dom";

const ROLE_CONFIG = {
  superadmin: {
    color: "text-red-100 bg-red-500/20",
    icon: <Shield size={16} />,
    background: "bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400",
    dashboard: "/superadmindashboard",
    label: "Super Admin",
  },
  admin: {
    color: "text-orange-100 bg-orange-500/20",
    icon: <Shield size={16} />,
    background: "bg-gradient-to-r from-cyan-400 via-sky-600 to-blue-700",
    dashboard: "/admindashboard",
  },
  user: {
    color: "text-green-100 bg-green-500/20",
    icon: <User size={16} />,
    background: "bg-gradient-to-r from-blue-400 via-cyan-600 to-emerald-500",
    dashboard: "/userdashboard",
  },
  default: {
    color: "text-gray-100 bg-gray-500/20",
    icon: <User size={16} />,
    background: "bg-gradient-to-r from-blue-400 via-indigo-800 to-cyan-700",
    dashboard: "/unauthorized",
  },
};

const Navbar = ({ setSidebarOpen }) => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Decode token
  const { username, role, userId } = useMemo(() => {
    if (!token) return { username: "", role: "", userId: "" };
    try {
      const decoded = jwtDecode(token);
      return {
        username: decoded.username || "",
        role: decoded.role || "",
        userId: decoded._id || decoded.id || "",
      };
    } catch {
      return { username: "", role: "", userId: "" };
    }
  }, [token]);

  // State for company info
  const [companyId, setCompanyId] = useState("");
  const [companyName, setCompanyName] = useState("");

  // Get companyId from user/admin
  useEffect(() => {
    if (!userId) return;
    const endpoint =
      role === "admin" || role === "superadmin"
        ? `/api/admin/${userId}`
        : `/api/users/${userId}`;
    axios
      .get(endpoint)
      .then((res) => {
        const companyObj = res.data.companyId;
        setCompanyId(
          companyObj && typeof companyObj === "object"
            ? companyObj._id
            : companyObj || ""
        );
      })
      .catch(() => setCompanyId(""));
  }, [userId, role]);

  // Get companyName from companyId
  useEffect(() => {
    if (!companyId || role === "superadmin") return;
    axios
      .get(`/api/company/${companyId}`)
      .then((res) => setCompanyName(res.data.companyName || ""))
      .catch(() => setCompanyName(""));
  }, [companyId, role]);

  // Get config for current role
  const roleKey = role?.toLowerCase() || "default";
  const roleConfig = ROLE_CONFIG[roleKey] || ROLE_CONFIG.default;
  const dashboardRoute = roleConfig.dashboard;

  return (
    <nav className={`relative ${roleConfig.background} shadow-lg`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
      </div>

      <div className="relative flex items-center justify-between px-6 py-4">
        {/* Hamburger for sidebar */}
        <button
          className="p-2 mr-2"
          onClick={() => setSidebarOpen((open) => !open)}
          aria-label="Open sidebar"
        >
          <Menu size={28} className="text-white" />
        </button>

        {/* Logo Section */}
        <div className="flex items-center gap-3 flex-1">
          <div className="flex flex-col">
            <NavLink to={dashboardRoute}>
              <h1 className="text-2xl font-bold text-white tracking-tight cursor-pointer hover:underline">
                {role === "superadmin"
                  ? roleConfig.label
                  : companyName || "Wild Waves"}
              </h1>
            </NavLink>
            <p className="text-blue-100 text-xs font-medium">
              Smart Home Control
            </p>
          </div>
        </div>

        {/* User Info Section */}
        <div className="flex items-center gap-4">
          {role && (
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-full border ${roleConfig.color} border-white/20 backdrop-blur-sm`}
            >
              {roleConfig.icon}
              <span className="text-sm font-medium capitalize">{role}</span>
            </div>
          )}

          {/* Cart Button for user role */}
          {roleKey === "user" && (
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
                <span className="text-blue-100 text-xs">Welcome back</span>
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