import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserDoorController = ({ doors, onDoorUpdate }) => {
  const [localDoors, setLocalDoors] = useState(doors);

  useEffect(() => {
    setLocalDoors(doors);
  }, [doors]);

  const handleFieldChange = async (door, idx, field, value) => {
    const updated = { ...localDoors[idx], [field]: value };
    setLocalDoors(prev =>
      prev.map((item, i) =>
        i === idx ? updated : item
      )
    );
    try {
      await axios.put(
        `http://localhost:5000/api/equipment/doors/${door._id}`,
        { [field]: value }
      );
      if (onDoorUpdate) onDoorUpdate(); // Refresh parent data if provided
    } catch (err) {
      console.error('Failed to update Door:', err);
      alert("Failed to update Door.");
    }
  };

  return (
    <div className="bg-white rounded shadow p-4">
      <h3 className="text-xl font-bold mb-2 text-green-700">Your Doors</h3>
      {localDoors.length === 0 ? (
        <div className="text-gray-400">No doors assigned.</div>
      ) : (
        <ul className="space-y-2">
          {localDoors.map((door, idx) => (
            <li key={door._id} className="border-b pb-1">
              <div className="font-semibold">{door.itemName}</div>
              <div className="text-sm text-gray-500">Code: {door.itemCode}</div>
              <div className="text-sm">Room: {door.roomId?.roomName || "N/A"}</div>
              <form className="space-y-2 mt-2" onSubmit={e => e.preventDefault()}>
                <div>
                  <label className="block font-medium">Status</label>
                  <div className="flex gap-2 mb-2">
                    {["ON", "OFF"].map((statusOption) => (
                      <button
                        key={statusOption}
                        type="button"
                        className={`px-4 py-2 rounded border 
                          ${localDoors[idx].status === statusOption
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"}
                        `}
                        onClick={() =>
                          handleFieldChange(door, idx, "status", statusOption)
                        }
                      >
                        {statusOption}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block font-medium">Lock Status</label>
                  <div className="flex gap-2 mb-2">
                    {[
                      { label: "Locked", value: true },
                      { label: "Unlocked", value: false }
                    ].map((lockOption) => (
                      <button
                        key={lockOption.label}
                        type="button"
                        className={`px-4 py-2 rounded border 
                          ${localDoors[idx].lockStatus === lockOption.value
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"}
                        `}
                        onClick={() =>
                          handleFieldChange(door, idx, "lockStatus", lockOption.value)
                        }
                      >
                        {lockOption.label}
                      </button>
                    ))}
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