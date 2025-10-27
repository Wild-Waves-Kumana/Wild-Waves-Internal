import React, { useState, useEffect, useCallback, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import ImageCropper from "../../components/common/ImageCropper";
import ConfirmFoodCreationModal from "../../components/modals/ConfirmFoodCreationModal";
import Toaster from "../../components/common/Toaster";

const categories = ["Main", "Dessert", "Beverage", "Snack"];
const availableOnOptions = ["Breakfast", "Lunch", "Dinner", "Teatime", "Anytime"];
const portionOptions = ["Medium", "Large", "Family"];

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
  category: "",
  isAvailable: true,
  availableOn: [],
  portions: [],
  images: [],
  useDefaultPrice: false,
};

const CreateFoods = () => {
  const navigate = useNavigate();
  
  const [form, setForm] = useState(initialFormState);
  const [companyId, setCompanyId] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [generatedFoodCode, setGeneratedFoodCode] = useState("");
  const [foodCodeLoading, setFoodCodeLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [existingFoods, setExistingFoods] = useState([]);
  const [loadingFoods, setLoadingFoods] = useState(false);

  // Toast state
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  // Cropping states
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [currentCropIdx, setCurrentCropIdx] = useState(0);

  // new: file input ref for visible button
  const fileInputRef = useRef(null);

  // Get companyId from token or fetch admin
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const decoded = jwtDecode(token);
      if (decoded.companyId) {
        setCompanyId(decoded.companyId._id || decoded.companyId);
      } else if (decoded.id) {
        fetch(`/api/admin/${decoded.id}`)
          .then((res) => res.json())
          .then((admin) => {
            setCompanyId(admin.companyId?._id || admin.companyId);
          });
      }
    } catch {
      setCompanyId("");
    }
  }, []);

  // Fetch next available food code on component mount
  useEffect(() => {
    const fetchNextFoodCode = async () => {
      setFoodCodeLoading(true);
      try {
        const response = await fetch("/api/foods/next-food-code");
        const data = await response.json();
        setGeneratedFoodCode(data.nextFoodCode);
      } catch (err) {
        console.error("Failed to generate food code:", err);
        setGeneratedFoodCode("FD0001"); // Fallback
      } finally {
        setFoodCodeLoading(false);
      }
    };
    fetchNextFoodCode();
  }, []);

  // Fetch existing foods when category or companyId changes
  useEffect(() => {
    const fetchExistingFoods = async () => {
      if (!form.category || !companyId) {
        setExistingFoods([]);
        return;
      }
      setLoadingFoods(true);
      try {
        const response = await fetch(`/api/foods/all?companyId=${companyId}`);
        const data = await response.json();
        // Filter by selected category
        const filtered = data.filter(food => food.category === form.category);
        setExistingFoods(filtered);
      } catch (err) {
        console.error("Failed to fetch existing foods:", err);
        setExistingFoods([]);
      } finally {
        setLoadingFoods(false);
      }
    };
    fetchExistingFoods();
  }, [form.category, companyId]);

  // Handle input changes
  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      setForm((prev) => {
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

  // Handle category selection
  const handleCategorySelect = (category) => {
    setForm((prev) => ({ ...prev, category }));
  };

  // Handle available on selection
  const handleAvailableOnSelect = (option) => {
    setForm((prev) => {
      const currentAvailableOn = prev.availableOn || [];
      const specificOptions = ["Breakfast", "Lunch", "Dinner", "Teatime"];
      
      if (option === "Anytime") {
        // If clicking Anytime
        if (currentAvailableOn.includes("Anytime")) {
          // Deselect Anytime and all others
          return { ...prev, availableOn: [] };
        } else {
          // Select Anytime and all specific options
          return { ...prev, availableOn: [...specificOptions, "Anytime"] };
        }
      } else {
        // Clicking a specific option
        let newAvailableOn;
        if (currentAvailableOn.includes(option)) {
          // Deselect the option and Anytime
          newAvailableOn = currentAvailableOn.filter(o => o !== option && o !== "Anytime");
        } else {
          // Select the option
          newAvailableOn = [...currentAvailableOn.filter(o => o !== "Anytime"), option];
          
          // Check if all specific options are now selected
          const allSpecificSelected = specificOptions.every(opt => 
            newAvailableOn.includes(opt)
          );
          
          // If all are selected, also add Anytime
          if (allSpecificSelected) {
            newAvailableOn.push("Anytime");
          }
        }
        return { ...prev, availableOn: newAvailableOn };
      }
    });
  };

  // Handle portion selection
  const handlePortionSelect = (portion) => {
    setForm((prev) => {
      let portions = prev.portions || [];
      const exists = portions.find((p) => p.name === portion);
      
      if (exists) {
        // Remove the portion
        portions = portions.filter((p) => p.name !== portion);
      } else {
        // Add the portion with empty price and disable default price
        portions = [...portions, { name: portion, price: "" }];
      }
      return { 
        ...prev, 
        portions,
        useDefaultPrice: false // Disable default price when portion is selected
      };
    });
  };

  // Handle default price selection
  const handleDefaultPriceSelect = () => {
    setForm((prev) => ({
      ...prev,
      useDefaultPrice: !prev.useDefaultPrice,
      portions: prev.useDefaultPrice ? prev.portions : [] // Clear portions when enabling default price
    }));
  };

  // Handle multiple image uploads with cropping
  const handleImageUpload = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setPendingFiles(files);
    setCurrentCropIdx(0);
    readAndCropNext(files, 0);
    // reset input so same file(s) can be re-selected if needed
    if (fileInputRef.current) fileInputRef.current.value = "";
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
          setToast({
            show: true,
            message: "Image upload failed.",
            type: "error"
          });
        }
      } catch {
        setToast({
          show: true,
          message: "Image upload failed.",
            type: "error"
        });
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

  // utility to open hidden file input
  const openFileDialog = () => {
    if (uploading || cropModalOpen) return;
    fileInputRef.current?.click();
  };

  // set an image as cover (move to front)
  const handleSetCover = (url) => {
    setForm((prev) => {
      const images = [...prev.images];
      const idx = images.indexOf(url);
      if (idx > -1) {
        images.splice(idx, 1);
        images.unshift(url);
      }
      return { ...prev, images };
    });
  };

  // move image left/right in preview
  const handleMoveImage = (url, direction) => {
    setForm((prev) => {
      const images = [...prev.images];
      const idx = images.indexOf(url);
      if (idx === -1) return prev;
      const newIdx = direction === "left" ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= images.length) return prev;
      // swap
      const tmp = images[newIdx];
      images[newIdx] = images[idx];
      images[idx] = tmp;
      return { ...prev, images };
    });
  };

  // Remove image from preview and form (existing, kept)
  const handleRemoveImage = useCallback(
    (url) => {
      setForm((prev) => ({
        ...prev,
        images: prev.images.filter((img) => img !== url),
      }));
    },
    []
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.category) {
      setToast({
        show: true,
        message: "Please select a category.",
        type: "error"
      });
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmCreate = async () => {
    setLoading(true);
    try {
      const payload = {
        ...form,
        companyId,
      };
      if (form.useDefaultPrice || !form.portions || form.portions.length === 0) {
        payload.portions = [];
        payload.price = form.price;
      } else {
        payload.price = undefined;
      }
      const res = await fetch("/api/foods/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setShowConfirmModal(false);
        
        // Show success toast
        setToast({
          show: true,
          message: `Food item "${form.name}" created successfully!`,
          type: 'success'
        });
        
        // Wait for toast to be visible then navigate
        setTimeout(() => {
          navigate('/create-foods');
          // Force page refresh to reset state
          window.location.reload();
        }, 2000);
        
      } else {
        const data = await res.json();
        setShowConfirmModal(false);
        setToast({
          show: true,
          message: data.message || "Failed to create food item.",
          type: "error"
        });
      }
    } catch {
      setShowConfirmModal(false);
      setToast({
        show: true,
        message: "Failed to create food item.",
        type: "error"
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-2">
      

      <div className="h-full">
        <h2 className="text-2xl font-semibold mb-4">Create Food Item</h2>
        
        <div className="flex flex-col lg:flex-row gap-8 items-stretch">
          {/* Left Column - Form */}
          <div className="flex-3 bg-white p-6 rounded-lg shadow-md flex flex-col h-full">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-2">
                  <label className="block font-medium mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
                  />
                </div>

                {/* Food Code Display */}
                <div className="flex-1">
                  <label className="block font-medium mb-1">Food Code</label>
                  <div className="w-full px-4 py-2 border rounded-md bg-gray-50 text-gray-600 flex items-center">
                    {foodCodeLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        Generating...
                      </div>
                    ) : (
                      <span className="font-mono text-lg">{generatedFoodCode}</span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">
                    Next available food code
                  </p>
                </div>
              </div>

              {/* Category and Description Row */}
              <div className="flex flex-col md:flex-row gap-4">
                

                {/* Description */}
                <div className="flex-2">
                  <label className="block font-medium mb-1">Description</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring resize-none"
                  />
                </div>

                {/* Category Selection as 2x2 Grid */}
                <div className="flex-1">
                  <label className="block font-medium mb-4">Category</label>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        className={`px-4 py-2 rounded border text-sm ${
                          form.category === cat
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100'
                        }`}
                        onClick={() => handleCategorySelect(cat)}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Available On Section as Buttons */}
              <div>
                <label className="block font-medium mb-1">Available On</label>
                <div className="grid grid-cols-5 gap-2">
                  {availableOnOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`px-4 py-2 rounded border text-sm ${
                        form.availableOn.includes(option)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100'
                      }`}
                      onClick={() => handleAvailableOnSelect(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Portion & Prices Section */}
              <div>
                <label className="block font-medium mb-1">Portion & Prices</label>
                <div className="grid grid-cols-4 gap-3">
                  {/* Portion Options */}
                  {portionOptions.map((portion) => {
                    const portionObj = form.portions.find((p) => p.name === portion);
                    const isSelected = !!portionObj;
                    const isDisabled = form.useDefaultPrice;
                    
                    return (
                      <div
                        key={portion}
                        className={`border rounded-lg p-3 transition-colors ${
                          isDisabled
                            ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                            : isSelected
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-300 bg-gray-50'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => !isDisabled && handlePortionSelect(portion)}
                          disabled={isDisabled}
                          className={`w-full text-left font-medium text-sm mb-2 ${
                            isDisabled
                              ? 'text-gray-400 cursor-not-allowed'
                              : isSelected 
                              ? 'text-blue-700' 
                              : 'text-gray-700'
                          }`}
                        >
                          {portion}
                        </button>
                        <div className="relative">
                          <input
                            type="number"
                            name={`portion-${portion}`}
                            value={portionObj?.price || ""}
                            onChange={handleChange}
                            onClick={() => {
                              if (!isSelected && !isDisabled) {
                                handlePortionSelect(portion);
                              }
                            }}
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            disabled={isDisabled}
                            className={`w-full border rounded px-3 py-2 pr-12 text-sm ${
                              isDisabled
                                ? 'bg-gray-100 cursor-not-allowed text-gray-400'
                                : isSelected
                                ? 'border-blue-300 focus:border-blue-500 focus:ring focus:ring-blue-200'
                                : 'border-gray-300'
                            }`}
                          />
                          <span className={`absolute right-3 top-2.5 text-sm ${
                            isDisabled ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            LKR
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Default Price Option */}
                  <div
                    className={`border rounded-lg p-3 transition-colors ${
                      form.portions && form.portions.length > 0
                        ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                        : form.useDefaultPrice
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 bg-purple-50'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (!form.portions || form.portions.length === 0) {
                          handleDefaultPriceSelect();
                        }
                      }}
                      disabled={form.portions && form.portions.length > 0}
                      className={`w-full text-left font-bold text-md mb-2 ${
                        form.portions && form.portions.length > 0
                          ? 'text-gray-400 cursor-not-allowed'
                          : form.useDefaultPrice 
                          ? 'text-blue-700' 
                          : 'text-gray-700'
                      }`}
                    >
                      Price
                    </button>
                    <div className="relative">
                      <input
                        type="number"
                        name="price"
                        value={form.price}
                        onChange={handleChange}
                        onClick={() => {
                          if (!form.useDefaultPrice && (!form.portions || form.portions.length === 0)) {
                            handleDefaultPriceSelect();
                          }
                        }}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        disabled={form.portions && form.portions.length > 0}
                        required={form.useDefaultPrice && (!form.portions || form.portions.length === 0)}
                        className={`w-full border rounded px-3 py-2 pr-12 text-sm ${
                          form.portions && form.portions.length > 0
                            ? 'bg-gray-100 cursor-not-allowed text-gray-400'
                            : form.useDefaultPrice
                            ? 'border-blue-300 focus:border-blue-500 focus:ring focus:ring-blue-200'
                            : 'border-gray-300'
                        }`}
                      />
                      <span className={`absolute right-3 top-2.5 text-sm ${
                        form.portions && form.portions.length > 0 ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        LKR
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Multiple Image Upload Section with Cropper (updated) */}
              <div>
                <label className="block font-medium mb-1">Food Photos</label>

                <div className="flex items-center gap-3 mb-3">
                  <button
                    type="button"
                    onClick={openFileDialog}
                    disabled={uploading || cropModalOpen}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Photos
                  </button>

                  <span className="text-sm text-gray-500">You can add multiple photos. Crop will appear for each.</span>
                </div>

                {/* hidden file input (triggered by button) */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={uploading || cropModalOpen}
                  className="hidden"
                />

                {/* Previews */}
                {form.images.length > 0 && (
                  <div className="flex gap-3 mt-2 flex-wrap">
                    {form.images.map((img, idx) => (
                      <div key={img} className="relative group w-28 h-28 rounded overflow-hidden shadow">
                        <img
                          src={img}
                          alt={`Food ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />

                        {/* overlay toolbar */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex flex-col justify-between">
                          <div className="flex justify-between p-1">
                            <button
                              type="button"
                              onClick={() => handleSetCover(img)}
                              title={idx === 0 ? "Cover image" : "Set as cover"}
                              className={`text-xs px-2 py-0.5 rounded ${idx === 0 ? 'bg-yellow-300 text-black' : 'bg-white/80 text-black hover:opacity-90'}`}
                            >
                              {idx === 0 ? "Cover" : "Set"}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRemoveImage(img)}
                              title="Remove"
                              className="text-xs px-2 py-0.5 rounded bg-red-600 text-white"
                            >
                              ×
                            </button>
                          </div>

                          <div className="flex justify-between p-1">
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => handleMoveImage(img, "left")}
                                disabled={idx === 0}
                                title="Move left"
                                className={`text-xs px-2 py-0.5 rounded bg-white/90 ${idx === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                ‹
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveImage(img, "right")}
                                disabled={idx === form.images.length - 1}
                                title="Move right"
                                className={`text-xs px-2 py-0.5 rounded bg-white/90 ${idx === form.images.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                ›
                              </button>
                            </div>

                            <span className="text-xs text-white/90 px-1">{idx + 1}/{form.images.length}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={form.isAvailable}
                    onClick={() =>
                      setForm((prev) => ({ ...prev, isAvailable: !prev.isAvailable }))
                    }
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none ${
                      form.isAvailable ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                        form.isAvailable ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <span className="font-medium select-none">
                    {form.isAvailable ? "Available" : "Unavailable"}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !companyId || uploading || cropModalOpen}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Food
              </button>
            </form>
          </div>

          {/* Right Column - Existing Foods */}
          <div className="flex-2 bg-white px-4 py-8 rounded-lg shadow-md flex flex-col h-full overflow-y-auto min-w-0">
            {!form.category ? (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Instructions</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Enter food name</li>
                  <li>• Food code will be auto-generated</li>
                  <li>• Add description (optional)</li>
                  <li>• Select category to view existing foods</li>
                  <li>• Choose when the food is available</li>
                  <li>• Add portion sizes and prices, or set a default price</li>
                  <li>• Upload food photos (optional)</li>
                </ul>
              </div>
            ) : (
              <>
                <h3 className="text-md font-semibold mb-6 flex-shrink-0">
                  Existing {form.category} Foods
                </h3>
                
                {loadingFoods ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading foods...</span>
                  </div>
                ) : existingFoods.length > 0 ? (
                  <div className="space-y-2 flex-1 overflow-y-auto pr-2">
                    {existingFoods.map((food) => (
                      <div key={food._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg flex-shrink-0">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm text-gray-600">{food.foodCode}</span>
                            <span className={`px-2 py-1 text-xs rounded ${
                              food.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {food.isAvailable ? 'Available' : 'Unavailable'}
                            </span>
                          </div>
                          <p className="font-medium text-gray-800">{food.name}</p>
                          {food.portions && food.portions.length > 0 ? (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {food.portions.map((portion, idx) => (
                                <span key={idx} className="text-xs text-gray-600">
                                  {portion.name}: LKR {parseFloat(portion.price).toFixed(2)}
                                  {idx < food.portions.length - 1 ? ',' : ''}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-600">LKR {food.price ? parseFloat(food.price).toFixed(2) : '0.00'}</p>
                          )}
                        </div>
                        {food.images && food.images.length > 0 && (
                          <img
                            src={food.images[0]}
                            alt={food.name}
                            className="h-12 w-12 object-cover rounded ml-2"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <p>No {form.category} foods found</p>
                      <p className="text-sm mt-1">This will be the first one</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
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

      {/* Confirm Food Creation Modal */}
      <ConfirmFoodCreationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmCreate}
        foodData={{
          foodCode: generatedFoodCode,
          name: form.name,
          description: form.description,
          category: form.category,
          isAvailable: form.isAvailable,
          availableOn: form.availableOn,
          portions: form.portions,
          price: form.price,
          images: form.images,
        }}
        loading={loading}
      />

      {/* Toast Notification */}
      <Toaster
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
        duration={3000}
        position="top-right"
      />
      
    </div>
  );
};

export default CreateFoods;
