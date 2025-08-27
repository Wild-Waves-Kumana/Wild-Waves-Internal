import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const FoodProfile = () => {
  const { foodId } = useParams();
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImgIdx, setCurrentImgIdx] = useState(0);

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

  const handlePrev = () => {
    if (!food?.images?.length) return;
    setCurrentImgIdx((prev) =>
      prev === 0 ? food.images.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    if (!food?.images?.length) return;
    setCurrentImgIdx((prev) =>
      prev === food.images.length - 1 ? 0 : prev + 1
    );
  };

  if (loading) {
    return <div className="text-center py-10">Loading food details...</div>;
  }

  if (!food) {
    return (
      <div className="text-center py-10 text-red-500">
        Food not found.
        <div className="mt-4">
          <Link to="/foods" className="text-blue-600 underline">
            Back to Foods
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-10 bg-white shadow rounded p-6">
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Image Slider */}
        <div className="flex-shrink-0 flex flex-col items-center">
          <div className="relative">
            {food.images && food.images.length > 0 ? (
              <>
                <img
                  src={food.images[currentImgIdx]}
                  alt={food.name}
                  className="h-72 w-72 object-cover rounded shadow"
                />
                {food.images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrev}
                      className="absolute left-0 top-1/2 -translate-y-1/2 bg-gray-700 bg-opacity-60 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-90"
                      aria-label="Previous photo"
                      style={{ zIndex: 1 }}
                    >
                      &#8592;
                    </button>
                    <button
                      onClick={handleNext}
                      className="absolute right-0 top-1/2 -translate-y-1/2 bg-gray-700 bg-opacity-60 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-90"
                      aria-label="Next photo"
                      style={{ zIndex: 1 }}
                    >
                      &#8594;
                    </button>
                  </>
                )}
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
          <div className="mb-2 text-gray-600">
            {food.description || "No description."}
          </div>
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
              <span className="font-semibold">Portions:</span>
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
          <div className="mt-4">
            <Link
              to="/foods"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Back to Foods
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodProfile;
