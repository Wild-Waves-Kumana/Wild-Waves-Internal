import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserLightController = ({ selectedRoom, onLightUpdate }) => {
  const [lights, setLights] = useState([]);

  // Fetch Lights for the selected room
  useEffect(() => {
    const fetchRoomLights = async () => {
      if (!selectedRoom) {
        setLights([]);
        return;
      }
      try {
        // selectedRoom.lights is an array of Light ObjectIds
        // Fetch all lights and filter by selectedRoom.lights and access === true
        const lightRes = await axios.get('http://localhost:5000/api/equipment/lights');
        const roomLights = lightRes.data.filter(light =>
          selectedRoom.lights &&
          selectedRoom.lights.includes(light._id) &&
          light.access === true
        );
        setLights(roomLights);
      } catch (err) {
        console.error('Failed to fetch room lights:', err);
        setLights([]);
      }
    };
    fetchRoomLights();
  }, [selectedRoom]);

  // Save only the changed field
  const handleFieldChange = async (light, idx, field, value) => {
    const updated = { ...lights[idx], [field]: value };
    setLights(prev =>
      prev.map((item, i) =>
        i === idx ? updated : item
      )
    );
    try {
      await axios.put(
        `http://localhost:5000/api/equipment/lights/${light._id}`,
        { [field]: value }
      );
      if (onLightUpdate) onLightUpdate();
    } catch (err) {
      console.error('Failed to update light:', err);
      alert("Failed to update Light.");
    }
  };

  return (
    <div className="bg-white rounded shadow p-4">
      <h3 className="text-xl font-bold mb-2 text-yellow-700">Your Lights</h3>
      {lights.length === 0 ? (
        <div className="text-gray-400">No lights assigned to this room.</div>
      ) : (
        <ul className="space-y-2">
          {lights.map((light, idx) => (
            <li key={light._id} className="border-b pb-1">
              <div className="font-semibold">{light.itemName}</div>
              <div className="text-sm text-gray-500">Code: {light.itemCode}</div>
              <div className="text-sm">Room: {light.roomId?.roomName || "N/A"}</div>
              <form className="space-y-2 mt-2" onSubmit={e => e.preventDefault()}>
                <div>
                  <label className="block font-medium">Brightness</label>
                  <div className="flex items-center gap-4 mb-2">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      name="brightness"
                      value={light.brightness ?? 0}
                      onChange={e =>
                        handleFieldChange(light, idx, "brightness", Number(e.target.value))
                      }
                      className="flex-1"
                      disabled={light.access !== true || light.status !== true}
                    />
                    <span className="w-12 text-center">
                      {light.brightness ?? 0}%
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block font-medium">Status</label>
                  <div className="flex gap-2 mb-2">
                    <button
                      type="button"
                      className={`px-4 py-2 rounded border 
                        ${light.status === true
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"}
                        ${light.access !== true ? "opacity-50 cursor-not-allowed" : ""}
                      `}
                      onClick={() => light.access === true && handleFieldChange(light, idx, "status", true)}
                      disabled={light.access !== true}
                    >
                      ON
                    </button>
                    <button
                      type="button"
                      className={`px-4 py-2 rounded border 
                        ${light.status === false
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"}
                        ${light.access !== true ? "opacity-50 cursor-not-allowed" : ""}
                      `}
                      onClick={() => light.access === true && handleFieldChange(light, idx, "status", false)}
                      disabled={light.access !== true}
                    >
                      OFF
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

export default UserLightController;