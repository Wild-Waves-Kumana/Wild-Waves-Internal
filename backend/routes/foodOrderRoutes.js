import express from "express";
import { createFoodOrder, getFoodOrdersByCompany, updateFoodOrderStatus, getFoodOrderByUser } from "../controllers/foodOrderController.js";
const router = express.Router();

router.post("/create", createFoodOrder);
router.get("/company/:companyId", getFoodOrdersByCompany);
router.get("/user/:userId", getFoodOrderByUser);
router.post("/update-status/:orderId", updateFoodOrderStatus);

export default router;