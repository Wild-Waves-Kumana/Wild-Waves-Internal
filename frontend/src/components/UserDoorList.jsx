import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UserDoorList = () => {
   const [doors, setDoors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get the logged-in user's ID from localStorage
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchDoors = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/equipment/doors');
        // Filter doors where assignedTo equals userId
        const filteredDoors = res.data.filter(
          (door) =>
            (door.assignedTo && (door.assignedTo._id === userId || door.assignedTo === userId))
        );
        setDoors(filteredDoors);
      } catch (err) {
        console.error('Failed to fetch doors:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoors();
  }, [userId]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Door Equipment List</h2>
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
              <th className="py-2 px-4 border-b">Edit</th>
            </tr>
          </thead>
          <tbody>
            {doors.map((door) => (
              <tr key={door._id}>
                <td className="py-2 px-4 border-b">{door.itemName}</td>
                <td className="py-2 px-4 border-b">{door.itemCode}</td>
                <td className="py-2 px-4 border-b">{door.roomname}</td>
                <td className="py-2 px-4 border-b">{door.status}</td>
                <td className="py-2 px-4 border-b">
                  <button className="text-blue-500 hover:underline">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default UserDoorList
