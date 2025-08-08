import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UserACList = ({ userId, adminId }) => {
  const [acs, setAcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem('role'); // Get current role

  useEffect(() => {
    const fetchACs = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/equipment/air-conditioners');
        let filteredACs = [];
        if (role === 'admin') {
          // Show ACs where assignedUser equals userId AND adminId equals adminId
          filteredACs = res.data.filter(
            (ac) =>
              (ac.assignedUser && (ac.assignedUser._id === userId || ac.assignedUser === userId)) &&
              (ac.adminId && (ac.adminId._id === adminId || ac.adminId === adminId))
          );
        } 
        if (role === 'superadmin') {
            filteredACs = res.data.filter(
            (ac) =>
              ac.assignedUser && (ac.assignedUser._id === userId || ac.assignedUser === userId)
          );

        }
        if (role === 'user') {
            filteredACs = res.data.filter(
            (ac) =>
              ac.assignedUser && (ac.assignedUser._id === userId || ac.assignedUser === userId)
          );
        }
        else {
          <div className='text-red-500'>
            Unable to fetch air conditioners for this user.
          </div>// For non-admin, show only ACs assigned to userId
          
        }
         // ✅ Log assignedUser for debugging
  filteredACs.forEach((ac) => {
    console.log("assignedUser field:", ac.assignedUser);
  });
        setAcs(filteredACs);
      } catch (err) {
        console.error('Failed to fetch air conditioners:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchACs();
  }, [userId, adminId, role]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Air Conditioner Equipment List</h2>
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
              <th className="py-2 px-4 border-b">Temperature</th>
              <th className="py-2 px-4 border-b">Mode</th>
              <th className="py-2 px-4 border-b">Fan Speed</th>
              <th className="py-2 px-4 border-b">Assigned To</th>
            </tr>
          </thead>
          <tbody>
            {acs.map((ac) => (
              <tr key={ac._id}>
                <td className="py-2 px-4 border-b">{ac.itemName}</td>
                <td className="py-2 px-4 border-b">{ac.itemCode}</td>
                <td className="py-2 px-4 border-b">{ac.roomname}</td>
                <td className="py-2 px-4 border-b">{ac.status}</td>
                <td className="py-2 px-4 border-b">{ac.temperaturelevel}</td>
                <td className="py-2 px-4 border-b">{ac.mode}</td>
                <td className="py-2 px-4 border-b">{ac.fanSpeed}</td>
                <td className="py-2 px-4 border-b">
                  {ac.assignedUser?.username || ac.assignedUser || 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserACList;