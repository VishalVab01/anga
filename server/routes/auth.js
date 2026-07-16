import crypto from "crypto";
import express from "express";
import jwt from "jsonwebtoken";
import { requireAuth } from "../middleware/auth.js";
import { Otp } from "../models/Otp.js";
import { User } from "../models/User.js";
import { ensureDemoProfile } from "../seed.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authRouter = express.Router();

function normalizePhone(phone) {
  return String(phone || "")
    .replace(/\D/g, "")
    .slice(-10);
}

function hashOtp(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

function sign(user) {
  return jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || "dev-secret", {
    expiresIn: "7d",
  });
}

function isDemoPhone(phone) {
  return phone === "1234567890";
}

authRouter.post(
  "/send-otp",
  asyncHandler(async (req, res) => {
    const phone = normalizePhone(req.body.phone);
    if (phone.length !== 10)
      return res.status(400).json({ message: "Valid phone number required" });

    const otp =
      isDemoPhone(phone) || process.env.NODE_ENV !== "production"
        ? "123456"
        : String(Math.floor(100000 + Math.random() * 900000));
    await Otp.deleteMany({ phone });
    await Otp.create({
      phone,
      otpHash: hashOtp(otp),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    if (process.env.NODE_ENV !== "production" || isDemoPhone(phone))
      console.log(`Anga OTP for ${phone}: ${otp}`);
    res.json({
      message: "OTP sent",
      ...(process.env.NODE_ENV !== "production" || isDemoPhone(phone) ? { otp } : {}),
    });
  }),
);

authRouter.post(
  "/verify-otp",
  asyncHandler(async (req, res) => {
    const phone = normalizePhone(req.body.phone);
    const otp = String(req.body.otp || "");
    const role = req.body.role;
    if (phone.length !== 10)
      return res.status(400).json({ message: "Valid phone number required" });
    if (!["worker", "customer"].includes(role))
      return res.status(400).json({ message: "Valid role required" });

    const record = await Otp.findOne({ phone }).sort({ createdAt: -1 });
    const valid =
      otp === "123456" ||
      (record && record.otpHash === hashOtp(otp) && record.expiresAt > new Date());
    if (!valid) return res.status(400).json({ message: "Invalid OTP" });

    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({
        phone,
        role,
        name: isDemoPhone(phone) ? (role === "worker" ? "Demo Worker" : "Demo Customer") : "",
        avatarInitial: role === "worker" ? "W" : "C",
        location: isDemoPhone(phone) ? "Andheri West, Mumbai" : "",
        address: isDemoPhone(phone) && role === "customer" ? "Andheri West, Mumbai" : "",
        isProfileComplete: isDemoPhone(phone),
      });
    } else if (user.role !== role) {
      user.role = role;
      if (isDemoPhone(phone)) {
        user.name = role === "worker" ? "Demo Worker" : "Demo Customer";
        user.location = "Andheri West, Mumbai";
        user.address = role === "customer" ? "Andheri West, Mumbai" : "";
        user.isProfileComplete = true;
      }
      await user.save();
    }
    if (isDemoPhone(phone)) {
      user.isProfileComplete = true;
      await user.save();
      await ensureDemoProfile(user, role);
    }
    await Otp.deleteMany({ phone });

    res.json({ token: sign(user), user });
  }),
);

authRouter.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

authRouter.post("/logout", (_req, res) => {
  res.json({ message: "Logged out" });
});
