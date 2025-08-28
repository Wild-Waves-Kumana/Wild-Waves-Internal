import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const UserFoodProfile = () => {
  const { foodId } = useParams();
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPortion, setSelectedPortion] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [currentImgIdx, setCurrentImgIdx] = useState(0);

  useEffect(() => {
    const fetchFood = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/foods/${foodId}`
        );
        setFood(res.data);
        if (res.data.portions && res.data.portions.length > 0) {
          setSelectedPortion(res.data.portions[0].name);
        }
        setCurrentImgIdx(0);
      } catch (err) {
        console.error("Error fetching food:", err);
        setFood(null);
      }
      setLoading(false);
    };
    fetchFood();
  }, [foodId]);

  const handleOrder = () => {
    // Implement order logic here (e.g., call order API or show a modal)
    alert(
      `Order placed!\nFood: ${food.name}\nPortion: ${
        selectedPortion || "Default"
      }\nQuantity: ${quantity}\nTotal: ${
        food.portions && food.portions.length > 0
          ? (food.portions.find((p) => p.name === selectedPortion)?.price || 0) *
            quantity
          : (food.price || 0) * quantity
      } LKR`
    );
  };

  if (loading) {
    return <div className="text-center py-10">Loading food details...</div>;
  }

  if (!food) {
    return (
      <div className="text-center py-10 text-red-500">
        Food not found.
      </div>
    );
  }

  const price =
    food.portions && food.portions.length > 0
      ? food.portions.find((p) => p.name === selectedPortion)?.price || 0
      : food.price || 0;

  return (
    <div className="mx-auto mt-10 bg-white shadow rounded p-6">
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Images with slider and thumbnails */}
        <div className="flex-shrink-0 flex flex-col items-center">
          <div className="relative">
            {food.images && food.images.length > 0 ? (
              <>
                <img
                  src={food.images[currentImgIdx]}
                  alt={food.name}
                  className="h-72 w-72 object-cover rounded shadow"
                />
              </>
            ) : (
              <div className="h-72 w-72 bg-gray-200 flex items-center justify-center rounded text-gray-400">
                No Image
              </div>
            )}
          </div>
          {/* Thumbnails */}
          {food.images && food.images.length > 1 && (
            <div className="flex gap-2 mt-2 flex-wrap justify-center">
              {food.images.map((img, idx) => (
                <img
                  key={img}
                  src={img}
                  alt={`Food ${idx + 1}`}
                  className={`h-12 w-12 object-cover rounded border cursor-pointer ${
                    idx === currentImgIdx
                      ? "border-blue-500 ring-2 ring-blue-400"
                      : "border-gray-300"
                  }`}
                  onClick={() => setCurrentImgIdx(idx)}
                />
              ))}
            </div>
          )}
        </div>
        {/* Details */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-2">{food.name}</h2>
          <div className="mb-2 text-gray-600">{food.description || "No description."}</div>
          <div className="mb-2">
            <span className="font-semibold">Category:</span>{" "}
            <span>{food.category}</span>
          </div>
          <div className="mb-2">
            <span className="font-semibold">Available On:</span>{" "}
            {food.availableOn && food.availableOn.length > 0
              ? food.availableOn.join(", ")
              : "Not specified"}
          </div>
          <div className="mb-2">
            <span className="font-semibold">Availability:</span>{" "}
            <span
              className={
                food.isAvailable
                  ? "text-green-700 font-semibold"
                  : "text-red-700 font-semibold"
              }
            >
              {food.isAvailable ? "Available" : "Not Available"}
            </span>
          </div>
          {/* Portions or Price */}
          {food.portions && food.portions.length > 0 ? (
            <div className="mb-2">
              <span className="font-semibold">Select Portion:</span>
              <select
                className="ml-2 border rounded px-2 py-1"
                value={selectedPortion}
                onChange={(e) => setSelectedPortion(e.target.value)}
              >
                {food.portions.map((portion) => (
                  <option key={portion.name} value={portion.name}>
                    {portion.name} - {portion.price} LKR
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="mb-2">
              <span className="font-semibold">Price:</span>{" "}
              {food.price != null ? `${food.price} LKR` : "N/A"}
            </div>
          )}
          <div className="mb-2 flex items-center">
            <span className="font-semibold mr-2">Quantity:</span>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="border rounded px-2 py-1 w-20"
            />
          </div>
          <div className="mb-4">
            <span className="font-semibold">Total:</span>{" "}
            <span className="text-lg font-bold">{price * quantity} LKR</span>
          </div>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={!food.isAvailable}
            onClick={handleOrder}
          >
            {food.isAvailable ? "Place Order" : "Not Available"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserFoodProfile;
