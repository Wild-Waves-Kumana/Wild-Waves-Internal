import React from 'react';
import Modal from '../common/Modal';

const LogoutModal = ({ isVisible, onClose, onLogout }) => (
  <Modal isVisible={isVisible} onClose={onClose} width="w-full max-w-xs">
    <h2 className="text-xl font-bold mb-4">Confirm Logout</h2>
    <p className="mb-4">Are you sure you want to logout?</p>
    <div className="flex justify-center space-x-4">
      <button
        onClick={onClose}
        className="px-4 py-2 bg-gray-300 text-slate-800 dark:bg-slate-600 dark:text-slate-200 rounded-lg hover:bg-gray-400"
      >
        Cancel
      </button>
      <button
        onClick={onLogout}
        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  </Modal>
);

export default LogoutModal;