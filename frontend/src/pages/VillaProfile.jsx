import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ACList from '../components/lists/ACList';
import DoorList from '../components/lists/DoorList';
import LightList from '../components/lists/LightList';

const VillaProfile = () => {
  const { villa_id } = useParams();
  const [villa, setVilla] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [roomIds, setRoomIds] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(""); // For filtering
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVilla = async () => {
      try {
        const villaRes = await axios.get(`http://localhost:5000/api/villa/${villa_id}`);
        setVilla(villaRes.data);

        // Fetch all rooms and filter those belonging to this villa
        const roomsRes = await axios.get('http://localhost:5000/api/rooms/all');
        const villaRooms = roomsRes.data.filter(room => villaRes.data.rooms.includes(room._id));
        setRooms(villaRooms);
        setRoomIds(villaRooms.map(room => room._id));
      } catch (err) {
        console.error("Failed to fetch villa or rooms:", err);
        setVilla(null);
        setRooms([]);
        setRoomIds([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVilla();
  }, [villa_id]);

  if (loading) return <div>Loading...</div>;
  if (!villa) return <div>Villa not found.</div>;

  return (
    <div className="container mx-auto px-4">
    <div className="mt-10 bg-white shadow rounded p-6 ">
      <h2 className="text-2xl font-bold mb-4">Villa Profile</h2>
      <div className="mb-4">
        <strong>Villa Name:</strong> {villa.villaName}
      </div>
      <div className="mb-4">
        <strong>Villa ID:</strong> {villa.villaId}
      </div>
      <div className="mb-4">
        <strong>Rooms:</strong>
        {rooms.length > 0 ? (
          <ul className="list-disc ml-6 mt-2">
            {rooms.map(room => (
              <li key={room._id}>{room.roomName}</li>
            ))}
          </ul>
        ) : (
          <span className="ml-2 text-gray-500">No rooms assigned</span>
        )}
      </div>
    </div>
      {/* Room selection buttons */}
      <div className="my-4">
        <h3 className="font-semibold mb-2">Filter by Room:</h3>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`px-4 py-2 rounded border
              ${selectedRoomId === ""
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"}
            `}
            onClick={() => setSelectedRoomId("")}
          >
            All Rooms
          </button>
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
      <div className="my-4">
        <strong>Villa Air Conditioners:</strong>
        <ACList roomIds={roomIds} selectedRoomId={selectedRoomId} role="admin" />
      </div>
      <div className="my-4">
        <strong>Villa Doors:</strong>
        <DoorList roomIds={roomIds} selectedRoomId={selectedRoomId} role="admin" />
      </div>
      <div className="my-4">
        <strong>Villa Lights:</strong>
        <LightList roomIds={roomIds} selectedRoomId={selectedRoomId} role="admin" />
      </div>
      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
        onClick={() => window.history.back()}
      >
        Back
      </button>
    </div>
  );
};

export default VillaProfile;