import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Edit3, Trash2, Clock, Tag, DollarSign, Package, TrendingUp, Eye, Star } from "lucide-react";
import EditFoodModal from "../../components/modals/EditFoodModal";

const CompanyFoodProfile = () => {
  const { foodId } = useParams();
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [orderCount, setOrderCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFoodAndOrderCount = async () => {
      try {
        // Fetch food details
        const res = await axios.get(`/api/foods/${foodId}`);
        setFood(res.data);
        setCurrentImgIdx(0);

        // Fetch companyId from food
        const companyId = res.data.companyId?._id || res.data.companyId;

        // Fetch food orders for company and count this food's orders
        if (companyId) {
          const ordersRes = await axios.get(
            `/api/food-orders/company/${companyId}`
          );
          let count = 0;
          (ordersRes.data || []).forEach((order) => {
            (order.items || []).forEach((item) => {
              const id = typeof item.foodId === "object" ? item.foodId._id : item.foodId;
              if (id === foodId) {
                count += item.quantity;
              }
            });
          });
          setOrderCount(count);
        }
      } catch (err) {
        console.error("Error fetching food or orders:", err);
        setFood(null);
        setOrderCount(0);
      }
      setLoading(false);
    };
    fetchFoodAndOrderCount();
  }, [foodId]);

  const handleEdit = () => setEditModalOpen(true);

  const handleEditSave = async (updatedFood) => {
    await axios.put(`/api/foods/${foodId}`, updatedFood);
    setFood({ ...food, ...updatedFood });
    setEditModalOpen(false);
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this food item? This action cannot be undone."
      )
    ) {
      try {
        await axios.delete(`/api/foods/${foodId}`);
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

  const handleAvailabilityChange = async (e) => {
    const newAvailability = e.target.value === "Available";
    setAvailabilityLoading(true);
    try {
      await axios.put(`/api/foods/${foodId}`, {
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading food details...</p>
        </div>
      </div>
    );
  }

  if (!food) {
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <div className="text-center bg-white p-8 rounded-xl shadow-sm">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Food not found</h3>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Back to Foods
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="p-2">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Foods
          </button>
          <div className="flex gap-3">
            <button
              onClick={handleEdit}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Edit3 size={16} className="mr-2" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Trash2 size={16} className="mr-2" />
              Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="relative mb-4">
              {food.images && food.images.length > 0 ? (
                <img
                  src={food.images[currentImgIdx]}
                  alt={food.name}
                  className="w-full object-cover rounded-xl shadow-sm"
                />
              ) : (
                <div className="w-full h-80 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-gray-400">
                  <Eye size={48} />
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {food.images && food.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {food.images.map((img, idx) => (
                  <img
                    key={img}
                    src={img}
                    alt={`Food ${idx + 1}`}
                    className={`flex-shrink-0 w-16 h-16 object-cover rounded-lg cursor-pointer transition-all duration-200
                      ${idx === currentImgIdx
                        ? "ring-2 ring-blue-500 shadow-md"
                        : "opacity-70 hover:opacity-100"
                      }`}
                    onClick={() => setCurrentImgIdx(idx)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Details & Action Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            {/* Header Info */}
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{food.name}</h1>
              <div className="flex items-center justify-between mb-3">
                {food.foodCode && (
                  <div className="flex items-center text-gray-500">
                    <Tag size={14} className="mr-1" />
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{food.foodCode}</span>
                  </div>
                )}
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                  ${food.isAvailable 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-red-100 text-red-800 border border-red-200'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full mr-1 ${food.isAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
                  {food.isAvailable ? 'Available' : 'Out of Stock'}
                </span>
              </div>
            </div>

            {/* Description */}
            {food.description && (
              <div className="mb-4">
                <p className="text-gray-600 text-sm leading-relaxed">{food.description}</p>
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <Package size={16} className="mx-auto text-gray-400 mb-1" />
                <p className="text-xs font-medium text-gray-900">{food.category}</p>
                <p className="text-xs text-gray-500">Category</p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <Star size={16} className="mx-auto text-yellow-500 mb-1" />
                <p className="text-xs font-medium text-gray-900">{orderCount}</p>
                <p className="text-xs text-gray-500">Ordered</p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <Clock size={16} className="mx-auto text-gray-400 mb-1" />
                <p className="text-xs font-medium text-gray-900">
                  {food.availableOn && food.availableOn.length > 0 
                    ? food.availableOn.length > 1 
                      ? `${food.availableOn.length} times`
                      : food.availableOn[0]
                    : "Anytime"}
                </p>
                <p className="text-xs text-gray-500">Available</p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <DollarSign size={16} className="mx-auto text-gray-400 mb-1" />
                <p className="text-xs font-medium text-gray-900">
                  {food.price != null ? `Rs. ${food.price}` : "Varied"}
                </p>
                <p className="text-xs text-gray-500">Price</p>
              </div>
            </div>

            {/* Available Times */}
            {food.availableOn && food.availableOn.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Available Times</h4>
                <div className="flex flex-wrap gap-1">
                  {food.availableOn.map((time) => (
                    <span
                      key={time}
                      className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                    >
                      <Clock size={10} className="mr-1" />
                      {time}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Portions/Pricing */}
            {food.portions && food.portions.length > 0 ? (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Available Portions</h3>
                <div className="space-y-2">
                  {food.portions.map((portion, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
                      <h4 className="font-medium text-sm text-gray-900">{portion.name}</h4>
                      <span className="text-sm font-bold text-green-700">
                        {portion.price != null ? `Rs. ${portion.price}` : "N/A"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
                  <span className="text-xl font-bold text-green-700">
                    {food.price != null ? `Rs. ${food.price}` : "Price varies"}
                  </span>
                </div>
              </div>
            )}

            {/* Availability Control */}
            <div className="border-t border-gray-200 pt-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">Availability Status</h3>
                  <p className="text-xs text-gray-500">Control item availability</p>
                </div>
                <div className="flex items-center gap-2">
                  {availabilityLoading && (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                  )}
                  <select
                    value={food.isAvailable ? "Available" : "Not Available"}
                    onChange={handleAvailabilityChange}
                    disabled={availabilityLoading}
                    className="px-3 py-1 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  >
                    <option value="Available">Available</option>
                    <option value="Not Available">Not Available</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
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
