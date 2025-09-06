import React, { useEffect, useState } from "react";
import axios from "axios";

const CompanyFoodOrders = ({ companyId }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!companyId) return;
    setLoading(true);
    axios
      .get(`http://localhost:5000/api/food-orders/all/${companyId}`)
      .then((res) => setOrders(res.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [companyId]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Company Food Orders</h2>
      {orders.length === 0 ? (
        <div>No orders found.</div>
      ) : (
        <table className="w-full border">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>User</th>
              <th>Villa</th>
              <th>Status</th>
              <th>Total</th>
              <th>Items</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order.orderId}</td>
                <td>{order.userId?.name || "-"}</td>
                <td>{order.villaId?.name || "-"}</td>
                <td>{order.status}</td>
                <td>{order.totalPrice} LKR</td>
                <td>
                  <ul>
                    {order.items.map((item, idx) => (
                      <li key={idx}>
                        {item.foodId?.name || item.name} [{item.foodCode}] ×{" "}
                        {item.quantity}
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

export default CompanyFoodOrders;
