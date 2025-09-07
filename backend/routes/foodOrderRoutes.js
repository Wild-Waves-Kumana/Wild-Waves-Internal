import express from "express";
import { createFoodOrder, getFoodOrdersByCompany, updateFoodOrderStatus } from "../controllers/foodOrderController.js";
const router = express.Router();

router.post("/create", createFoodOrder);
router.get("/all/:companyId", getFoodOrdersByCompany);
router.post("/update-status/:orderId", updateFoodOrderStatus);

export default router;