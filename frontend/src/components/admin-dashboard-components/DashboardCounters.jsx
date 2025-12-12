import React, { useState, useEffect } from 'react';
import { Utensils, TrendingUp, Calendar, Users, Home } from 'lucide-react';

const DashboardCounters = () => {
  const [foodOrderCount, setFoodOrderCount] = useState(0);
  const [currentMonth, setCurrentMonth] = useState('');
  const [loading, setLoading] = useState(true);
  const [monthlyBookedVillas, setMonthlyBookedVillas] = useState(0);
  

  useEffect(() => {
    const now = new Date();
    const monthLabel = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const dummyData = {
      foodOrderCount: 42,
      totalBookings: 12,
      revenue: 754320.5,
      monthlyUsers: 16,
      monthlyBookedVillas: 8,
      
    };

    const t = setTimeout(() => {
      setFoodOrderCount(dummyData.foodOrderCount);
      setMonthlyBookedVillas(dummyData.monthlyBookedVillas);
      setCurrentMonth(monthLabel);
      setLoading(false);
    }, 300);

    return () => clearTimeout(t);
  }, []);

  const cardBase = 'relative group bg-white rounded-md p-3 border shadow-sm transition-all duration-200';
  const smallMeta = 'text-xs text-gray-500';
  const titleClass = 'text-sm font-medium text-gray-600';
  const numberClass = 'text-2xl font-bold';

  return (
    <div className="w-full">
      {loading ? (
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="h-20 bg-gray-200 rounded-md" />
          <div className="h-20 bg-gray-200 rounded-md" />
          <div className="h-20 bg-gray-200 rounded-md" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {/* Food Orders */}
          <div className={`${cardBase} border-orange-200`}>
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-orange-50 rounded-md">
                <Utensils className="w-5 h-5 text-orange-600" />
              </div>
              <Calendar className="w-4 h-4 text-orange-400" />
            </div>
            <div className="space-y-0.5">
              <div className={titleClass}>Food Orders</div>
              <div className={`${numberClass} text-orange-600`}>{foodOrderCount}</div>
              <div className={smallMeta}>{currentMonth}</div>
            </div>
          </div>

          {/* Monthly Bookings */}
          <div className={`${cardBase} border-blue-200`}>
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-50 rounded-md">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="space-y-0.5">
              <div className={titleClass}>Monthly Bookings</div>
              <div className={`${numberClass} text-blue-600`}>128</div>
              <div className={smallMeta}>{currentMonth}</div>
            </div>
          </div>

          {/* New Users (Month) */}
          <div className={`${cardBase} border-teal-200`}>
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-teal-50 rounded-md">
                <Users className="w-5 h-5 text-teal-600" />
              </div>
            </div>
            <div className="space-y-0.5">
              <div className={titleClass}>New Users (Month)</div>
              <div className={`${numberClass} text-teal-600`}>16</div>
              <div className={smallMeta}>{currentMonth}</div>
            </div>
          </div>

          {/* Booked Villas */}
          <div className={`${cardBase} border-violet-200`}>
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-violet-50 rounded-md">
                <Home className="w-5 h-5 text-violet-600" />
              </div>
            </div>
            <div className="space-y-0.5">
              <div className={titleClass}>Booked Villas (Month)</div>
              <div className={`${numberClass} text-violet-600`}>{monthlyBookedVillas}</div>
              <div className={smallMeta + ' truncate'}>{currentMonth}</div>
              
            </div>
          </div>

          {/* Revenue */}
          <div className={`${cardBase} border-green-200`}>
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-50 rounded-md">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="space-y-0.5">
              <div className={titleClass}>Revenue</div>
              <div className={`${numberClass} text-green-600`}>LKR 754,320</div>
              <div className={smallMeta}>{currentMonth}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardCounters;