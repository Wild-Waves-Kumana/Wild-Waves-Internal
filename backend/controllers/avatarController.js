import express from "express";
import cloudinary from "../config/cloudinary.js";
import fetch from "node-fetch";

const router = express.Router();

export const uploadAvatar = async (req, res) => {
  try {
    const { avatarUrl } = req.body;
    if (!avatarUrl) {
      return res.status(400).json({ error: "No avatar URL provided" });
    }

    // Fetch SVG from DiceBear
    const response = await fetch(avatarUrl);
    const svgData = await response.text();

    // Upload SVG to Cloudinary
    const result = await cloudinary.uploader.upload_stream(
      {
        folder: "wildwaves/avatars",
        public_id: `avatar-${Date.now()}`,
        resource_type: "image",
        format: "svg",
      },
      (error, result) => {
        if (error) {
          console.error(error);
          return res.status(500).json({ error: "Avatar upload failed" });
        }
        res.json({ url: result.secure_url });
      }
    );

    // Write SVG data to the upload stream
    result.end(svgData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Avatar upload failed" });
  }
};

export default router;
