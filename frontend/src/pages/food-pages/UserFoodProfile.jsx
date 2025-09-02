import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CreateFoodOrderModal from "../../components/modals/CreateFoodOrderModal";
import AddFoodtoCartModal from "../../components/modals/AddFoodtoCartModal"; // <-- import the modal
import axios from "axios";

const UserFoodProfile = () => {
  const { foodId } = useParams();
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [cartModalOpen, setCartModalOpen] = useState(false); // <-- state for cart modal

  // Replace with actual user and villa IDs from your auth context or state management
  const userId = "loggedInUserId"; // TODO: Get logged-in user ID
  const villaId = "userVillaId"; // TODO: Get user's villa ID

  useEffect(() => {
    const fetchFood = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/foods/${foodId}`
        );
        setFood(res.data);
        setCurrentImgIdx(0);
      } catch (err) {
        console.error("Error fetching food:", err);
        setFood(null);
      }
      setLoading(false);
    };
    fetchFood();
  }, [foodId]);

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

  return (
    <div className="mx-auto mt-10 bg-white shadow rounded p-6">
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Images with slider and thumbnails */}
        <div className="flex-shrink-0 flex flex-col items-center">
          <div className="relative">
            {food.images && food.images.length > 0 ? (
              <img
                src={food.images[currentImgIdx]}
                alt={food.name}
                className="h-72 w-72 object-cover rounded shadow"
              />
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
          {/* Add foodCode below the name */}
          <div className="mb-1 text-xs text-gray-500 font-mono">
            {food.foodCode ? `Code: ${food.foodCode}` : ""}
          </div>
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
              <span className="font-semibold">Portions & Prices:</span>
              <ul className="list-disc ml-6 mt-1">
                {food.portions.map((portion) => (
                  <li key={portion.name}>
                    <span className="font-medium">{portion.name}:</span>{" "}
                    <span>
                      {portion.price != null ? `${portion.price} LKR` : "N/A"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="mb-2">
              <span className="font-semibold">Price:</span>{" "}
              {food.price != null ? `${food.price} LKR` : "N/A"}
            </div>
          )}
          <div className="flex gap-3 mt-4">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              disabled={!food.isAvailable}
              onClick={() => setOrderModalOpen(true)}
            >
              {food.isAvailable ? "Place Order" : "Not Available"}
            </button>
            <button
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              disabled={!food.isAvailable}
              onClick={() => setCartModalOpen(true)}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
      <CreateFoodOrderModal
        isVisible={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        food={food}
        userId={userId}
        villaId={villaId}
        onOrderSuccess={() => {}}
      />
      <AddFoodtoCartModal
        isVisible={cartModalOpen}
        onClose={() => setCartModalOpen(false)}
        food={food}
        onCartSuccess={() => {}}
      />
    </div>
  );
};

export default UserFoodProfile;
