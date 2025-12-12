import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const TotalBookingsCalander = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState({});

  useEffect(() => {
    // Expanded dummy booking data with more dates
    const dummyBookings = {
      // December 2024
      '2024-12-05': 2,
      '2024-12-08': 4,
      '2024-12-10': 3,
      '2024-12-12': 1,
      '2024-12-15': 5,
      '2024-12-16': 2,
      '2024-12-18': 3,
      '2024-12-20': 6,
      '2024-12-22': 4,
      '2024-12-23': 2,
      '2024-12-24': 7,
      '2024-12-25': 8,
      '2024-12-26': 5,
      '2024-12-27': 3,
      '2024-12-28': 4,
      '2024-12-29': 2,
      '2024-12-30': 6,
      '2024-12-31': 9,
      
      // January 2025
      '2025-01-01': 10,
      '2025-01-02': 7,
      '2025-01-03': 5,
      '2025-01-05': 3,
      '2025-01-07': 2,
      '2025-01-10': 4,
      '2025-01-12': 3,
      '2025-01-14': 1,
      '2025-01-15': 5,
      '2025-01-17': 2,
      '2025-01-20': 4,
      '2025-01-22': 3,
      '2025-01-25': 6,
      '2025-01-27': 2,
      '2025-01-30': 3,
      
      // February 2025
      '2025-02-02': 2,
      '2025-02-05': 4,
      '2025-02-08': 3,
      '2025-02-10': 5,
      '2025-02-14': 8,
      '2025-02-15': 6,
      '2025-02-17': 2,
      '2025-02-20': 3,
      '2025-02-23': 4,
      '2025-02-25': 2,
      '2025-02-28': 5,

      // November 2025
      '2025-11-01': 3,
      '2025-11-03': 2,
      '2025-11-05': 4,
      '2025-11-07': 5,
      '2025-11-09': 3,
      '2025-11-11': 6,
      '2025-11-13': 2,
      '2025-11-15': 7,
      '2025-11-17': 4,
      '2025-11-19': 3,
      '2025-11-21': 5,
      '2025-11-23': 8,
      '2025-11-24': 9,
      '2025-11-25': 6,
      '2025-11-27': 5,
      '2025-11-28': 10,
      '2025-11-29': 7,
      '2025-11-30': 4,

      // December 2025
      '2025-12-01': 5,
      '2025-12-03': 3,
      '2025-12-05': 6,
      '2025-12-07': 4,
      '2025-12-10': 5,
      '2025-12-12': 7,
      '2025-12-14': 3,
      '2025-12-15': 8,
      '2025-12-17': 4,
      '2025-12-19': 6,
      '2025-12-20': 9,
      '2025-12-21': 5,
      '2025-12-22': 7,
      '2025-12-23': 10,
      '2025-12-24': 12,
      '2025-12-25': 15,
      '2025-12-26': 11,
      '2025-12-27': 8,
      '2025-12-28': 6,
      '2025-12-29': 9,
      '2025-12-30': 10,
      '2025-12-31': 14,

      // January 2026
      '2026-01-01': 13,
      '2026-01-02': 11,
      '2026-01-03': 9,
      '2026-01-04': 7,
      '2026-01-06': 5,
      '2026-01-08': 4,
      '2026-01-10': 6,
      '2026-01-12': 3,
      '2026-01-14': 5,
      '2026-01-16': 7,
      '2026-01-18': 4,
      '2026-01-20': 6,
      '2026-01-22': 3,
      '2026-01-24': 5,
      '2026-01-26': 8,
      '2026-01-28': 4,
      '2026-01-30': 6,

      // February 2026
      '2026-02-01': 4,
      '2026-02-03': 5,
      '2026-02-05': 3,
      '2026-02-07': 6,
      '2026-02-09': 4,
      '2026-02-11': 5,
      '2026-02-13': 7,
      '2026-02-14': 10,
      '2026-02-15': 8,
      '2026-02-16': 6,
      '2026-02-18': 4,
      '2026-02-20': 5,
      '2026-02-22': 3,
      '2026-02-24': 6,
      '2026-02-26': 4,
      '2026-02-28': 7,
    };
    setBookings(dummyBookings);
  }, []);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const formatDateKey = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const renderCalendarDays = () => {
    const days = [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Empty cells before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 bg-gray-50 rounded"></div>);
    }

    // Calendar days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = formatDateKey(year, month, day);
      const bookingCount = bookings[dateKey] || 0;
      const isToday =
        day === new Date().getDate() &&
        month === new Date().getMonth() &&
        year === new Date().getFullYear();

      days.push(
        <div
          key={day}
          className={`h-8 rounded border transition-all duration-200 ${
            bookingCount > 0
              ? 'bg-blue-50 border-blue-300 hover:bg-blue-100 cursor-pointer'
              : 'bg-white border-gray-200 hover:bg-gray-50'
          } ${isToday ? 'ring-1 ring-blue-500' : ''}`}
        >
          <div className="flex flex-col items-center justify-center h-full">
            <span
              className={`text-xs font-medium ${
                bookingCount > 0 ? 'text-blue-700' : 'text-gray-700'
              } ${isToday ? 'text-blue-600' : ''}`}
            >
              {day}
            </span>
            {bookingCount > 0 && (
              <span className="text-[10px] bg-blue-600 text-white px-1 rounded-full leading-none">
                {bookingCount}
              </span>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-800">Bookings</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={previousMonth}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Previous month"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div className="px-2 py-0.5 bg-blue-50 rounded border border-blue-200">
            <span className="text-xs font-semibold text-blue-700">{monthName}</span>
          </div>
          <button
            onClick={nextMonth}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Next month"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
          <div key={idx} className="text-center text-[10px] font-semibold text-gray-600 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">{renderCalendarDays()}</div>

      {/* Legend */}
      <div className="mt-2 pt-2 border-t border-gray-200">
        <div className="flex items-center justify-around text-[10px]">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-white border border-gray-200 rounded"></div>
            <span className="text-gray-600">None</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-50 border border-blue-300 rounded"></div>
            <span className="text-gray-600">Booked</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-white ring-1 ring-blue-500 rounded"></div>
            <span className="text-gray-600">Today</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalBookingsCalander;