import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, index: true },
    description: { type: String, required: true },
    problemImageUrl: { type: String, default: "" },
    location: { type: String, required: true },
    wage: { type: Number, required: true },
    date: { type: String, default: "" },
    time: { type: String, default: "" },
    urgent: { type: Boolean, default: false },
    workersNeeded: { type: Number, default: 1 },
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
