import mongoose from "mongoose";

const workerProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    skills: [{ type: String, required: true }],
    experience: { type: String, default: "", maxlength: 40 },
    expectedWage: { type: Number, default: 0, min: 0, max: 10000000 },
    availableToday: { type: Boolean, default: true },
    preferredDistance: { type: String, default: "5 km" },
    location: { type: String, default: "", trim: true, maxlength: 180 },
    photoUrl: { type: String, default: "", maxlength: 1000000 },
    documentsUploaded: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    totalJobsCompleted: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

export const WorkerProfile =
  mongoose.models.WorkerProfile || mongoose.model("WorkerProfile", workerProfileSchema);
