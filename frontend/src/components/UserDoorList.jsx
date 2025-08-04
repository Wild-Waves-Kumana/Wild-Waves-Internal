import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UserDoorList = ({userId, adminId}) => {
   const [doors, setDoors] = useState([]);
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem('role'); // Get current role


  useEffect(() => {
    const fetchDoors = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/equipment/doors');
        
        let filteredDoors=[];// Filter doors where assignedTo equals userId
        if (role === 'admin') {
          // Show ACs where assignedTo equals userId AND adminId equals adminId
          filteredDoors = res.data.filter(
            (door) =>
              (door.assignedTo && (door.assignedTo._id === userId || door.assignedTo === userId)) &&
              (door.adminId && (door.adminId._id === adminId || door.adminId === adminId))
          );
        } 
        if (role === 'superadmin') {
            filteredDoors = res.data.filter(
            (door) =>
              door.assignedTo && (door.assignedTo._id === userId || door.assignedTo === userId)
          );

        }
        if (role === 'user') {
            filteredDoors = res.data.filter(
            (door) =>
              door.assignedTo && (door.assignedTo._id === userId || door.assignedTo === userId)
          );
        }
        else {
          <div className='text-red-500'>
            Unable to fetch Doors for this user.
          </div>// For non-admin, show only ACs assigned to userId
          
        }
      // ✅ Log assignedTo for debugging
    filteredDoors.forEach((door) => {
      console.log("AssignedTo field:", door.assignedTo);
    });
          setDoors(filteredDoors);
        } catch (err) {
          console.error('Failed to fetch Doors:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchDoors();
    }, [userId, adminId, role]);
        
       

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
