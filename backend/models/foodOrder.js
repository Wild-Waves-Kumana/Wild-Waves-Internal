import mongoose from "mongoose";

const foodOrderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  villaId: { type: mongoose.Schema.Types.ObjectId, ref: "Villa" },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" }, // <-- add this line
  items: [
    {
      foodId: { type: mongoose.Schema.Types.ObjectId, ref: "Food" },
      name: String,
      foodCode: String,
      portion: String,
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ],
  totalPrice: { type: Number, required: true },
  expectTime: { type: Date },
  status: {
    type: String,
    enum: ["Pending", "Preparing", "Delivered", "Cancelled"],
    default: "Pending",
  },
  specialRequest: { type: String },
  order: { type: Boolean, default: true },
  orderedAt: { type: Date, default: Date.now },
});

export default mongoose.model("FoodOrder", foodOrderSchema);
