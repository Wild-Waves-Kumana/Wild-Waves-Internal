import express from "express";
import { createFoodOrder, getFoodOrdersByCompany, getFoodOrderByUser, updateFoodOrderStatus, getAllFoodOrders } from "../controllers/foodOrderController.js";
const router = express.Router();

router.post("/create", createFoodOrder);
router.get("/company/:companyId", getFoodOrdersByCompany);
router.get("/user/:userId", getFoodOrderByUser);
router.put("/update-status/:orderId", updateFoodOrderStatus);
router.get("/all", getAllFoodOrders);

export default router;