import React, { useState, useEffect } from "react";
import Modal from "../common/Modal";
import axios from "axios";

// --- Helpers ---
const getTodayDate = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const getTimeString = (date) => {
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};

const getFutureTime = (minutes) => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + minutes);
  return getTimeString(now);
};

const getMinCustomTime = () => getFutureTime(20); // enforce +20 mins

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

const CartFoodOrderModal = ({
  isVisible,
  onClose,
  cart,
  onOrderSuccess,
}) => {
  const [specialRequest, setSpecialRequest] = useState("");
  const [expectDate, setExpectDate] = useState(getTodayDate());
  const [expectTime, setExpectTime] = useState("");
  const [customTime, setCustomTime] = useState(false);
  const [quickTimeType, setQuickTimeType] = useState("20min");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [villaId, setVillaId] = useState(null);

  // Get userId from token
  const userId = getUserIdFromToken();

  // Fetch villaId from user collection
  useEffect(() => {
    const fetchVillaId = async () => {
      if (!userId) return;
      try {
        const res = await axios.get(
          `api/users/${userId}`
        );
        setVillaId(res.data.villaId || null);
      } catch {
        setVillaId(null);
      }
    };
    fetchVillaId();
  }, [userId]);

  // Default quick select on mount
  useEffect(() => {
    if (!customTime && quickTimeType === "20min") {
      setExpectDate(getTodayDate());
      setExpectTime(getFutureTime(20));
    }
    if (!customTime && quickTimeType === "1hour") {
      setExpectDate(getTodayDate());
      setExpectTime(getFutureTime(60));
    }
    if (!customTime && quickTimeType === "2hour") {
      setExpectDate(getTodayDate());
      setExpectTime(getFutureTime(120));
    }
  }, [customTime, quickTimeType]);

  // Combine datetime
  let expectDateTime;
  if (expectDate && expectTime) {
    expectDateTime = new Date(`${expectDate}T${expectTime}`);
  }

  // --- Quick Select ---
  const handleQuickTime = (mins, type) => {
    setExpectDate(getTodayDate());
    setExpectTime(getFutureTime(mins));
    setCustomTime(false);
    setQuickTimeType(type);
    setError("");
  };

  const handleCustomTime = () => {
    setCustomTime(true);
    setExpectTime("");
    setQuickTimeType("");
    setError("");
  };

  // --- Date Change ---
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setExpectDate(newDate);
    setCustomTime(true);
    setQuickTimeType("");
    setError("");
  };

  // --- Time Change (with +20min validation) ---
  const handleTimeChange = (e) => {
    const selectedTime = e.target.value;
    const minAllowed = getMinCustomTime();

    if (expectDate === getTodayDate() && selectedTime < minAllowed) {
      setExpectTime("");
      setError("You must select a time at least 20 minutes from now.");
    } else {
      setExpectTime(selectedTime);
      setError("");
    }
    setCustomTime(true);
    setQuickTimeType("");
  };

  // --- Min time for input ---
  const minTime =
    expectDate === getTodayDate() ? getMinCustomTime() : "00:00";

  // --- Submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (
        expectDate &&
        expectTime &&
        new Date(`${expectDate}T${expectTime}`) < new Date()
      ) {
        setError("Cannot select a past date or time.");
        setLoading(false);
        return;
      }

      if (!userId || !villaId) {
        setError("User or villa information missing.");
        setLoading(false);
        return;
      }

      // Prepare items for order
      const items = cart.items.map(item => ({
        foodId: item.foodId?._id || item.foodId,
        foodCode: item.foodId?.foodCode || item.foodCode,
        name: item.foodId?.name || item.name,
        portion: item.portion,
        quantity: item.quantity,
        price: item.price,
      }));

      const orderPayload = {
        userId,
        villaId,
        items,
        totalPrice: cart.itemTotalPrice,
        expectTime: expectDateTime || undefined,
        specialRequest,
      };

      await axios.post(
        "api/food-orders/create",
        orderPayload
      );

      // Instantly update cartStatus to false
      await axios.put("api/food-cart/set-status", {
        userId,
        cartStatus: false,
      });

      setSuccess("Order placed successfully!");
      if (onOrderSuccess) onOrderSuccess();
      setTimeout(() => {
        setSuccess("");
        onClose();
      }, 1200);
    } catch (err) {
      console.error("Error placing order:", err);
      setError("Failed to place order.");
    }
    setLoading(false);
  };

  if (!cart || !cart.items || cart.items.length === 0) return null;

  return (
    <Modal isVisible={isVisible} onClose={onClose} width="max-w-lg w-full">
      <h2 className="text-xl font-bold mb-4">Place Order for Cart Items</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Cart Items List */}
        <div>
          <div className="font-semibold mb-2">Items:</div>
          <ul className="list-disc ml-6">
            {cart.items.map((item, idx) => (
              <li key={item.foodId?._id || item.foodId || idx}>
                {item.foodId?.name || item.name}{" "}
                {item.portion ? `(${item.portion})` : ""} x {item.quantity} - {item.price * item.quantity} LKR
              </li>
            ))}
          </ul>
        </div>

        {/* Expected Time */}
        <div>
          <label className="font-semibold mr-2">Expected Time:</label>
          <div className="flex gap-2 flex-wrap mb-2">
            <button
              type="button"
              className={`px-3 py-1 rounded border ${
                quickTimeType === "20min"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"
              }`}
              onClick={() => handleQuickTime(20, "20min")}
            >
              +20 mins
            </button>
            <button
              type="button"
              className={`px-3 py-1 rounded border ${
                quickTimeType === "1hour"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"
              }`}
              onClick={() => handleQuickTime(60, "1hour")}
            >
              +1 hour
            </button>
            <button
              type="button"
              className={`px-3 py-1 rounded border ${
                quickTimeType === "2hour"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"
              }`}
              onClick={() => handleQuickTime(120, "2hour")}
            >
              +2 hours
            </button>
            <button
              type="button"
              className={`px-3 py-1 rounded border ${
                customTime
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"
              }`}
              onClick={handleCustomTime}
            >
              Custom
            </button>
          </div>

          {/* Show only if custom selected */}
          {customTime && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={expectDate}
                onChange={handleDateChange}
                className="border rounded px-2 py-1"
                min={getTodayDate()}
              />
              <input
                type="time"
                value={expectTime}
                onChange={handleTimeChange}
                className="border rounded px-2 py-1"
                min={minTime}
              />
            </div>
          )}
        </div>

        {/* Special Request */}
        <div>
          <label className="font-semibold mr-2">Special Request:</label>
          <textarea
            value={specialRequest}
            onChange={(e) => setSpecialRequest(e.target.value)}
            className="border rounded px-2 py-1 w-full"
            rows={2}
            placeholder="Any special instructions?"
          />
        </div>

        {/* Total */}
        <div>
          <span className="font-semibold">Total:</span>{" "}
          <span className="text-lg font-bold">{cart.itemTotalPrice} LKR</span>
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
            {loading ? "Placing..." : "Place Order"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CartFoodOrderModal;