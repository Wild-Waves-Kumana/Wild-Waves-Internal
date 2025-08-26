import Food from '../models/food.js';

// Create a new food item
export const createFood = async (req, res) => {
  try {
    const { name, description, price, category, isAvailable } = req.body;
    const food = new Food({
      name,
      description,
      price,
      category,
      isAvailable,
    });
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
    const { name, description, price, category, isAvailable } = req.body;
    const food = await Food.findByIdAndUpdate(
      req.params.id,
      { name, description, price, category, isAvailable },
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