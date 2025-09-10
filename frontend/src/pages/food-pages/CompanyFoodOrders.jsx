import React, { useState } from "react";
import OngoingFoodOrders from "../../components/foods/OngoingFoodOrders";
import RecentFoodOrders from "../../components/foods/RecentFoodOrders";
import FoodOrdersHistory from "../../components/foods/FoodOrdersHistory";

const CompanyFoodOrders = () => {
  const [activeTab, setActiveTab] = useState("ongoing");

  return (
    <div>
      <div className="flex gap-2 mb-6">
        <button
          className={`px-4 py-2 rounded font-semibold ${
            activeTab === "ongoing"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
          onClick={() => setActiveTab("ongoing")}
        >
          Ongoing Food Orders
        </button>
        <button
          className={`px-4 py-2 rounded font-semibold ${
            activeTab === "total"
              ? "bg-green-600 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
          onClick={() => setActiveTab("total")}
        >
          Recent Food Orders
        </button>
        <button
          className={`px-4 py-2 rounded font-semibold ${
            activeTab === "history"
              ? "bg-gray-700 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
          onClick={() => setActiveTab("history")}
        >
          History
        </button>
      </div>
      {activeTab === "ongoing" && <OngoingFoodOrders />}
      {activeTab === "total" && <RecentFoodOrders />}
      {activeTab === "history" && <FoodOrdersHistory />}
    </div>
  );
};

export default CompanyFoodOrders;