import React, { useRef, useState } from "react";

const UserFaceRegistration = () => {
  const videoRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState("");

  // Start camera
  const startCamera = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreaming(true);
      }
    } catch (err) {
        console.error("Error accessing camera:", err);
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

  // Submit handler (replace with your backend logic)
  const handleSubmit = async () => {
    if (photos.length < 5) {
      setError("Please capture 5 photos.");
      return;
    }
    // TODO: Send photos to backend for registration
    alert("Face registration submitted!");
    stopCamera();
    setPhotos([]);
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white shadow rounded p-6">
      <h2 className="text-2xl font-bold mb-4">Face Registration</h2>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <div className="flex flex-col items-center">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="rounded shadow mb-4"
          width={320}
          height={240}
          style={{ background: "#222" }}
        />
        <div className="flex gap-4 mb-4">
          {!streaming ? (
            <button
              onClick={startCamera}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Start Camera
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700"
            >
              Stop Camera
            </button>
          )}
          <button
            onClick={capturePhoto}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            disabled={!streaming || photos.length >= 5}
          >
            Capture Photo ({photos.length}/5)
          </button>
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
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          disabled={photos.length < 5}
        >
          Submit Registration
        </button>
      </div>
    </div>
  );
};

export default UserFaceRegistration;