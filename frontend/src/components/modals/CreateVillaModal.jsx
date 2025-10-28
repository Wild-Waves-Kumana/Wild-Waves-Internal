import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Modal from '../../components/common/Modal';

const CreateVillaModal = ({ isOpen, onClose, onCreated }) => {
  const [villaId, setVillaId] = useState('');
  const [villaName, setVillaName] = useState('');
  const [villaLocation, setVillaLocation] = useState('');
  const [hasAC, setHasAC] = useState(false);
  const [basePriceWithAC, setBasePriceWithAC] = useState('');
  const [basePriceWithoutAC, setBasePriceWithoutAC] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [idLoading, setIdLoading] = useState(false);

  const token = localStorage.getItem('token');
  let adminId = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      adminId = decoded.id;
    } catch (err) {
      console.error('Invalid token:', err);
    }
  }

  const fetchNextVillaId = async () => {
    setIdLoading(true);
    try {
      const res = await axios.get('/api/villas/next-id');
      if (res.data?.nextVillaId) {
        setVillaId(res.data.nextVillaId);
      }
    } catch (err) {
      console.error('Failed to fetch next villa id', err);
    } finally {
      setIdLoading(false);
    }
  };

  // fetch next id when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchNextVillaId();
      setVillaName('');
      setVillaLocation('');
      setHasAC(false);
      setBasePriceWithAC('');
      setBasePriceWithoutAC('');
      setMessage('');
    }
  }, [isOpen]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const villaBasePrice = {};
      if (basePriceWithAC) villaBasePrice.withAC = parseFloat(basePriceWithAC);
      if (basePriceWithoutAC) villaBasePrice.withoutAC = parseFloat(basePriceWithoutAC);

      const res = await axios.post('/api/villas/create', {
        villaId,
        villaName,
        villaLocation,
        hasAC,
        villaBasePrice: Object.keys(villaBasePrice).length > 0 ? villaBasePrice : undefined,
        adminId,
      });
      setMessage('Villa created successfully.');
      // notify parent
      if (onCreated) onCreated(res.data.villa);
      // reset and close
      setVillaId('');
      setVillaName('');
      setVillaLocation('');
      setHasAC(false);
      setBasePriceWithAC('');
      setBasePriceWithoutAC('');
      setTimeout(() => {
        setMessage('');
        onClose();
      }, 700);
    } catch (err) {
      console.error('Failed to create villa:', err);
      setMessage(err.response?.data?.message || 'Failed to create villa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isVisible={isOpen} onClose={onClose} width="max-w-xl">
      <div className="w-full">
        <h2 className="text-2xl font-semibold text-center mb-4">Create Villa</h2>
        {message && <p className="text-center text-sm text-green-600 mb-3">{message}</p>}
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Villa ID</label>
            <div>
              <div className="w-full px-4 py-2 border rounded-md bg-gray-50 text-gray-700 flex items-center">
                {idLoading ? (
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Generating...
                  </div>
                ) : (
                  <span className="font-mono text-lg">{villaId}</span>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Next available villa id</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Villa Name</label>
            <input
              type="text"
              placeholder="Villa Name"
              value={villaName}
              onChange={(e) => setVillaName(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Villa Location (Optional)</label>
            <input
              type="text"
              placeholder="Enter location"
              value={villaLocation}
              onChange={(e) => setVillaLocation(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Air Conditioning</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={hasAC}
                onClick={() => setHasAC(!hasAC)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none ${
                  hasAC ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    hasAC ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <span className="font-medium select-none text-sm">
                {hasAC ? "Has AC" : "No AC"}
              </span>
            </div>
          </div>

          {/* Villa Base Price Section */}
          <div>
            <label className="block text-sm font-medium mb-2">Villa Base Price (Optional)</label>
            <div className="grid grid-cols-2 gap-4">
              {/* With AC Price */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">With AC</label>
                <div className="relative">
                  <input
                    type="number"
                    value={basePriceWithAC}
                    onChange={(e) => setBasePriceWithAC(e.target.value)}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-4 py-2 pr-16 border rounded-md focus:outline-none focus:ring"
                  />
                  <span className="absolute right-4 top-2.5 text-sm text-gray-500">LKR</span>
                </div>
              </div>

              {/* Without AC Price */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Without AC</label>
                <div className="relative">
                  <input
                    type="number"
                    value={basePriceWithoutAC}
                    onChange={(e) => setBasePriceWithoutAC(e.target.value)}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-4 py-2 pr-16 border rounded-md focus:outline-none focus:ring"
                  />
                  <span className="absolute right-4 top-2.5 text-sm text-gray-500">LKR</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Base price per night for entire villa</p>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              className="px-4 py-2 rounded border"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Villa'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CreateVillaModal;