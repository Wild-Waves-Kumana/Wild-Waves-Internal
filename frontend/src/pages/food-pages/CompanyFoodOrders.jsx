import React, { useState } from "react";
import OngoingFoodOrders from "../../components/foods/OngoingFoodOrders";
import RecentFoodOrders from "../../components/foods/RecentFoodOrders";
import FoodOrdersHistory from "../../components/foods/FoodOrdersHistory";

const CompanyFoodOrders = () => {
  const [activeTab, setActiveTab] = useState("ongoing");

  return (
    <div>
      <div className="flex justify-center gap-2 mb-6">
        <button
          className={`px-6 py-2 rounded-full font-semibold shadow transition-all duration-150
            ${activeTab === "ongoing"
              ? "bg-blue-600 text-white scale-105"
              : "bg-gray-100 text-gray-700 hover:bg-blue-100"}
          `}
          onClick={() => setActiveTab("ongoing")}
        >
          Ongoing Food Orders
        </button>
        <button
          className={`px-6 py-2 rounded-full font-semibold shadow transition-all duration-150
            ${activeTab === "total"
              ? "bg-green-600 text-white scale-105"
              : "bg-gray-100 text-gray-700 hover:bg-green-100"}
          `}
          onClick={() => setActiveTab("total")}
        >
          Recent Food Orders
        </button>
        <button
          className={`px-6 py-2 rounded-full font-semibold shadow transition-all duration-150
            ${activeTab === "history"
              ? "bg-gray-700 text-white scale-105"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"}
          `}
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