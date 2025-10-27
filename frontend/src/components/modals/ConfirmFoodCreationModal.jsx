import React from 'react';
import Modal from '../common/Modal';

const ConfirmFoodCreationModal = ({ isOpen, onClose, onConfirm, foodData, loading }) => {
  return (
    <Modal isVisible={isOpen} onClose={onClose} width="max-w-2xl min-w-1/3">
      <div className="w-full">
        <h2 className="text-2xl font-semibold text-center mb-4">Confirm Food Creation</h2>
        <p className="text-center text-gray-600 mb-6">Please review the food details before creating</p>

        <div className="space-y-4 bg-gray-50 p-4 rounded-lg">

          <div className="flex flex-col md:flex-row gap-4">
            {/* Food Code */}
            <div className="flex-1 border-l-4 border-green-500 pl-4">
              <h4 className="text-sm font-medium text-gray-700">Food Code</h4>
              <p className="text-lg font-mono">{foodData.foodCode || 'Not generated'}</p>
            </div>

            {/* Food Name */}
            <div className="flex-1 border-l-4 border-purple-500 pl-4">
              <h4 className="text-sm font-medium text-gray-700">Food Name</h4>
              <p className="text-lg font-semibold">{foodData.name || 'Not specified'}</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            {/* Category */}
            <div className="flex-1 border-l-4 border-orange-500 pl-4">
              <h4 className="text-sm font-medium text-gray-700">Category</h4>
              <p className="text-lg capitalize">{foodData.category || 'Not specified'}</p>
            </div>

            {/* Availability Status */}
            <div className="flex-1 border-l-4 border-yellow-500 pl-4">
              <h4 className="text-sm font-medium text-gray-700">Status</h4>
              <span className={`inline-block px-3 py-1 text-sm rounded-full ${
                foodData.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {foodData.isAvailable ? 'Available' : 'Unavailable'}
              </span>
            </div>
          </div>

          {/* Description */}
          {foodData.description && (
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="text-sm font-medium text-gray-700">Description</h4>
              <p className="text-base text-gray-600">{foodData.description}</p>
            </div>
          )}

          {/* Available On */}
          {foodData.availableOn && foodData.availableOn.length > 0 && (
            <div className="border-l-4 border-indigo-500 pl-4">
              <h4 className="text-sm font-medium text-gray-700">Available On</h4>
              <div className="flex flex-wrap gap-2 mt-2">
                {foodData.availableOn.map((time, idx) => (
                  <span key={idx} className="text-sm bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full">
                    {time}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Portions & Prices */}
          {foodData.portions && foodData.portions.length > 0 ? (
            <div className="border-l-4 border-teal-500 pl-4">
              <h4 className="text-sm font-medium text-gray-700">Portions & Prices</h4>
              <div className="flex flex-wrap gap-3 mt-2">
                {foodData.portions.map((portion, idx) => (
                  <div key={idx} className="bg-white border rounded-lg px-3 py-2">
                    <span className="text-sm font-medium text-gray-700">{portion.name}</span>
                    <span className="text-base font-semibold text-gray-900 ml-2">
                      LKR {parseFloat(portion.price).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Default Price */
            <div className="border-l-4 border-teal-500 pl-4">
              <h4 className="text-sm font-medium text-gray-700">Price</h4>
              <p className="text-lg font-semibold">
                LKR {foodData.price ? parseFloat(foodData.price).toFixed(2) : '0.00'}
              </p>
            </div>
          )}

          {/* Images */}
          {foodData.images && foodData.images.length > 0 && (
            <div className="border-l-4 border-pink-500 pl-4">
              <h4 className="text-sm font-medium text-gray-700">Images</h4>
              <div className="flex gap-3 mt-2 flex-wrap">
                {foodData.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Food ${idx + 1}`}
                    className="h-20 w-20 object-cover rounded shadow"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end mt-6">
          <button
            type="button"
            className="px-6 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </span>
            ) : (
              'Confirm & Create'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmFoodCreationModal;