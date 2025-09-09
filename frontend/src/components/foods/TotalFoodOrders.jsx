import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Modal from "../common/Modal";

const statusOptions = ["Pending", "Preparing", "Delivered", "Cancelled"];

const CompanyFoodOrder = () => {
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
      .then((res) => setOrders(res.data))
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
        setOrders(res.data);
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
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Company Food Orders</h2>
      {orders.length === 0 ? (
        <div>No orders found.</div>
      ) : (
        <div className="flex flex-col gap-6">
          {orders.map((order) => (
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
                    {order.userId ? usernames[order.userId] || "-" : "-"}
                  </div>
                  <div className="mb-1">
                    <span className="font-semibold">Villa:</span>{" "}
                    {order.villaId ? villaNames[order.villaId] || "-" : "-"}
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
                  <table className="w-full mt-2 border">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="py-1 px-2 text-left text-xs">Code</th>
                        <th className="py-1 px-2 text-left text-xs">Name</th>
                        <th className="py-1 px-2 text-right text-xs">Quantity</th>
                        <th className="py-1 px-2 text-right text-xs">Price</th>
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

export default CompanyFoodOrder;