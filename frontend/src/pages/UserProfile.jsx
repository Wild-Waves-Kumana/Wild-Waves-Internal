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
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    username: "",
    roomname: "",
    roomid: "",
    password: "",
  });
  const adminId = localStorage.getItem('adminId');

  useEffect(() => {
    // Get role from token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setRole(decoded.role);
      } catch {
        setRole('');
      }
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/users/${userId}`);
        setUser(res.data);
      } catch (err) {
        console.error('Failed to fetch user:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  const openEditModal = () => {
    setEditForm({
      username: user.username || "",
      roomname: user.roomname || "",
      roomid: user.roomid || "",
      password: "",
    });
    setShowEditModal(true);
  };

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

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found.</div>;

  return (
    <div>
      <div className="flex max-w mx-auto mt-10 bg-white shadow rounded p-6">
        <div className='flex-1 mx-3'> 
          <img src={user.profilePicture} alt={`${user.username}'s profile`} className="w-24 h-24 rounded-full mx-auto" />
        </div>
        <div className="flex-2 mx-3 mb-4">
          <h2 className="text-2xl font-bold mb-4">User Profile</h2>
          <div className="mb-2"><strong>Username:</strong> {user.username}</div>
          <div className="mb-2"><strong>Room Name:</strong> {user.roomname}</div>
          <div className="mb-2"><strong>Room ID:</strong> {user.roomid}</div>
          <div className="mb-2"><strong>Role:</strong> {user.role}</div>
          <strong>Company:</strong> 
          {user.companyId && typeof user.companyId === 'object'
            ? `${user.companyId.companyName} (${user.companyId.companyId || user.companyId._id})`
            : user.companyId || 'N/A'
          }
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
              className="px-4 py-2 w-30 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={role === "user"}>
              Edit User
            </button>
          </div>
          <div className='mb-2'>
            <button
              onClick={() => window.location.href = `/delete-user/${userId}`}
              className="px-4 py-2 w-30 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
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

      <Modal isVisible={showEditModal} onClose={() => setShowEditModal(false)}>
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
            name="roomname"
            value={editForm.roomname}
            onChange={handleEditChange}
            placeholder="Room Name"
            className="w-full border px-3 py-2 rounded"
          />
          <input
            type="text"
            name="roomid"
            value={editForm.roomid}
            onChange={handleEditChange}
            placeholder="Room ID"
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
