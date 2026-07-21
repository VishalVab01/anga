import express from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { Application } from "../models/Application.js";
import { Job } from "../models/Job.js";
import { Notification } from "../models/Notification.js";
import { WorkerProfile } from "../models/WorkerProfile.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const jobsRouter = express.Router();

function jobQuery(req) {
  const query = {};
  if (req.query.status) query.status = req.query.status;
  if (req.query.category) query.category = req.query.category;
  if (req.query.search) {
    const rx = new RegExp(String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    query.$or = [{ title: rx }, { category: rx }, { location: rx }];
  }
  return query;
}

jobsRouter.post(
  "/",
  requireAuth,
  requireRole("customer"),
  asyncHandler(async (req, res) => {
    const body = req.body;
    const job = await Job.create({
      customerId: req.user._id,
      title: body.title || body.description?.slice(0, 48) || "Local job",
      category: body.category || body.service,
      description: body.description,
      problemImageUrl: body.problemImageUrl || "",
      location: body.location,
      wage: Number(body.wage || body.budget),
      date: body.date || "",
      time: body.time || "",
      urgent: Boolean(
        body.urgent ||
        String(body.urgency || "")
          .toLowerCase()
          .includes("urgent"),
      ),
      workersNeeded: Number(body.workersNeeded || body.workers || 1),
    });
    res.status(201).json({ job });
  }),
);

jobsRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const query = jobQuery(req);
    if (req.query.mine === "true") query.customerId = req.user._id;
    const jobs = await Job.find(query).sort({ createdAt: -1 }).lean();
    const applications =
      req.user.role === "worker"
        ? await Application.find({ workerId: req.user._id }).select("jobId status").lean()
        : [];
    const appMap = new Map(applications.map((app) => [String(app.jobId), app.status]));
    res.json({
      jobs: jobs.map((job) => ({ ...job, applicationStatus: appMap.get(String(job._id)) || null })),
    });
  }),
);

jobsRouter.get(
  "/nearby",
  requireAuth,
  requireRole("worker"),
  asyncHandler(async (req, res) => {
    const query = { ...jobQuery(req), status: "open" };
    const jobs = await Job.find(query).sort({ createdAt: -1, urgent: -1 }).lean();
    const applications = await Application.find({ workerId: req.user._id })
      .select("jobId status")
      .lean();
    const appMap = new Map(applications.map((app) => [String(app.jobId), app.status]));
    res.json({
      jobs: jobs.map((job) => ({ ...job, applicationStatus: appMap.get(String(job._id)) || null })),
    });
  }),
);

jobsRouter.get(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const job = await Job.findById(req.params.id).lean();
    if (!job) return res.status(404).json({ message: "Job not found" });
    const application =
      req.user.role === "worker"
        ? await Application.findOne({ jobId: job._id, workerId: req.user._id }).lean()
        : null;
    res.json({ job: { ...job, applicationStatus: application?.status || null } });
  }),
);

jobsRouter.put(
  "/:id",
  requireAuth,
  requireRole("customer"),
  asyncHandler(async (req, res) => {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, customerId: req.user._id },
      req.body,
      { new: true, runValidators: true },
    );
    if (!job) return res.status(404).json({ message: "Job not found or not yours" });
    res.json({ job });
  }),
);

jobsRouter.delete(
  "/:id",
  requireAuth,
  requireRole("customer"),
  asyncHandler(async (req, res) => {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, customerId: req.user._id },
      { status: "cancelled" },
      { new: true },
    );
    if (!job) return res.status(404).json({ message: "Job not found or not yours" });
    res.json({ job });
  }),
);

jobsRouter.post(
  "/:id/apply",
  requireAuth,
  requireRole("worker"),
  asyncHandler(async (req, res) => {
    const job = await Job.findById(req.params.id);
    if (!job || job.status !== "open")
      return res.status(404).json({ message: "Open job not found" });

    const application = await Application.create({
      jobId: job._id,
      workerId: req.user._id,
      customerId: job.customerId,
    }).catch((error) => {
      if (error.code === 11000) {
        const duplicate = new Error("Already applied to this job");
        duplicate.status = 409;
        throw duplicate;
      }
      throw error;
    });

    await Job.findByIdAndUpdate(job._id, { $addToSet: { applicants: req.user._id } });
    await Notification.create({
      userId: job.customerId,
      title: "New application",
      message: `${req.user.name || "A worker"} applied to ${job.title}`,
      type: "application",
    });

    res.status(201).json({ application });
  }),
);

jobsRouter.get(
  "/:id/applicants",
  requireAuth,
  requireRole("customer"),
  asyncHandler(async (req, res) => {
    const job = await Job.findOne({ _id: req.params.id, customerId: req.user._id }).lean();
    if (!job) return res.status(404).json({ message: "Job not found or not yours" });
    const applications = await Application.find({ jobId: job._id }).lean();
    const workerIds = applications.map((app) => app.workerId);
    const profiles = await WorkerProfile.find({ userId: { $in: workerIds } }).lean();
    const profileMap = new Map(profiles.map((profile) => [String(profile.userId), profile]));
    res.json({
      job,
      applicants: applications.map((application) => ({
        application,
        worker: profileMap.get(String(application.workerId)) || null,
      })),
    });
  }),
);

jobsRouter.post(
  "/:id/assign",
  requireAuth,
  requireRole("customer"),
  asyncHandler(async (req, res) => {
    const workerId = req.body.workerId;
    const job = await Job.findOne({ _id: req.params.id, customerId: req.user._id });
    if (!job) return res.status(404).json({ message: "Job not found or not yours" });

    const application = await Application.findOneAndUpdate(
      { jobId: job._id, workerId },
      { status: "accepted" },
      { new: true },
    );
    if (!application) return res.status(404).json({ message: "Applicant not found" });

    await Application.updateMany(
      { jobId: job._id, workerId: { $ne: workerId } },
      { status: "rejected" },
    );
    job.status = "assigned";
    job.assignedWorkerId = workerId;
    await job.save();
    await Notification.create({
      userId: workerId,
      title: "Job assigned",
      message: `You were assigned: ${job.title}`,
      type: "assigned",
    });

    res.json({ job, application });
  }),
);

jobsRouter.post(
  "/:id/complete",
  requireAuth,
  requireRole("customer"),
  asyncHandler(async (req, res) => {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, customerId: req.user._id },
      { status: "completed" },
      { new: true },
    );
    if (!job) return res.status(404).json({ message: "Job not found or not yours" });
    const application = await Application.findOneAndUpdate(
      { jobId: job._id, status: "accepted" },
      { status: "completed" },
      { new: true },
    );
    if (application) {
      await Notification.create({
        userId: application.workerId,
        title: "Job completed",
        message: `${job.title} was marked completed. Ask the customer for rating if needed.`,
        type: "completed",
      });
    }
    res.json({ job });
  }),
);
