import mongoose from "mongoose";

const foodOrderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true, required: true }, // <-- unique string
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  villaId: { type: mongoose.Schema.Types.ObjectId, ref: "Villa" },
  items: [
    {
      foodId: { type: mongoose.Schema.Types.ObjectId, ref: "Food" },
      name: String, // snapshot of food name at time of order
      portion: String, // e.g., Small, Medium, Large
      quantity: { type: Number, required: true },
      price: { type: Number, required: true }, // snapshot of price at time of order // snapshot of food image at time of order
    },
  ],
  totalPrice: { type: Number, required: true },
  expectTime: { type: Date }, // expected delivery or ready time
  status: {
    type: String,
    enum: ["Pending", "Preparing", "Delivered", "Cancelled"],
    default: "Pending",
  },
  specialRequest: { type: String }, // any special notes from user
  orderedAt: { type: Date, default: Date.now },
});

export default mongoose.model("FoodOrder", foodOrderSchema);
