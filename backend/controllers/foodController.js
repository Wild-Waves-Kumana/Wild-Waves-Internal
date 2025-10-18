import Food from '../models/food.js';

// Helper to generate foodCode based on category, incrementing by 1 for each category, starting at 001
const generateUniqueFoodCode = async (category) => {
  const prefixes = {
    Main: "MN",
    Dessert: "DT",
    Beverage: "BV",
    Snack: "SN",
  };
  const prefix = prefixes[category] || "FD";

  // Find the highest foodCode for this category
  const regex = new RegExp(`^${prefix}(\\d{3})$`);
  const latestFood = await Food.find({ foodCode: { $regex: regex } })
    .sort({ foodCode: -1 })
    .limit(1);

  let nextNumber = 1;
  if (latestFood.length > 0) {
    // Extract the numeric part and increment
    const match = latestFood[0].foodCode.match(regex);
    if (match && match[1]) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }
  const foodCode = `${prefix}${String(nextNumber).padStart(3, "0")}`;
  return foodCode;
};

// Create a new food item
export const createFood = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      isAvailable,
      companyId,
      availableOn,
      portions,
      images,
    } = req.body;

    if (!companyId) {
      return res.status(400).json({ message: "companyId is required" });
    }

    // Generate unique foodCode based on category
    const foodCode = await generateUniqueFoodCode(category);

    const foodData = {
      foodCode,
      name,
      description,
      category,
      isAvailable,
      companyId,
      availableOn: Array.isArray(availableOn) ? availableOn : [],
      portions: Array.isArray(portions) ? portions : [],
      images: Array.isArray(images) ? images : [],
    };

    if (!foodData.portions.length && price !== undefined) {
      foodData.price = price;
    } else {
      foodData.price = undefined;
    }

    const food = new Food(foodData);
    await food.save();
    res.status(201).json({ message: "Food item created successfully", food });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all food items (optionally filter by companyId)
export const getFoods = async (req, res) => {
  try {
    // GET /api/foods/all?companyId=xxx
    const { companyId } = req.query;
    let query = {};
    if (companyId) {
      query.companyId = companyId;
    }
    const foods = await Food.find(query);
    res.json(foods);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all foods (no filtering, for superadmin) - DO NOT populate from anything
export const getAllFoods = async (req, res) => {
  try {
    const foods = await Food.find({});
    res.json(foods);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a single food item by ID
export const getFoodById = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) return res.status(404).json({ message: "Food not found" });
    res.json(food);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a food item
export const updateFood = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      isAvailable,
      availableOn,
      portions,
      images,
    } = req.body;

    const food = await Food.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        category,
        isAvailable,
        availableOn: Array.isArray(availableOn) ? availableOn : [],
        portions: Array.isArray(portions) ? portions : [],
        images: Array.isArray(images) ? images : [],
      },
      { new: true, runValidators: true }
    );
    if (!food) return res.status(404).json({ message: "Food not found" });
    res.json({ message: "Food item updated successfully", food });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete a food item
export const deleteFood = async (req, res) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);
    if (!food) return res.status(404).json({ message: "Food not found" });
    res.json({ message: "Food item deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};