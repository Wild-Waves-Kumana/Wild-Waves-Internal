import React, { useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Modal from '../../components/common/Modal';

const CreateVillaModal = ({ isOpen, onClose, onCreated }) => {
  const [villaId, setVillaId] = useState('');
  const [villaName, setVillaName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

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
          <input
            type="text"
            placeholder="Villa ID"
            value={villaId}
            onChange={(e) => setVillaId(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring"
          />
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