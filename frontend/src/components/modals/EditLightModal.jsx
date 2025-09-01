import React from "react";
import Modal from "../common/Modal";

const EditLightModal = ({
  isVisible,
  onClose,
  editForm,
  setEditForm,
  handleEditChange,
  handleEditSubmit,
}) => {
  return (
    <Modal isVisible={isVisible} onClose={onClose} width="w-full max-w-md">
      <h2 className="text-xl font-bold mb-4">Edit Light</h2>
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

        <label className="block font-medium">Brightness</label>
        <div className="flex items-center gap-4 mb-2">
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            name="brightness"
            value={editForm.brightness}
            onChange={handleEditChange}
            className="flex-1"
            disabled={!editForm.access}
          />
          <span className="w-12 text-center">{editForm.brightness}%</span>
        </div>

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
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditLightModal;