import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Modal from "../common/Modal";

const statusOptions = ["Pending", "Preparing", "Delivered", "Cancelled"];

const RecentFoodOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState("");
  const [usernames, setUsernames] = useState({});
  const [villaNames, setVillaNames] = useState({});
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [now, setNow] = useState(Date.now());
  const [confirmModal, setConfirmModal] = useState({
    isVisible: false,
    orderId: null,
    newStatus: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [dateOrderedAt, setDateOrderedAt] = useState("");
  const [dateExpectTime, setDateExpectTime] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Live timer effect
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Get adminId from token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const decoded = jwtDecode(token);
      const adminId = decoded.adminId || decoded._id || decoded.id;
      if (!adminId) return;
      console.log("Admin ID from token:", adminId);

      // Fetch companyId from admin collection
      axios
        .get(`http://localhost:5000/api/admin/${adminId}`)
        .then((res) => {
          setCompanyId(res.data.companyId);
        })
        .catch(() => setCompanyId(""));
    } catch {
      setCompanyId("");
    }
  }, []);

  // Fetch orders when companyId is available
  useEffect(() => {
    if (!companyId) return;
    setLoading(true);
    axios
      .get(`http://localhost:5000/api/food-orders/all/${companyId._id}`)
      .then((res) => {
        // Filter: exclude "Cancelled by User" and only show orders with expectTime >= today
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of today
        const filtered = (res.data || []).filter(
          (order) =>
            order.status !== "Cancelled by User" &&
            (!order.expectTime || new Date(order.expectTime) >= today)
        );
        setOrders(filtered);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [companyId]);

  // Fetch usernames for all userIds in orders
  useEffect(() => {
    const fetchAllUsernames = async () => {
      const ids = orders.map((order) => order.userId).filter(Boolean);
      const uniqueIds = [...new Set(ids)];
      const newUsernames = {};
      await Promise.all(
        uniqueIds.map(async (userId) => {
          try {
            const res = await axios.get(`http://localhost:5000/api/users/${userId}`);
            newUsernames[userId] = res.data.username || "-";
          } catch {
            newUsernames[userId] = "-";
          }
        })
      );
      setUsernames(newUsernames);
    };
    if (orders.length > 0) fetchAllUsernames();
  }, [orders]);

  // Fetch villa names for all villaIds in orders
  useEffect(() => {
    const fetchAllVillaNames = async () => {
      const ids = orders.map((order) => order.villaId).filter(Boolean);
      const uniqueIds = [...new Set(ids)];
      const newVillaNames = {};
      await Promise.all(
        uniqueIds.map(async (villaId) => {
          try {
            const res = await axios.get(`http://localhost:5000/api/villas/${villaId}`);
            newVillaNames[villaId] = res.data.villaName || "-";
          } catch {
            newVillaNames[villaId] = "-";
          }
        })
      );
      setVillaNames(newVillaNames);
    };
    if (orders.length > 0) fetchAllVillaNames();
  }, [orders]);

  // Handler to update order status
  const handleStatusUpdate = async (orderId, newStatus) => {
    // For Delivered or Cancelled, show confirmation modal
    if (newStatus === "Delivered" || newStatus === "Cancelled") {
      setConfirmModal({ isVisible: true, orderId, newStatus });
      return;
    }
    await updateOrderStatus(orderId, newStatus);
  };

  // Actual update function
  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingStatus((prev) => ({ ...prev, [orderId]: true }));
    try {
      await axios.post(
        `http://localhost:5000/api/food-orders/update-status/${orderId}`,
        { status: newStatus }
      );
      // Refresh orders after update
      if (companyId) {
        const res = await axios.get(
          `http://localhost:5000/api/food-orders/all/${companyId._id}`
        );
        // Filter again after update
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of today
        const filtered = (res.data || []).filter(
          (order) =>
            order.status !== "Cancelled by User" &&
            (!order.expectTime || new Date(order.expectTime) >= today)
        );
        setOrders(filtered);
      }
    } catch {
      // Optionally show error
    }
    setUpdatingStatus((prev) => ({ ...prev, [orderId]: false }));
    setConfirmModal({ isVisible: false, orderId: null, newStatus: "" });
  };

  // Helper to format timer
  const getTimer = (expectTime) => {
    if (!expectTime) return "-";
    const diff = Math.max(0, new Date(expectTime) - now);
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Filtered and sorted orders
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // Status dropdown filter
    if (statusFilter) {
      result = result.filter(order => order.status === statusFilter);
    }

    // Search by orderId, villa name, userId
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(order =>
        (order.orderId && order.orderId.toLowerCase().includes(term)) ||
        (order.villaId && villaNames[order.villaId] && villaNames[order.villaId].toLowerCase().includes(term)) ||
        (order.userId && usernames[order.userId] && usernames[order.userId].toLowerCase().includes(term))
      );
    }

    // Date search for orderedAt
    if (dateOrderedAt) {
      result = result.filter(order => {
        if (!order.orderedAt) return false;
        const orderDate = new Date(order.orderedAt);
        const selectedDate = new Date(dateOrderedAt);
        return (
          orderDate.getFullYear() === selectedDate.getFullYear() &&
          orderDate.getMonth() === selectedDate.getMonth() &&
          orderDate.getDate() === selectedDate.getDate()
        );
      });
    }

    // Date search for expectTime
    if (dateExpectTime) {
      result = result.filter(order => {
        if (!order.expectTime) return false;
        const expectDate = new Date(order.expectTime);
        const selectedDate = new Date(dateExpectTime);
        return (
          expectDate.getFullYear() === selectedDate.getFullYear() &&
          expectDate.getMonth() === selectedDate.getMonth() &&
          expectDate.getDate() === selectedDate.getDate()
        );
      });
    }

    // Sort by timer ascending (lowest timer first)
    result.sort((a, b) => {
      const aTime = a.expectTime ? new Date(a.expectTime) - Date.now() : Infinity;
      const bTime = b.expectTime ? new Date(b.expectTime) - Date.now() : Infinity;
      return aTime - bTime;
    });

    return result;
  }, [orders, searchTerm, villaNames, usernames, dateOrderedAt, dateExpectTime, statusFilter]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {/* Search Bar, Status Dropdown, and Date Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <input
          type="text"
          placeholder="Search Order ID, Villa Name, User ID..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md w-full md:w-1/3"
        />
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Status:</label>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="Preparing">Preparing</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Ordered At:</label>
          <input
            type="date"
            value={dateOrderedAt}
            onChange={e => setDateOrderedAt(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          />
          {dateOrderedAt && (
            <button
              className="px-2 py-1 rounded bg-gray-200 text-gray-700 text-xs"
              onClick={() => setDateOrderedAt("")}
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Expected Time:</label>
          <input
            type="date"
            value={dateExpectTime}
            onChange={e => setDateExpectTime(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          />
          {dateExpectTime && (
            <button
              className="px-2 py-1 rounded bg-gray-200 text-gray-700 text-xs"
              onClick={() => setDateExpectTime("")}
            >
              Clear
            </button>
          )}
        </div>
      </div>
      {filteredOrders.length === 0 ? (
        <div>No orders found.</div>
      ) : (
        <div className="flex flex-col gap-2">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded shadow p-4 mb-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status & Order ID */}
                <span className="font-bold text-blue-700">
                  Order ID: {order.orderId}
                  {(order.status === "Pending" || order.status === "Preparing") && order.expectTime && (
                    <span className="ml-5 px-4 rounded bg-gray-200 text-blue-700 font-mono text-xs">
                      {getTimer(order.expectTime)}
                    </span>
                  )}
                </span>
                <div className="flex gap-2">
                  {statusOptions.map((status) => {
                    let activeBg = "";
                    let activeBorder = "";
                    let activeText = "";
                    if (status === "Pending") {
                      activeBg = "bg-yellow-500";
                      activeBorder = "border-yellow-600";
                      activeText = "text-white";
                    } else if (status === "Preparing") {
                      activeBg = "bg-blue-500";
                      activeBorder = "border-blue-600";
                      activeText = "text-white";
                    } else if (status === "Delivered") {
                      activeBg = "bg-green-500";
                      activeBorder = "border-green-600";
                      activeText = "text-white";
                    } else if (status === "Cancelled") {
                      activeBg = "bg-red-500";
                      activeBorder = "border-red-600";
                      activeText = "text-white";
                    }

                    return (
                      <button
                        key={status}
                        className={`px-2 py-1 rounded text-xs border transition-all duration-150
                          ${
                            order.status === status
                              ? `${activeBg} ${activeText} ${activeBorder} font-bold shadow`
                              : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"
                          }
                        `}
                        disabled={updatingStatus[order.orderId]}
                        onClick={() => handleStatusUpdate(order.orderId, status)}
                      >
                        {status}
                      </button>
                    );
                  })}
                </div>
                {/* Left: Order Details */}
                <div>
                    <div className="mb-1">
                      <span className="font-semibold">User:</span>{" "}
                      {order.userId && usernames[order.userId] && order.userId ? (
                        <a
                          href={`/user-profile/${order.userId}`}
                          className="text-blue-600 hover:text-blue-800"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {usernames[order.userId]}
                        </a>
                      ) : (
                        "-"
                      )}
                    </div>
                    <div className="mb-1">
                      <span className="font-semibold">Villa:</span>{" "}
                      {order.villaId && villaNames[order.villaId] && order.villaId ? (
                        <a
                          href={`/villa-profile/${order.villaId}`}
                          className="text-blue-600 hover:text-blue-800"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {villaNames[order.villaId]}
                        </a>
                      ) : (
                        "-"
                      )}    
                    </div>
                  <div className="mb-1">
                    <span className="font-semibold">Ordered At:</span>{" "}
                    {order.orderedAt
                      ? new Date(order.orderedAt).toLocaleString()
                      : "-"}
                  </div>
                  <div className="mb-1">
                    <span className="font-semibold">Expect Time:</span>{" "}
                    {order.expectTime
                      ? new Date(order.expectTime).toLocaleString()
                      : "-"}
                  </div>
                  <div className="mb-1">
                    <span className="font-semibold">Total:</span>{" "}
                    {order.totalPrice} LKR
                  </div>
                  {order.specialRequest && (
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-semibold">Special Request:</span> {order.specialRequest}
                    </div>
                  )}
                </div>
                {/* Right: Items */}
                <div>
                  <table className="w-full  bg-white shadow-md rounded-lg overflow-hidden ">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="py-2 px-4 text-left text-xs">Code</th>
                        <th className="py-2 px-4 text-left text-xs">Name</th>
                        <th className="py-2 px-4 text-right text-xs">Quantity</th>
                        <th className="py-2 px-4 text-right text-xs">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-1 px-2 font-mono text-xs text-gray-500">
                            {item.foodCode || "-"}
                          </td>
                          <td className="py-1 px-2">
                            {item.foodId?.name || item.name}
                          </td>
                          <td className="py-1 px-2 text-right">
                            {item.quantity}
                          </td>
                          <td className="py-1 px-2 text-right">
                            {item.quantity > 1
                              ? `${item.quantity} x ${item.price}`
                              : `${item.price}`}
                          </td>
                        </tr>
                      ))}
                      <tr>
                        <td colSpan={3} className="py-1 px-2 text-right font-semibold">
                          Total
                        </td>
                        <td className="py-1 px-2 text-right font-bold text-blue-700">
                          {order.totalPrice} LKR
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Confirmation Modal */}
      <Modal
        isVisible={confirmModal.isVisible}
        onClose={() => setConfirmModal({ isVisible: false, orderId: null, newStatus: "" })}
        width="max-w-sm"
      >
        <div className="text-center">
          <h3 className="text-lg font-bold mb-2">Confirm Status Change</h3>
          <p className="mb-4">
            Are you sure you want to change the status to <span className="font-semibold">{confirmModal.newStatus}</span>?
          </p>
          <div className="flex justify-center gap-4">
            <button
              className="px-4 py-2 rounded bg-blue-600 text-white font-semibold"
              onClick={() => updateOrderStatus(confirmModal.orderId, confirmModal.newStatus)}
            >
              Yes, Change
            </button>
            <button
              className="px-4 py-2 rounded bg-gray-300 text-gray-700 font-semibold"
              onClick={() => setConfirmModal({ isVisible: false, orderId: null, newStatus: "" })}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RecentFoodOrder;