import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UserLightList = () => {
  const [lights, setLights] = useState([]);
  const [loading, setLoading] = useState(true);
    // Get the logged-in user's ID from localStorage
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchLights = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/equipment/lights');
        
        // Filter doors where assignedTo equals userId
        const filteredLights = res.data.filter(
          (light) =>
            (light.assignedTo && (light.assignedTo._id === userId || light.assignedTo === userId))
        );
        setLights(filteredLights);
      } catch (err) {
        console.error('Failed to fetch lights:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLights();
  }, [userId]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Light Equipment List</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Item Name</th>
              <th className="py-2 px-4 border-b">Item Code</th>
              <th className="py-2 px-4 border-b">Room Name</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Brightness</th>
              <th className="py-2 px-4 border-b">Assigned To</th>
            </tr>
          </thead>
          <tbody>
            {lights.map((light) => (
              <tr key={light._id}>
                <td className="py-2 px-4 border-b">{light.itemName}</td>
                <td className="py-2 px-4 border-b">{light.itemCode}</td>
                <td className="py-2 px-4 border-b">{light.roomname}</td>
                <td className="py-2 px-4 border-b">{light.status}</td>
                <td className="py-2 px-4 border-b">{light.brightness}</td>
                <td className="py-2 px-4 border-b">
                  {light.assignedTo?.username || light.assignedTo || 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserLightList;