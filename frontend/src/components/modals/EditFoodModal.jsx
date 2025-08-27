import React, { useState, useEffect, useCallback } from "react";
import Modal from "../common/Modal";
import ImageCropper from "../common/ImageCropper";

const categories = ["Main", "Dessert", "Beverage", "Snack"];
const availableOnOptions = ["Breakfast", "Lunch", "Dinner", "Teatime", "Anytime"];
const portionOptions = ["Small", "Medium", "Large"];

const cropAspectRatios = {
  Square: 1,
  Portrait: 3 / 4,
  Landscape: 4 / 3,
  Wide: 16 / 9,
};

const initialFormState = {
  name: "",
  description: "",
  price: "",
  category: categories[0],
  isAvailable: true,
  availableOn: [],
  portions: [],
  images: [],
};

const EditFoodModal = ({
  isVisible,
  onClose,
  food,
  onSave,
  loading: externalLoading,
}) => {
  const [form, setForm] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Cropping states
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [currentCropIdx, setCurrentCropIdx] = useState(0);

  // Populate form with food data when modal opens
  useEffect(() => {
    if (food && isVisible) {
      setForm({
        name: food.name || "",
        description: food.description || "",
        price: food.price || "",
        category: food.category || categories[0],
        isAvailable: food.isAvailable ?? true,
        availableOn: food.availableOn || [],
        portions: food.portions || [],
        images: food.images || [],
      });
      setError("");
      setSuccess("");
    }
  }, [food, isVisible]);

  // Handle input changes
  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      setForm((prev) => {
        if (name === "availableOn") {
          return {
            ...prev,
            availableOn: checked
              ? [...prev.availableOn, value]
              : prev.availableOn.filter((v) => v !== value),
          };
        }
        if (name.startsWith("portion-")) {
          const portionName = name.split("-")[1];
          const portions = prev.portions.filter((p) => p.name !== portionName);
          return {
            ...prev,
            portions:
              value !== ""
                ? [...portions, { name: portionName, price: value }]
                : portions,
          };
        }
        return {
          ...prev,
          [name]: type === "checkbox" ? checked : value,
        };
      });
    },
    []
  );

  // Handle portion checkbox (add/remove portion)
  const handlePortionCheck = useCallback((e) => {
    const { value, checked } = e.target;
    setForm((prev) => {
      let portions = prev.portions || [];
      if (checked && !portions.find((p) => p.name === value)) {
        portions = [...portions, { name: value, price: "" }];
      } else if (!checked) {
        portions = portions.filter((p) => p.name !== value);
      }
      return { ...prev, portions };
    });
  }, []);

  // Handle multiple image uploads with cropping
  const handleImageUpload = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setPendingFiles(files);
    setCurrentCropIdx(0);
    readAndCropNext(files, 0);
    // eslint-disable-next-line
  }, []);

  // Read file as data URL and open cropper
  const readAndCropNext = useCallback((files, idx) => {
    if (idx >= files.length) {
      setPendingFiles([]);
      setCurrentCropIdx(0);
      return;
    }
    const file = files[idx];
    const reader = new FileReader();
    reader.onload = () => {
      setCropImageSrc(reader.result);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
  }, []);

  // After cropping, upload to Cloudinary and continue with next file
  const handleCropComplete = useCallback(
    async (croppedImageBlob) => {
      setCropModalOpen(false);
      setUploading(true);
      setError("");
      try {
        const formData = new FormData();
        formData.append("file", croppedImageBlob);
        formData.append(
          "upload_preset",
          import.meta.env.VITE_APP_CLOUDINARY_UPLOAD_PRESET
        );

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );
        const data = await res.json();
        if (data.secure_url) {
          setForm((prev) => ({
            ...prev,
            images: [...prev.images, data.secure_url],
          }));
        } else {
          setError("Image upload failed.");
        }
      } catch {
        setError("Image upload failed.");
      }
      setUploading(false);

      // Continue cropping next file if any
      if (pendingFiles.length > 0) {
        const nextIdx = currentCropIdx + 1;
        if (nextIdx < pendingFiles.length) {
          setCurrentCropIdx(nextIdx);
          readAndCropNext(pendingFiles, nextIdx);
        } else {
          setPendingFiles([]);
          setCurrentCropIdx(0);
        }
      }
    },
    [pendingFiles, currentCropIdx, readAndCropNext]
  );

  // Cancel cropping
  const handleCropCancel = useCallback(() => {
    setCropModalOpen(false);
    setPendingFiles([]);
    setCurrentCropIdx(0);
  }, []);

  // Remove image from preview and form
  const handleRemoveImage = useCallback(
    (url) => {
      setForm((prev) => ({
        ...prev,
        images: prev.images.filter((img) => img !== url),
      }));
    },
    []
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");
    try {
      const payload = {
        ...form,
      };
      if (!form.portions || form.portions.length === 0) {
        payload.portions = [];
        payload.price = form.price;
      } else {
        payload.price = undefined;
      }
      // Call parent onSave handler
      await onSave(payload);
      setSuccess("Food item updated successfully!");
      onClose();
    } catch (err) {
      console.error("Update failed:", err);
      setError("Failed to update food item.");
    }
    setLoading(false);
  };

  return (
    <Modal isVisible={isVisible} onClose={onClose} width="max-w-3xl w-full">
      <h2 className="text-2xl font-bold mb-4">Edit Food Item</h2>
      {success && <div className="mb-4 text-green-600">{success}</div>}
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Left column */}
          <div className="flex flex-col gap-4">
            <div>
              <label className="block font-semibold mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={2}
                className="w-full border rounded px-3 py-2 resize-none"
                style={{ minHeight: 40, maxHeight: 60 }}
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Available On</label>
              <div className="flex flex-wrap gap-2">
                {availableOnOptions.map((option) => (
                  <label key={option} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="availableOn"
                      value={option}
                      checked={form.availableOn.includes(option)}
                      onChange={handleChange}
                      className="accent-blue-600"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                name="isAvailable"
                checked={form.isAvailable}
                onChange={handleChange}
                id="isAvailable"
                className="mr-2"
              />
              <label htmlFor="isAvailable" className="font-semibold">
                Available
              </label>
            </div>
          </div>
          {/* Right column */}
          <div className="flex flex-col gap-4">
            <div>
              <label className="block font-semibold mb-1">Portion & Prices</label>
              <div className="flex flex-col gap-2">
                {portionOptions.map((portion) => {
                  const portionObj = form.portions.find((p) => p.name === portion) || {};
                  return (
                    <div key={portion} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        value={portion}
                        checked={!!form.portions.find((p) => p.name === portion)}
                        onChange={handlePortionCheck}
                        id={`portion-check-${portion}`}
                      />
                      <label htmlFor={`portion-check-${portion}`} className="w-20">{portion}</label>
                      <input
                        type="number"
                        name={`portion-${portion}`}
                        value={portionObj.price || ""}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        placeholder="Price"
                        className="border rounded px-2 py-1 w-24"
                        disabled={!form.portions.find((p) => p.name === portion)}
                      />
                      <span className="text-gray-500">LKR</span>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Default Price if no portions */}
            {(!form.portions || form.portions.length === 0) && (
              <div>
                <label className="block font-semibold mb-1">Price (LKR)</label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            )}
            <div>
              <label className="block font-semibold mb-1">Food Photos</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={uploading || cropModalOpen}
                className="block"
              />
              {form.images.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {form.images.map((img, idx) => (
                    <div key={img} className="relative group">
                      <img
                        src={img}
                        alt={`Food ${idx + 1}`}
                        className="h-14 w-14 object-cover rounded shadow"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(img)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-80 hover:opacity-100"
                        title="Remove"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading || uploading || cropModalOpen || externalLoading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading || externalLoading ? "Saving..." : "Save Changes"}
        </button>
      </form>
      {/* Image Cropper Modal */}
      {cropModalOpen && cropImageSrc && (
        <ImageCropper
          imageSrc={cropImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatios={cropAspectRatios}
          cropShape="rect"
          title="Crop Food Image"
        />
      )}
    </Modal>
  );
};

export default EditFoodModal;