import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ReusableTable from "../../components/common/ReusableTable";

const SuperadminFoodMenu = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [companyNames, setCompanyNames] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFoods = async () => {
      setLoading(true);
      try {
        // Fetch all foods
        const res = await axios.get("/api/foods/allfoods");
        setFoods(res.data);

        // Fetch company names for each unique companyId
        const uniqueCompanyIds = [
          ...new Set(res.data.map((food) => food.companyId)),
        ].filter(Boolean);

        const companyNameMap = {};
        await Promise.all(
          uniqueCompanyIds.map(async (id) => {
            try {
              const companyRes = await axios.get(`/api/company/${id}`);
              companyNameMap[id] = companyRes.data.companyName;
            } catch {
              companyNameMap[id] = "N/A";
            }
          })
        );
        setCompanyNames(companyNameMap);
      } catch (err) {
        console.error(err);
        setFoods([]);
      }
      setLoading(false);
    };
    fetchFoods();
  }, []);

  const columns = [
    {
      key: "foodCode",
      header: "Food Code",
      sortable: true,
      filterable: true,
    },
    {
      key: "images",
      header: "Image",
      render: (value, row) =>
        value && value.length > 0 ? (
          <img
            src={value[0]}
            alt={row.name}
            className="w-16 h-16 object-cover rounded shadow"
          />
        ) : (
          <span className="text-gray-400">No Image</span>
        ),
      sortable: false,
      filterable: false,
    },
    
    {
      key: "name",
      header: "Name",
      sortable: true,
      filterable: true,
    },
    {
      key: "category",
      header: "Category",
      sortable: true,
      filterable: true,
    },
    {
      key: "companyId",
      header: "Company",
      render: (value) =>
        value && companyNames[value] ? companyNames[value] : "N/A",
      sortable: false,
      filterable: true,
    },
    {
      key: "price",
      header: "Price",
      render: (value, row) =>
        row.portions && row.portions.length > 0
          ? `From Rs. ${Math.min(...row.portions.map((p) => p.price))}`
          : value !== undefined && value !== null
          ? `Rs. ${value}`
          : "N/A",
      sortable: true,
      filterable: false,
    },
    {
      key: "actions",
      header: "Action",
      render: (value, row) => (
        <button
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          onClick={() => navigate(`/company-food-profile/${row._id}`)}
        >
          View Profile
        </button>
      ),
      sortable: false,
      filterable: false,
    },
  ];

  return (
    <div className=" mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">All Foods (All Companies)</h1>
      <ReusableTable
        columns={columns}
        data={foods}
        loading={loading}
        pagination={true}
        pageSize={10}
        filterable={true}
        searchable={true}
        emptyMessage="No foods found."
      />
    </div>
  );
};

export default SuperadminFoodMenu;
