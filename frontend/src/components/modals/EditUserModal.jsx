import React from "react";
import Modal from "../common/Modal";

const EditUserModal = ({
  isVisible,
  onClose,
  editForm,
  handleEditChange,
  handleEditSubmit,
  villas = [],
}) => {
  return (
    <Modal isVisible={isVisible} onClose={onClose} width="w-2/5">
      <h3 className="text-xl font-bold mb-4">Edit User</h3>
      <form onSubmit={handleEditSubmit} className="space-y-3">
        <input
          type="text"
          name="username"
          value={editForm.username}
          onChange={handleEditChange}
          placeholder="Username"
          className="w-full border px-3 py-2 rounded"
        />
        <select
          name="villaId"
          value={editForm.villaId}
          onChange={handleEditChange}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="">Select Villa</option>
          {villas.map((villa) => (
            <option key={villa._id} value={villa._id}>
              {villa.villaName} ({villa.villaId})
            </option>
          ))}
        </select>
        <input
          type="password"
          name="password"
          value={editForm.password}
          onChange={handleEditChange}
          placeholder="New Password (leave blank to keep current)"
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="date"
          name="checkinDate"
          value={editForm.checkinDate}
          onChange={handleEditChange}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="date"
          name="checkoutDate"
          value={editForm.checkoutDate}
          onChange={handleEditChange}
          className="w-full border px-3 py-2 rounded"
        />
        <div className="flex items-center">
          <label className="mr-2 font-medium">Access:</label>
          <input
            type="checkbox"
            name="access"
            checked={!!editForm.access}
            onChange={handleEditChange}
            className="mr-2"
          />
          <span>{editForm.access ? "Enabled" : "Disabled"}</span>
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

export default EditUserModal;