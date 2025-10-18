import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ReusableTable from "../common/ReusableTable";

const AdminList = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdmins = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/admin/all");
        setAdmins(res.data);
      } catch (err) {
        console.error("Error fetching admins:", err);
        setAdmins([]);
      }
      setLoading(false);
    };
    fetchAdmins();
  }, []);

  const columns = [
    {
      key: "username",
      header: "Username",
      sortable: true,
      filterable: false,
    },
    {
      key: "email",
      header: "Email",
      sortable: true,
      filterable: false,
    },
    {
      key: "role",
      header: "Role",
      sortable: true,
      filterable: false,
    },
    {
      key: "companyId",
      header: "Company",
      render: (value) =>
        value && typeof value === "object"
          ? `${value.companyName} (${value.companyId})`
          : "N/A",
      sortable: false,
      filterable: false,
    },
    {
      key: "actions",
      header: "Action",
      render: (value, row) => (
        <button
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          onClick={() => navigate(`/admin-profile/${row._id}`)}
        >
          View Profile
        </button>
      ),
      sortable: false,
      filterable: false,
    },
  ];

  return (
    <div className=" bg-white shadow rounded p-6 mt-4">
      <h1 className="text-2xl font-bold mb-6">Admin List</h1>
      <ReusableTable
        columns={columns}
        data={admins}
        loading={loading}
        pagination={true}
        pageSize={10}
        filterable={true}
        searchable={true}
        emptyMessage="No admins found."
      />
    </div>
  );
};

export default AdminList;