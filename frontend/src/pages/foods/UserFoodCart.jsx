import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import CartFoodOrderModal from "../../components/modals/CartFoodOrderModal"; // <-- import the modal

const UserFoodCart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [orderModalOpen, setOrderModalOpen] = useState(false); // <-- modal state

  // Fetch cart items
  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      if (!token) return setLoading(false);
      let userId;
      try {
        const decoded = jwtDecode(token);
        userId = decoded.id;
      } catch {
        setLoading(false);
        return;
      }
      try {
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
  }, [updating]);

  // Handle quantity or portion change
  const handleCartEdit = async (item, newQuantity, newPortion, newPrice) => {
    if (newQuantity < 1) return;
    setUpdating(true);
    const token = localStorage.getItem("token");
    if (!token) return setUpdating(false);
    let userId;
    try {
      const decoded = jwtDecode(token);
      userId = decoded.id;
    } catch {
      setUpdating(false);
      return;
    }
    try {
      await axios.put("http://localhost:5000/api/food-cart/edit-cart", {
        userId,
        foodId: item.foodId?._id || item.foodId,
        oldPortion: item.portion,
        oldPrice: item.price,
        quantity: newQuantity,
        newPortion: newPortion ?? item.portion,
        newPrice: newPrice ?? item.price,
      });
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to update cart. Please try again."
      );
    }
    setUpdating(false);
  };

  // Handle remove item
  const handleRemoveItem = async (item) => {
    setUpdating(true);
    const token = localStorage.getItem("token");
    if (!token) return setUpdating(false);
    let userId;
    try {
      const decoded = jwtDecode(token);
      userId = decoded.id;
    } catch {
      setUpdating(false);
      return;
    }
    try {
      await axios.put("http://localhost:5000/api/food-cart/edit-cart", {
        userId,
        foodId: item.foodId?._id || item.foodId,
        oldPortion: item.portion,
        oldPrice: item.price,
        quantity: 0,
      });
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to remove item. Please try again."
      );
    }
    setUpdating(false);
  };

  return (
    <div className="mx-auto mt-8 bg-white shadow rounded p-6">
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
                <th className="py-2 px-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cart.items.map((item, idx) => (
                <tr key={item.foodId?._id || item.foodId || idx}>
                  <td className="py-2 px-2">
                    {item.foodId?.name || item.name}
                  </td>
                  <td className="py-2 px-2">
                    {/* Portion as selectable buttons if multiple portions */}
                    {item.foodId?.portions && item.foodId.portions.length > 0 ? (
                      <div className="flex gap-1">
                        {item.foodId.portions.map(portion => (
                          <button
                            key={portion.name}
                            type="button"
                            disabled={updating || item.portion === portion.name}
                            className={`px-2 py-1 rounded border text-xs ${
                              item.portion === portion.name
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"
                            }`}
                            onClick={() => {
                              if (item.portion !== portion.name) {
                                handleCartEdit(
                                  item,
                                  item.quantity,
                                  portion.name,
                                  portion.price
                                );
                              }
                            }}
                          >
                            {portion.name} - {portion.price} LKR
                          </button>
                        ))}
                      </div>
                    ) : (
                      item.portion || "-"
                    )}
                  </td>
                  <td className="py-2 px-2 text-right">
                    {item.price} LKR
                  </td>
                  <td className="py-2 px-2 text-right">
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      disabled={updating}
                      onChange={e =>
                        handleCartEdit(
                          item,
                          Number(e.target.value),
                          undefined,
                          undefined
                        )
                      }
                      className="w-16 border rounded px-1 py-0.5 text-right"
                    />
                  </td>
                  <td className="py-2 px-2 text-right">
                    {item.price * item.quantity} LKR
                  </td>
                  <td className="py-2 px-2 text-center">
                    <button
                      className="text-red-600 hover:underline"
                      disabled={updating}
                      onClick={() => handleRemoveItem(item)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-right font-bold text-lg">
            Total: {cart.itemTotalPrice} LKR
          </div>
          <div className="flex justify-end mt-4">
            <button
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
              disabled={updating}
              onClick={() => setOrderModalOpen(true)}
            >
              Order Foods
            </button>
          </div>
          <CartFoodOrderModal
            isVisible={orderModalOpen}
            onClose={() => setOrderModalOpen(false)}
            cart={cart}
            onOrderSuccess={() => {
              setOrderModalOpen(false);
              setUpdating(u => !u); // Refresh cart after order
            }}
          />
        </>
      )}
      {!loading && !error && (!cart || !cart.items || cart.items.length === 0) && (
        <div className="text-gray-500">Your cart is empty.</div>
      )}
    </div>
  );
};

export default UserFoodCart;
