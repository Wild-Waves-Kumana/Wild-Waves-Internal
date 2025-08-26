import mongoose from 'mongoose';

const foodSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  category: { type: String, enum: ["Main", "Dessert", "Beverage", "Snack"] },
  isAvailable: { type: Boolean, default: true },
});

export default mongoose.model("Food", foodSchema);
