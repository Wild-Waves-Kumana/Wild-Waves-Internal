import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Modal from "../common/Modal";

const statusOptions = ["Pending", "Preparing", "Delivered", "Cancelled"];

const getStatusStyles = (status, selected) => {
  const base = "px-2 py-1 rounded text-xs border transition-all duration-150 font-semibold";
  if (!selected) return `${base} bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100`;
  switch (status) {
    case "Pending":
      return `${base} bg-yellow-500 text-white border-yellow-600 shadow`;
    case "Preparing":
      return `${base} bg-blue-500 text-white border-blue-600 shadow`;
    case "Delivered":
      return `${base} bg-green-500 text-white border-green-600 shadow`;
    case "Cancelled":
      return `${base} bg-red-500 text-white border-red-600 shadow`;
    default:
      return base;
  }
};

const OngoingFoodOrders = () => {
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
  const [statusFilter, setStatusFilter] = useState(""); // <-- Add status filter

  // Live timer effect
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Get adminId from token and fetch companyId
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const decoded = jwtDecode(token);
      const adminId = decoded.adminId || decoded._id || decoded.id;
      if (!adminId) return;
      axios
        .get(`http://localhost:5000/api/admin/${adminId}`)
        .then((res) => setCompanyId(res.data.companyId))
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
      .get(`http://localhost:5000/api/food-orders/company/${companyId._id}`)
      .then((res) => {
        // Only Pending and Preparing
        const filtered = (res.data || []).filter(
          (order) =>
            (order.status === "Pending" || order.status === "Preparing")
        );
        // Sort by timer ascending (lowest timer first)
        const sorted = filtered.sort((a, b) => {
          const aTime = a.expectTime ? new Date(a.expectTime) - Date.now() : Infinity;
          const bTime = b.expectTime ? new Date(b.expectTime) - Date.now() : Infinity;
          return aTime - bTime;
        });
        setOrders(sorted);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [companyId]);

  // Memoize userIds and villaIds for efficient fetching
  const userIds = useMemo(() => [...new Set(orders.map(o => o.userId).filter(Boolean))], [orders]);
  const villaIds = useMemo(() => [...new Set(orders.map(o => o.villaId).filter(Boolean))], [orders]);

  // Fetch usernames
  useEffect(() => {
    if (userIds.length === 0) return;
    let cancelled = false;
    (async () => {
      const newUsernames = {};
      await Promise.all(
        userIds.map(async (userId) => {
          try {
            const res = await axios.get(`http://localhost:5000/api/users/${userId}`);
            newUsernames[userId] = res.data.username || "-";
          } catch {
            newUsernames[userId] = "-";
          }
        })
      );
      if (!cancelled) setUsernames(newUsernames);
    })();
    return () => { cancelled = true; };
  }, [userIds]);

  // Fetch villa names
  useEffect(() => {
    if (villaIds.length === 0) return;
    let cancelled = false;
    (async () => {
      const newVillaNames = {};
      await Promise.all(
        villaIds.map(async (villaId) => {
          try {
            const res = await axios.get(`http://localhost:5000/api/villas/${villaId}`);
            newVillaNames[villaId] = res.data.villaName || "-";
          } catch {
            newVillaNames[villaId] = "-";
          }
        })
      );
      if (!cancelled) setVillaNames(newVillaNames);
    })();
    return () => { cancelled = true; };
  }, [villaIds]);

  // Handler to update order status
  const handleStatusUpdate = async (orderId, newStatus) => {
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
      await axios.put(
        `http://localhost:5000/api/food-orders/update-status/${orderId}`,
        { status: newStatus }
      );
      // Refresh orders after update
      if (companyId) {
        const res = await axios.get(
          `http://localhost:5000/api/food-orders/company/${companyId._id}`
        );
        const filtered = (res.data || []).filter(
          (order) =>
            (order.status === "Pending" || order.status === "Preparing")
        );
        setOrders(filtered);
      }
    } catch {
      // Optionally show error
    }
    setUpdatingStatus((prev) => ({ ...prev, [orderId]: false }));
    setConfirmModal({ isVisible: false, orderId: null, newStatus: "" });
  };

  // Helper to format timer (hh:mm:ss)
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

  // Dashboard stats
  const totalPending = filteredOrders.filter(order => order.status === "Pending").length;
  const totalPreparing = filteredOrders.filter(order => order.status === "Preparing").length;
  const totalOrders = filteredOrders.length;
  const totalAmount = filteredOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
  const totalTimerZero = filteredOrders.filter(order => getTimer(order.expectTime) === "00:00:00").length;

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {/* Dashboard Section */}
      <div className="flex flex-wrap justify-between gap-4 mb-6">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 rounded-lg p-4 min-w-[180px]">
          <div className="text-lg font-bold text-yellow-700">{totalPending}</div>
          <div className="text-sm text-yellow-800">Pending Orders</div>
        </div>
        <div className="bg-blue-100 border-l-4 border-blue-500 rounded-lg p-4 min-w-[180px]">
          <div className="text-lg font-bold text-blue-700">{totalPreparing}</div>
          <div className="text-sm text-blue-800">Preparing Orders</div>
        </div>
        <div className="bg-red-100 border-l-4 border-red-500 rounded-lg p-4 min-w-[180px]">
          <div className="text-lg font-bold text-red-700">{totalTimerZero}</div>
          <div className="text-sm text-red-800">Expired (00:00:00) Orders</div>
        </div>
        <div className="bg-gray-100 border-l-4 border-gray-500 rounded-lg p-4 min-w-[180px]">
          <div className="text-lg font-bold text-gray-700">{totalOrders}</div>
          <div className="text-sm text-gray-800">Total Ongoing Orders</div>
        </div>
        <div className="bg-green-100 border-l-4 border-green-500 rounded-lg p-4 min-w-[180px]">
          <div className="text-lg font-bold text-green-700">{totalAmount} LKR</div>
          <div className="text-sm text-green-800">Total Amount</div>
        </div>
        
      </div>
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
        <div>No ongoing orders found.</div>
      ) : (
        <div className="flex flex-col gap-2">
          {filteredOrders.map((order) => {
            const timer = getTimer(order.expectTime);
            const isTimerZero = timer === "00:00:00";
            return (
              <div
                key={order._id}
                className={`rounded-lg shadow-md p-4 mb-4 w-full overflow-hidden ${
                  isTimerZero ? "bg-red-100" : "bg-white"
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Status & Order ID */}
                  <span className="font-bold text-blue-700">
                    Order ID: {order.orderId}
                    {(order.status === "Pending" || order.status === "Preparing") && order.expectTime && (
                      <span className="ml-5 px-4 rounded bg-gray-200 text-blue-700 font-mono text-xs">
                        {timer}
                      </span>
                    )}
                  </span>
                  <div className="flex gap-2">
                    {statusOptions.map((status) => (
                      <button
                        key={status}
                        className={getStatusStyles(status, order.status === status)}
                        disabled={updatingStatus[order.orderId]}
                        onClick={() => handleStatusUpdate(order.orderId, status)}
                      >
                        {status}
                      </button>
                    ))}
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
            );
          })}
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

export default OngoingFoodOrders;