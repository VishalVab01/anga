import express from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { CustomerProfile } from "../models/CustomerProfile.js";
import { User } from "../models/User.js";
import { WorkerProfile } from "../models/WorkerProfile.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const profileRouter = express.Router();

profileRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const model = req.user.role === "worker" ? WorkerProfile : CustomerProfile;
    const profile = await model.findOne({ userId: req.user._id }).lean();
    res.json({ user: req.user, profile });
  }),
);

profileRouter.put(
  "/worker",
  requireAuth,
  requireRole("worker"),
  asyncHandler(async (req, res) => {
    const body = req.body;
    const profile = await WorkerProfile.findOneAndUpdate(
      { userId: req.user._id },
      {
        userId: req.user._id,
        name: body.name,
        phone: body.phone || req.user.phone,
        skills: Array.isArray(body.skills) && body.skills.length ? body.skills : ["electrician"],
        experience: body.experience || "",
        expectedWage: Number(body.expectedWage || body.wage || 0),
        availableToday: Boolean(body.availableToday ?? body.available),
        preferredDistance: body.preferredDistance || body.distance || "5 km",
        location: body.location || body.area || "",
        photoUrl: body.photoUrl || "",
        documentsUploaded: Boolean(body.documentsUploaded || body.document),
        verified: Boolean(body.verified),
      },
      { upsert: true, new: true, runValidators: true },
    );

    await User.findByIdAndUpdate(req.user._id, {
      name: profile.name,
      location: profile.location,
      avatarInitial: profile.name.charAt(0).toUpperCase(),
      isProfileComplete: true,
    });

    res.json({ profile });
  }),
);

profileRouter.put(
  "/customer",
  requireAuth,
  requireRole("customer"),
  asyncHandler(async (req, res) => {
    const body = req.body;
    const profile = await CustomerProfile.findOneAndUpdate(
      { userId: req.user._id },
      {
        userId: req.user._id,
        name: body.name,
        phone: body.phone || req.user.phone,
        address: body.address || "",
        customerType: body.customerType || body.ownerType || "homeowner",
      },
      { upsert: true, new: true, runValidators: true },
    );

    await User.findByIdAndUpdate(req.user._id, {
      name: profile.name,
      address: profile.address,
      location: profile.address,
      avatarInitial: profile.name.charAt(0).toUpperCase(),
      isProfileComplete: true,
    });

    res.json({ profile });
  }),
);
