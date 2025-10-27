import express from "express";
import {createFood, getFoods, getAllFoods, getFoodById, updateFood, deleteFood, getNextFoodCode} from "../controllers/foodController.js";

const router = express.Router();

router.post("/create", createFood);  // Create a new food item
router.get("/all", getFoods);  // Get all food items
router.get("/allfoods", getAllFoods);  // Get all food items without filtering
router.get("/next-food-code", getNextFoodCode);  // Get next available food code (MUST be before /:id)
router.get("/:id", getFoodById);  // Get a single food item by ID
router.put("/:id", updateFood);  // Update a food item
router.delete("/:id", deleteFood);  // Delete a food item

export default router;