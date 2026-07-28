import express from "express";
import mongoose from "mongoose";
import { requireAuth } from "../middleware/auth.js";
import { WorkerProfile } from "../models/WorkerProfile.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const workersRouter = express.Router();

workersRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const query = {};
    if (req.query.skill) query.skills = req.query.skill;
    if (req.query.availableToday === "true") query.availableToday = true;
    if (req.query.search) {
      const rx = new RegExp(String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      query.$or = [{ name: rx }, { location: rx }, { skills: rx }];
    }

    const workers = await WorkerProfile.find(query)
      .sort({ verified: -1, rating: -1, totalJobsCompleted: -1 })
      .lean();
    res.json({ workers });
  }),
);

workersRouter.get(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ message: "Worker not found" });
    }

    const worker = await WorkerProfile.findOne({
      $or: [{ _id: id }, { userId: id }],
    }).lean();
    if (!worker) return res.status(404).json({ message: "Worker not found" });
    res.json({ worker });
  }),
);
