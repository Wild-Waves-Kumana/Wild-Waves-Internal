import FoodOrder from "../models/foodOrder.js";

// Helper to generate orderId: yyyymmdd-xxxx (xxxx = 0000+count for the day)
const generateOrderId = async () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const dateStr = `${yyyy}${mm}${dd}`;

  // Count orders for today
  const startOfDay = new Date(`${yyyy}-${mm}-${dd}T00:00:00.000Z`);
  const endOfDay = new Date(`${yyyy}-${mm}-${dd}T23:59:59.999Z`);
  const count = await FoodOrder.countDocuments({
    orderedAt: { $gte: startOfDay, $lte: endOfDay },
  });

  const orderNum = String(count).padStart(4, "0");
  return `${dateStr}-${orderNum}`;
};

// Create a new food order
export const createFoodOrder = async (req, res) => {
  try {
    const {
      userId,
      villaId,
      items,
      totalPrice,
      expectTime,
      status,
      specialRequest,
    } = req.body;

    // Basic validation
    if (!userId || !villaId || !items || !Array.isArray(items) || items.length === 0 || !totalPrice) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Generate unique orderId
    let orderId;
    let unique = false;
    let tryCount = 0;
    while (!unique && tryCount < 5) {
      orderId = await generateOrderId();
      // Check uniqueness
      const exists = await FoodOrder.findOne({ orderId });
      if (!exists) unique = true;
      else {
        // If exists, artificially increment count for next try
        tryCount++;
      }
    }
    if (!unique) {
      return res.status(500).json({ message: "Failed to generate unique orderId." });
    }

    const foodOrder = new FoodOrder({
      orderId,
      userId,
      villaId,
      items,
      totalPrice,
      expectTime,
      status,
      specialRequest,
    });

    const savedOrder = await foodOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error("Error creating food order:", error);
    res.status(500).json({ message: "Failed to create food order." });
  }
};