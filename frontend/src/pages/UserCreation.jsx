import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Modal from '../components/common/Modal';

const UserCreation = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    role: 'user',
    checkinDate: '',
    checkoutDate: '',
    villaId: '',
    roomId: '',
  });
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [villas, setVillas] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedVillaRooms, setSelectedVillaRooms] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
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

  // Fetch villas for the admin's company
  useEffect(() => {
    const fetchVillas = async () => {
      try {
        if (!token) return;
        const decoded = jwtDecode(token);
        const adminId = decoded.id;

        // Fetch admin details to get companyId
        const adminRes = await axios.get(`http://localhost:5000/api/admin/${adminId}`);
        const companyId = adminRes.data.companyId?._id || adminRes.data.companyId;

        // Fetch all villas
        const villasRes = await axios.get("http://localhost:5000/api/villas/all");
        // Filter villas by companyId
        const filteredVillas = villasRes.data.filter(
          (v) =>
            v.companyId === companyId ||
            v.companyId?._id === companyId
        );
        setVillas(filteredVillas);
      } catch (err) {
        setVillas([]);
        console.error("Failed to load villas", err);
      }
    };
    fetchVillas();
  }, [token]);

  // Fetch rooms for all villas on mount
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/rooms/all");
        setRooms(res.data);
      } catch (err) {
        console.error("Failed to fetch rooms", err);
        setRooms([]);
      }
    };
    fetchRooms();
  }, []);

  // When a villa is selected, update selectedVillaRooms and clear selectedRooms
  const handleVillaSelect = (villa) => {
    setFormData((prev) => ({ ...prev, villaId: villa._id }));
    // Find room objects that match the villa's rooms array
    const villaRoomObjs = rooms.filter((room) =>
      villa.rooms.includes(room._id)
    );
    setSelectedVillaRooms(villaRoomObjs);
    setSelectedRooms([]); // Clear selected rooms when villa changes
  };

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
  useEffect(() => {
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

  // Handle room selection (multiple)
  const handleRoomToggle = (roomId) => {
    setSelectedRooms((prev) =>
      prev.includes(roomId)
        ? prev.filter((id) => id !== roomId)
        : [...prev, roomId]
    );
  };

  // Select all rooms for the selected villa
  const handleSelectAllRooms = () => {
    setSelectedRooms(selectedVillaRooms.map((room) => room._id));
  };

  // Deselect all rooms
  const handleDeselectAllRooms = () => {
    setSelectedRooms([]);
  };

  // Find selected villa and room objects for display
  const selectedVilla = villas.find(v => v._id === formData.villaId);
  const selectedRoomObjs = selectedVillaRooms.filter(room => selectedRooms.includes(room._id));

  // Handle form submit: show confirmation modal instead of immediate submit
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

    setShowConfirmModal(true);
  };

  // Actual submit after confirmation
  const handleConfirm = async () => {
    setShowConfirmModal(false);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', {
        username,
        password: formData.password,
        role: formData.role,
        adminId: adminId,
        checkinDate: formData.checkinDate,
        checkoutDate: formData.checkoutDate,
        villaId: formData.villaId,      // <-- pass villa object ID here
        rooms: selectedRooms,
      });

      setMessage(res.data.message);
      setShowSuccessModal(true); // Show success modal
      // REMOVE navigation from here!
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

            {/* Villa Selection as buttons */}
            <div>
              <label className="block font-medium mb-1">Select Villa</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {villas.map((villa) => (
                  <button
                    key={villa._id}
                    type="button"
                    className={`px-4 py-2 rounded border
                      ${formData.villaId === villa._id
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"}
                    `}
                    onClick={() => handleVillaSelect(villa)}
                  >
                    {villa.villaName} ({villa.villaId})
                  </button>
                ))}
              </div>
            </div>

            {/* Room Selection for selected villa as buttons (multiple) */}
            {formData.villaId && (
              <div>
                <label className="block font-medium mb-1">Select Rooms</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  <button
                    type="button"
                    className="px-4 py-2 rounded border bg-green-500 text-white border-green-600 hover:bg-green-600"
                    onClick={handleSelectAllRooms}
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 rounded border bg-gray-300 text-gray-700 border-gray-400 hover:bg-gray-400"
                    onClick={handleDeselectAllRooms}
                  >
                    Deselect All
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedVillaRooms.map((room) => (
                    <button
                      key={room._id}
                      type="button"
                      className={`px-4 py-2 rounded border
                        ${selectedRooms.includes(room._id)
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"}
                      `}
                      onClick={() => handleRoomToggle(room._id)}
                    >
                      {room.roomName}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Check-in and Check-out Dates */}
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

      {/* Confirmation Modal */}
      <Modal isVisible={showConfirmModal} onClose={() => setShowConfirmModal(false)} width="max-w-lg">
        <h2 className="text-xl font-bold mb-4 text-center">Confirm User Details</h2>
        <div className="space-y-2">
          <div>
            <span className="font-semibold">Username:</span> {username}
          </div>
          <div>
            <span className="font-semibold">Villa:</span> {selectedVilla ? `${selectedVilla.villaName} (${selectedVilla.villaId})` : '-'}
          </div>
          <div>
            <span className="font-semibold">Rooms:</span>
            <ul className="list-disc ml-6">
              {selectedRoomObjs.length > 0
                ? selectedRoomObjs.map(room => (
                    <li key={room._id}>{room.roomName}</li>
                  ))
                : <li>-</li>
              }
            </ul>
          </div>
          <div>
            <span className="font-semibold">Check-in Date:</span> {formData.checkinDate}
          </div>
          <div>
            <span className="font-semibold">Check-out Date:</span> {formData.checkoutDate}
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button
            className="px-4 py-2 rounded bg-gray-300 text-gray-700 hover:bg-gray-400"
            onClick={() => setShowConfirmModal(false)}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            onClick={handleConfirm}
          >
            Confirm
          </button>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal isVisible={showSuccessModal} onClose={() => setShowSuccessModal(false)} width="max-w-lg">
        <h2 className="text-xl font-bold mb-4 text-center">User Created Successfully</h2>
        <div className="space-y-2">
          <div>
            <span className="font-semibold">Username:</span> {username}
          </div>
          <div>
            <span className="font-semibold">Villa:</span> {selectedVilla ? `${selectedVilla.villaName} (${selectedVilla.villaId})` : '-'}
          </div>
          <div>
            <span className="font-semibold">Rooms:</span>
            <ul className="list-disc ml-6">
              {selectedRoomObjs.length > 0
                ? selectedRoomObjs.map(room => (
                    <li key={room._id}>{room.roomName}</li>
                  ))
                : <li>-</li>
              }
            </ul>
          </div>
          <div>
            <span className="font-semibold">Check-in Date:</span> {formData.checkinDate}
          </div>
          <div>
            <span className="font-semibold">Check-out Date:</span> {formData.checkoutDate}
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => {
              setShowSuccessModal(false);
              navigate('/admindashboard');
            }}
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default UserCreation;
