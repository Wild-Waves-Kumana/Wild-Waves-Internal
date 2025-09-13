import express from "express";
import { createFoodOrder, getFoodOrdersByCompany, getFoodOrderByUser, updateFoodOrderStatus } from "../controllers/foodOrderController.js";
const router = express.Router();

router.post("/create", createFoodOrder);
router.get("/company/:companyId", getFoodOrdersByCompany);
router.get("/user/:userId", getFoodOrderByUser);
router.put("/update-status/:orderId", updateFoodOrderStatus);

export default router;