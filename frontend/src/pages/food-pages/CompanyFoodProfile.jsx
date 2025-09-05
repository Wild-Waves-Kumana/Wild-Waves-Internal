import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import EditFoodModal from "../../components/modals/EditFoodModal";

const CompanyFoodProfile = () => {
  const { foodId } = useParams();
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const navigate = useNavigate();

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


  const handleEdit = () => setEditModalOpen(true);

  const handleEditSave = async (updatedFood) => {
    await axios.put(`http://localhost:5000/api/foods/${foodId}`, updatedFood);
    setFood({ ...food, ...updatedFood }); // Update local state with new data
    setEditModalOpen(false);
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this food item? This action cannot be undone."
      )
    ) {
      try {
        await axios.delete(`http://localhost:5000/api/foods/${foodId}`);
        navigate("/foods");
      } catch (err) {
        console.error("Error deleting food:", err);
        alert("Failed to delete food item.");
      }
    }
  };

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/foods");
    }
  };

  // Handle availability dropdown change
  const handleAvailabilityChange = async (e) => {
    const newAvailability = e.target.value === "Available";
    setAvailabilityLoading(true);
    try {
      await axios.put(`http://localhost:5000/api/foods/${foodId}`, {
        ...food,
        isAvailable: newAvailability,
      });
      setFood((prev) => ({ ...prev, isAvailable: newAvailability }));
    } catch (err) {
      console.error("Error updating availability:", err);
      alert("Failed to update availability.");
    }
    setAvailabilityLoading(false);
  };

  if (loading) {
    return <div className="text-center py-10">Loading food details...</div>;
  }

  if (!food) {
    return (
      <div className="text-center py-10 text-red-500">
        Food not found.
        <div className="mt-4">
          <button
            onClick={handleBack}
            className="text-blue-600 underline"
          >
            Back to Foods
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className=" mx-auto  bg-white shadow rounded p-6">
      <div className="grid grid-cols-5 gap-6 items-start">
        {/* 2 columns: Image Slider */}
        <div className="col-span-2 flex flex-col items-center">
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
        {/* 2 columns: Details */}
        <div className="col-span-2">
          <h2 className="text-2xl font-bold mb-2">{food.name}</h2>
          {/* Add foodCode below the name */}
          {food.foodCode && (
            <div className="mb-2 text-xs text-gray-500 font-mono">
              Code: {food.foodCode}
            </div>
          )}
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
          <div className="mb-2 flex items-center gap-2">
            <span className="font-semibold">Availability:</span>
            <select
              value={food.isAvailable ? "Available" : "Not Available"}
              onChange={handleAvailabilityChange}
              disabled={availabilityLoading}
              className="border rounded px-2 py-1"
            >
              <option value="Available">Available</option>
              <option value="Not Available">Not Available</option>
            </select>
            {availabilityLoading && (
              <span className="text-xs text-gray-500 ml-2">Saving...</span>
            )}
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
        </div>
        {/* 1 column: Edit/Delete Buttons */}
        <div className="col-span-1 flex flex-col items-end gap-2">
          <button
            onClick={handleEdit}
            className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded shadow w-full"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow w-full"
          >
            Delete
          </button>
          <button
            onClick={handleBack}
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
          >
            Back to Foods
          </button>
        </div>
      </div>
      <EditFoodModal
        isVisible={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        food={food}
        onSave={handleEditSave}
      />
    </div>
  );
};

export default CompanyFoodProfile;
