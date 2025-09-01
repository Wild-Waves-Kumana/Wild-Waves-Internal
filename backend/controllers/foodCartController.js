import FoodCart from "../models/foodCart.js";

// Create or update cart for a user (merge items with same foodId, portion, and price)
export const addToCart = async (req, res) => {
  try {
    const { userId, items } = req.body;
    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Invalid payload." });
    }

    // Find existing cart for the user (cartStatus: true means in-cart)
    let cart = await FoodCart.findOne({ userId, cartStatus: true });

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
        cartStatus: true, // explicitly set as in-cart
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

    // Only get carts with cartStatus: true (in-cart)
    const cart = await FoodCart.findOne({ userId, cartStatus: true })
      .populate("userId")
      .populate("items.foodId");

    if (!cart) {
      return res.status(200).json({
        items: [],
        user: null,
        itemTotalPrice: 0,
      });
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

// Edit the quantity or portion of a specific item in the user's cart
export const editCartItems = async (req, res) => {
  try {
    const { userId, foodId, oldPortion, oldPrice, quantity, newPortion, newPrice } = req.body;
    if (!userId || !foodId || oldPrice == null || quantity == null) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Normalize portions for comparison (treat undefined/null as empty string)
    const oldPortionNorm = oldPortion ?? "";
    const newPortionNorm = newPortion ?? oldPortionNorm;

    // Find the user's cart (cartStatus: true means in-cart)
    const cart = await FoodCart.findOne({ userId, cartStatus: true });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found." });
    }

    // Find the item in the cart by old portion and price
    const itemIdx = cart.items.findIndex(
      (i) =>
        String(i.foodId) === String(foodId) &&
        (i.portion ?? "") === oldPortionNorm &&
        i.price === oldPrice
    );

    if (itemIdx === -1) {
      return res.status(404).json({ message: "Item not found in cart." });
    }

    // If changing portion/price, check if an item with new portion/price already exists
    let targetPortion = newPortionNorm;
    let targetPrice = newPrice ?? oldPrice;

    if ((newPortion && newPortion !== oldPortion) || (newPrice != null && newPrice !== oldPrice)) {
      const existingIdx = cart.items.findIndex(
        (i, idx) =>
          idx !== itemIdx &&
          String(i.foodId) === String(foodId) &&
          (i.portion ?? "") === targetPortion &&
          i.price === targetPrice
      );
      if (existingIdx !== -1) {
        // If exists, increase its quantity and remove the old item
        cart.items[existingIdx].quantity += quantity;
        cart.items.splice(itemIdx, 1);
      } else {
        // Change the portion/price of the item
        cart.items[itemIdx].portion = targetPortion;
        cart.items[itemIdx].price = targetPrice;
        cart.items[itemIdx].quantity = quantity;
      }
    } else {
      // Only change quantity or remove if 0
      if (quantity > 0) {
        cart.items[itemIdx].quantity = quantity;
      } else {
        cart.items.splice(itemIdx, 1);
      }
    }

    // Recalculate total price
    cart.itemTotalPrice = cart.items.reduce(
      (total, i) => total + i.price * i.quantity,
      0
    );

  await cart.save();
  res.status(200).json({ message: "Cart item updated.", cart });
  } catch (error) {
    console.error("Error editing cart item quantity:", error);
    res.status(500).json({ message: "Failed to edit cart item." });
  }
};

// Update the cartStatus of a user's cart
export const updateCartStatus = async (req, res) => {
  try {
    const { userId, cartStatus } = req.body;
    if (!userId || typeof cartStatus !== "boolean") {
      return res.status(400).json({ message: "Missing or invalid fields." });
    }

    // Find the user's in-cart cart and update its status
    const cart = await FoodCart.findOneAndUpdate(
      { userId, cartStatus: true },
      { cartStatus },
      { new: true }
    );

    if (!cart) {
      return res.status(404).json({ message: "Cart not found." });
    }

    res.status(200).json({ message: "Cart status updated.", cart });
  } catch (error) {
    console.error("Error updating cart status:", error);
    res.status(500).json({ message: "Failed to update cart status." });
  }
};





