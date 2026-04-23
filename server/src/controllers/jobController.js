import Job from "../models/Job.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import asyncHandler from "../middleware/asyncHandler.js";
import AppError from "../utils/appError.js";

export const createJob = asyncHandler(async (req, res) => {
  const { title, company, description, location, budget, skills, employmentType } = req.body;
  const parsedBudget = Number(budget);
  if (!title || !company || !description || !location || Number.isNaN(parsedBudget) || parsedBudget < 0) {
    throw new AppError("Please provide valid job details and budget", 400);
  }
  const job = await Job.create({
    title,
    company,
    description,
    location,
    budget: parsedBudget,
    budgetMin: Math.floor(parsedBudget * 0.8),
    budgetMax: Math.ceil(parsedBudget * 1.2),
    skills: Array.isArray(skills) ? skills : [],
    employmentType,
    postedBy: req.user._id,
  });
  res.status(201).json(job);
});

export const getJobs = asyncHandler(async (req, res) => {
  const { search = "", location = "", skill = "", minBudget = "", page = 1, limit = 10 } = req.query;
  const query = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { company: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }
  if (location) {
    query.location = { $regex: location, $options: "i" };
  }
  if (skill) {
    query.skills = { $regex: skill, $options: "i" };
  }
  if (minBudget) {
    const parsedMinBudget = Number(minBudget);
    if (!Number.isNaN(parsedMinBudget)) {
      query.budget = { $gte: parsedMinBudget };
    }
  }

  const pageNumber = Math.max(1, Number(page) || 1);
  const limitNumber = Math.min(50, Math.max(1, Number(limit) || 10));
  const skip = (pageNumber - 1) * limitNumber;
  const [jobs, total] = await Promise.all([
    Job.find(query).populate("postedBy", "name email role").sort({ createdAt: -1 }).skip(skip).limit(limitNumber),
    Job.countDocuments(query),
  ]);
  res.set("X-Pagination-Page", String(pageNumber));
  res.set("X-Pagination-Limit", String(limitNumber));
  res.set("X-Pagination-Total", String(total));
  res.set("X-Pagination-Pages", String(Math.ceil(total / limitNumber) || 1));
  res.status(200).json(jobs);
});

export const getJobById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new AppError("Invalid job id", 400);
  }
  const job = await Job.findById(req.params.id).populate("postedBy", "name email role");
  if (!job) {
    throw new AppError("Job not found", 404);
  }
  res.status(200).json(job);
});

export const getEmployerJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json(jobs);
});

export const toggleSaveJob = asyncHandler(async (req, res) => {
  const jobId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new AppError("Invalid job id", 400);
  }

  const jobExists = await Job.exists({ _id: jobId });
  if (!jobExists) {
    throw new AppError("Job not found", 404);
  }

  const user = await User.findById(req.user._id);
  const alreadySaved = user.savedJobs.some((id) => id.toString() === jobId);
  if (alreadySaved) {
    user.savedJobs = user.savedJobs.filter((id) => id.toString() !== jobId);
  } else {
    user.savedJobs.push(jobId);
  }

  await user.save();
  res.status(200).json({ savedJobs: user.savedJobs });
});

export const closeJob = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new AppError("Invalid job id", 400);
  }
  const job = await Job.findOneAndUpdate(
    { _id: req.params.id, postedBy: req.user._id },
    { status: "closed" },
    { new: true }
  );
  if (!job) {
    throw new AppError("Job not found or not owned by current user", 404);
  }
  res.status(200).json(job);
});
