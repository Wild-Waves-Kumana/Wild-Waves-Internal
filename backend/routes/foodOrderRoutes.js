import express from "express";
import { createFoodOrder } from "../controllers/foodOrderController.js";
const router = express.Router();

router.post("/create", createFoodOrder);

export default router;