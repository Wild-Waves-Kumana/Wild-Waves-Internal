import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const UserCreation = () => {
  const [formData, setFormData] = useState({
    villaName: '',
    villaId: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: 'user',
  });
  const [message, setMessage] = useState('');
  const [showRoomCreation, setShowRoomCreation] = useState(false);
  const [rooms, setRooms] = useState([{ roomName: '' }]);
  const [roomMessage, setRoomMessage] = useState('');
  const [createdUserId, setCreatedUserId] = useState(null);
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
        villaName: formData.villaName,
        villaId: formData.villaId,
        username: formData.username,
        password: formData.password,
        role: formData.role,
        adminId: adminId,
      });

      setMessage(res.data.message);
      setShowRoomCreation(true); // Show room creation on success

      // Save the created user's _id (villaId)
      if (res.data.user && res.data.user._id) {
        setCreatedUserId(res.data.user._id);
      } else if (res.data.userId) {
        setCreatedUserId(res.data.userId);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong');
    }
  };

  // Room creation handlers
  const handleRoomChange = (idx, value) => {
    setRooms(rooms =>
      rooms.map((room, i) => (i === idx ? { ...room, roomName: value } : room))
    );
  };

  const addRoomField = () => {
    setRooms([...rooms, { roomName: '' }]);
  };

  const handleSaveRooms = async () => {
    try {
      for (const room of rooms) {
        if (room.roomName.trim()) {
          await axios.post('http://localhost:5000/api/room/create', {
            roomName: room.roomName,
            villaId: createdUserId, // Pass the user _id as villaId
          });
        }
      }
      setRoomMessage('Rooms created successfully!');
      setTimeout(() => {
        setRoomMessage('');
        navigate('/admindashboard');
      }, 1200);
    } catch (err) {
      console.error('Error creating rooms:', err);
      setRoomMessage('Failed to create rooms.');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg flex w-full max-w-4xl overflow-hidden">
        {/* Left: User Creation */}
        <div className="w-1/2 p-8 border-r">
          <form onSubmit={handleSignup} className="space-y-4">
            <h2 className="text-2xl font-semibold text-center">Sign Up</h2>
            {message && <p className="text-center text-sm text-red-600">{message}</p>}

            <input
              type="text"
              name="villaName"
              placeholder="Villa Name"
              value={formData.villaName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring"
            />
            <input
              type="text"
              name="villaId"
              placeholder="Villa ID"
              value={formData.villaId}
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
              disabled={showRoomCreation}
            >
              Sign Up
            </button>
          </form>
        </div>

        {/* Right: Room Creation */}
        <div className="w-1/2 p-8 flex flex-col items-center justify-center">
          {!showRoomCreation ? (
            <div className="text-gray-400 text-center">
              <span className="text-2xl">🏠</span>
              <div className="mt-2">Create a user to add rooms</div>
            </div>
          ) : (
            <div className="w-full">
              <h2 className="text-2xl font-semibold text-center mb-4">Add Rooms</h2>
              {roomMessage && <p className="text-center text-green-600">{roomMessage}</p>}
              {rooms.map((room, idx) => (
                <div key={idx} className="flex items-center mb-2">
                  <input
                    type="text"
                    placeholder={`Room Name ${idx + 1}`}
                    value={room.roomName}
                    onChange={e => handleRoomChange(idx, e.target.value)}
                    className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring"
                  />
                  {idx === rooms.length - 1 && (
                    <button
                      type="button"
                      onClick={addRoomField}
                      className="ml-2 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      +
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleSaveRooms}
                className="w-full mt-4 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
              >
                Save Rooms
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserCreation;
