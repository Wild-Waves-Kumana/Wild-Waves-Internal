import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const UserCreation = () => {
  const [formData, setFormData] = useState({
    
    
    username: '',
    password: '',
    confirmPassword: '',
    role: 'user',
  });
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  // Decode token to get adminId
  let adminId = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      adminId = decoded.id;
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
        
        
        username: formData.username,
        password: formData.password,
        role: formData.role,
        adminId: adminId,
      });

      setMessage(res.data.message);
      setTimeout(() => {
        navigate('/admindashboard');
      }, 1200);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg flex w-full max-w-2xl overflow-hidden">
        {/* User Creation */}
        <div className="w-full p-8">
          <form onSubmit={handleSignup} className="space-y-4">
            <h2 className="text-2xl font-semibold text-center">Sign Up</h2>
            {message && <p className="text-center text-sm text-green-600">{message}</p>}

            
            
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
      </div>
    </div>
  );
};

export default UserCreation;
