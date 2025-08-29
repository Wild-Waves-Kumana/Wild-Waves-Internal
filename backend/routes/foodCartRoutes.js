import express from "express";
import { addToCart, getCartItems, editCartItems, updateCartStatus } from "../controllers/foodCartController.js";

const router = express.Router();

router.post("/add", addToCart);
router.get("/items/:userId", getCartItems);
router.put("/edit-cart", editCartItems);
router.put("/set-status", updateCartStatus); // expects userId and cartStatus in body

export default router;