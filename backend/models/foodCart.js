import mongoose from "mongoose";

const foodCartSchema = new mongoose.Schema({

  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" }, // optional, add if needed
  items: [
    {
      foodId: { type: mongoose.Schema.Types.ObjectId, ref: "Food", required: true },
      name: String,
      portion: String,
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ],
  itemTotalPrice: { type: Number, required: true },
  cartStatus: {
    type: String,
    enum: ["in-cart", "ordered"],
    default: "in-cart",
  },
});

export default mongoose.model("FoodCart", foodCartSchema);
