import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "" },
    phone: { type: String, required: true, unique: true, index: true },
    email: { type: String, trim: true, lowercase: true, unique: true, sparse: true, index: true },
    passwordHash: { type: String, default: "", select: false },
    role: { type: String, enum: ["worker", "customer"], required: true },
    avatarInitial: { type: String, default: "A" },
    location: { type: String, default: "" },
    address: { type: String, default: "" },
    isProfileComplete: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const User = mongoose.models.User || mongoose.model("User", userSchema);
