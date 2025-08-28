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
  // Example: JWT in localStorage under "token"
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.userId || payload.id || null;
  } catch {
    return null;
  }
};

const FoodOrderPlacementModal = ({
  isVisible,
  onClose,
  food,
  selectedPortion,
  quantity,
  onOrderSuccess,
}) => {
  const [orderQuantity, setOrderQuantity] = useState(quantity || 1);
  const [orderPortion, setOrderPortion] = useState(
    selectedPortion || (food?.portions?.[0]?.name || "")
  );
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
          `http://localhost:5000/api/users/${userId}`
        );
        setVillaId(res.data.villaId || null);
      } catch {
        setVillaId(null);
      }
    };
    fetchVillaId();
  }, [userId]);

  if (!food) return null;

  // Portion + price
  const portionObj =
    food.portions?.find((p) => p.name === orderPortion) || null;
  const price = portionObj ? portionObj.price : food.price || 0;
  const image = food.images?.[0] || "";

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

      const orderPayload = {
        userId,
        villaId,
        items: [
          {
            foodId: food._id,
            name: food.name,
            portion: portionObj?.name,
            quantity: orderQuantity,
            price,
            // image, // <-- REMOVE this line so image is not sent to DB
          },
        ],
        totalPrice: price * orderQuantity,
        expectTime: expectDateTime || undefined,
        specialRequest,
      };

      await axios.post(
        "http://localhost:5000/api/food-orders/create",
        orderPayload
      );

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

  return (
    <Modal isVisible={isVisible} onClose={onClose} width="max-w-lg w-full">
      <h2 className="text-xl font-bold mb-4">Place Food Order</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Food Info */}
        <div className="flex gap-4 items-center">
          {image && (
            <img
              src={image}
              alt={food.name}
              className="h-20 w-20 object-cover rounded"
            />
          )}
          <div>
            <div className="font-semibold text-lg">{food.name}</div>
            <div className="text-gray-500">{food.category}</div>
          </div>
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
            {loading ? "Placing..." : "Place Order"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default FoodOrderPlacementModal;
