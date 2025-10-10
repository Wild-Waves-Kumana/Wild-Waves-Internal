import React, { useState } from "react";
import Modal from "../common/Modal";

const EditAdminModal = ({
  isVisible,
  onClose,
  editForm,
  handleEditChange,
  handleEditSubmit,
  passwordError,
}) => {
  // Toggle: true = "I have current password", false = "Reset without current password"
  const [hasCurrentPassword, setHasCurrentPassword] = useState(true);

  // Reset toggle when modal opens/closes
  React.useEffect(() => {
    if (isVisible) setHasCurrentPassword(true);
  }, [isVisible]);

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
          <div className="flex items-center mb-2">
            <label className="font-semibold mr-3">Password Reset:</label>
            <span className="mr-2 text-sm">I have current password</span>
            <label className="inline-flex relative items-center cursor-pointer">
              <input
                type="checkbox"
                checked={hasCurrentPassword}
                onChange={() => setHasCurrentPassword((v) => !v)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 transition-all"></div>
              <div
                className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow transition-all ${
                  hasCurrentPassword ? "translate-x-5" : ""
                }`}
                style={{ transition: "transform 0.2s" }}
              ></div>
            </label>
          </div>

          {hasCurrentPassword ? (
            <>
              <label className="block font-semibold mb-1">Change Password</label>
              <input
                type="password"
                name="currentPassword"
                value={editForm.currentPassword}
                onChange={handleEditChange}
                placeholder="Current Password"
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
            </>
          ) : (
            <>
              <label className="block font-semibold mb-1">
                Reset Password (no current password)
              </label>
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
            </>
          )}
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