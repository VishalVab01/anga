import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    category: { type: String, required: true, trim: true, maxlength: 60, index: true },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    problemImageUrl: { type: String, default: "", maxlength: 1000000 },
    location: { type: String, required: true, trim: true, maxlength: 180 },
    wage: { type: Number, required: true, min: 1, max: 10000000 },
    date: { type: String, default: "" },
    time: { type: String, default: "" },
    urgent: { type: Boolean, default: false },
    workersNeeded: { type: Number, default: 1, min: 1, max: 50 },
    status: {
      type: String,
      enum: ["open", "assigned", "completed", "cancelled"],
      default: "open",
      index: true,
    },
    assignedWorkerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true },
);

export const Job = mongoose.models.Job || mongoose.model("Job", jobSchema);
