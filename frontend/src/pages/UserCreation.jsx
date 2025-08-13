import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const UserCreation = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    role: 'user',
    checkinDate: '',
    checkoutDate: '',
  });
  const [username, setUsername] = useState('');
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

  // Generate username: user-ddmmyy-xxx
  const generateUsername = () => {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yy = String(now.getFullYear()).slice(-2);
    const random = Math.floor(100 + Math.random() * 900); // 3 digits
    return `user-${dd}${mm}${yy}-${random}`;
  };

  // Generate a unique username by checking with backend
  const generateUniqueUsername = async () => {
    let unique = false;
    let newUsername = '';
    while (!unique) {
      newUsername = generateUsername();
      try {
        const checkRes = await axios.get(`http://localhost:5000/api/auth/check-username/${newUsername}`);
        if (checkRes.data.available) {
          unique = true;
        }
      } catch {
        // In case of error, try again
      }
    }
    setUsername(newUsername);
    return newUsername;
  };

  // Generate unique username on mount
  React.useEffect(() => {
    generateUniqueUsername();
    // eslint-disable-next-line
  }, []);

  // Regenerate username if needed (e.g., after error)
  const regenerateUsername = () => {
    generateUniqueUsername();
  };

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
      // Username is already unique at this point
      const res = await axios.post('http://localhost:5000/api/auth/register', {
        username,
        password: formData.password,
        role: formData.role,
        adminId: adminId,
        checkinDate: formData.checkinDate,
        checkoutDate: formData.checkoutDate,
      });

      setMessage(res.data.message);
      setTimeout(() => {
        navigate('/admindashboard');
      }, 1200);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong');
      regenerateUsername();
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="flex min-h-screen bg-gray-100 items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg flex w-full max-w-2xl overflow-hidden">
        {/* User Creation */}
        <div className="w-full p-8">
          <form onSubmit={handleSignup} className="space-y-4">
            <h2 className="text-2xl font-semibold text-center">Sign Up</h2>
            {message && <p className="text-center text-sm text-green-600">{message}</p>}

            <div>
              <label className="block font-medium mb-1">Username</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  name="username"
                  value={username}
                  readOnly
                  className="w-full px-4 py-2 border rounded-md bg-gray-100 cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={regenerateUsername}
                  className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                  title="Regenerate Username"
                >
                  ↻
                </button>
              </div>
            </div>

            {/* Check-in Date */}
            <div className="flex flex-col">
              <div className="flex gap-4">
                {/* Check-in Date */}
                <div className="flex flex-col w-1/2">
                  <label className="block font-medium mb-1">Check-in Date</label>
                  <input
                    type="date"
                    name="checkinDate"
                    value={formData.checkinDate}
                    onChange={handleChange}
                    required
                    min={today}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring"
                  />
                </div>

                {/* Check-out Date */}
                <div className="flex flex-col w-1/2">
                  <label className="block font-medium mb-1">Check-out Date</label>
                  <input
                    type="date"
                    name="checkoutDate"
                    value={formData.checkoutDate}
                    onChange={handleChange}
                    required
                    min={formData.checkinDate || today}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring"
                  />
                </div>
              </div>
            </div>



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
