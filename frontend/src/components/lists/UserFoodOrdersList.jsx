import React from "react";
import ReusableTable from "../common/ReusableTable";

const UserFoodOrdersList = ({
  userOrders = [],
  loading = false,
}) => {
  // Table columns for user food orders
  const userOrderColumns = [
    {
      key: "orderId",
      header: "Order ID",
      sortable: true,
    },
    {
      key: "orderedAt",
      header: "Ordered At",
      sortable: true,
      render: (val) => val ? new Date(val).toLocaleString() : "-",
    },
    {
      key: "expectTime",
      header: "Expect Time",
      sortable: true,
      render: (val) => val ? new Date(val).toLocaleString() : "-",
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (val) => {
        let style = "";
        if (val === "Delivered") {
          style = "bg-green-500 text-white";
        } else if (val === "Cancelled") {
          style = "bg-red-500 text-white";
        } else if (val === "Cancelled by User") {
          style = "bg-yellow-500 text-white";
        } else if (val === "Pending") {
          style = "bg-blue-500 text-white";
        } else if (val === "Preparing") {
          style = "bg-indigo-500 text-white";
        }
        return (
          <span className={`px-3 py-1 rounded font-semibold text-xs shadow ${style}`}>
            {val}
          </span>
        );
      },
    },
    {
      key: "totalPrice",
      header: "Total Price",
      sortable: true,
      render: (val) => `${val} LKR`,
    },
    {
      key: "items",
      header: "Items",
      render: (items) =>
        <ul className="list-disc ml-4">
          {items.map((item, idx) => (
            <li key={idx}>
              <span className="font-mono">{item.foodCode}</span> - {item.foodId?.name || item.name} ({item.quantity} x {item.price} LKR)
            </li>
          ))}
        </ul>,
    },
    {
      key: "specialRequest",
      header: "Special Request",
      render: (val) => val || "-",
    },
  ];

  return (
    <div className="mx-auto my-4 bg-white shadow rounded p-6">
      <h3 className="text-xl font-bold mb-4">User Food Orders</h3>
      <ReusableTable
        columns={userOrderColumns}
        data={userOrders}
        searchable={true}
        sortable={true}
        pagination={true}
        pageSize={10}
        striped={true}
        hover={true}
        loading={loading}
        emptyMessage="No food orders found for this user."
      />
    </div>
  );
};

export default UserFoodOrdersList;