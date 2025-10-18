import React, { useState, useMemo } from "react";
import Modal from "../common/Modal";
import axios from "axios";
import { Search } from 'lucide-react';

const statusOptions = ["Pending", "Preparing", "Delivered", "Cancelled", "Cancelled by User"];

const getStatusStyles = (status, selected) => {
  const base = "px-2 py-1 rounded text-xs border transition-all duration-150 font-semibold";
  if (!selected) return `${base} bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100`;
  switch (status) {
    case "Pending":
      return `${base} bg-blue-500 text-white border-blue-600 shadow`;
    case "Preparing":
      return `${base} bg-indigo-500 text-white border-indigo-600 shadow`;
    case "Delivered":
      return `${base} bg-green-500 text-white border-green-600 shadow`;
    case "Cancelled by User":
      return `${base} bg-yellow-500 text-white border-yellow-600 shadow`;
    case "Cancelled":
      return `${base} bg-red-500 text-white border-red-600 shadow`;
    default:
      return base;
  }
};

const SAFoodOrdersCardView = ({ 
  orders, 
  loading, 
  usernames, 
  villaNames, 
  updatingStatus, 
  setUpdatingStatus,
  setOrders
}) => {
  const [confirmModal, setConfirmModal] = useState({
    isVisible: false,
    orderId: null,
    newStatus: "",
  });
  
  // Search and pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dateFilter, setDateFilter] = useState("");

  

  // Handler to update order status - Show confirmation for ALL status changes in card mode
  const handleStatusUpdate = async (orderId, newStatus) => {
    setConfirmModal({ isVisible: true, orderId, newStatus });
  };

  // Actual update function
  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingStatus((prev) => ({ ...prev, [orderId]: true }));
    try {
      await axios.put(
        `/api/food-orders/update-status/${orderId}`,
        { status: newStatus }
      );
      // Refresh orders after update
      const res = await axios.get(`/api/food-orders/all`);
      setOrders(res.data || []);
    } catch {
      // Optionally show error
    }
    setUpdatingStatus((prev) => ({ ...prev, [orderId]: false }));
    setConfirmModal({ isVisible: false, orderId: null, newStatus: "" });
  };

  // Process data with search and date filter
  const processedData = useMemo(() => {
    let result = [...orders];

    // Apply search
    if (searchTerm) {
      result = result.filter(order =>
        order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usernames[order.userId]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        villaNames[order.villaId]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.specialRequest?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items?.some(item => 
          item.foodCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.foodId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply date filter
    if (dateFilter) {
      result = result.filter(order => {
        const orderDate = new Date(order.orderedAt);
        const selectedDate = new Date(dateFilter);
        return (
          orderDate.getFullYear() === selectedDate.getFullYear() &&
          orderDate.getMonth() === selectedDate.getMonth() &&
          orderDate.getDate() === selectedDate.getDate()
        );
      });
    }

    return result;
  }, [orders, searchTerm, dateFilter, usernames, villaNames]);

  // Pagination logic
  const totalPages = Math.ceil(processedData.length / pageSize);
  const paginatedData = processedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Handle page size change
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  // Generate page numbers for navigation
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    const start = Math.max(1, currentPage - delta);
    const end = Math.min(totalPages, currentPage + delta);

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    if (start > 1) {
      rangeWithDots.push(1);
      if (start > 2) {
        rangeWithDots.push('...');
      }
    }

    rangeWithDots.push(...range);

    if (end < totalPages) {
      if (end < totalPages - 1) {
        rangeWithDots.push('...');
      }
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search orders, users, villas, items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 font-semibold">Date:</label>
          <input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {dateFilter && (
            <button
              className="px-2 py-1 rounded bg-gray-200 text-gray-700 text-xs"
              onClick={() => setDateFilter("")}
            >
              Clear
            </button>
          )}
        </div>

        {/* Page Size Selector */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Show:</label>
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {[5, 10, 25, 50].map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          <span className="text-sm text-gray-600">entries</span>
        </div>
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-700">
          Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, processedData.length)} of {processedData.length} results
        </div>
      </div>

      {/* Cards */}
      {paginatedData.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No history orders found.</div>
      ) : (
        <div className="flex flex-col gap-2">
          {paginatedData.map((order) => (
            <div
              key={order._id}
              className="rounded-lg shadow-md p-4 mb-4 w-full overflow-hidden bg-white"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left: Order Details */}
                <div>
                  <span className="font-bold text-blue-700 text-lg mb-2 block">
                    Order ID: {order.orderId}
                  </span>
                  
                  {/* Status Update Buttons */}
                  <div className="flex gap-2 mb-3 flex-wrap">
                    {statusOptions.map((status) => (
                      <button
                        key={status}
                        className={getStatusStyles(status, order.status === status)}
                        disabled={updatingStatus[order.orderId]}
                        onClick={() => handleStatusUpdate(order.orderId, status)}
                      >
                        {status}
                      </button>
                    ))}
                  </div>

                  <div className="mb-1">
                    <span className="font-semibold">User:</span>{" "}
                    {order.userId && usernames[order.userId] ? (
                      <a
                        href={`/user-profile/${order.userId}`}
                        className="text-blue-600 hover:text-blue-800"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {usernames[order.userId]}
                      </a>
                    ) : (
                      "-"
                    )}
                  </div>
                  <div className="mb-1">
                    <span className="font-semibold">Villa:</span>{" "}
                    {order.villaId && villaNames[order.villaId] ? (
                      <a
                        href={`/villa-profile/${order.villaId}`}
                        className="text-blue-600 hover:text-blue-800"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {villaNames[order.villaId]}
                      </a>
                    ) : (
                      "-"
                    )}
                  </div>
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

                {/* Right: Items Table */}
                <div>
                  <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="py-2 px-4 text-left text-xs">Code</th>
                        <th className="py-2 px-4 text-left text-xs">Name</th>
                        <th className="py-2 px-4 text-right text-xs">Quantity</th>
                        <th className="py-2 px-4 text-right text-xs">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-1 px-2 font-mono text-xs text-gray-500">
                            {item.foodCode || "-"}
                          </td>
                          <td className="py-1 px-2">
                            {item.foodId?.name || item.name}
                          </td>
                          <td className="py-1 px-2 text-right">
                            {item.quantity}
                          </td>
                          <td className="py-1 px-2 text-right">
                            {item.quantity > 1
                              ? `${item.quantity} x ${item.price}`
                              : `${item.price}`}
                          </td>
                        </tr>
                      ))}
                      <tr>
                        <td colSpan={3} className="py-1 px-2 text-right font-semibold">
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
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 bg-white border-t border-gray-300 rounded-b-lg gap-4 mt-4">
          {/* Results Info */}
          <div className="flex items-center text-sm text-gray-700">
            <span>
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, processedData.length)} of {processedData.length} results
            </span>
          </div
          >
          
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
            {getPageNumbers().map((pageNum, index) => (
              pageNum === '...' ? (
                <span key={index} className="px-2 py-1 text-gray-500">...</span>
              ) : (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`
                    px-3 py-1 border rounded-md text-sm font-medium
                    ${currentPage === pageNum
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                    }
                  `}
                >
                  {pageNum}
                </button>
              )
            ))}
            
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

      {/* Confirmation Modal */}
      <Modal
        isVisible={confirmModal.isVisible}
        onClose={() => setConfirmModal({ isVisible: false, orderId: null, newStatus: "" })}
        width="max-w-sm"
      >
        <div className="text-center">
          <h3 className="text-lg font-bold mb-2">Confirm Status Change</h3>
          <p className="mb-4">
            Are you sure you want to change the status to <span className="font-semibold">{confirmModal.newStatus}</span>?
          </p>
          <div className="flex justify-center gap-4">
            <button
              className="px-4 py-2 rounded bg-blue-600 text-white font-semibold"
              onClick={() => updateOrderStatus(confirmModal.orderId, confirmModal.newStatus)}
            >
              Yes, Change
            </button>
            <button
              className="px-4 py-2 rounded bg-gray-300 text-gray-700 font-semibold"
              onClick={() => setConfirmModal({ isVisible: false, orderId: null, newStatus: "" })}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SAFoodOrdersCardView;