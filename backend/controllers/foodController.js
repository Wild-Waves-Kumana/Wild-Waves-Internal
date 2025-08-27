import Food from '../models/food.js';

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
      images, // <-- Accept images array
    } = req.body;

    if (!companyId) {
      return res.status(400).json({ message: "companyId is required" });
    }

    const foodData = {
      name,
      description,
      category,
      isAvailable,
      companyId,
      availableOn: Array.isArray(availableOn) ? availableOn : [],
      portions: Array.isArray(portions) ? portions : [],
      images: Array.isArray(images) ? images : [], // <-- Store as array
    };

    // If no portions, set price; if portions exist, ignore price
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

// Get all food items
export const getFoods = async (req, res) => {
  try {
    const foods = await Food.find();
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