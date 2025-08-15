import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserDoorController = ({ selectedRoom, onDoorUpdate }) => {
  const [doors, setDoors] = useState([]);

  // Fetch Doors for the selected room
  useEffect(() => {
    const fetchRoomDoors = async () => {
      if (!selectedRoom) {
        setDoors([]);
        return;
      }
      try {
        // selectedRoom.doors is an array of Door ObjectIds
        // Fetch all doors and filter by selectedRoom.doors
        const doorRes = await axios.get('http://localhost:5000/api/equipment/doors');
        const roomDoors = doorRes.data.filter(door =>
          selectedRoom.doors && selectedRoom.doors.includes(door._id)
        );
        setDoors(roomDoors);
      } catch (err) {
        console.error('Failed to fetch room doors:', err);
        setDoors([]);
      }
    };
    fetchRoomDoors();
  }, [selectedRoom]);

  const handleFieldChange = async (door, idx, field, value) => {
    const updated = { ...doors[idx], [field]: value };
    setDoors(prev =>
      prev.map((item, i) =>
        i === idx ? updated : item
      )
    );
    try {
      await axios.put(
        `http://localhost:5000/api/equipment/doors/${door._id}`,
        { [field]: value }
      );
      if (onDoorUpdate) onDoorUpdate();
    } catch (err) {
      console.error('Failed to update Door:', err);
      alert("Failed to update Door.");
    }
  };

  return (
    <div className="bg-white rounded shadow p-4">
      <h3 className="text-xl font-bold mb-2 text-green-700">Your Doors</h3>
      {doors.length === 0 ? (
        <div className="text-gray-400">No doors assigned to this room.</div>
      ) : (
        <ul className="space-y-2">
          {doors.map((door, idx) => (
            <li key={door._id} className="border-b pb-1">
              <div className="font-semibold">{door.itemName}</div>
              <div className="text-sm text-gray-500">Code: {door.itemCode}</div>
              <div className="text-sm">Room: {door.roomId?.roomName || "N/A"}</div>
              <form className="space-y-2 mt-2" onSubmit={e => e.preventDefault()}>
                <div>
                  <label className="block font-medium">Status</label>
                  <div className="flex gap-2 mb-2">
                    <button
                      type="button"
                      className={`px-4 py-2 rounded border 
                        ${door.status === true
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"}
                      `}
                      onClick={() => handleFieldChange(door, idx, "status", true)}
                    >
                      ON
                    </button>
                    <button
                      type="button"
                      className={`px-4 py-2 rounded border 
                        ${door.status === false
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"}
                      `}
                      onClick={() => handleFieldChange(door, idx, "status", false)}
                    >
                      OFF
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block font-medium">Lock Status</label>
                  <div className="flex gap-2 mb-2">
                    <button
                      type="button"
                      className={`px-4 py-2 rounded border 
                        ${door.lockStatus === true
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"}
                      `}
                      onClick={() => handleFieldChange(door, idx, "lockStatus", true)}
                    >
                      Locked
                    </button>
                    <button
                      type="button"
                      className={`px-4 py-2 rounded border 
                        ${door.lockStatus === false
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"}
                      `}
                      onClick={() => handleFieldChange(door, idx, "lockStatus", false)}
                    >
                      Unlocked
                    </button>
                  </div>
                </div>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserDoorController;