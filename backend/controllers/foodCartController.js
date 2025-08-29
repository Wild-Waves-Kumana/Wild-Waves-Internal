import FoodCart from "../models/foodCart.js";

// Create or update cart for a user (merge items with same foodId, portion, and price)
export const addToCart = async (req, res) => {
  try {
    const { userId, items } = req.body;
    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Invalid payload." });
    }

    // Find existing cart for the user
    let cart = await FoodCart.findOne({ userId, cartStatus: "in-cart" });

    if (cart) {
      // For each new item, check if it matches an existing item (same foodId, portion, price)
      items.forEach((newItem) => {
        const existing = cart.items.find(
          (item) =>
            String(item.foodId) === String(newItem.foodId) &&
            item.portion === newItem.portion &&
            item.price === newItem.price
        );
        if (existing) {
          existing.quantity += newItem.quantity;
        } else {
          cart.items.push(newItem);
        }
      });
      // Recalculate total price
      cart.itemTotalPrice = cart.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
    } else {
      // If no cart exists, create a new one
      cart = new FoodCart({
        userId,
        items,
        itemTotalPrice: items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        ),
      });
    }

    await cart.save();
    res.status(200).json({ message: "Cart updated successfully", cart });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ message: "Failed to add to cart." });
  }
}

// Get only the items array in the cart, with foodId populated, and user/company populated
export const getCartItems = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: "Missing userId." });

    const cart = await FoodCart.findOne({ userId })
      .populate("userId")
      .populate("items.foodId");

    if (!cart) {
      return res.status(404).json({ message: "No cart found." });
    }

    res.status(200).json({
      items: cart.items,
      user: cart.userId,
      itemTotalPrice: cart.itemTotalPrice,
    });
  } catch (error) {
    console.error("Error fetching cart items:", error);
    res.status(500).json({ message: "Failed to fetch cart items." });
  }
};

