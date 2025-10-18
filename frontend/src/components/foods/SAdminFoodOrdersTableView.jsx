import React from "react";
import ReusableTable from "../common/ReusableTable";

const SAdminFoodOrdersTableView = ({ 
  orders, 
  loading, 
  usernames, 
  villaNames 
}) => {
  // Table columns
  const columns = [
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
      key: "userId",
      header: "User",
      sortable: true,
      render: (val) =>
        val && usernames[val] ? (
          <a
            href={`/user-profile/${val}`}
            className="text-blue-600 hover:text-blue-800"
            target="_blank"
            rel="noopener noreferrer"
          >
            {usernames[val]}
          </a>
        ) : (
          "-"
        ),
    },
    {
      key: "villaId",
      header: "Villa",
      sortable: true,
      render: (val) =>
        val && villaNames[val] ? (
          <a
            href={`/villa-profile/${val}`}
            className="text-blue-600 hover:text-blue-800"
            target="_blank"
            rel="noopener noreferrer"
          >
            {villaNames[val]}
          </a>
        ) : (
          "-"
        ),
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

  

  // Sort orders by orderId descending by default
  const sortedOrders = [...orders].sort((a, b) => {
    if (a.orderId < b.orderId) return 1;
    if (a.orderId > b.orderId) return -1;
    return 0;
  });

  return (
    <ReusableTable
      columns={columns}
      data={sortedOrders}
      dateSearch={true}
      dateSearchKey="orderedAt"
      searchable={true}
      sortable={true}
      pagination={true}
      pageSize={10}
      striped={true}
      hover={true}
      loading={loading}
      emptyMessage="No history orders found."
    />
  );
};

export default SAdminFoodOrdersTableView;