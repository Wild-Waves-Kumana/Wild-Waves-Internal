import React, { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import ReusableTable from '../common/ReusableTable';

const VillaList = ({ companyId: propCompanyId }) => {
  const [villas, setVillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const navigate = useNavigate();

  // Fetch user company ID from token
  const getUserCompanyId = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      const decoded = jwtDecode(token);
      const { id: adminId, role } = decoded;

      // Super admin can see all villas
      if (role === 'superadmin') {
        return 'ALL';
      }

      // Fetch admin to get companyId
      const { data: adminData } = await axios.get(`/api/admin/${adminId}`);
      return adminData.companyId?._id || adminData.companyId;
    } catch (err) {
      console.error('Error getting user company ID:', err);
      return null;
    }
  }, []);

  // Fetch villas based on company ID
  useEffect(() => {
    const fetchVillas = async () => {
      setLoading(true);
      try {
        // Determine which company ID to use
        let companyId = propCompanyId;
        if (!companyId) {
          companyId = await getUserCompanyId();
          if (!companyId) {
            setVillas([]);
            return;
          }
        }

        // Fetch all villas
        const { data: allVillas } = await axios.get('/api/villas/all');

        // Filter villas based on company ID
        if (companyId === 'ALL') {
          // Super admin sees all villas
          setVillas(allVillas);
        } else {
          // Filter by company ID
          const filteredVillas = allVillas.filter(
            villa =>
              villa.companyId === companyId ||
              villa.companyId?._id === companyId
          );
          setVillas(filteredVillas);
        }
      } catch (err) {
        console.error('Error fetching villas:', err);
        setVillas([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVillas();
  }, [propCompanyId, getUserCompanyId]);

  // Fetch all rooms once
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const { data } = await axios.get('/api/rooms/all');
        setRooms(data);
      } catch (err) {
        console.error('Error fetching rooms:', err);
        setRooms([]);
      }
    };

    fetchRooms();
  }, []);

  // Get room names for a specific villa
  const getVillaRooms = useCallback((villa) => {
    if (!villa.rooms || !Array.isArray(villa.rooms) || rooms.length === 0) {
      return [];
    }
    return rooms.filter(room => villa.rooms.includes(room._id));
  }, [rooms]);

  // Toggle dropdown handler
  const toggleDropdown = useCallback((villaId) => {
    setOpenDropdown(prev => prev === villaId ? null : villaId);
  }, []);

  // Navigate to villa profile
  const handleViewProfile = useCallback((villaId) => {
    navigate(`/villa-profile/${villaId}`);
  }, [navigate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (openDropdown) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openDropdown]);

  // Define table columns
  const columns = useMemo(() => [
    { 
      key: 'villaName', 
      header: 'Villa Name',
      render: (value) => (
        <span className="font-medium text-gray-800">{value || 'N/A'}</span>
      )
    },
    { 
      key: 'villaId', 
      header: 'Villa ID',
      render: (value) => (
        <span className="text-sm text-gray-600">{value || 'N/A'}</span>
      )
    },
    {
      key: 'rooms',
      header: 'Rooms',
      render: (_, row) => {
        const villaRooms = getVillaRooms(row);
        const isOpen = openDropdown === row._id;

        return (
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors duration-200 text-sm font-medium"
              onClick={() => toggleDropdown(row._id)}
            >
              {isOpen ? 'Hide Rooms' : `Show Rooms (${villaRooms.length})`}
            </button>
            {isOpen && (
              <div className="absolute z-10 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg w-56 max-h-60 overflow-auto">
                {villaRooms.length > 0 ? (
                  <ul className="divide-y divide-gray-100">
                    {villaRooms.map(room => (
                      <li 
                        key={room._id} 
                        className="px-4 py-3 hover:bg-gray-50 transition-colors duration-150"
                      >
                        <div className="text-sm font-medium text-gray-800">
                          {room.roomName}
                        </div>
                        {room.roomCode && (
                          <div className="text-xs text-gray-500 mt-1">
                            Code: {room.roomCode}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-3 text-center text-gray-400 text-sm">
                    No rooms assigned
                  </div>
                )}
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'profile',
      header: 'Actions',
      render: (_, row) => (
        <button
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors duration-200 text-sm font-medium shadow-sm hover:shadow-md"
          onClick={() => handleViewProfile(row._id)}
        >
          View Profile
        </button>
      )
    }
  ], [getVillaRooms, openDropdown, toggleDropdown, handleViewProfile]);

  return (
    <div className="mx-auto mt-6 bg-white shadow-lg rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Villas
          {villas.length > 0 && (
            <span className="ml-2 text-lg font-normal text-gray-500">
              ({villas.length} total)
            </span>
          )}
        </h2>
      </div>

      <ReusableTable
        columns={columns}
        data={villas}
        loading={loading}
        pagination={true}
        pageSize={10}
        emptyMessage="No villas found."
      />
    </div>
  );
};

export default VillaList;