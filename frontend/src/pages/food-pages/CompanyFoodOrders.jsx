import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const CompanyFoodOrders = () => {
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

  // Fetch villa names for all villaIds in orders (reference from VillaProfile)
  useEffect(() => {
    const fetchAllVillaNames = async () => {
      const ids = orders.map((order) => order.villaId).filter(Boolean);
      const uniqueIds = [...new Set(ids)];
      const newVillaNames = {};
      await Promise.all(
        uniqueIds.map(async (villaId) => {
          try {
            const res = await axios.get(`http://localhost:5000/api/villa/${villaId}`);
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

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Company Food Orders</h2>
      {orders.length === 0 ? (
        <div>No orders found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded shadow p-4 flex flex-col mb-4"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-blue-700">Order ID: {order.orderId}</span>
                <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                  {order.status}
                </span>
              </div>
              <div className="mb-1">
                <span className="font-semibold">User:</span>{" "}
                {order.userId ? usernames[order.userId] || "-" : "-"}
              </div>
              <div className="mb-1">
                <span className="font-semibold">Villa:</span>{" "}
                {order.villaId ? villaNames[order.villaId] || "-" : "-"}
              </div>
              <div className="mb-1">
                <span className="font-semibold">Total:</span>{" "}
                {order.totalPrice} LKR
              </div>
              <div className="mb-2">
                <span className="font-semibold">Items:</span>
                <ul className="list-disc ml-6 mt-1">
                  {order.items.map((item, idx) => (
                    <li key={idx}>
                      {item.foodId?.name || item.name} [{item.foodCode}] × {item.quantity}
                    </li>
                  ))}
                </ul>
              </div>
              {order.specialRequest && (
                <div className="mt-2 text-sm text-gray-600">
                  <span className="font-semibold">Special Request:</span> {order.specialRequest}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompanyFoodOrders;
