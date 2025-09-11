import React, { useEffect, useState, useMemo, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Clock, Search } from "lucide-react";

const CATEGORIES = ["All", "Main", "Dessert", "Beverage", "Snack"];
const AVAILABLE_ON_OPTIONS = [
  "All",
  "Breakfast",
  "Lunch",
  "Dinner",
  "Teatime",
  "Anytime",
];
const AVAILABILITY_OPTIONS = [
  { value: "All", label: "All Items" },
  { value: "Available", label: "Available" },
  { value: "Not Available", label: "Out of Stock" },
];
const pageSize = 12;

const CompanyFoods = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [companyFilter, setCompanyFilter] = useState("All");
  const [filters, setFilters] = useState({
    category: "All",
    availableOn: "All",
    availability: "All",
    search: "",
  });
  const [foodOrderCounts, setFoodOrderCounts] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();

  // Fetch foods and food order counts
  const fetchFoodsAndOrders = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return setLoading(false);
      const decoded = jwtDecode(token);
      const adminId = decoded.id;
      if (decoded.role === "superadmin") {
        setIsSuperAdmin(true);
        // Fetch all companies for filter
        const companiesRes = await axios.get(
          "http://localhost:5000/api/company/all"
        );
        setCompanies(companiesRes.data);

        // Fetch all foods
        const foodsRes = await axios.get(`http://localhost:5000/api/foods/all`);
        setFoods(foodsRes.data);

        // Fetch all food orders for all companies
        const ordersRes = await axios.get(
          `http://localhost:5000/api/food-orders/all`
        );
        const counts = {};
        (ordersRes.data || []).forEach((order) => {
          (order.items || []).forEach((item) => {
            if (item.foodId) {
              const id =
                typeof item.foodId === "object" ? item.foodId._id : item.foodId;
              counts[id] = (counts[id] || 0) + item.quantity;
            }
          });
        });
        setFoodOrderCounts(counts);
      } else {
        const adminRes = await axios.get(`http://localhost:5000/api/admin/${adminId}`);
        const companyId = adminRes.data.companyId?._id || adminRes.data.companyId;
        const foodsRes = await axios.get(
          `http://localhost:5000/api/foods/all?companyId=${companyId}`
        );
        setFoods(foodsRes.data);

        // Fetch food orders for company
        const ordersRes = await axios.get(
          `http://localhost:5000/api/food-orders/company/${companyId}`
        );
        const counts = {};
        (ordersRes.data || []).forEach((order) => {
          (order.items || []).forEach((item) => {
            if (item.foodId) {
              const id =
                typeof item.foodId === "object" ? item.foodId._id : item.foodId;
              counts[id] = (counts[id] || 0) + item.quantity;
            }
          });
        });
        setFoodOrderCounts(counts);
      }
    } catch (err) {
      console.error("Error fetching foods or orders:", err);
      setFoods([]);
      setFoodOrderCounts({});
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchFoodsAndOrders();
  }, [fetchFoodsAndOrders]);

  // Filtering and sorting logic
  const filteredFoods = useMemo(() => {
    let filtered = [...foods];
    if (isSuperAdmin && companyFilter !== "All") {
      filtered = filtered.filter(
        (food) =>
          food.companyId === companyFilter ||
          (food.companyId && food.companyId._id === companyFilter)
      );
    }
    if (filters.category !== "All") {
      filtered = filtered.filter((food) => food.category === filters.category);
    }
    if (filters.availableOn !== "All") {
      filtered = filtered.filter(
        (food) =>
          Array.isArray(food.availableOn) &&
          food.availableOn.includes(filters.availableOn)
      );
    }
    if (filters.availability !== "All") {
      filtered = filtered.filter(
        (food) =>
          (filters.availability === "Available" && food.isAvailable) ||
          (filters.availability === "Not Available" && !food.isAvailable)
      );
    }
    if (filters.search.trim() !== "") {
      const searchLower = filters.search.trim().toLowerCase();
      filtered = filtered.filter(
        (food) =>
          food.name.toLowerCase().includes(searchLower) ||
          (food.description && food.description.toLowerCase().includes(searchLower)) ||
          (food.foodCode && food.foodCode.toLowerCase().includes(searchLower))
      );
    }
    // Sort: available items first, then by order count descending
    filtered.sort((a, b) => {
      if (a.isAvailable !== b.isAvailable) return a.isAvailable ? -1 : 1;
      const aCount = foodOrderCounts[a._id] || 0;
      const bCount = foodOrderCounts[b._id] || 0;
      return bCount - aCount;
    });
    return filtered;
  }, [
    foods,
    companyFilter,
    isSuperAdmin,
    filters.category,
    filters.availableOn,
    filters.availability,
    filters.search,
    foodOrderCounts,
  ]);

  // Pagination logic
  const totalPages = Math.ceil(filteredFoods.length / pageSize);
  const paginatedFoods = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredFoods.slice(start, start + pageSize);
  }, [filteredFoods, currentPage]);

  // Filter change handler
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading foods...</p>
        </div>
      </div>
    );
  }


  return (
    <div>
      {/* Filters */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Company Filter (SuperAdmin only) */}
          {isSuperAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company
              </label>
              <select
                value={companyFilter}
                onChange={e => setCompanyFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              >
                <option value="All">All</option>
                {companies.map((company) => (
                  <option key={company._id} value={company._id}>
                    {company.companyName || company.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={filters.category}
              onChange={e => handleFilterChange("category", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          {/* Available On Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available On
            </label>
            <select
              value={filters.availableOn}
              onChange={e => handleFilterChange("availableOn", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
            >
              {AVAILABLE_ON_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          {/* Availability Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Availability
            </label>
            <select
              value={filters.availability}
              onChange={e => handleFilterChange("availability", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
            >
              {AVAILABILITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={e => handleFilterChange("search", e.target.value)}
                placeholder="Search menu items..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              />
            </div>
          </div>
        </div>
        {/* Active filters count */}
        {(filters.category !== "All" || filters.availableOn !== "All" || filters.availability !== "All" || filters.search) && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-600">
              {filteredFoods.length} of {foods.length} items shown
            </span>
            <button
              onClick={() => setFilters({ category: "All", availableOn: "All", availability: "All", search: "" })}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Food Tiles */}
      {filteredFoods.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No foods found{isSuperAdmin ? "" : " for this company"}.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
            {paginatedFoods.map((food) => (
              <div
                key={food._id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 p-6 flex flex-col h-full hover:border-blue-200 group cursor-pointer"
                onClick={() => navigate(`/company-food-profile/${food._id}`)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    navigate(`/company-food-profile/${food._id}`);
                  }
                }}
                role="button"
                aria-label={`View details for ${food.name}`}
              >
                <div className="w-full mb-4 relative overflow-hidden rounded-lg bg-gray-50 flex justify-center items-center">
                  {food.images && food.images.length > 0 ? (
                    <img
                      src={food.images[0]}
                      alt={food.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                      ${
                        food.isAvailable
                          ? "bg-green-100 text-green-800 border border-green-200"
                          : "bg-red-100 text-red-800 border border-red-200"
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full mr-1 ${
                          food.isAvailable ? "bg-green-500" : "bg-red-500"
                        }`}
                      />
                      {food.isAvailable ? "Available" : "Out of Stock"}
                    </span>
                  </div>
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="mb-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                      {food.name}
                    </h3>
                    {food.foodCode && (
                      <div className="flex items-center text-sm text-gray-500 mb-1">
                        <span className="font-mono">{food.foodCode}</span>
                      </div>
                    )}
                  </div>
                  {/* Fixed height for description */}
                  <div className="mb-1 min-h-[40px] flex items-start">
                    {food.description ? (
                      <p className="text-xs text-gray-600">
                        {food.description.length > 40
                          ? `${food.description.substring(0, 40)}...`
                          : food.description}
                      </p>
                    ) : (
                      <span className="text-xs text-gray-400">No description</span>
                    )}
                  </div>
                  {/* Fixed height for availableOn */}
                  <div className="mb-1 min-h-[24px] flex items-center">
                    {food.availableOn && food.availableOn.length > 0 ? (
                      <>
                        <Clock size={14} className="text-gray-400 mr-1" />
                        <span className="text-xs text-gray-600">
                          {food.availableOn.join(", ")}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </div>
                  {/* Fixed height for price */}
                  <div className="mb-3 min-h-[28px] flex items-center">
                    {food.price ? (
                      <span className="text-lg font-bold text-black-600">
                        Rs. {food.price.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">No price</span>
                    )}
                  </div>
                  {/* Most ordered count */}
                  <div className="mb-1 min-h-[24px] flex items-center">
                    <span className="text-xs text-gray-500">
                      Ordered: {foodOrderCounts[food._id] || 0} times
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Pagination Controls */}
          <div className="flex justify-center items-center mt-8 gap-2">
            <button
              className="px-3 py-1 rounded bg-gray-200 text-gray-700 text-sm disabled:opacity-50"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`px-3 py-1 rounded text-sm font-semibold ${
                  currentPage === i + 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-blue-100"
                }`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="px-3 py-1 rounded bg-gray-200 text-gray-700 text-sm disabled:opacity-50"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CompanyFoods;