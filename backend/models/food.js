import mongoose from 'mongoose';

const portionSchema = new mongoose.Schema({
  name: String,
  price: Number,
}, { _id: false });

const foodSchema = new mongoose.Schema({
  foodCode: { type: String, required: true, unique: true },
  name: String,
  description: String,
  price: Number, // Default price if no portions
  category: { type: String, enum: ["Main", "Dessert", "Beverage", "Snack"] },
  isAvailable: { type: Boolean, default: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
  availableOn: [{ type: String }],
  portions: [portionSchema], // Array of portions with name and price
  images: [{ type: String }], // <-- Array of Cloudinary image URLs
});

export default mongoose.model("Food", foodSchema);
