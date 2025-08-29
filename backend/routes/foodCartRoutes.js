import express from "express";
import { addToCart, getCartItems, editCartItems, setCartStatus } from "../controllers/foodCartController.js";

const router = express.Router();

router.post("/add", addToCart);
router.get("/items/:userId", getCartItems);
router.put("/edit-cart", editCartItems);
router.put("/set-status/:cartId", setCartStatus);


export default router;