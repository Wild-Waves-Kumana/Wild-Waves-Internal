import React, { useEffect, useState, useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import UserACController from './equipmentControllers/UserACController';
import UserLightController from './equipmentControllers/UserLightController';
import UserDoorController from './equipmentControllers/UserDoorController';

const SELECTED_ROOM_KEY = "selectedRoomId";

const DashboardController = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(
    () => localStorage.getItem(SELECTED_ROOM_KEY) || null
  );
  const [loading, setLoading] = useState(true);

  // Get user id from the JWT token
  const token = localStorage.getItem('token');
  const userId = useMemo(() => {
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return decoded.id;
    } catch {
      return null;
    }
  }, [token]);

  // Fetch the logged-in user's rooms from the user collection
  useEffect(() => {
    const fetchUserRooms = async () => {
      setLoading(true);
      try {
        const userRes = await axios.get(`http://localhost:5000/api/users/${userId}`);
        const user = userRes.data;
        // user.rooms is an array of room ObjectIds
        // Fetch all rooms and filter by user's room ids
        const allRoomsRes = await axios.get('http://localhost:5000/api/rooms/all');
        const userRooms = allRoomsRes.data.filter(room => user.rooms && user.rooms.includes(room._id));
        setRooms(userRooms);

        // If selectedRoomId is not in userRooms, reset to first room
        if (userRooms.length > 0) {
          const found = userRooms.find(r => r._id === selectedRoomId);
          if (!found) {
            setSelectedRoomId(userRooms[0]._id);
            localStorage.setItem(SELECTED_ROOM_KEY, userRooms[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch user rooms:', err);
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchUserRooms();
    // eslint-disable-next-line
  }, [userId]);

  // Save selectedRoomId to localStorage when it changes
  useEffect(() => {
    if (selectedRoomId) {
      localStorage.setItem(SELECTED_ROOM_KEY, selectedRoomId);
    }
  }, [selectedRoomId]);

  const selectedRoom = useMemo(
    () => rooms.find(r => r._id === selectedRoomId),
    [rooms, selectedRoomId]
  );

  if (loading) {
    return <div>Loading your equipments...</div>;
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Select Room:</h3>
        <div className="flex flex-wrap gap-2">
          {rooms.map(room => (
            <button
              key={room._id}
              type="button"
              className={`px-4 py-2 rounded border
                ${selectedRoomId === room._id
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"}
              `}
              onClick={() => setSelectedRoomId(room._id)}
            >
              {room.roomName}
            </button>
          ))}
        </div>
      </div>
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* AC Section */}
        <UserACController selectedRoom={selectedRoom} />
        {/* Lights Section */}
        <UserLightController selectedRoom={selectedRoom} />
        {/* Doors Section */}
        <UserDoorController selectedRoom={selectedRoom} />
      </div>
    </div>
  );
};

export default DashboardController;