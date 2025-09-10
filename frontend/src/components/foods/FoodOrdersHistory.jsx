import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import ReusableTable from "../common/ReusableTable";

const FoodOrdersHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState("");
  const [usernames, setUsernames] = useState({});
  const [villaNames, setVillaNames] = useState({});

  // Get adminId from token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const decoded = jwtDecode(token);
      const adminId = decoded.adminId || decoded._id || decoded.id;
      if (!adminId) return;

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
        // Show all orders for the company
        setOrders(res.data || []);
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

  // Table columns
  const columns = [
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
      key: "userId",
      header: "User",
      sortable: true,
      render: (val) =>
        val && usernames[val] ? (
          <a
            href={`/user-profile/${val}`}
            className="text-blue-600 hover:text-blue-800"
            target="_blank"
            rel="noopener noreferrer"
          >
            {usernames[val]}
          </a>
        ) : (
          "-"
        ),
    },
    {
      key: "villaId",
      header: "Villa",
      sortable: true,
      render: (val) =>
        val && villaNames[val] ? (
          <a
            href={`/villa-profile/${val}`}
            className="text-blue-600 hover:text-blue-800"
            target="_blank"
            rel="noopener noreferrer"
          >
            {villaNames[val]}
          </a>
        ) : (
          "-"
        ),          
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
      <ReusableTable
        columns={columns}
        data={sortedOrders}
        dateSearch={true}
        dateSearchKey="orderedAt"
        searchable={true}
        sortable={true}
        pagination={true}
        pageSize={10}
        striped={true}
        hover={true}
        loading={loading}
        emptyMessage="No history orders found."
      />
    </div>
  );
};

export default FoodOrdersHistory;