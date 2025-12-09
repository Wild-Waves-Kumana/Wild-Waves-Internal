import React, { useState, useEffect } from "react";
import axios from "axios";
import { RefreshCcw } from "lucide-react";

// DiceBear avatar types for variety
const AVATAR_STYLES = [
  "croodles",
  "adventurer",
  "adventurer-neutral",
  "micah",
  "pixel-art",
  "pixel-art-neutral",
  "avataaars",
  "big-ears",
  "big-ears-neutral",
  "bottts",
  "croodles-neutral",
  "identicon",
  "initials",
  "miniavs",
  "open-peeps",
  "personas",
  "rings",
  "shapes"
];

const getDiceBearUrl = (style, seed) =>
  `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;

const RandomAvatar = ({ onSelect, disabled = false }) => {
  const [avatars, setAvatars] = useState([]);
  const [selected, setSelected] = useState("");
  const [uploading, setUploading] = useState(false);

  // Generate 4 avatars (can auto-select first)
  const generateAvatarsArray = () => {
    return Array(4)
      .fill(0)
      .map((_, idx) => {
        const style = AVATAR_STYLES[idx % AVATAR_STYLES.length];
        const seed = Math.random().toString(36).substring(2, 10);
        return getDiceBearUrl(style, seed);
      });
  };

  // Regenerate avatars; if autoSelectFirst true, select + upload first avatar
  const regenerateAvatars = async (autoSelectFirst = false) => {
    if (disabled) return;
    const newAvatars = generateAvatarsArray();
    setAvatars(newAvatars);

    if (autoSelectFirst && newAvatars[0]) {
      // Immediately select and upload first avatar
      try {
        await handleSelect(newAvatars[0]);
      } catch (err) {
        console.error(err);
        // handleSelect already logs errors
      }
    } else {
      setSelected("");
      if (onSelect) onSelect("");
    }
  };

  // Select avatar and upload to backend -> cloudinary
  const handleSelect = async (url) => {
    if (disabled) return;
    setSelected(url);
    setUploading(true);
    try {
      const res = await axios.post("/api/avatar/upload", { avatarUrl: url });
      if (onSelect) onSelect(res.data.url); // Pass Cloudinary URL to parent
    } catch (err) {
      if (onSelect) onSelect("");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  // Initial load: generate avatars and auto-select the first one
  useEffect(() => {
    regenerateAvatars(true);
    // eslint-disable-next-line
  }, []);

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="flex gap-4 mt-2 items-center">
        {avatars.map((url, idx) => (
          <img
            key={idx}
            src={url}
            alt={`Avatar ${idx + 1}`}
            className={`w-20 h-20 rounded-full shadow-lg cursor-pointer border-4 transition-all ${
              selected === url ? "border-blue-500" : "border-transparent"
            } ${disabled ? "opacity-60 pointer-events-none" : ""}`}
            onClick={() => !disabled && handleSelect(url)}
            style={{ opacity: uploading && selected === url ? 0.5 : 1 }}
          />
        ))}
        <button
          type="button"
          onClick={() => regenerateAvatars(false)}
          className={`ml-2 p-2 bg-gray-100 rounded-full hover:bg-blue-100 transition-colors ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          title="Regenerate Avatars"
          disabled={disabled}
        >
          <RefreshCcw size={20} className="text-blue-600" />
        </button>
      </div>
      {uploading && (
        <div className="mt-2 text-sm text-gray-500">Uploading avatar...</div>
      )}
    </div>
  );
};

export default RandomAvatar;
