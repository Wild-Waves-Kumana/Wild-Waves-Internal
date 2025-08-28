import React, { useState, useEffect } from "react";
import Modal from "../common/Modal";
import axios from "axios";

// Helper to get today's date in yyyy-mm-dd format
const getTodayDate = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

// Helper to get time string in HH:MM format
const getTimeString = (date) => {
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};

// Helper to get current time in HH:MM format
const getNowTime = () => {
  const now = new Date();
  return getTimeString(now);
};

const FoodOrderPlacementModal = ({
  isVisible,
  onClose,
  food,
  selectedPortion,
  quantity,
  userId,
  villaId,
  onOrderSuccess,
}) => {
  const [orderQuantity, setOrderQuantity] = useState(quantity || 1);
  const [orderPortion, setOrderPortion] = useState(
    selectedPortion || (food?.portions?.[0]?.name || "")
  );
  const [specialRequest, setSpecialRequest] = useState("");
  const [expectDate, setExpectDate] = useState(getTodayDate());
  const [expectTime, setExpectTime] = useState("");
  const [customTime, setCustomTime] = useState(false); // now false by default → quick select mode
  const [quickTimeType, setQuickTimeType] = useState("20min"); // default +20 mins
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!food) return null;

  // Get price and image for selected portion
  const portionObj =
    food.portions && food.portions.length > 0
      ? food.portions.find((p) => p.name === orderPortion)
      : null;
  const price = portionObj ? portionObj.price : food.price || 0;
  const image = food.images && food.images.length > 0 ? food.images[0] : "";

  // Default: preselect +20 mins when component mounts
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (!customTime && quickTimeType === "20min") {
      const now = new Date();
      now.setMinutes(now.getMinutes() + 20);
      setExpectDate(getTodayDate());
      setExpectTime(getTimeString(now));
    }
  }, [customTime, quickTimeType]);

  // Combine date and time into a JS Date object (or undefined)
  let expectDateTime;
  if (expectDate && expectTime) {
    expectDateTime = new Date(`${expectDate}T${expectTime}`);
  }

  // Quick time select handlers
  const handleQuickTime = (mins, type) => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + mins);
    setExpectDate(getTodayDate());
    setExpectTime(getTimeString(now));
    setCustomTime(false);
    setQuickTimeType(type);
  };
  const handleCustomTime = () => {
    setCustomTime(true);
    setExpectTime("");
    setQuickTimeType("");
  };

  const handleDateChange = (e) => {
    setExpectDate(e.target.value);
    setCustomTime(true);
    setQuickTimeType("");
    if (e.target.value === getTodayDate() && expectTime && expectTime < getNowTime()) {
      setExpectTime("");
      setError("You cannot select a past time for today.");
    } else {
      setError("");
    }
  };

  const handleTimeChange = (e) => {
    const selectedTime = e.target.value;
    if (expectDate === getTodayDate() && selectedTime < getNowTime()) {
      setExpectTime("");
      setError("You cannot select a past time for today.");
    } else {
      setExpectTime(selectedTime);
      setError("");
    }
    setCustomTime(true);
    setQuickTimeType("");
  };

  // Prevent selecting past times for today
  const minTime = expectDate === getTodayDate() ? getNowTime() : "00:00";

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

      const orderPayload = {
        userId,
        villaId,
        items: [
          {
            foodId: food._id,
            name: food.name,
            portion: portionObj ? portionObj.name : undefined,
            quantity: orderQuantity,
            price,
            image,
          },
        ],
        totalPrice: price * orderQuantity,
        expectTime: expectDateTime || undefined,
        specialRequest,
      };
      await axios.post("http://localhost:5000/api/food-orders/create", orderPayload);
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
        <div>
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
        </div>
        {food.portions && food.portions.length > 0 && (
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
                customTime
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"
              }`}
              onClick={handleCustomTime}
            >
              Custom
            </button>
          </div>

          {/* Show date/time only if customTime is true */}
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
        <div>
          <span className="font-semibold">Total:</span>{" "}
          <span className="text-lg font-bold">{price * orderQuantity} LKR</span>
        </div>
        {error && <div className="text-red-600">{error}</div>}
        {success && <div className="text-green-600">{success}</div>}
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
