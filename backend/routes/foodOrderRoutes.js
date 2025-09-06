import express from "express";
import { createFoodOrder, getFoodOrdersByCompany } from "../controllers/foodOrderController.js";
const router = express.Router();

router.post("/create", createFoodOrder);
router.get("/all/:companyId", getFoodOrdersByCompany);

export default router;