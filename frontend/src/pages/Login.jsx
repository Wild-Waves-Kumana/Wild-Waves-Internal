import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUser, FaLock } from "react-icons/fa";
import Logo from "../assets/logo.png";
import VillaImg from "../assets/login.jpg";
import Toaster from "../components/common/Toaster";

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "error" });
  const navigate = useNavigate();

  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
  };
  const hideToast = () => setToast(prev => ({ ...prev, show: false }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/auth/login", {
        username,
        password,
      });
      const { token, user } = res.data;
      const { role } = user;

      localStorage.setItem("token", token);
      onLogin(token);

      // Role-based redirects
      if (role === "user") {
        navigate("/userdashboard");
      } else if (role === "admin") {
        navigate("/admindashboard");
      } else if (role === "superadmin") {
        navigate("/superadmindashboard");
      } else {
        navigate("/unauthorized");
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Login failed", "error");
    }
  };

  return (
    <div className="min-h-screen flex ">
      {/* ◀︎ Left pane – form */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center px-6 py-10 bg-white">
        <img src={Logo} alt="Wild Waves Kumana" className="w-40 mb-2 select-none" />
        <h1 className="text-4xl font-extrabold text-gray-800 tracking-wider mb-1 text-center">
          LOG IN
        </h1>
        <p className="text-gray-500 my-4 text-center">
          Enter your username (user) or email (admin)
        </p>
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <div className="relative mb-4">
            <FaUser className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Username (user) or Email (admin)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="relative mb-2">
            <FaLock className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex justify-end text-sm mb-6">
            <span className="text-gray-600 mr-1">Forgot Password&nbsp;?</span>
            <button
              type="button"
              className="text-blue-600 hover:underline"
              onClick={() => navigate("/forgot-password")}
            >
              Click Here
            </button>
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-700 to-sky-500 text-white font-semibold rounded shadow hover:opacity-90 transition"
          >
            Log in
          </button>
        </form>
        <p className="mt-8 text-sm text-gray-600 text-center">
          Having trouble to Log in&nbsp;?&nbsp;
          <button
            className="text-blue-600 hover:underline"
            onClick={() => navigate("/contact")}
          >
            Contact us !
          </button>
        </p>
      </div>
      {/* ▶︎ Right pane – hero image (hidden on small screens) */}
      <div className="hidden md:block w-1/2">
        <img
          src={VillaImg}
          alt="Hotel bungalow"
          className="object-cover w-full h-full select-none"
        />
      </div>
      {/* Toaster for error messages */}
      <Toaster
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={hideToast}
        duration={4000}
        position="top-right"
      />
    </div>
  );
};

export default Login;
