import mongoose from "mongoose";

const customerProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    address: { type: String, default: "", trim: true, maxlength: 180 },
    customerType: {
      type: String,
      enum: ["homeowner", "shop_owner", "contractor", "other"],
      default: "homeowner",
    },
    rating: { type: Number, default: 4.6, min: 0, max: 5 },
  },
  { timestamps: true },
);

export const CustomerProfile =
  mongoose.models.CustomerProfile || mongoose.model("CustomerProfile", customerProfileSchema);
