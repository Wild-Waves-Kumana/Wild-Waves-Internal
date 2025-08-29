import express from "express";
import { addToCart, getCartItems } from "../controllers/foodCartController.js";

const router = express.Router();

router.post("/add", addToCart);
router.get("/items/:userId", getCartItems);

export default router;