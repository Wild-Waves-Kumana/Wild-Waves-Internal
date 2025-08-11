import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import UserACList from '../components/UserACList';
import UserDoorList from '../components/UserDoorList';
import UserLightList from '../components/UserLightList';
import Modal from "../components/Modal";
import { jwtDecode } from 'jwt-decode'; 

const UserProfile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminId, setAdminId] = useState("");
  const [role, setRole] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    username: "",
    villaName: "",
    villaId: "",
    password: "",
  });
  const [userRooms, setUserRooms] = useState([]);
  const [newRooms, setNewRooms] = useState([{ roomName: '' }]);
  const [roomAssignMessage, setRoomAssignMessage] = useState('');


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setRole(decoded.role);
        setAdminId(decoded.adminId);
      } catch {
        setRole('');
      }
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/users/${userId}`);
        setUser(res.data);

        // Fetch companies after user is loaded
        const companiesRes = await axios.get('http://localhost:5000/api/company/all');
        setCompanies(companiesRes.data);

      } catch (err) {
        console.error('Failed to fetch user:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  // Fetch rooms assigned to this user
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/rooms/user/${userId}`);
        setUserRooms(res.data);
      } catch (err) {
        console.error('Failed to fetch user rooms:', err);
        setUserRooms([]);
      }
    };
    fetchRooms();
  }, [userId]);
  
  // Get company name by ID
  const getCompanyName = (companyId) => {
    if (!companyId) return 'N/A';
    // If already populated object
    if (typeof companyId === 'object') {
      return companyId.companyName || companyId.companyId || companyId._id || 'N/A';
    }
    // If just an ID, find in companies array
    const found = companies.find(
      (c) => c._id === companyId || c.companyId === companyId
    );
    return found ? found.companyName : 'N/A';
  };

  // Open edit modal with pre-filled data
  const openEditModal = () => {
    setEditForm({
      username: user.username || "",
      villaName: user.villaName || "",
      villaId: user.villaId || "",
      password: "",
    });
    setShowEditModal(true);
  };

  // Handle changes in the edit form
  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/users/${userId}`, editForm);
      setShowEditModal(false);
      // Optionally refetch user data
      const res = await axios.get(`http://localhost:5000/api/users/${userId}`);
      setUser(res.data);
    } catch (err) {
      console.error('Failed to update user:', err);
      alert("Failed to update user.");
    }
  };

  const handleNewRoomChange = (idx, value) => {
  setNewRooms(rooms =>
    rooms.map((room, i) => (i === idx ? { ...room, roomName: value } : room))
  );
};

const addNewRoomField = () => {
  setNewRooms([...newRooms, { roomName: '' }]);
};

const handleAssignRooms = async (e) => {
  e.preventDefault();
  try {
    for (const room of newRooms) {
      if (room.roomName.trim()) {
        await axios.post('http://localhost:5000/api/rooms/create', {
          roomName: room.roomName,
          villaId: userId, // assign to this user
        });
      }
    }
    setRoomAssignMessage('Rooms assigned successfully!');
    setNewRooms([{ roomName: '' }]);
    // Optionally refetch rooms
    const res = await axios.get(`http://localhost:5000/api/rooms/user/${userId}`);
    setUserRooms(res.data);
    setTimeout(() => setRoomAssignMessage(''), 1500);
  } catch (err) {
    console.error('Failed to assign rooms:', err);
    setRoomAssignMessage('Failed to assign rooms.');
  }
};

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found.</div>;

  return (
    <div>
      <div className="flex max-w mx-auto mt-10 bg-white shadow rounded p-6">
        <div className='flex-1 mx-3'> 
          <img src={user.profilePicture} alt={`${user.username}'s profile`} className="w-24 h-24 rounded-full mx-auto" />
        </div>
        <div className="flex-2 mx-3 mb-2">
          <h2 className="text-2xl font-bold mb-4">User Profile</h2>
          <div className="mb-2"><strong>Username:</strong> {user.username}</div>
          <div className="mb-2"><strong>Villa Name:</strong> {user.villaName}</div>
          <div className="mb-2"><strong>Villa ID:</strong> {user.villaId}</div>
          <div className="mb-2"><strong>Role:</strong> {user.role}</div>
          <div className="mb-2"><strong>Company:</strong> {getCompanyName(user.companyId)}</div>
          {/* Room names list */}
          <div className="my-4">
            {" "}
            {userRooms.length === 0 ? (
              <span className="text-gray-400">No rooms assigned</span>
            ) : (
              <div className="flex flex-wrap gap-2 mt-2">
                {userRooms.map(room => (
                  <div
                    key={room._id}
                    className="px-4 py-2 bg-blue-100 text-blue-800 rounded shadow text-sm font-medium"
                  >
                    {room.roomName}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 mx-3 mb-4 my-5 "> 
          <div className='mb-2 '>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 w-30 bg-blue-500 text-white rounded hover:bg-blue-600">
              Back 
            </button>
          </div>
          <div className='mb-2'>
            <button
              onClick={openEditModal}
              className={`px-4 py-2 w-30 bg-yellow-500 text-white rounded 
                ${role !== "user" ? "hover:bg-yellow-600" : ""} 
                disabled:opacity-50 disabled:cursor-not-allowed`}
              disabled={role === "user"}>
              Edit User
            </button>
          </div>
          <div className='mb-2'>
            <button
              onClick={() => window.location.href = `/delete-user/${userId}`}
              className={`px-4 py-2 w-30 bg-red-500 text-white rounded 
                ${role !== "user" ? "hover:bg-red-600" : ""} 
                disabled:opacity-50 disabled:cursor-not-allowed`}
              disabled={role === "user"}>
              Delete User
            </button>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <UserACList userId={userId} adminId={adminId} />
        <UserDoorList userId={userId} adminId={adminId} />
        <UserLightList userId={userId} adminId={adminId} />
      </div>

      <Modal isVisible={showEditModal} onClose={() => setShowEditModal(false)} width="w-2/5">
        <h3 className="text-xl font-bold mb-4">Edit User</h3>
        <form onSubmit={handleEditSubmit} className="space-y-3">
          <input
            type="text"
            name="username"
            value={editForm.username}
            onChange={handleEditChange}
            placeholder="Username"
            className="w-full border px-3 py-2 rounded"
          />
          <input
            type="text"
            name="villaName"
            value={editForm.villaName}
            onChange={handleEditChange}
            placeholder="Villa Name"
            className="w-full border px-3 py-2 rounded"
          />
          <input
            type="text"
            name="villaId"
            value={editForm.villaId}
            onChange={handleEditChange}
            placeholder="Villa ID"
            className="w-full border px-3 py-2 rounded"
          />
          <input
            type="password"
            name="password"
            value={editForm.password}
            onChange={handleEditChange}
            placeholder="New Password (leave blank to keep current)"
            className="w-full border px-3 py-2 rounded"
          />

          {/* Assign new rooms section */}
          <div className="border-t pt-4 mt-4">
            <h4 className="font-semibold mb-2">Assign New Rooms</h4>
            {roomAssignMessage && (
              <div className="text-green-600 text-sm mb-2">{roomAssignMessage}</div>
            )}
            {newRooms.map((room, idx) => (
              <div key={idx} className="flex items-center mb-2">
                <input
                  type="text"
                  placeholder={`Room Name ${idx + 1}`}
                  value={room.roomName}
                  onChange={e => handleNewRoomChange(idx, e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring"
                />
                {idx === newRooms.length - 1 && (
                  <button
                    type="button"
                    onClick={addNewRoomField}
                    className="ml-2 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    +
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleAssignRooms}
              className="w-full mt-2 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
            >
              Assign Rooms
            </button>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Save
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserProfile;
