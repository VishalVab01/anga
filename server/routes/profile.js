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
    const name = String(body.name || "").trim();
    const phone = String(body.phone || req.user.phone || "").trim();
    const location = String(body.location || body.area || "").trim();
    const skills = Array.isArray(body.skills)
      ? body.skills.map((skill) => String(skill).trim()).filter(Boolean)
      : [];
    const expectedWage = Number(body.expectedWage || body.wage);
    if (
      !name ||
      phone.replace(/\D/g, "").length < 10 ||
      !location ||
      skills.length === 0 ||
      !Number.isFinite(expectedWage) ||
      expectedWage < 1
    ) {
      return res.status(400).json({
        message: "Name, valid phone, location, skill and expected wage are required",
      });
    }
    const phoneOwner = await User.exists({ phone, _id: { $ne: req.user._id } });
    if (phoneOwner) return res.status(409).json({ message: "Mobile number already in use" });
    const profile = await WorkerProfile.findOneAndUpdate(
      { userId: req.user._id },
      {
        userId: req.user._id,
        name,
        phone,
        skills,
        experience: body.experience || "",
        expectedWage,
        availableToday: Boolean(body.availableToday ?? body.available),
        preferredDistance: body.preferredDistance || body.distance || "5 km",
        location,
        photoUrl: body.photoUrl || "",
        documentsUploaded: Boolean(body.documentsUploaded || body.document),
      },
      { upsert: true, new: true, runValidators: true },
    );

    await User.findByIdAndUpdate(req.user._id, {
      name: profile.name,
      phone: profile.phone,
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
    const name = String(body.name || "").trim();
    const phone = String(body.phone || req.user.phone || "").trim();
    const address = String(body.address || "").trim();
    const customerType = String(body.customerType || body.ownerType || "homeowner");
    if (
      !name ||
      phone.replace(/\D/g, "").length < 10 ||
      !address ||
      !["homeowner", "shop_owner", "contractor", "other"].includes(customerType)
    ) {
      return res.status(400).json({
        message: "Name, valid phone, address and customer type are required",
      });
    }
    const phoneOwner = await User.exists({ phone, _id: { $ne: req.user._id } });
    if (phoneOwner) return res.status(409).json({ message: "Mobile number already in use" });
    const profile = await CustomerProfile.findOneAndUpdate(
      { userId: req.user._id },
      {
        userId: req.user._id,
        name,
        phone,
        address,
        photoUrl: body.photoUrl || "",
        customerType,
      },
      { upsert: true, new: true, runValidators: true },
    );

    await User.findByIdAndUpdate(req.user._id, {
      name: profile.name,
      phone: profile.phone,
      address: profile.address,
      location: profile.address,
      avatarInitial: profile.name.charAt(0).toUpperCase(),
      isProfileComplete: true,
    });

    res.json({ profile });
  }),
);
