import React from "react";
import Modal from "../common/Modal";

const EditDoorModal = ({
  isVisible,
  onClose,
  editForm,
  setEditForm,
  handleEditChange,
  handleEditSubmit,
}) => {
  return (
    <Modal isVisible={isVisible} onClose={onClose} width="w-full max-w-md">
      <h2 className="text-xl font-bold mb-4">Edit Door</h2>
      <form onSubmit={handleEditSubmit} className="space-y-3">
        <input
          type="text"
          name="itemName"
          value={editForm.itemName}
          onChange={handleEditChange}
          placeholder="Item Name"
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="text"
          name="itemCode"
          value={editForm.itemCode}
          onChange={handleEditChange}
          placeholder="Item Code"
          className="w-full border px-3 py-2 rounded"
        />

        <label className="block font-medium">Status</label>
        <div className="flex gap-2 mb-2">
          <button
            type="button"
            className={`px-4 py-2 rounded border 
              ${editForm.status === true
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"}
              ${!editForm.access ? "opacity-50 cursor-not-allowed" : ""}
            `}
            onClick={() => editForm.access && setEditForm({ ...editForm, status: true })}
            disabled={!editForm.access}
          >
            ON
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded border 
              ${editForm.status === false
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"}
              ${!editForm.access ? "opacity-50 cursor-not-allowed" : ""}
            `}
            onClick={() => editForm.access && setEditForm({ ...editForm, status: false })}
            disabled={!editForm.access}
          >
            OFF
          </button>
        </div>

        <label className="block font-medium">Lock Status</label>
        <div className="flex gap-2 mb-2">
          <button
            type="button"
            className={`px-4 py-2 rounded border 
              ${editForm.lockStatus === true
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"}
              ${!editForm.access ? "opacity-50 cursor-not-allowed" : ""}
            `}
            onClick={() => editForm.access && setEditForm({ ...editForm, lockStatus: true })}
            disabled={!editForm.access}
          >
            Unlocked
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded border 
              ${editForm.lockStatus === false
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"}
              ${!editForm.access ? "opacity-50 cursor-not-allowed" : ""}
            `}
            onClick={() => editForm.access && setEditForm({ ...editForm, lockStatus: false })}
            disabled={!editForm.access}
          >
            Locked
          </button>
        </div>

        <label className="block font-medium">Access</label>
        <div className="flex gap-2 mb-2">
          <button
            type="button"
            className={`px-4 py-2 rounded border 
              ${editForm.access === true
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"}
            `}
            onClick={() => setEditForm({ ...editForm, access: true })}
          >
            Enabled
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded border 
              ${editForm.access === false
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100"}
            `}
            onClick={() => setEditForm({ ...editForm, access: false })}
          >
            Disabled
          </button>
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

export default EditDoorModal;