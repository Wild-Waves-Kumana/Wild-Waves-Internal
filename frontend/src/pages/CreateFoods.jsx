import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const categories = ["Main", "Dessert", "Beverage", "Snack"];
const availableOnOptions = ["Breakfast", "Lunch", "Dinner", "Teatime", "Anytime"];
const portionOptions = ["Small", "Medium", "Large"];

const CreateFoods = () => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "", // default price if no portions
    category: categories[0],
    isAvailable: true,
    availableOn: [],
    portions: [],
  });
  const [companyId, setCompanyId] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Get companyId from token or fetch admin
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.companyId) {
          setCompanyId(decoded.companyId._id || decoded.companyId);
        } else if (decoded.id) {
          fetch(`http://localhost:5000/api/admin/${decoded.id}`)
            .then((res) => res.json())
            .then((admin) => {
              setCompanyId(admin.companyId?._id || admin.companyId);
            });
        }
      } catch {
        setCompanyId("");
      }
    }
  }, []);

  // Handle checkbox and input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "availableOn") {
      setForm((prev) => {
        if (checked) {
          return { ...prev, availableOn: [...prev.availableOn, value] };
        } else {
          return {
            ...prev,
            availableOn: prev.availableOn.filter((v) => v !== value),
          };
        }
      });
    } else if (name.startsWith("portion-")) {
      // Portion price change
      const portionName = name.split("-")[1];
      setForm((prev) => {
        const portions = prev.portions.filter((p) => p.name !== portionName);
        if (value !== "") {
          return {
            ...prev,
            portions: [...portions, { name: portionName, price: value }],
          };
        } else {
          return { ...prev, portions };
        }
      });
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  // Handle portion checkbox (add/remove portion)
  const handlePortionCheck = (e) => {
    const { value, checked } = e.target;
    setForm((prev) => {
      let portions = prev.portions || [];
      if (checked) {
        // Add with empty price
        if (!portions.find((p) => p.name === value)) {
          portions = [...portions, { name: value, price: "" }];
        }
      } else {
        portions = portions.filter((p) => p.name !== value);
      }
      return { ...prev, portions };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");
    try {
      const payload = {
        ...form,
        companyId,
      };
      // If no portions, send price as a single value and portions as empty array
      if (!form.portions || form.portions.length === 0) {
        payload.portions = [];
        payload.price = form.price;
      } else {
        payload.price = undefined; // Don't send price if portions exist
      }
      const res = await fetch("http://localhost:5000/api/foods/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSuccess("Food item created successfully!");
        setForm({
          name: "",
          description: "",
          price: "",
          category: categories[0],
          isAvailable: true,
          availableOn: [],
          portions: [],
        });
      } else {
        const data = await res.json();
        setError(data.message || "Failed to create food item.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to create food item.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white shadow rounded p-6">
      <h2 className="text-2xl font-bold mb-4">Create Food Item</h2>
      {success && <div className="mb-4 text-green-600">{success}</div>}
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        {/* Available On Section */}
        <div>
          <label className="block font-semibold mb-1">Available On</label>
          <div className="flex flex-wrap gap-4">
            {availableOnOptions.map((option) => (
              <label key={option} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="availableOn"
                  value={option}
                  checked={form.availableOn.includes(option)}
                  onChange={handleChange}
                  className="accent-blue-600"
                />
                {option}
              </label>
            ))}
          </div>
        </div>
        {/* Portion Section */}
        <div>
          <label className="block font-semibold mb-1">Portion & Prices</label>
          <div className="flex flex-col gap-2">
            {portionOptions.map((portion) => {
              const portionObj = form.portions.find((p) => p.name === portion) || {};
              return (
                <div key={portion} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    value={portion}
                    checked={!!form.portions.find((p) => p.name === portion)}
                    onChange={handlePortionCheck}
                    id={`portion-check-${portion}`}
                  />
                  <label htmlFor={`portion-check-${portion}`} className="w-20">{portion}</label>
                  <input
                    type="number"
                    name={`portion-${portion}`}
                    value={portionObj.price || ""}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="Price"
                    className="border rounded px-2 py-1 w-32"
                    disabled={!form.portions.find((p) => p.name === portion)}
                  />
                  <span className="text-gray-500">LKR</span>
                </div>
              );
            })}
          </div>
        </div>
        {/* Default Price if no portions */}
        {(!form.portions || form.portions.length === 0) && (
          <div>
            <label className="block font-semibold mb-1">Price (LKR)</label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
        )}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="isAvailable"
            checked={form.isAvailable}
            onChange={handleChange}
            id="isAvailable"
            className="mr-2"
          />
          <label htmlFor="isAvailable" className="font-semibold">
            Available
          </label>
        </div>
        <button
          type="submit"
          disabled={loading || !companyId}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Creating..." : "Create Food"}
        </button>
      </form>
    </div>
  );
};

export default CreateFoods;