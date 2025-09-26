import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminCreation = () => {
  const [formData, setFormData] = useState({
    companyId: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'admin', // default role
  });

  const [companies, setCompanies] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  useEffect(() => {
    // Fetch companies for dropdown
    axios.get('http://localhost:5000/api/company/all')
      .then(res => setCompanies(res.data))
      .catch(() => setCompanies([]));
  }, []);

  const isEmailValid = (email) => {
    // Simple email regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };


  const isPasswordValid = (password) => {
    const lengthCheck = password.length >= 8;
    const numberCheck = /\d/.test(password);
    const symbolCheck = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return lengthCheck && numberCheck && symbolCheck;
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!isEmailValid(formData.email)) {
      setMessage('Please enter a valid email address.');
      return;
    }
 
    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    if (!isPasswordValid(formData.password)) {
      setMessage('Password must be at least 8 characters long and include at least 1 number and 1 special character.');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/auth/adminregister', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role, // send selected role
        companyId: formData.companyId, // send selected company ID
      });

      setMessage(res.data.message);
      navigate('/superadmindashboard');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleEmailBlur = () => {
    if (formData.email && !isEmailValid(formData.email)) {
      setMessage('Please enter a valid email address.');
    } else {
      setMessage('');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleSignup} className="bg-white p-8 rounded-lg shadow-md w-80 space-y-4">
        <h2 className="text-2xl font-semibold text-center">Sign Up</h2>
        {message && <p className="text-center text-sm text-red-600">{message}</p>}

         {/* ✅ Role Selection Dropdown */}
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring"
        >
          <option value="admin">Admin</option>
          <option value="superadmin">Super Admin</option>
        </select>

         {/* Company Dropdown */}
        <select
          name="companyId"
          value={formData.companyId}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring"
        >
          <option value="">Select Company</option>
          {companies.map((c) => (
            <option key={c._id} value={c._id}>
              {c.companyName}
            </option>
          ))}
        </select>
        
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
          type="text"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleEmailBlur} // <-- Add this line
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

export default AdminCreation;
