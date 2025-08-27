import express from "express";
import {
  createFood,
  getFoods,
  getFoodById,
  updateFood,
  deleteFood,
} from "../controllers/foodController.js";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();


router.post("/create", createFood);  // Create a new food item
router.get("/all", getFoods);  // Get all food items
router.get("/:id", getFoodById);  // Get a single food item by ID
router.put("/:id", updateFood);  // Update a food item
router.delete("/:id", deleteFood);  // Delete a food item



router.get("/cloudinary-test", async (req, res) => {
  try {
    const result = await cloudinary.api.ping();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Cloudinary config failed" });
  }
});

export default router;