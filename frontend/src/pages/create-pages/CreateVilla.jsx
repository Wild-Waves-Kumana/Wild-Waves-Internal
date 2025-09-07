import React, { useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const VillaCreation = () => {
  const [villaId, setVillaId] = useState('');
  const [villaName, setVillaName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Step control
  const [showRoomCreation, setShowRoomCreation] = useState(false);
  const [rooms, setRooms] = useState([{ roomName: '' }]);
  const [roomMessage, setRoomMessage] = useState('');
  const [createdVillaId, setCreatedVillaId] = useState(null);

  // Get adminId from JWT token
  const token = localStorage.getItem('token');
  let adminId = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      adminId = decoded.id;
    } catch (err) {
      console.error('Invalid token:', err);
    }
  }

  // Step 1: Villa creation
  const handleVillaSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await axios.post('http://localhost:5000/api/villas/create', {
        villaId,
        villaName,
        adminId,
      });
      setMessage('Villa created successfully!');
      setShowRoomCreation(true);
      setCreatedVillaId(res.data.villa._id); // Save the created villa's _id
    } catch (err) {
      console.error('Failed to create villa:', err);
      setMessage('Failed to create villa.');
    }
    setLoading(false);
  };

  // Step 2: Room creation
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
          await axios.post('http://localhost:5000/api/rooms/create', {
            roomName: room.roomName,
            villaId: createdVillaId, // Pass the villa _id as villaId
          });
        }
      }
      setRoomMessage('Rooms created successfully!');
      setTimeout(() => {
        setRoomMessage('');
        // Optionally redirect or reset form here
      }, 1200);
    } catch (err) {
      console.error('Failed to create rooms:', err);
      setRoomMessage('Failed to create rooms.');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 justify-center">
      <div className="bg-white rounded-lg shadow-lg flex w-full overflow-hidden">
        {/* Left: Villa Creation */}
        <div className="w-1/2 p-8 border-r">
          <form onSubmit={handleVillaSubmit} className="space-y-4">
            <h2 className="text-2xl font-semibold text-center">Create Villa</h2>
            {message && <p className="text-center text-sm text-green-600">{message}</p>}
            <input
              type="text"
              placeholder="Villa ID"
              value={villaId}
              onChange={e => setVillaId(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring"
              disabled={showRoomCreation}
            />
            <input
              type="text"
              placeholder="Villa Name"
              value={villaName}
              onChange={e => setVillaName(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring"
              disabled={showRoomCreation}
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
              disabled={loading || showRoomCreation}
            >
              {loading ? 'Creating...' : 'Create Villa'}
            </button>
          </form>
        </div>

        {/* Right: Room Creation */}
        <div className="w-1/2 p-8 justify-center">
          {!showRoomCreation ? (
            <div className="text-gray-400 text-center">
              <span className="text-2xl">🏠</span>
              <div className="mt-2">Create a villa to add rooms</div>
            </div>
          ) : (
            <div className="w-full">
              <h2 className="text-2xl font-semibold text-center mb-8">Add Rooms</h2>
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

export default VillaCreation;
