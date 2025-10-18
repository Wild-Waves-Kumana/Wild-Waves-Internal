import React, { useEffect, useState } from "react";
import axios from "axios";
import SAdminFoodOrdersTableView from "../../components/foods/SAdminFoodOrdersTableView";
import SAdminFoodOrdersCardView from "../../components/foods/SAdminFoodOrdersCardView";

const SuperadminFoodOrdersHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usernames, setUsernames] = useState({});
  const [villaNames, setVillaNames] = useState({});
  const [viewMode, setViewMode] = useState("table"); // "table" or "card"
  const [updatingStatus, setUpdatingStatus] = useState({});

  // Fetch all orders for superadmin
  useEffect(() => {
    setLoading(true);
    axios
      .get(`/api/food-orders/all`)
      .then((res) => {
        setOrders(res.data || []);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  // Fetch usernames for all userIds in orders
  useEffect(() => {
    const fetchAllUsernames = async () => {
      const ids = orders.map((order) => order.userId).filter(Boolean);
      const uniqueIds = [...new Set(ids)];
      const newUsernames = {};
      await Promise.all(
        uniqueIds.map(async (userId) => {
          try {
            const res = await axios.get(`/api/users/${userId}`);
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
            const res = await axios.get(`/api/villas/${villaId}`);
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

  // Sort orders by orderId descending by default
  const sortedOrders = [...orders].sort((a, b) => {
    if (a.orderId < b.orderId) return 1;
    if (a.orderId > b.orderId) return -1;
    return 0;
  });

  // Dashboard stats for history
  const totalDelivered = sortedOrders.filter(order => order.status === "Delivered").length;
  const totalCancelled = sortedOrders.filter(order => order.status === "Cancelled").length;
  const totalUserCancelled = sortedOrders.filter(order => order.status === "Cancelled by User").length;
  const totalHistoryOrders = sortedOrders.length;
  const totalHistoryAmount = sortedOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

  return (
    <div>
      {/* Dashboard Section */}
      <div className="flex flex-wrap justify-between gap-4 mb-6">
        <div className="bg-green-100 border-l-4 border-green-500 rounded-lg p-4 min-w-[180px]">
          <div className="text-lg font-bold text-green-700">{totalDelivered}</div>
          <div className="text-sm text-green-800">Delivered Orders</div>
        </div>
        <div className="bg-red-100 border-l-4 border-red-500 rounded-lg p-4 min-w-[180px]">
          <div className="text-lg font-bold text-red-700">{totalCancelled}</div>
          <div className="text-sm text-red-800">Cancelled Orders</div>
        </div>
        <div className="bg-yellow-100 border-l-4 border-yellow-500 rounded-lg p-4 min-w-[180px]">
          <div className="text-lg font-bold text-yellow-700">{totalUserCancelled}</div>
          <div className="text-sm text-yellow-800">User Cancelled Orders</div>
        </div>
        <div className="bg-gray-100 border-l-4 border-gray-500 rounded-lg p-4 min-w-[180px]">
          <div className="text-lg font-bold text-gray-700">{totalHistoryOrders}</div>
          <div className="text-sm text-gray-800">Total Orders</div>
        </div>
        <div className="bg-blue-100 border-l-4 border-blue-500 rounded-lg p-4 min-w-[180px]">
          <div className="text-lg font-bold text-blue-700">{totalHistoryAmount} LKR</div>
          <div className="text-sm text-blue-800">Total Amount</div>
        </div>
      </div>

      
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Food Orders</h2>

          <div className="flex items-center gap-2">
            <button
          onClick={() => setViewMode("table")}
          className={`px-6 py-2 rounded-full font-semibold shadow transition-all duration-150 ${
            viewMode === "table"
              ? "bg-blue-500 text-white shadow"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
            >
          Table View
            </button>
            <button
          onClick={() => setViewMode("card")}
          className={`px-6 py-2 rounded-full font-semibold shadow transition-all duration-150 ${
            viewMode === "card"
              ? "bg-blue-500 text-white shadow"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
            >
          Card View
            </button>
          </div>
        </div>

      {/* Conditional Rendering based on view mode */}
      {viewMode === "table" ? (
        <SAdminFoodOrdersTableView
          orders={sortedOrders}
          loading={loading}
          usernames={usernames}
          villaNames={villaNames}
        />
      ) : (
        <SAdminFoodOrdersCardView
          orders={sortedOrders}
          loading={loading}
          usernames={usernames}
          villaNames={villaNames}
          updatingStatus={updatingStatus}
          setUpdatingStatus={setUpdatingStatus}
          setOrders={setOrders}
        />
      )}
    </div>
  );
};

export default SuperadminFoodOrdersHistory;