import React from "react";
import Modal from "../common/Modal";

const EditAdminModal = ({
  isVisible,
  onClose,
  editForm,
  handleEditChange,
  handleEditSubmit,
  passwordError,
}) => {
  return (
    <Modal isVisible={isVisible} onClose={onClose} width="w-2/5">
      <h3 className="text-xl font-bold mb-4">Edit Admin</h3>
      <form onSubmit={handleEditSubmit} className="space-y-3">
        <input
          type="text"
          name="username"
          value={editForm.username}
          onChange={handleEditChange}
          placeholder="Username"
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="email"
          name="email"
          value={editForm.email}
          onChange={handleEditChange}
          placeholder="Email"
          className="w-full border px-3 py-2 rounded"
        />
        <div className="border-t pt-3 mt-3">
          <label className="block font-semibold mb-1">Change Password</label>
          <input
            type="password"
            name="oldPassword"
            value={editForm.oldPassword}
            onChange={handleEditChange}
            placeholder="Old Password"
            className="w-full border px-3 py-2 rounded mb-2"
            autoComplete="current-password"
          />
          <input
            type="password"
            name="newPassword"
            value={editForm.newPassword}
            onChange={handleEditChange}
            placeholder="New Password"
            className="w-full border px-3 py-2 rounded mb-2"
            autoComplete="new-password"
          />
          <input
            type="password"
            name="confirmPassword"
            value={editForm.confirmPassword}
            onChange={handleEditChange}
            placeholder="Confirm New Password"
            className="w-full border px-3 py-2 rounded"
            autoComplete="new-password"
          />
          {passwordError && (
            <div className="text-red-500 text-sm mt-1">{passwordError}</div>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Save
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditAdminModal;