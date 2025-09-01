import React, { useRef, useState, useContext, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import { jwtDecode } from "jwt-decode";
import LoadingOverlay from "../components/common/LoadingOverlay";
import Modal from "../components/common/Modal";

const UserFaceRegistration = () => {
  const videoRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [faceRegistered, setFaceRegistered] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // <-- modal state
  const { username } = useContext(UserContext);

  // Get userId from token
  let userId = null;
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const decoded = jwtDecode(token);
      userId = decoded.id || decoded.userId || null;
    } catch {
      userId = null;
    }
  }

  // Fetch user faceRegistration status on mount
  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      try {
        const res = await fetch(`http://localhost:5000/api/users/${userId}`);
        if (res.ok) {
          const user = await res.json();
          if (user.faceRegistration) {
            setFaceRegistered(true);
            setSuccess("Face registration already completed successfully!");
          }
        }
      } catch (err) {
        console.error(err);
        // Optionally handle error
      }
    };
    fetchUser();
  }, [userId]);

  // Start camera
  const startCamera = async () => {
    setError("");
    setSuccess("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreaming(true);
      }
    } catch (err) {
      console.error(err);
      setError("Unable to access camera.");
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      setStreaming(false);
    }
  };

  // Capture photo
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 320;
    canvas.height = video.videoHeight || 240;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/png");
    setPhotos((prev) => (prev.length < 5 ? [...prev, dataUrl] : prev));
  };

  // Remove a photo
  const removePhoto = (idx) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  // Convert dataURL to File
  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  };

  // Submit handler
  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    if (photos.length < 5) {
      setError("Please capture 5 photos.");
      setLoading(false);
      return;
    }
    try {
      const formData = new FormData();
      photos.forEach((photo, idx) => {
        const file = dataURLtoFile(photo, `face_${idx + 1}.png`);
        formData.append("images", file);
      });

      const response = await fetch(
        "https://face-recognition-app-vnr6.onrender.com/register_face",
        {
          method: "POST",
          headers: {
            nic: username,
          },
          body: formData,
        }
      );

      if (response.ok) {
        setSuccess("Face registration submitted successfully!");
        setPhotos([]);
        stopCamera();
        setFaceRegistered(true);

        // Update user collection: set faceRegistration to true
        try {
          await fetch(`http://localhost:5000/api/users/${userId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ faceRegistration: true }),
          });
        } catch (err) {
          console.error(err);
        }
      } else {
        const resText = await response.text();
        setError("Face registration failed: " + resText);
      }
    } catch (err) {
      setError("Face registration failed: " + err.message);
    }
    setLoading(false);
  };

  // Delete face data handler
  const handleDeleteFaceData = async () => {
    setError("");
    setSuccess("");
    setDeleting(true);
    try {
      const response = await fetch(
        `https://face-recognition-app-vnr6.onrender.com/delete_user/${username}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        setSuccess("Face data deleted successfully.");
        setFaceRegistered(false);
        // Optionally update user collection: set faceRegistration to false
        try {
          await fetch(`http://localhost:5000/api/users/${userId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ faceRegistration: false }),
          });
        } catch (err) {
          console.error(err);
        }
      } else {
        const resText = await response.text();
        setError("Failed to delete face data: " + resText);
      }
    } catch (err) {
      setError("Failed to delete face data: " + err.message);
    }
    setDeleting(false);
    setShowDeleteModal(false);
  };

  return (
    <div className="mx-auto bg-white shadow rounded p-6">
      <LoadingOverlay
        isVisible={loading}
        message="Registering your face. Please wait..."
        variant="orbit"
        theme="blue"
      />
      <h2 className="text-2xl font-bold mb-2">Face Registration</h2>
      <div className="mb-2 text-cyan-700 font-semibold">
        Username: <span className="font-bold">{username}</span>
      </div>
      <div className="mb-4 text-gray-600 text-sm">
        User ID: <span className="font-mono">{userId || "N/A"}</span>
      </div>
      {faceRegistered ? (
        <div className="mb-4">
          <div className="text-green-600 text-lg font-semibold mb-4">
            Face registration already completed successfully!
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            disabled={deleting}
          >
            Delete Face Data
          </button>
          <Modal isVisible={showDeleteModal} onClose={() => setShowDeleteModal(false)} width="w-full max-w-xs">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="mb-4">Are you sure you want to delete your facial data? This action cannot be undone.</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 text-slate-800 rounded-lg hover:bg-gray-400"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteFaceData}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </Modal>
        </div>
      ) : (
        <>
          {error && <div className="mb-4 text-red-600">{error}</div>}
          {success && <div className="mb-4 text-green-600">{success}</div>}
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left: Camera and Previews */}
            <div className="flex-1 flex flex-col items-center">
              <div className="w-full aspect-video bg-black rounded shadow mb-4 flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover rounded"
                  style={{ background: "#222" }}
                />
              </div>
              <div className="flex gap-2 flex-wrap mb-4">
                {photos.map((photo, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={photo}
                      alt={`Face ${idx + 1}`}
                      className="w-24 h-24 object-cover rounded border"
                    />
                    <button
                      onClick={() => removePhoto(idx)}
                      className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
            {/* Right: Buttons */}
            <div className="flex flex-col gap-4 items-center w-full md:w-56">
              {!streaming ? (
                <button
                  onClick={startCamera}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Start Camera
                </button>
              ) : (
                <button
                  onClick={stopCamera}
                  className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700"
                >
                  Stop Camera
                </button>
              )}
              <button
                onClick={capturePhoto}
                className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                disabled={!streaming || photos.length >= 5}
              >
                Capture Photo ({photos.length}/5)
              </button>
              <button
                onClick={handleSubmit}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600"
                disabled={photos.length < 5}
              >
                Submit Registration
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserFaceRegistration;