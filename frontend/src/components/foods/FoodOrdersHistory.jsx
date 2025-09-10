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
      render: (val) => val ? usernames[val] || "-" : "-",
    },
    {
      key: "villaId",
      header: "Villa",
      sortable: true,
      render: (val) => val ? villaNames[val] || "-" : "-",
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

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Food Orders History</h2>
      <ReusableTable
        columns={columns}
        data={sortedOrders}
        dateSearch={true} // Enable date search
        dateSearchKey="orderedAt" // Or "expectTime" or any date column key
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