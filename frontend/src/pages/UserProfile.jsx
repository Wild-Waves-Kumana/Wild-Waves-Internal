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
          axios.get(`http://localhost:5000/api/users/${userId}`),
          axios.get('http://localhost:5000/api/company/all'),
          axios.get('http://localhost:5000/api/villas/all'),
          axios.get('http://localhost:5000/api/rooms/all')
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
      .get(`http://localhost:5000/api/food-orders/user/${userId}`)
      .then((res) => {
        setUserOrders(res.data || []);
      })
      .catch(() => setUserOrders([]))
      .finally(() => setUserOrdersLoading(false));
  }, [userId]);



  // Table columns for user food orders
  const userOrderColumns = [
    {
      key: "orderId",
      header: "Order ID",
      sortable: true,
    },
    {
      key: "orderedAt",
      header: "Ordered At",
      sortable: true,
      render: (val) => val ? new Date(val).toLocaleString() : "-",
    },
    {
      key: "expectTime",
      header: "Expect Time",
      sortable: true,
      render: (val) => val ? new Date(val).toLocaleString() : "-",
    },
    
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (val) => {
        let style = "";
        if (val === "Delivered") {
          style = "bg-green-500 text-white";
        } else if (val === "Cancelled") {
          style = "bg-red-500 text-white";
        } else if (val === "Cancelled by User") {
          style = "bg-yellow-500 text-white";
        } else if (val === "Pending") {
          style = "bg-blue-500 text-white";
        } else if (val === "Preparing") {
          style = "bg-indigo-500 text-white";
        }
        return (
          <span className={`px-3 py-1 rounded font-semibold text-xs shadow ${style}`}>
            {val}
          </span>
        );
      },
    },
    {
      key: "totalPrice",
      header: "Total Price",
      sortable: true,
      render: (val) => `${val} LKR`,
    },
    {
      key: "items",
      header: "Items",
      render: (items) =>
        <ul className="list-disc ml-4">
          {items.map((item, idx) => (
            <li key={idx}>
              <span className="font-mono">{item.foodCode}</span> - {item.foodId?.name || item.name} ({item.quantity} x {item.price} LKR)
            </li>
          ))}
        </ul>,
    },
    {
      key: "specialRequest",
      header: "Special Request",
      render: (val) => val || "-",
    },
  ];

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
      await axios.put(`http://localhost:5000/api/users/${userId}`, editForm);
      setShowEditModal(false);
      // Refetch user data
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
          {/* <img src={user.profilePicture} alt={`${user.username}'s profile`} className="w-24 h-24 rounded-full mx-auto" /> */}
        </div>
        <div className="flex-2 mx-3 mb-2">
          <h2 className="text-2xl font-bold mb-4">User Profile</h2>
          <div className="mb-2"><strong>Username:</strong> {user.username}</div>
          <div className="mb-2"><strong>Villa Name:</strong> {getVillaName(user.villaId)} ({getVillaId(user.villaId)})</div>
          <div className="mb-2"><strong>Company:</strong> {getCompanyName(user.companyId)}</div>
          <div className="mb-2"><strong>Check-In:</strong> {user.checkinDate ? new Date(user.checkinDate).toLocaleDateString() : 'N/A'}</div>
          <div className="mb-2"><strong>Check-Out:</strong> {user.checkoutDate ? new Date(user.checkoutDate).toLocaleDateString() : 'N/A'}</div>
          <div className="mb-2"><strong>Role:</strong> {user.role}</div>
          <div className="mb-2"><strong>Access:</strong> <span className={`px-2 py-1 rounded ${user.access === true ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{user.access === true ? "Enabled" : "Disabled"}</span></div>
          <div className="my-4">
            {getAssignedRooms().length === 0 ? (
              <span className="text-gray-400">No rooms assigned</span>
            ) : (
              <div className="flex flex-wrap gap-2 mt-2">
                {getAssignedRooms().map(room => (
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
              onClick={() => window.location.href = `/face-registration/${userId}`}
              className={`px-4 py-2 w-30 bg-green-500 text-white rounded 
                ${role === "user" ? "hover:bg-green-600" : ""} 
                disabled:opacity-50 disabled:cursor-not-allowed`}
              disabled={role !== "user"}>
              Face Registration
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
        {/* Room selection buttons */}
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Filter by Room:</h3>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`px-4 py-2 rounded border
                ${selectedRoomId === ""
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"}
              `}
              onClick={() => setSelectedRoomId("")}
            >
              All Rooms
            </button>
            {getAssignedRooms().map(room => (
              <button
                key={room._id}
                type="button"
                className={`px-4 py-2 rounded border
                  ${selectedRoomId === room._id
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"}
                `}
                onClick={() => setSelectedRoomId(room._id)}
              >
                {room.roomName}
              </button>
            ))}
          </div>
        </div>
        {/* Pass selectedRoomId as prop to ACList */}
        <ACList userId={userId} selectedRoomId={selectedRoomId} />
        <DoorList userId={userId} selectedRoomId={selectedRoomId} />
        <LightList userId={userId} selectedRoomId={selectedRoomId} />
      </div>

      {/* User Food Orders Section */}
      <div className="mt-10">
        <h3 className="text-xl font-bold mb-4">User Food Orders</h3>
        <ReusableTable
          columns={userOrderColumns}
          data={userOrders}
          searchable={true}
          sortable={true}
          pagination={true}
          pageSize={10}
          striped={true}
          hover={true}
          loading={userOrdersLoading}
          emptyMessage="No food orders found for this user."
        />
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
