import Application from "../models/Application.js";
import Job from "../models/Job.js";
import User from "../models/User.js";
import Project from "../models/Project.js";
import sendEmail from "../utils/sendEmail.js";
import mongoose from "mongoose";
import asyncHandler from "../middleware/asyncHandler.js";
import AppError from "../utils/appError.js";

const allowedStatuses = ["reviewing", "shortlisted", "rejected", "accepted"];

export const applyToJob = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.jobId)) {
    throw new AppError("Invalid job id", 400);
  }
  const { coverLetter = "", proposedBudget = 0 } = req.body;
  const job = await Job.findById(req.params.jobId).populate("postedBy", "email name");
  if (!job) {
    throw new AppError("Job not found", 404);
  }
  if (job.status === "closed") {
    throw new AppError("This job is no longer accepting proposals", 400);
  }

  const existingApplication = await Application.findOne({ job: job._id, applicant: req.user._id });
  if (existingApplication) {
    throw new AppError("You already applied to this job", 400);
  }

  const application = await Application.create({
    job: job._id,
    applicant: req.user._id,
    coverLetter,
    proposedBudget: Number(proposedBudget) || 0,
  });

  await sendEmail({
    to: job.postedBy.email,
    subject: `New proposal for ${job.title}`,
    text: `${req.user.name} has submitted a proposal for your job posting.`,
  });
  res.status(201).json(application);
});

export const getMyApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ applicant: req.user._id })
    .populate("job", "title company location status")
    .sort({ createdAt: -1 });
  res.status(200).json(applications);
});

export const getApplicantsForEmployer = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ postedBy: req.user._id }).select("_id");
  const jobIds = jobs.map((job) => job._id);
  const applications = await Application.find({ job: { $in: jobIds } })
    .populate("job", "title postedBy")
    .populate("applicant", "name email resumeUrl skills rating")
    .sort({ createdAt: -1 });
  res.status(200).json(applications);
});

export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!allowedStatuses.includes(status)) {
    throw new AppError("Invalid application status", 400);
  }
  if (!mongoose.Types.ObjectId.isValid(req.params.applicationId)) {
    throw new AppError("Invalid application id", 400);
  }

  const application = await Application.findById(req.params.applicationId).populate("job").populate("applicant", "email name");
  if (!application) {
    throw new AppError("Application not found", 404);
  }
  const ownsJob = application.job.postedBy.toString() === req.user._id.toString();
  if (!ownsJob) {
    throw new AppError("Not authorized to update this application", 403);
  }

  application.status = status;
  await application.save();

  if (status === "accepted") {
    await Project.findOneAndUpdate(
      { job: application.job._id },
      { job: application.job._id, client: req.user._id, freelancer: application.applicant._id, status: "pending" },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    await Job.findByIdAndUpdate(application.job._id, { status: "closed" });
  }

  await sendEmail({
    to: application.applicant.email,
    subject: `Application status updated: ${application.job.title}`,
    text: `Hi ${application.applicant.name}, your application status is now "${status}".`,
  });
  res.status(200).json(application);
});

export const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError("Resume file is required", 400);
  }
  const user = await User.findById(req.user._id);
  user.resumeUrl = process.env.VERCEL ? `Uploaded resume: ${req.file.originalname}` : `/uploads/${req.file.filename}`;
  await user.save();
  res.status(200).json({ resumeUrl: user.resumeUrl });
});
