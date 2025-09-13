import React, { useState, useMemo } from "react";
import Modal from "../common/Modal";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

export default function AddFoodtoCartModal({
  isVisible,
  onClose,
  food,
  selectedPortion,
  quantity,
  onCartSuccess,
}) {
  const [orderQuantity, setOrderQuantity] = useState(quantity || 1);
  const [orderPortion, setOrderPortion] = useState(
    selectedPortion || (food?.portions?.[0]?.name || "")
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Get user id from the JWT token
  const token = localStorage.getItem("token");
  const userId = useMemo(() => {
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return decoded.id;
    } catch {
      return null;
    }
  }, [token]);

  if (!food) return null;

  // Portion + price
  const portionObj =
    food.portions?.find((p) => p.name === orderPortion) || null;
  const price = portionObj ? portionObj.price : food.price || 0;

  // Add to cart handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!userId) {
      setError("User not logged in.");
      setLoading(false);
      return;
    }

    try {
      const cartPayload = {
        userId,
        items: [
          {
            foodId: food._id,
            foodCode: food.foodCode,
            name: food.name,
            portion: portionObj?.name,
            quantity: orderQuantity,
            price,
          },
        ],
      };

      await axios.post(
        "http://localhost:5000/api/food-cart/add",
        cartPayload
      );

      setSuccess("Added to cart!");
      if (onCartSuccess) onCartSuccess();
      setTimeout(() => {
        setSuccess("");
        onClose();
      }, 1000);
    } catch (err) {
      console.error("Failed to add to cart:", err);
      setError("Failed to add to cart.");
    }
    setLoading(false);
  };

  return (
    <Modal isVisible={isVisible} onClose={onClose} width="max-w-md w-full">
      <h2 className="text-xl font-bold mb-4">Add Food to Cart</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Food Info */}
        <div>
          <div className="font-semibold text-lg">{food.name}</div>
          <div className="text-gray-500">{food.category}</div>
        </div>

        {/* Portions */}
        {food.portions?.length > 0 && (
          <div>
            <label className="font-semibold mr-2">Portion:</label>
            <div className="flex gap-2 mt-2">
              {food.portions.map((portion) => (
                <button
                  key={portion.name}
                  type="button"
                  className={`px-4 py-2 rounded border ${
                    orderPortion === portion.name
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"
                  }`}
                  onClick={() => setOrderPortion(portion.name)}
                >
                  {portion.name} - {portion.price} LKR
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Price (if no portions) */}
        {(!food.portions || food.portions.length === 0) && (
          <div>
            <span className="font-semibold">Price:</span>{" "}
            {food.price != null ? `${food.price} LKR` : "N/A"}
          </div>
        )}

        {/* Quantity */}
        <div>
          <label className="font-semibold mr-2">Quantity:</label>
          <input
            type="number"
            min={1}
            value={orderQuantity}
            onChange={(e) => setOrderQuantity(Number(e.target.value))}
            className="border rounded px-2 py-1 w-24"
            required
          />
        </div>

        {/* Total */}
        <div>
          <span className="font-semibold">Total:</span>{" "}
          <span className="text-lg font-bold">{price * orderQuantity} LKR</span>
        </div>

        {/* Error/Success */}
        {error && <div className="text-red-600">{error}</div>}
        {success && <div className="text-green-600">{success}</div>}

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
