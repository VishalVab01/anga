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

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  const [salt, stored] = String(storedHash || "").split(":");
  if (!salt || !stored) return false;
  const candidate = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(stored, "hex");
  return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
}

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

function publicUser(user) {
  const value = user.toObject ? user.toObject() : { ...user };
  delete value.passwordHash;
  if (String(value.phone || "").startsWith("email:")) value.phone = "";
  return value;
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
  "/register",
  asyncHandler(async (req, res) => {
    const name = String(req.body.name || "").trim();
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");
    const role = req.body.role;
    if (!name || name.length > 80) return res.status(400).json({ message: "Valid name required" });
    if (!/^\S+@\S+\.\S+$/.test(email))
      return res.status(400).json({ message: "Valid email required" });
    if (password.length < 8 || password.length > 128)
      return res.status(400).json({ message: "Password must be 8 to 128 characters" });
    if (!["worker", "customer"].includes(role))
      return res.status(400).json({ message: "Valid role required" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "An account already uses this email" });

    const emailPhone = `email:${crypto.createHash("sha256").update(email).digest("hex").slice(0, 24)}`;
    const user = await User.create({
      name,
      email,
      passwordHash: hashPassword(password),
      phone: emailPhone,
      role,
      avatarInitial: name.charAt(0).toUpperCase(),
      isProfileComplete: false,
    });
    res.status(201).json({ token: sign(user), user: publicUser(user) });
  }),
);

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");
    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    res.json({ token: sign(user), user: publicUser(user) });
  }),
);

authRouter.post(
  "/send-otp",
  asyncHandler(async (req, res) => {
    const phone = normalizePhone(req.body.phone);
    if (phone.length !== 10)
      return res.status(400).json({ message: "Valid phone number required" });

    const otp =
      isDemoPhone(phone) || process.env.NODE_ENV !== "production"
        ? "1234"
        : String(crypto.randomInt(1000, 10000));
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
    if (role !== undefined && !["worker", "customer"].includes(role))
      return res.status(400).json({ message: "Valid role required" });

    const record = await Otp.findOne({ phone }).sort({ createdAt: -1 });
    const valid =
      (process.env.NODE_ENV !== "production" && otp === "1234") ||
      (isDemoPhone(phone) && ["1234", "123456"].includes(otp)) ||
      (record && record.otpHash === hashOtp(otp) && record.expiresAt > new Date());
    if (!valid) return res.status(400).json({ message: "Invalid OTP" });

    let user = await User.findOne({ phone });
    if (!role) {
      if (!user) return res.json({ verified: true, needsRole: true });

      await Otp.deleteMany({ phone });
      return res.json({
        verified: true,
        needsRole: false,
        token: sign(user),
        user: publicUser(user),
      });
    }

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

    res.json({ token: sign(user), user: publicUser(user) });
  }),
);

authRouter.get("/me", requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

authRouter.post("/logout", (_req, res) => {
  res.json({ message: "Logged out" });
});
