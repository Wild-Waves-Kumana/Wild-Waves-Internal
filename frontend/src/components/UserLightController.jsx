import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserLightController = ({ lights, onLightUpdate }) => {
  // Local Lights state for instant UI update
  const [localLights, setLocalLights] = useState(lights);

  // Keep localLights in sync with props when room changes
  useEffect(() => {
    setLocalLights(lights);
  }, [lights]);

  // Save only the changed field
  const handleFieldChange = async (light, idx, field, value) => {
    const updated = { ...localLights[idx], [field]: value };
    // Update local state for instant feedback
    setLocalLights(prev =>
      prev.map((item, i) =>
        i === idx ? updated : item
      )
    );
    // Save to backend
    try {
      await axios.put(
        `http://localhost:5000/api/equipment/lights/${light._id}`,
        { [field]: value }
      );
      if (onLightUpdate) onLightUpdate(); // Refresh parent data
    } catch (err) {
      console.error('Failed to update Light:', err);
      alert("Failed to update Light.");
    }
  };

  return (
    <div className="bg-white rounded shadow p-4">
      <h3 className="text-xl font-bold mb-2 text-yellow-700">Your Lights</h3>
      {localLights.length === 0 ? (
        <div className="text-gray-400">No lights assigned.</div>
      ) : (
        <ul className="space-y-2">
          {localLights.map((light, idx) => (
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
                    />
                    <span className="w-12 text-center">
                      {light.brightness ?? 0}%
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block font-medium">Status</label>
                  <div className="flex gap-2 mb-2">
                    {["ON", "OFF"].map((statusOption) => (
                      <button
                        key={statusOption}
                        type="button"
                        className={`px-4 py-2 rounded border 
                          ${localLights[idx].status === statusOption
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"}
                        `}
                        onClick={() =>
                          handleFieldChange(light, idx, "status", statusOption)
                        }
                      >
                        {statusOption}
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

export default UserLightController;