import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';


const UserCreation = () => {
  const [formData, setFormData] = useState({
    roomname: '',
    roomnid: '', // new field for room number
    username: '',
    password: '',
    confirmPassword: '',
    role: 'user', // default role
  });

  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

    // Decode token to get adminId and role
  let adminId = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      adminId = decoded.id; // or decoded._id depending on your backend
      console.log('Admin ID (from token):', adminId);
    } catch (err) {
      console.error('Invalid token:', err);
    }
  }


  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const isPasswordValid = (password) => {
    const lengthCheck = password.length >= 8;
    const numberCheck = /\d/.test(password);
    const symbolCheck = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return lengthCheck && numberCheck && symbolCheck;
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    if (!isPasswordValid(formData.password)) {
      setMessage('Password must be at least 8 characters long and include at least 1 number and 1 special character.');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', {
        roomname: formData.roomname,      // <-- add this
        roomid: formData.roomid,  // <-- and this
        username: formData.username,
        password: formData.password,
        role: formData.role, // ✅ send selected role
        adminId: adminId, // Pass the adminId from localStorage
      });

      setMessage(res.data.message);
      navigate('/admindashboard');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleSignup} className="bg-white p-8 rounded-lg shadow-md w-80 space-y-4">
        <h2 className="text-2xl font-semibold text-center">Sign Up</h2>
        {message && <p className="text-center text-sm text-red-600">{message}</p>}


        <input
          type="text"
          name="roomname"
          placeholder="Room Name"
          value={formData.roomname}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring"
        />
        <input
          type="text" 
          name="roomid"
          placeholder="Room ID"
          value={formData.roomid}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring"
        />
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring"
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default UserCreation;
