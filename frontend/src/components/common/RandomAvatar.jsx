import React, { useState } from "react";
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

const RandomAvatar = ({ onSelect }) => {
  const [avatars, setAvatars] = useState([]);
  const [selected, setSelected] = useState("");
  const [uploading, setUploading] = useState(false);

  // Generate 4 random avatars (frontend only)
  const regenerateAvatars = () => {
    const newAvatars = Array(4)
      .fill(0)
      .map((_, idx) => {
        const style = AVATAR_STYLES[idx % AVATAR_STYLES.length];
        const seed = Math.random().toString(36).substring(2, 10);
        return getDiceBearUrl(style, seed);
      });
    setAvatars(newAvatars);
    setSelected("");
    if (onSelect) onSelect(""); // Clear parent avatar
  };

  // Select avatar and upload instantly
  const handleSelect = async (url) => {
    setSelected(url);
    setUploading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/avatar/upload", { avatarUrl: url });
      if (onSelect) onSelect(res.data.url); // Pass Cloudinary URL to parent
    } catch (err) {
      if (onSelect) onSelect("");
      console.error(err);
    }
    setUploading(false);
  };

  // Initial load
  React.useEffect(() => {
    regenerateAvatars();
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
            }`}
            onClick={() => handleSelect(url)}
            style={{ opacity: uploading && selected === url ? 0.5 : 1 }}
          />
        ))}
        <button
          type="button"
          onClick={regenerateAvatars}
          className="ml-2 p-2 bg-gray-100 rounded-full hover:bg-blue-100 transition-colors"
          title="Regenerate Avatars"
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
