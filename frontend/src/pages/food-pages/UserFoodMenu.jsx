import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import AddFoodtoCartModal from "../../components/modals/AddFoodtoCartModal"; // <-- import modal

const categories = ["All", "Main", "Dessert", "Beverage", "Snack"];
const availableOnOptions = [
  "All",
  "Breakfast",
  "Lunch",
  "Dinner",
  "Teatime",
  "Anytime",
];

const UserFoodMenu = () => {
  const [foods, setFoods] = useState([]);
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [availableOnFilter, setAvailableOnFilter] = useState("All");
  const [availabilityFilter, setAvailabilityFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFoodsByUserCompany = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return setLoading(false);
        const decoded = jwtDecode(token);
        const userId = decoded.id;

        // Get user details to find companyId
        const userRes = await axios.get(`http://localhost:5000/api/users/${userId}`);
        const userCompanyId = userRes.data.companyId?._id || userRes.data.companyId;

        // Get foods for this company
        const foodsRes = await axios.get(
          `http://localhost:5000/api/foods/all?companyId=${userCompanyId}`
        );
        setFoods(foodsRes.data);
      } catch (err) {
        console.error("Error fetching foods:", err);
        setFoods([]);
      }
      setLoading(false);
    };
    fetchFoodsByUserCompany();
  }, []);

  // Filtering logic
  useEffect(() => {
    let filtered = [...foods];
    if (categoryFilter !== "All") {
      filtered = filtered.filter((food) => food.category === categoryFilter);
    }
    if (availableOnFilter !== "All") {
      filtered = filtered.filter(
        (food) =>
          Array.isArray(food.availableOn) &&
          food.availableOn.includes(availableOnFilter)
      );
    }
    if (availabilityFilter !== "All") {
      filtered = filtered.filter(
        (food) =>
          (availabilityFilter === "Available" && food.isAvailable) ||
          (availabilityFilter === "Not Available" && !food.isAvailable)
      );
    }
    if (search.trim() !== "") {
      const searchLower = search.trim().toLowerCase();
      filtered = filtered.filter(
        (food) =>
          food.name.toLowerCase().includes(searchLower) ||
          (food.description && food.description.toLowerCase().includes(searchLower))
      );
    }
    setFilteredFoods(filtered);
  }, [foods, categoryFilter, availableOnFilter, availabilityFilter, search]);

  if (loading) {
    return <div className="text-center py-10">Loading foods...</div>;
  }

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <div>
          <label className="font-semibold mr-2">Category:</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border rounded px-2 py-1"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="font-semibold mr-2">Available On:</label>
          <select
            value={availableOnFilter}
            onChange={(e) => setAvailableOnFilter(e.target.value)}
            className="border rounded px-2 py-1"
          >
            {availableOnOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="font-semibold mr-2">Availability:</label>
          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="All">All</option>
            <option value="Available">Available</option>
            <option value="Not Available">Not Available</option>
          </select>
        </div>
        <div>
          <label className="font-semibold mr-2">Search:</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or description"
            className="border rounded px-2 py-1"
          />
        </div>
      </div>
      {filteredFoods.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No foods found for your company.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
          {filteredFoods.map((food) => (
            <div
              key={food._id}
              className="bg-white rounded shadow p-4 flex flex-col items-center hover:shadow-lg transition"
              tabIndex={0}
              role="group"
              aria-label={`View details for ${food.name}`}
            >
              <div className="w-full flex justify-center mb-2">
                {food.images && food.images.length > 0 ? (
                  <img
                    src={food.images[0]}
                    alt={food.name}
                    className="h-32 w-32 object-cover rounded"
                  />
                ) : (
                  <div className="h-32 w-32 bg-gray-200 flex items-center justify-center rounded text-gray-400">
                    No Image
                  </div>
                )}
              </div>
              <h3 className="text-lg font-bold mb-1">{food.name}</h3>
              <div className="mb-1 text-sm text-gray-600">
                {food.availableOn && food.availableOn.length > 0
                  ? food.availableOn.join(", ")
                  : "Not specified"}
              </div>
              <div className="mb-2">
                <span
                  className={
                    food.isAvailable
                      ? "inline-block px-2 py-1 text-xs bg-green-100 text-green-700 rounded"
                      : "inline-block px-2 py-1 text-xs bg-red-100 text-red-700 rounded"
                  }
                >
                  {food.isAvailable ? "Available" : "Not Available"}
                </span>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  onClick={() => navigate(`/user-food-profile/${food._id}`)}
                >
                  View
                </button>
                <button
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  disabled={!food.isAvailable}
                  onClick={() => {
                    setSelectedFood(food);
                    setCartModalOpen(true);
                  }}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <AddFoodtoCartModal
        isVisible={cartModalOpen}
        onClose={() => setCartModalOpen(false)}
        food={selectedFood}
        onCartSuccess={() => setCartModalOpen(false)}
      />
    </div>
  );
};

export default UserFoodMenu;