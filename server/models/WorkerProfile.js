import mongoose from "mongoose";

const workerProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    skills: [{ type: String, required: true }],
    experience: { type: String, default: "" },
    expectedWage: { type: Number, default: 0 },
    availableToday: { type: Boolean, default: true },
    preferredDistance: { type: String, default: "5 km" },
    location: { type: String, default: "" },
    photoUrl: { type: String, default: "" },
    documentsUploaded: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    rating: { type: Number, default: 4.5 },
    totalJobsCompleted: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const WorkerProfile =
  mongoose.models.WorkerProfile || mongoose.model("WorkerProfile", workerProfileSchema);
