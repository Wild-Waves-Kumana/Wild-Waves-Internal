import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ACList from '../components/lists/ACList';
import DoorList from '../components/lists/DoorList';
import LightList from '../components/lists/LightList';
import Modal from "../components/common/Modal";
import { jwtDecode } from 'jwt-decode';
import EditUserModal from "../components/modals/EditUserModal";
import ReusableTable from "../components/common/ReusableTable";
import UserFoodOrdersList from "../components/lists/UserFoodOrdersList";
import profileicon from '../assets/profile-icon.png';  
import { Building2, Home, CalendarDays, User, Pencil, Trash2, DoorClosed, DoorOpen } from "lucide-react";

const UserProfile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [villas, setVillas] = useState([]);
  const [allRooms, setAllRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    username: "",
    villaId: "",
    password: "",
    checkinDate: "",
    checkoutDate: "",
    access: false,
  });
  const [selectedRoomId, setSelectedRoomId] = useState(""); // for room filter
  const [userOrders, setUserOrders] = useState([]);
  const [userOrdersLoading, setUserOrdersLoading] = useState(true);
 

  // Fetch user, companies, villas, and all rooms
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setRole(decoded.role);
        //setRole(decoded.role);
      } catch {
        setRole('');
      }
    }

    const fetchData = async () => {
      try {
        const [userRes, companiesRes, villasRes, roomsRes] = await Promise.all([
          axios.get(`/api/users/${userId}`),
          axios.get('/api/company/all'),
          axios.get('/api/villas/all'),
          axios.get('/api/rooms/all')
        ]);
        setUser(userRes.data);
        setCompanies(companiesRes.data);
        setVillas(villasRes.data);
        setAllRooms(roomsRes.data);
      } catch (err) {
        console.error('Failed to fetch user/profile data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  // Fetch user's food orders
  useEffect(() => {
    if (!userId) return;
    setUserOrdersLoading(true);
    axios
      .get(`/api/food-orders/user/${userId}`)
      .then((res) => {
        setUserOrders(res.data || []);
      })
      .catch(() => setUserOrders([]))
      .finally(() => setUserOrdersLoading(false));
  }, [userId]);


  // Helpers
  const getCompanyName = (companyId) => {
    if (!companyId) return 'N/A';
    const found = companies.find(
      (c) => c._id === companyId || c.companyId === companyId
    );
    return found ? found.companyName : 'N/A';
  };

  const getVillaName = (villaId) => {
    if (!villaId) return 'N/A';
    const found = villas.find(
      (v) => v._id === villaId || v.villaId === villaId
    );
    return found ? found.villaName : 'N/A';
  };

  const getVillaId = (villaId) => {
    if (!villaId) return 'N/A';
    const found = villas.find(
      (v) => v._id === villaId || v.villaId === villaId
    );
    return found ? found.villaId : 'N/A';
  };

  const getAssignedRooms = () => {
    if (!user || !user.rooms || !Array.isArray(user.rooms)) return [];
    return allRooms.filter(room => user.rooms.includes(room._id));
  };

  // Edit modal logic
  const openEditModal = () => {
    setEditForm({
      username: user.username || "",
      villaId: user.villaId || "",
      password: "",
      checkinDate: user.checkinDate ? user.checkinDate.split('T')[0] : "",
      checkoutDate: user.checkoutDate ? user.checkoutDate.split('T')[0] : "",
      access: user.access,
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm({
      ...editForm,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/users/${userId}`, editForm);
      setShowEditModal(false);
      // Refetch user data
      const res = await axios.get(`/api/users/${userId}`);
      setUser(res.data);
    } catch (err) {
      console.error('Failed to update user:', err);
      alert("Failed to update user.");
    }
  };

  // Helper to check if avatarUrl is valid (basic check)
  const isValidAvatar = (url) => {
    return url && typeof url === "string" && url.trim() !== "";
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found.</div>;

  return (
    <div>
      {/* Hero Profile Card */}
        <div className="shadow-xl rounded-xl overflow-hidden mb-8">
          <div className="h-32 relative">
            {/* Avatar and Username/Status Row */}
            <div className="px-4 flex items-center gap-8 w-full">
              {/* Avatar */}
              <div className="relative">
                <img
                  src={isValidAvatar(user.avatarUrl) ? user.avatarUrl : profileicon}
                  alt={`${user.username}'s profile`}
                  className="w-48 h-48 rounded-full border-4 border-white shadow-xl object-cover"
                  onError={e => { e.target.onerror = null; e.target.src = profileicon; }}
                />
              </div>
              {/* Username and status */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">{user.username}</h1>
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                    {user.role}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user.access === true ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                  }`}>
                    {user.access === true ? (
                      <>
                        <span className="inline-block align-middle mr-1"><User size={16} className="text-emerald-700" /></span>
                        Active
                      </>
                    ) : (
                      <>
                        <span className="inline-block align-middle mr-1"><User size={16} className="text-red-700" /></span>
                        Inactive
                      </>
                    )}
                  </span>
                </div>
              </div>
              {/* Action Buttons aligned right */}
              <div className="space-y-3 ml-auto flex flex-col items-end">
                {/* Only show Face Registration for role 'user' */}
                {role === "user" && (
                  <>
                    <span className="text-sm font-extralight text-gray-500 mb-2 block">Register your face for secure access</span>
                    <button
                      onClick={() => window.location.href = `/face-registration/${userId}`}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 shadow-sm hover:shadow-md w-full justify-center gap-2"
                    >
                      <User size={18} />
                      Face Registration
                    </button>
                  </>
                )}
                {/* Only show Edit and Delete for admin or superadmin */}
                {(role === "admin" || role === "superadmin") && (
                  <>
                    <button
                      onClick={openEditModal}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md w-full justify-center gap-2"
                    >
                      <Pencil size={18} />
                      Edit Profile
                    </button>

                    <button
                      onClick={() => window.location.href = `/delete-user/${userId}`}
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 shadow-sm hover:shadow-md w-full justify-center gap-2"
                    >
                      <Trash2 size={18} />
                      Delete User
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="absolute top-4 right-4 text-right">
            </div>
          </div>
          
          <div className="pt-20 pb-8 px-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
              {/* User Info Section */}
              <div className="flex-1">
                

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Building2 size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 font-medium">Company</p>
                        <p className="text-slate-800 font-semibold">{getCompanyName(user.companyId)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Home size={20} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 font-medium">Villa</p>
                        <p className="text-slate-800 font-semibold">{getVillaName(user.villaId)} ({getVillaId(user.villaId)})</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <CalendarDays size={20} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 font-medium">Check-In</p>
                        <p className="text-slate-800 font-semibold">
                          {user.checkinDate ? new Date(user.checkinDate).toLocaleDateString('en-US', { 
                            month: 'short', day: 'numeric', year: 'numeric' 
                          }) : 'Not set'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                        <CalendarDays size={20} className="text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 font-medium">Check-Out</p>
                        <p className="text-slate-800 font-semibold">
                          {user.checkoutDate ? new Date(user.checkoutDate).toLocaleDateString('en-US', { 
                            month: 'short', day: 'numeric', year: 'numeric' 
                          }) : 'Not set'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Assigned Rooms */}
                <div className="mt-8 px-2">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <DoorOpen size={20} className="text-blue-600" />
                    Assigned Rooms
                  </h3>
                  {getAssignedRooms().length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <div className="text-4xl mb-2">🚪</div>
                      <p>No rooms assigned yet</p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      {getAssignedRooms().map(room => (
                        <div
                          key={room._id}
                          className="px-4 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 font-medium"
                        >
                          {room.roomName}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              
            </div>
          </div>
        </div>
      <div className="mt-4">
        {/* Room selection buttons */}
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Filter by Room:</h3>
          <div className="flex justify-center gap-2 mb-6">
            <button
              type="button"
              className={`px-6 py-2 rounded-full font-semibold shadow transition-all duration-150
            ${selectedRoomId === ""
              ? "bg-blue-600 text-white scale-105"
              : "bg-gray-100 text-gray-700 hover:bg-blue-100"}
          `}
              onClick={() => setSelectedRoomId("")}
            >
              All Rooms
            </button>
            {getAssignedRooms().map(room => (
              <button
                key={room._id}
                type="button"
                className={`px-6 py-2 rounded-full font-semibold shadow transition-all duration-150
                  ${selectedRoomId === room._id
                    ? "bg-blue-600 text-white scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-blue-100"}
                `}
                onClick={() => setSelectedRoomId(room._id)}
              >
                {room.roomName}
              </button>
            ))}
          </div>
        </div>

        
        <ACList userId={userId} selectedRoomId={selectedRoomId} />
        <DoorList userId={userId} selectedRoomId={selectedRoomId} />
        <LightList userId={userId} selectedRoomId={selectedRoomId} />
        <UserFoodOrdersList userOrders={userOrders} loading={userOrdersLoading}/>

      </div>


      <EditUserModal
        isVisible={showEditModal}
        onClose={() => setShowEditModal(false)}
        editForm={editForm}
        setEditForm={setEditForm}
        handleEditChange={handleEditChange}
        handleEditSubmit={handleEditSubmit}
        villas={villas}
      />
    </div>
  );
};

export default UserProfile;
