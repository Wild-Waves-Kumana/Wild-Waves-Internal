import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import UserACController from './UserACController';
import UserLightController from './UserLightController';
import UserDoorController from './UserDoorController';

const DashboardController = () => {
  const [acs, setAcs] = useState([]);
  const [lights, setLights] = useState([]);
  const [doors, setDoors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(null);

  // Get user id from the JWT token
  const token = localStorage.getItem('token');
  let userId = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      userId = decoded.id;
    } catch (err) {
      console.error('Invalid token:', err);
    }
  }

  useEffect(() => {
    const fetchEquipments = async () => {
      setLoading(true);
      try {
        // Fetch ACs
        const acRes = await axios.get('http://localhost:5000/api/equipment/air-conditioners');
        setAcs(acRes.data.filter(
          ac => ac.assignedUser === userId || (ac.assignedUser && ac.assignedUser._id === userId)
        ));

        // Fetch Lights
        const lightRes = await axios.get('http://localhost:5000/api/equipment/lights');
        setLights(lightRes.data.filter(
          light => light.assignedUser === userId || (light.assignedUser && light.assignedUser._id === userId)
        ));

        // Fetch Doors
        const doorRes = await axios.get('http://localhost:5000/api/equipment/doors');
        setDoors(doorRes.data.filter(
          door => door.assignedUser === userId || (door.assignedUser && door.assignedUser._id === userId)
        ));
      } catch (err) {
        console.error('Failed to fetch equipments:', err);
        setAcs([]); setLights([]); setDoors([]);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchEquipments();
  }, [userId]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/rooms/user/${userId}`);
        setRooms(res.data);
        if (res.data.length > 0) setSelectedRoomId(res.data[0]._id);
      } catch (err) {
        console.error('Failed to fetch rooms:', err);
        setRooms([]);
      }
    };
    if (userId) fetchRooms();
  }, [userId]);

  const filteredAcs = selectedRoomId
    ? acs.filter(ac => ac.roomId && ac.roomId._id === selectedRoomId)
    : acs;
  const filteredLights = selectedRoomId
    ? lights.filter(light => light.roomId && light.roomId._id === selectedRoomId)
    : lights;
  const filteredDoors = selectedRoomId
    ? doors.filter(door => door.roomId && door.roomId._id === selectedRoomId)
    : doors;

  const refreshAcs = async () => {
    try {
      const acRes = await axios.get('http://localhost:5000/api/equipment/air-conditioners');
      setAcs(acRes.data.filter(
        ac => ac.assignedUser === userId || (ac.assignedUser && ac.assignedUser._id === userId)
      ));
    } catch (err) {
      console.error('Failed to fetch ACs:', err);
      setAcs([]);
    }
  };

  const refreshLights = async () => {
    try {
      const lightRes = await axios.get('http://localhost:5000/api/equipment/lights');
      setLights(lightRes.data.filter(
        light => light.assignedUser === userId || (light.assignedUser && light.assignedUser._id === userId)
      ));
    } catch (err) {
      console.error('Failed to fetch lights:', err);
      setLights([]);
    }
  };

  const refreshDoors = async () => {
    try {
      const doorRes = await axios.get('http://localhost:5000/api/equipment/doors');
      setDoors(doorRes.data.filter(
        door => door.assignedUser === userId || (door.assignedUser && door.assignedUser._id === userId)
      ));
    } catch (err) {
      console.error('Failed to fetch doors:', err);
      setDoors([]);
    }
  };

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
        <UserACController acs={filteredAcs} onACUpdate={refreshAcs} />
        {/* Lights Section */}
        <UserLightController lights={filteredLights} onLightUpdate={refreshLights} />
        {/* Doors Section */}
        <UserDoorController doors={filteredDoors} onDoorUpdate={refreshDoors} />
      </div>
    </div>
  );
};

export default DashboardController;