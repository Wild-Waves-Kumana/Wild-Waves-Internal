import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Grid3X3, 
  List, 
  ShoppingCart, 
  Eye, 
  Clock,
  Tag,
  Image as ImageIcon,
  RefreshCw
} from "lucide-react";
import AddFoodtoCartModal from "../../components/modals/AddFoodtoCartModal";

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
  { value: "Not Available", label: "Out of Stock" }
];

const UserFoodMenu = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: "All",
    availableOn: "All", 
    availability: "All",
    search: ""
  });
  const [viewMode, setViewMode] = useState("grid");
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const [foodOrderCounts, setFoodOrderCounts] = useState({});
  const navigate = useNavigate();

  // Fetch foods and food order counts
  const fetchFoodsByUserCompany = useCallback(async () => {
    try {
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required");
        return;
      }
      const decoded = jwtDecode(token);
      const userId = decoded.id;
      const userRes = await axios.get(`api/users/${userId}`);
      const userCompanyId = userRes.data.companyId?._id || userRes.data.companyId;
      if (!userCompanyId) {
        setError("No company associated with your account");
        return;
      }
      // Fetch foods
      const foodsRes = await axios.get(
        `api/foods/all?companyId=${userCompanyId}`
      );
      setFoods(foodsRes.data || []);
      // Fetch food orders for company
      const ordersRes = await axios.get(
        `api/food-orders/company/${userCompanyId}`
      );
      // Count foodId occurrences in orders
      const counts = {};
      (ordersRes.data || []).forEach(order => {
        (order.items || []).forEach(item => {
          if (item.foodId) {
            const id = typeof item.foodId === "object" ? item.foodId._id : item.foodId;
            counts[id] = (counts[id] || 0) + item.quantity;
          }
        });
      });
      setFoodOrderCounts(counts);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load menu items");
      setFoods([]);
      setFoodOrderCounts({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFoodsByUserCompany();
  }, [fetchFoodsByUserCompany]);

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleAddToCart = useCallback((food) => {
    setSelectedFood(food);
    setCartModalOpen(true);
  }, []);

  const handleCartSuccess = useCallback(() => {
    setCartModalOpen(false);
  }, []);

  const TruncatedText = ({ text, maxLength = 80 }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    if (!text || text.length <= maxLength) return <span>{text}</span>;
    return (
      <span>
        {isExpanded ? text : `${text.substring(0, maxLength)}...`}
        <button
          onClick={e => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
          className="ml-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          {isExpanded ? 'see less' : 'see more'}
        </button>
      </span>
    );
  };

  const FoodCard = ({ food, isListView = false }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300
      ${isListView ? 'flex items-stretch p-4 space-x-4' : 'p-6 flex flex-col h-full'}
      hover:border-blue-200 group`}>
      <div className={`${isListView ? 'w-24 h-24 flex-shrink-0' : 'w-full mb-4'} relative overflow-hidden rounded-lg bg-gray-50`}>
        {food.images && food.images.length > 0 ? (
          <img
            src={food.images[0]}
            alt={food.name}
            className={`${isListView ? 'w-24 h-24' : 'w-full h-48'} object-cover group-hover:scale-105 transition-transform duration-300`}
            loading="lazy"
          />
        ) : (
          <div className={`${isListView ? 'w-24 h-24' : 'w-full h-48'} bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400`}>
            <ImageIcon size={isListView ? 24 : 32} />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
            ${food.isAvailable ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
            <div className={`w-1.5 h-1.5 rounded-full mr-1 ${food.isAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
            {food.isAvailable ? 'Available' : 'Out of Stock'}
          </span>
        </div>
      </div>
      <div className={`${isListView ? 'flex-1 min-w-0 flex flex-col justify-between' : 'flex-1 flex flex-col'}`}>
        <div className="flex-1 flex flex-col">
          <div className="mb-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">{food.name}</h3>
            {food.foodCode && (
              <div className="flex items-center text-sm text-gray-500 mb-1">
                <Tag size={14} className="mr-1" />
                <span className="font-mono">{food.foodCode}</span>
              </div>
            )}
          </div>
          {/* Fixed height for description */}
          <div className="mb-1 min-h-[40px] flex items-start">
            {food.description ? (
              <p className="text-xs text-gray-600">
                <TruncatedText text={food.description} maxLength={40} />
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
                  <TruncatedText text={food.availableOn.join(", ")} maxLength={30} />
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
        </div>
        <div className="flex gap-3 mt-auto">
          <button
            onClick={() => navigate(`/user-food-profile/${food._id}`)}
            className="flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors duration-200 flex-1"
          >
            <Eye size={16} className="mr-1" />
            View Details
          </button>
          <button
            onClick={() => handleAddToCart(food)}
            disabled={!food.isAvailable}
            className={`flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 flex-1
              ${food.isAvailable ? 'text-white bg-green-600 hover:bg-green-700 shadow-sm hover:shadow-md' : 'text-gray-400 bg-gray-100 cursor-not-allowed'}`}
          >
            <ShoppingCart size={16} className="mr-1" />
          </button>
        </div>
      </div>
    </div>
  );

  // Memoized filtered foods for performance
  const filteredFoods = useMemo(() => {
    let filtered = [...foods];
    if (filters.category !== "All") {
      filtered = filtered.filter(food => food.category === filters.category);
    }
    if (filters.availableOn !== "All") {
      filtered = filtered.filter(food =>
        Array.isArray(food.availableOn) &&
        food.availableOn.includes(filters.availableOn)
      );
    }
    if (filters.availability !== "All") {
      filtered = filtered.filter(food =>
        (filters.availability === "Available" && food.isAvailable) ||
        (filters.availability === "Not Available" && !food.isAvailable)
      );
    }
    if (filters.search.trim()) {
      const searchLower = filters.search.trim().toLowerCase();
      filtered = filtered.filter(food =>
        food.name.toLowerCase().includes(searchLower) ||
        (food.description && food.description.toLowerCase().includes(searchLower)) ||
        (food.foodCode && food.foodCode.toLowerCase().includes(searchLower))
      );
    }
    // Sort: available items first, not available items last
    filtered.sort((a, b) => {
      if (a.isAvailable !== b.isAvailable) return a.isAvailable ? -1 : 1;
      // Sort by order count descending
      const aCount = foodOrderCounts[a._id] || 0;
      const bCount = foodOrderCounts[b._id] || 0;
      return bCount - aCount;
    });
    return filtered;
  }, [foods, filters, foodOrderCounts]);

  // Pagination logic
  const totalPages = Math.ceil(filteredFoods.length / pageSize);
  const paginatedFoods = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredFoods.slice(start, start + pageSize);
  }, [filteredFoods, currentPage, pageSize]);

  if (loading) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu items...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchFoodsByUserCompany()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Food Menu</h1>
            <p className="text-gray-600 mt-1">
              Discover delicious meals from your company kitchen
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate("/user-food-orders")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              Food Orders
            </button>
            {/* View mode toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-colors duration-200 ${
                  viewMode === "grid" 
                    ? "bg-white text-blue-600 shadow-sm" 
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <Grid3X3 size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-colors duration-200 ${
                  viewMode === "list" 
                    ? "bg-white text-blue-600 shadow-sm" 
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
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
              onChange={(e) => handleFilterChange("availableOn", e.target.value)}
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
              onChange={(e) => handleFilterChange("availability", e.target.value)}
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
                onChange={(e) => handleFilterChange("search", e.target.value)}
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

      {/* Food Grid/List */}
      {filteredFoods.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14-7H3m14 14H3M5 7l3 3-3 3m8-6l3 3-3 3" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No menu items found</h3>
          <p className="text-gray-600 mb-4">
            {filters.search || filters.category !== "All" || filters.availableOn !== "All" || filters.availability !== "All"
              ? "Try adjusting your filters to see more results."
              : "No food items are available for your company at the moment."
            }
          </p>
          {(filters.category !== "All" || filters.availableOn !== "All" || filters.availability !== "All" || filters.search) && (
            <button
              onClick={() => setFilters({ category: "All", availableOn: "All", availability: "All", search: "" })}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className={viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"}>
            {paginatedFoods.map(food => (
              <FoodCard
                key={food._id}
                food={food}
                isListView={viewMode === "list"}
              />
            ))}
          </div>
          {/* Pagination Controls (ReusableTable style from UserFoodOrders) */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 bg-white border-t border-gray-300 rounded-b-lg gap-4 mt-8">
              {/* Results Info */}
              <div className="flex items-center text-sm text-gray-700">
                <span>
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredFoods.length)} of {filteredFoods.length} results
                </span>
              </div>
              {/* Navigation Controls */}
              <div className="flex items-center space-x-1">
                {/* First Page */}
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-2 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="First page"
                >
                  ««
                </button>
                {/* Previous Page */}
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {/* Page Numbers */}
                {(() => {
                  const delta = 2;
                  const range = [];
                  const rangeWithDots = [];
                  const start = Math.max(1, currentPage - delta);
                  const end = Math.min(totalPages, currentPage + delta);
                  for (let i = start; i <= end; i++) range.push(i);
                  if (start > 1) {
                    rangeWithDots.push(1);
                    if (start > 2) rangeWithDots.push('...');
                  }
                  rangeWithDots.push(...range);
                  if (end < totalPages) {
                    if (end < totalPages - 1) rangeWithDots.push('...');
                    rangeWithDots.push(totalPages);
                  }
                  return rangeWithDots.map((pageNum, index) =>
                    pageNum === '...' ? (
                      <span key={index} className="px-2 py-1 text-gray-500">...</span>
                    ) : (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 border rounded-md text-sm font-medium ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  );
                })()}
                {/* Next Page */}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
                {/* Last Page */}
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Last page"
                >
                  »»
                </button>
              </div>
              {/* Quick Jump */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">Go to page:</span>
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const page = parseInt(e.target.value);
                    if (page >= 1 && page <= totalPages) {
                      setCurrentPage(page);
                    }
                  }}
                  className="w-16 px-2 py-1 border border-gray-300 rounded-md text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-gray-600">of {totalPages}</span>
              </div>
            </div>
          )}
        </>
      )}

      <AddFoodtoCartModal
        isVisible={cartModalOpen}
        onClose={() => setCartModalOpen(false)}
        food={selectedFood}
        onCartSuccess={handleCartSuccess}
      />
    </div>
  );
};

export default UserFoodMenu;