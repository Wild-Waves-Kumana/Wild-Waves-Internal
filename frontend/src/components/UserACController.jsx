import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserACController = ({ acs, onACUpdate }) => {
  // Local ACs state for instant UI update
  const [localAcs, setLocalAcs] = useState(acs);

  // Keep localAcs in sync with props when room changes
  useEffect(() => {
    setLocalAcs(acs);
  }, [acs]);

  // Save only the changed field
  const handleFieldChange = async (ac, idx, field, value) => {
    const updated = { ...localAcs[idx], [field]: value };
    // Update local state for instant feedback
    setLocalAcs(prev =>
      prev.map((item, i) =>
        i === idx ? updated : item
      )
    );
    // Save to backend
    try {
      await axios.put(
        `http://localhost:5000/api/equipment/air-conditioners/${ac._id}`,
        { [field]: value }
      );
      if (onACUpdate) onACUpdate(); // Refresh parent data after update
    } catch (err) {
      console.error('Failed to update AC:', err);
      alert("Failed to update AC.");
    }
  };

  return (
    <div className="bg-white rounded shadow p-4">
      <h3 className="text-xl font-bold mb-2 text-blue-700">Your Air Conditioners</h3>
      {localAcs.length === 0 ? (
        <div className="text-gray-400">No ACs assigned.</div>
      ) : (
        <ul className="space-y-2">
          {localAcs.map((ac, idx) => (
            <li key={ac._id} className="border-b pb-1">
              <div className="font-semibold">{ac.itemName}</div>
              <div className="text-sm text-gray-500">Code: {ac.itemCode}</div>
              <div className="text-sm">Room: {ac.roomId?.roomName || "N/A"}</div>
              <form className="space-y-2 mt-2" onSubmit={e => e.preventDefault()}>
                <div>
                  <label className="block font-medium">Temperature Level</label>
                  <div className="flex items-center gap-4 mb-2">
                    <input
                      type="range"
                      min={16}
                      max={26}
                      step={1}
                      name="temperaturelevel"
                      value={ac.temperaturelevel}
                      onChange={e =>
                        handleFieldChange(ac, idx, "temperaturelevel", Number(e.target.value))
                      }
                      className="flex-1"
                    />
                    <span className="w-12 text-center">
                      {ac.temperaturelevel}°C
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block font-medium">Mode</label>
                  <div className="flex gap-2 mb-2">
                    {["No Mode", "Cool", "Heat", "Fan", "Dry"].map((modeOption) => (
                      <button
                        key={modeOption}
                        type="button"
                        className={`px-4 py-2 rounded border 
                          ${ac.mode === modeOption
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"}
                        `}
                        onClick={() =>
                          handleFieldChange(ac, idx, "mode", modeOption)
                        }
                      >
                        {modeOption}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block font-medium">Fan Speed</label>
                  <div className="flex gap-2 mb-2">
                    {["Low", "Medium", "High"].map((speed) => (
                      <button
                        key={speed}
                        type="button"
                        className={`px-4 py-2 rounded border 
                          ${ac.fanSpeed === speed
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"}
                        `}
                        onClick={() =>
                          handleFieldChange(ac, idx, "fanSpeed", speed)
                        }
                      >
                        {speed}
                      </button>
                    ))}
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
                          ${ac.status === statusOption
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"}
                        `}
                        onClick={() =>
                          handleFieldChange(ac, idx, "status", statusOption)
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

export default UserACController;