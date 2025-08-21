// ReusableTable.js
import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Search, Filter } from 'lucide-react';

const ReusableTable = ({ 
  columns, 
  data,
  searchable = true,
  sortable = true,
  filterable = false,
  pagination = false,
  pageSize = 10,
  className = '',
  headerClassName = '',
  rowClassName = '',
  cellClassName = '',
  striped = true,
  hover = true,
  compact = false,
  loading = false,
  emptyMessage = 'No data available',
  onRowClick = null
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({});

  // Handle sorting
  const handleSort = (key) => {
    if (!sortable) return;
    
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Handle filtering
  const handleFilter = (columnKey, value) => {
    setFilters(prev => ({
      ...prev,
      [columnKey]: value
    }));
    setCurrentPage(1);
  };

  // Process data with search, filter, and sort
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply search
    if (searchable && searchTerm) {
      result = result.filter(item =>
        columns.some(column => {
          const value = item[column.key];
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Apply filters
    Object.entries(filters).forEach(([key, filterValue]) => {
      if (filterValue) {
        result = result.filter(item => {
          const value = item[key];
          return String(value).toLowerCase().includes(filterValue.toLowerCase());
        });
      }
    });

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, sortConfig, filters, columns, searchable]);

  // Pagination logic
  const totalPages = Math.ceil(processedData.length / pageSize);
  const paginatedData = pagination
    ? processedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : processedData;

  // Loading skeleton
  if (loading) {
    return (
      <div className={`w-full ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        {searchable && (
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}
        
        {filterable && (
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {Object.values(filters).filter(Boolean).length} filters active
            </span>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 rounded-lg">
          <thead className={`bg-gray-200 ${headerClassName}`}>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`
                    px-4 py-2 text-left font-semibold border-b border-gray-300
                    ${sortable && col.sortable !== false ? 'cursor-pointer hover:bg-gray-300' : ''}
                    ${compact ? 'px-2 py-1' : ''}
                  `}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{col.header}</span>
                    {sortable && col.sortable !== false && (
                      <div className="flex flex-col">
                        <ChevronUp
                          className={`w-3 h-3 ${
                            sortConfig.key === col.key && sortConfig.direction === 'asc'
                              ? 'text-blue-600'
                              : 'text-gray-400'
                          }`}
                        />
                        <ChevronDown
                          className={`w-3 h-3 -mt-1 ${
                            sortConfig.key === col.key && sortConfig.direction === 'desc'
                              ? 'text-blue-600'
                              : 'text-gray-400'
                          }`}
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Column Filter */}
                  {filterable && col.filterable !== false && (
                    <input
                      type="text"
                      placeholder={`Filter ${col.header}`}
                      value={filters[col.key] || ''}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleFilter(col.key, e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
                    />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr 
                  key={row._id || idx} 
                  className={`
                    ${striped && idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                    ${hover ? 'hover:bg-gray-100' : ''}
                    ${onRowClick ? 'cursor-pointer' : ''}
                    ${rowClassName}
                  `}
                  onClick={() => onRowClick && onRowClick(row, idx)}
                >
                  {columns.map(col => (
                    <td 
                      key={col.key} 
                      className={`
                        px-4 py-2 border-b border-gray-300
                        ${compact ? 'px-2 py-1' : ''}
                        ${cellClassName}
                      `}
                    >
                      {col.render
                        ? col.render(row[col.key], row)
                        : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-300 rounded-b-lg">
          <div className="flex items-center text-sm text-gray-700">
            <span>
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, processedData.length)} of {processedData.length} results
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const pageNum = Math.max(1, currentPage - 2) + i;
              if (pageNum > totalPages) return null;
              
              return (
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
              );
            })}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReusableTable;