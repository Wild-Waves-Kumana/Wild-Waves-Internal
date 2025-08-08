import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UserLightList = ({userId, adminId}) => {
  const [lights, setLights] = useState([]);
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem('role'); // Get current role

  useEffect(() => {
    const fetchLights = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/equipment/lights');
        let filteredLights=[]
        // Filter light where assignedUser equals userId
        if (role === 'admin') {
            // Show Lights where assignedUser equals userId AND adminId equals adminId
            filteredLights = res.data.filter(
              (light) =>
                (light.assignedUser && (light.assignedUser._id === userId || light.assignedUser === userId)) &&
                (light.adminId && (light.adminId._id === adminId || light.adminId === adminId))
            );
          } 
        if (role === 'superadmin') {
            filteredLights = res.data.filter(
            (light) =>
            light.assignedUser && (light.assignedUser._id === userId || light.assignedUser === userId)
        );
        }
        if (role === 'user') {
              filteredLights = res.data.filter(
              (light) =>
                light.assignedUser && (light.assignedUser._id === userId || light.assignedUser === userId)
            );
          }
          else {
            <div className='text-red-500'>
              Unable to fetch Doors for this user.
            </div>// For non-admin, show only ACs assigned to userId
            
          }
         // Log assignedUser for debugging
        filteredLights.forEach((light) => {
            console.log("assignedUser field:", light.assignedUser);
        });
            setLights(filteredLights);
          } catch (err) {
            console.error('Failed to fetch Lights:', err);
          } finally {
            setLoading(false);
          }
        };
        fetchLights();
      }, [userId, adminId, role]);






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
                  {light.assignedUser?.username || light.assignedUser || 'N/A'}
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