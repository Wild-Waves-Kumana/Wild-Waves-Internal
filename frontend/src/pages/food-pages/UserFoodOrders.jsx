import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const UserFoodOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get userId from JWT token
  const getUserIdFromToken = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return decoded.userId || decoded._id || decoded.id;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError("");
      const userId = getUserIdFromToken();
      if (!userId) {
        setError("User not logged in.");
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(
          `http://localhost:5000/api/food-orders/user/${userId}`
        );
        setOrders(res.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch orders.");
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  return (
    <div className="mx-auto mt-8 bg-white shadow rounded p-6">
      <h2 className="text-2xl font-bold mb-4">Your Food Orders</h2>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {!loading && !error && orders.length === 0 && (
        <div className="text-gray-500 text-center py-8">No orders found.</div>
      )}
      {!loading && !error && orders.length > 0 && (
        <table className="w-full border mb-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-2 text-left">Order ID</th>
              <th className="py-2 px-2 text-left">Ordered At</th>
              <th className="py-2 px-2 text-left">Status</th>
              <th className="py-2 px-2 text-left">Total</th>
              <th className="py-2 px-2 text-left">Items</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id}>
                <td className="py-2 px-2">{order.orderId}</td>
                <td className="py-2 px-2">
                  {order.orderedAt
                    ? new Date(order.orderedAt).toLocaleString()
                    : "-"}
                </td>
                <td className="py-2 px-2">{order.status}</td>
                <td className="py-2 px-2">{order.totalPrice} LKR</td>
                <td className="py-2 px-2">
                  <ul className="list-disc ml-4">
                    {order.items.map((item, idx) => (
                      <li key={idx}>
                        {item.name} ({item.portion || "Standard"}) × {item.quantity}
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserFoodOrders;