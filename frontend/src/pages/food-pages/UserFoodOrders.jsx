import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Modal from "../../components/common/Modal";

const statusOptions = ["Pending", "Preparing", "Delivered", "Cancelled"];

const getStatusStyles = (status) => {
  const base = "px-2 py-1 rounded text-xs border transition-all duration-150 font-semibold";
  switch (status) {
    case "Pending":
      return `${base} bg-yellow-500 text-white border-yellow-600 shadow`;
    case "Preparing":
      return `${base} bg-blue-500 text-white border-blue-600 shadow`;
    case "Delivered":
      return `${base} bg-green-500 text-white border-green-600 shadow`;
    case "Cancelled":
      return `${base} bg-red-500 text-white border-red-600 shadow`;
    default:
      return base;
  }
};

const UserFoodOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateOrderedAt, setDateOrderedAt] = useState("");
  const [dateExpectTime, setDateExpectTime] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [now, setNow] = useState(Date.now());
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Get userId from JWT token
  const getUserIdFromToken = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return decoded.userId || decoded._id || decoded.id;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError("");
      const userId = getUserIdFromToken();
      if (!userId) {
        setError("User not logged in.");
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(
          `http://localhost:5000/api/food-orders/user/${userId}`
        );
        setOrders(res.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch orders.");
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  // Helper to format timer (hh:mm:ss)
  const getTimer = (expectTime) => {
    if (!expectTime) return "-";
    const diff = Math.max(0, new Date(expectTime) - now);
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Filtered and sorted orders
  const filteredOrders = React.useMemo(() => {
    let result = [...orders];

    // Status dropdown filter
    if (statusFilter) {
      result = result.filter(order => order.status === statusFilter);
    }

    // Search by orderId, item name
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(order =>
        (order.orderId && order.orderId.toLowerCase().includes(term)) ||
        order.items.some(item => (item.name || "").toLowerCase().includes(term))
      );
    }

    // Date search for orderedAt
    if (dateOrderedAt) {
      result = result.filter(order => {
        if (!order.orderedAt) return false;
        const orderDate = new Date(order.orderedAt);
        const selectedDate = new Date(dateOrderedAt);
        return (
          orderDate.getFullYear() === selectedDate.getFullYear() &&
          orderDate.getMonth() === selectedDate.getMonth() &&
          orderDate.getDate() === selectedDate.getDate()
        );
      });
    }

    // Date search for expectTime
    if (dateExpectTime) {
      result = result.filter(order => {
        if (!order.expectTime) return false;
        const expectDate = new Date(order.expectTime);
        const selectedDate = new Date(dateExpectTime);
        return (
          expectDate.getFullYear() === selectedDate.getFullYear() &&
          expectDate.getMonth() === selectedDate.getMonth() &&
          expectDate.getDate() === selectedDate.getDate()
        );
      });
    }

    // Sort by orderId descending
    result.sort((a, b) => {
      if (a.orderId < b.orderId) return 1;
      if (a.orderId > b.orderId) return -1;
      return 0;
    });

    return result;
  }, [orders, searchTerm, dateOrderedAt, dateExpectTime, statusFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Dashboard stats
  const totalPending = filteredOrders.filter(order => order.status === "Pending").length;
  const totalPreparing = filteredOrders.filter(order => order.status === "Preparing").length;
  const totalDelivered = filteredOrders.filter(order => order.status === "Delivered").length;
  const totalCancelled = filteredOrders.filter(order => order.status === "Cancelled").length;
  const totalOrders = filteredOrders.length;
  const totalAmount = filteredOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

  // Cancel order handler
  const handleCancelOrder = async () => {
    if (!selectedOrderId) return;
    try {
      await axios.put(
        `http://localhost:5000/api/food-orders/update-status/${selectedOrderId}`, // <-- use orderId here
        { status: "Cancelled by User" }
      );
      setOrders((prev) =>
        prev.map((order) =>
          order.orderId === selectedOrderId // <-- use orderId here
            ? { ...order, status: "Cancelled by User" }
            : order
        )
      );
      setCancelModalOpen(false);
      setSelectedOrderId(null);
    } catch (err) {
      console.error(err);
      alert("Failed to cancel order.");
    }
  };

  return (
    <div className="mx-auto mt-8 bg-white shadow rounded p-6">
      <h2 className="text-2xl font-bold mb-4">Your Food Orders</h2>
      {/* Dashboard Section */}
      <div className="flex flex-wrap justify-between gap-4 mb-6">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 rounded-lg p-4 min-w-[120px]">
          <div className="text-lg font-bold text-yellow-700">{totalPending}</div>
          <div className="text-sm text-yellow-800">Pending</div>
        </div>
        <div className="bg-blue-100 border-l-4 border-blue-500 rounded-lg p-4 min-w-[120px]">
          <div className="text-lg font-bold text-blue-700">{totalPreparing}</div>
          <div className="text-sm text-blue-800">Preparing</div>
        </div>
        <div className="bg-green-100 border-l-4 border-green-500 rounded-lg p-4 min-w-[120px]">
          <div className="text-lg font-bold text-green-700">{totalDelivered}</div>
          <div className="text-sm text-green-800">Delivered</div>
        </div>
        <div className="bg-red-100 border-l-4 border-red-500 rounded-lg p-4 min-w-[120px]">
          <div className="text-lg font-bold text-red-700">{totalCancelled}</div>
          <div className="text-sm text-red-800">Cancelled</div>
        </div>
        <div className="bg-gray-100 border-l-4 border-gray-500 rounded-lg p-4 min-w-[120px]">
          <div className="text-lg font-bold text-gray-700">{totalOrders}</div>
          <div className="text-sm text-gray-800">Total Orders</div>
        </div>
        <div className="bg-green-100 border-l-4 border-green-500 rounded-lg p-4 min-w-[120px]">
          <div className="text-lg font-bold text-green-700">{totalAmount} LKR</div>
          <div className="text-sm text-green-800">Total Amount</div>
        </div>
      </div>
      {/* Search Bar, Status Dropdown, and Date Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <input
          type="text"
          placeholder="Search Order ID, Item Name..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md w-full md:w-1/3"
        />
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Status:</label>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="">All</option>
            {statusOptions.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Ordered At:</label>
          <input
            type="date"
            value={dateOrderedAt}
            onChange={e => setDateOrderedAt(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          />
          {dateOrderedAt && (
            <button
              className="px-2 py-1 rounded bg-gray-200 text-gray-700 text-xs"
              onClick={() => setDateOrderedAt("")}
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Expected Time:</label>
          <input
            type="date"
            value={dateExpectTime}
            onChange={e => setDateExpectTime(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          />
          {dateExpectTime && (
            <button
              className="px-2 py-1 rounded bg-gray-200 text-gray-700 text-xs"
              onClick={() => setDateExpectTime("")}
            >
              Clear
            </button>
          )}
        </div>
      </div>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {!loading && !error && filteredOrders.length === 0 && (
        <div className="text-gray-500 text-center py-8">No orders found.</div>
      )}
      {!loading && !error && filteredOrders.length > 0 && (
        <div>
          <div className="flex flex-col gap-2">
            {paginatedOrders.map(order => (
              <div
                key={order._id}
                className="rounded-lg shadow-md p-4 mb-4 w-full overflow-hidden bg-white"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Status & Order ID */}
                  <span className="font-bold text-blue-700">
                    Order ID: {order.orderId}
                  </span>
                  {/* Only show current status as a button */}
                  <div className="flex justify-start md:justify-end items-center gap-2">
                    <span className={getStatusStyles(order.status)}>
                      {order.status}
                    </span>
                    {order.status === "Pending" && (
                      <button
                        className="ml-2 px-3 py-1 rounded bg-red-500 text-white text-xs font-semibold shadow hover:bg-red-600 transition"
                        onClick={() => {
                          setSelectedOrderId(order.orderId);
                          setCancelModalOpen(true);
                        }}
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                  {/* Left: Order Details */}
                  <div>
                    <div className="mb-1">
                      <span className="font-semibold">Ordered At:</span>{" "}
                      {order.orderedAt
                        ? new Date(order.orderedAt).toLocaleString()
                        : "-"}
                    </div>
                    <div className="mb-1">
                      <span className="font-semibold">Expect Time:</span>{" "}
                      {order.expectTime
                        ? new Date(order.expectTime).toLocaleString()
                        : "-"}
                    </div>
                    <div className="mb-1">
                      <span className="font-semibold">Total:</span>{" "}
                      {order.totalPrice} LKR
                    </div>
                    {order.specialRequest && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-semibold">Special Request:</span> {order.specialRequest}
                      </div>
                    )}
                  </div>
                  {/* Right: Items */}
                  <div>
                    <table className="w-full bg-white shadow-md rounded-lg overflow-hidden ">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="py-2 px-4 text-left text-xs">Name</th>
                          <th className="py-2 px-4 text-left text-xs">Portion</th>
                          <th className="py-2 px-4 text-right text-xs">Quantity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item, idx) => (
                          <tr key={idx}>
                            <td className="py-1 px-2">{item.name}</td>
                            <td className="py-1 px-2">{item.portion || "Standard"}</td>
                            <td className="py-1 px-2 text-right">{item.quantity}</td>
                          </tr>
                        ))}
                        <tr>
                          <td colSpan={2} className="py-1 px-2 text-right font-semibold">
                            Total
                          </td>
                          <td className="py-1 px-2 text-right font-bold text-blue-700">
                            {order.totalPrice} LKR
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Pagination Controls (ReusableTable style) */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 bg-white border-t border-gray-300 rounded-b-lg gap-4 mt-4">
              {/* Results Info */}
              <div className="flex items-center text-sm text-gray-700">
                <span>
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredOrders.length)} of {filteredOrders.length} results
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
        </div>
      )}

      {/* Cancel Order Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onRequestClose={() => setCancelModalOpen(false)}
        title="Cancel Order"
        content={`Are you sure you want to cancel order ${selectedOrderId}?`}
        onConfirm={handleCancelOrder}
        confirmText="Yes, Cancel Order"
        cancelText="No, Keep Order"
      />
    </div>
  );
};

export default UserFoodOrders;