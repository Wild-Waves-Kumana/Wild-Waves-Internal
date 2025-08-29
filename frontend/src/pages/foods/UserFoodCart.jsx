import React, { useEffect, useState } from "react";
import axios from "axios";

// Helper to get userId from JWT token
const getUserIdFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.userId || payload.id || null;
  } catch {
    return null;
  }
};

const UserFoodCart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const userId = getUserIdFromToken();

  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      setError("");
      try {
        if (!userId) {
          setError("User not logged in.");
          setLoading(false);
          return;
        }
        const res = await axios.get(
          `http://localhost:5000/api/food-cart/items/${userId}`
        );
        setCart(res.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to fetch cart."
        );
        setCart(null);
      }
      setLoading(false);
    };
    fetchCart();
  }, [userId]);

  return (
    <div className="max-w-2xl mx-auto mt-8 bg-white shadow rounded p-6">
      <h2 className="text-2xl font-bold mb-4">Your Food Cart</h2>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {!loading && !error && cart && cart.items && cart.items.length > 0 && (
        <>
          <div className="mb-4">
            <span className="font-semibold">User:</span>{" "}
            {cart.user?.username || cart.user?.email || "N/A"}
          </div>
          <table className="w-full mb-4 border">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-2 text-left">Food</th>
                <th className="py-2 px-2 text-left">Portion</th>
                <th className="py-2 px-2 text-right">Price</th>
                <th className="py-2 px-2 text-right">Qty</th>
                <th className="py-2 px-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {cart.items.map((item, idx) => (
                <tr key={item.foodId?._id || item.foodId || idx}>
                  <td className="py-2 px-2">
                    {item.foodId?.name || item.name}
                  </td>
                  <td className="py-2 px-2">{item.portion || "-"}</td>
                  <td className="py-2 px-2 text-right">
                    {item.price} LKR
                  </td>
                  <td className="py-2 px-2 text-right">
                    {item.quantity}
                  </td>
                  <td className="py-2 px-2 text-right">
                    {item.price * item.quantity} LKR
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-right font-bold text-lg">
            Total: {cart.itemTotalPrice} LKR
          </div>
        </>
      )}
      {!loading && !error && (!cart || !cart.items || cart.items.length === 0) && (
        <div className="text-gray-500">Your cart is empty.</div>
      )}
    </div>
  );
};

export default UserFoodCart;
