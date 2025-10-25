import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Modal from '../../components/common/Modal';

const CreateVillaModal = ({ isOpen, onClose, onCreated }) => {
  const [villaId, setVillaId] = useState('');
  const [villaName, setVillaName] = useState('');
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
      console.log('Fetching next villa ID...'); // DEBUG
      const res = await axios.get('/api/villas/next-id');
      console.log('Response:', res.data); // DEBUG
      if (res.data?.nextVillaId) {
        setVillaId(res.data.nextVillaId);
        console.log('Villa ID set to:', res.data.nextVillaId); // DEBUG
      } else {
        console.log('No nextVillaId in response'); // DEBUG
      }
    } catch (err) {
      console.error('Failed to fetch next villa id', err);
      console.error('Error response:', err.response); // DEBUG
    } finally {
      setIdLoading(false);
    }
  };

  // fetch next id when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchNextVillaId();
      setVillaName('');
      setMessage('');
    }
  }, [isOpen]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await axios.post('/api/villas/create', {
        villaId,
        villaName,
        adminId,
      });
      setMessage('Villa created successfully.');
      // notify parent
      if (onCreated) onCreated(res.data.villa);
      // reset and close
      setVillaId('');
      setVillaName('');
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

          <input
            type="text"
            placeholder="Villa Name"
            value={villaName}
            onChange={(e) => setVillaName(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring"
          />
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
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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