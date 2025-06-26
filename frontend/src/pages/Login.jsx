import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUser, FaLock } from "react-icons/fa";

//Adjust these paths so they point to the actual files in your project
import Logo from "../assets/logo.png"; // hotel logo
import VillaImg from "../assets/login.jpg"; // right‑hand hero image


const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        username,
        password,
      });

      console.log("Login response:", res.data);

      const { token, user } = res.data;
      const { role } = user;

      localStorage.setItem("token", token);
      onLogin(token);

      // ➡️ Role‑based redirects
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
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex ">
      {/* ◀︎ Left pane – form */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center px-6 py-10 bg-white">
        {/* logo */}
        <img src={Logo} alt="Wild Waves Kumana" className="w-40 mb-4 select-none" />

        <h1 className="text-4xl font-extrabold text-gray-800 tracking-wider mb-1 text-center">
          LOG IN
        </h1>
        <p className="text-gray-500 mb-8 text-center">
          Enter your username and password
        </p>

        {/* form */}
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          {/* username */}
          <div className="relative mb-4">
            <FaUser className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* password */}
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

          {/* forgot password */}
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

          {/* Google sign‑in */}
          {/* <button
            type="button"
            className="flex items-center justify-center w-full border border-gray-300 rounded py-2 mb-6 hover:bg-gray-50 transition"
          >
            <img src={GoogleLogo} alt="Google" className="w-5 h-5 mr-2" />
            Google
          </button> */}

          {/* primary submit */}
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-700 to-sky-500 text-white font-semibold rounded shadow hover:opacity-90 transition"
          >
            Log in
          </button>
        </form>

        {/* contact */}
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
    </div>
  );
};

export default Login;
