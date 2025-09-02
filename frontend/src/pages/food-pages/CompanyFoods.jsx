import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const categories = ["All", "Main", "Dessert", "Beverage", "Snack"];
const availableOnOptions = [
  "All",
  "Breakfast",
  "Lunch",
  "Dinner",
  "Teatime",
  "Anytime",
];

const CompanyFoods = () => {
  const [foods, setFoods] = useState([]);
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // For superadmin: all companies for filter
  const [companies, setCompanies] = useState([]);
  const [companyFilter, setCompanyFilter] = useState("All");

  // Filter states
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [availableOnFilter, setAvailableOnFilter] = useState("All");
  const [availabilityFilter, setAvailabilityFilter] = useState("All");
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompanyIdAndFoods = async () => {
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
        } else {
          const adminRes = await axios.get(
            `http://localhost:5000/api/admin/${adminId}`
          );
          const companyId = adminRes.data.companyId?._id || adminRes.data.companyId;
          setCompanyId(companyId);
          const foodsRes = await axios.get(
            `http://localhost:5000/api/foods/all?companyId=${companyId}`
          );
          setFoods(foodsRes.data);
        }
      } catch (err) {
        console.error("Failed to fetch foods or company ID:", err);
        setFoods([]);
      }
      setLoading(false);
    };
    fetchCompanyIdAndFoods();
  }, []);

  useEffect(() => {
    if (companyId) {
      console.log("CompanyFoods companyId:", companyId);
    }
  }, [companyId]);

  // Filtering logic
  useEffect(() => {
    let filtered = [...foods];
    if (isSuperAdmin && companyFilter !== "All") {
      filtered = filtered.filter(
        (food) =>
          food.companyId === companyFilter ||
          (food.companyId && food.companyId._id === companyFilter)
      );
    }
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
  }, [
    foods,
    companyFilter,
    isSuperAdmin,
    categoryFilter,
    availableOnFilter,
    availabilityFilter,
    search,
  ]);

  if (loading) {
    return <div className="text-center py-10">Loading foods...</div>;
  }

  if (!filteredFoods.length) {
    return (
      <div>
        <FoodFilters
          isSuperAdmin={isSuperAdmin}
          companies={companies}
          companyFilter={companyFilter}
          setCompanyFilter={setCompanyFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          availableOnFilter={availableOnFilter}
          setAvailableOnFilter={setAvailableOnFilter}
          availabilityFilter={availabilityFilter}
          setAvailabilityFilter={setAvailabilityFilter}
          search={search}
          setSearch={setSearch}
        />
        <div className="text-center py-10 text-gray-500">
          No foods found{isSuperAdmin ? "" : " for this company"}.
        </div>
      </div>
    );
  }

  return (
    <div>
      <FoodFilters
        isSuperAdmin={isSuperAdmin}
        companies={companies}
        companyFilter={companyFilter}
        setCompanyFilter={setCompanyFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        availableOnFilter={availableOnFilter}
        setAvailableOnFilter={setAvailableOnFilter}
        availabilityFilter={availabilityFilter}
        setAvailabilityFilter={setAvailabilityFilter}
        search={search}
        setSearch={setSearch}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
        {filteredFoods.map((food) => (
          <div
            key={food._id}
            className="bg-white rounded shadow p-4 flex flex-col items-center cursor-pointer hover:shadow-lg transition"
            onClick={() => navigate(`/company-food-profile/${food._id}`)}
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === "Enter" || e.key === " ") {
                navigate(`/company-food-profile/${food._id}`);
              }
            }}
            role="button"
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
            {/* Add foodCode below the name */}
            <div className="mb-1 text-xs text-gray-500 font-mono">
              {food.foodCode ? `Code: ${food.foodCode}` : ""}
            </div>
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
          </div>
        ))}
      </div>
    </div>
  );
};

// Filtering UI as a reusable component
function FoodFilters({
  isSuperAdmin,
  companies,
  companyFilter,
  setCompanyFilter,
  categoryFilter,
  setCategoryFilter,
  availableOnFilter,
  setAvailableOnFilter,
  availabilityFilter,
  setAvailabilityFilter,
  search,
  setSearch,
}) {
  return (
    <div className="flex flex-wrap gap-4 mb-6 items-end">
      {isSuperAdmin && (
        <div>
          <label className="font-semibold mr-2">Company:</label>
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="border rounded px-2 py-1"
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
  );
}

export default CompanyFoods;