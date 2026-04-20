import Job from "../models/Job.js";
import User from "../models/User.js";
import mongoose from "mongoose";

export const createJob = async (req, res) => {
  try {
    const { title, company, description, location, budget, skills, employmentType } = req.body;
    const parsedBudget = Number(budget);

    if (!title || !company || !description || !location || Number.isNaN(parsedBudget) || parsedBudget < 0) {
      return res.status(400).json({ message: "Please provide valid job details and budget" });
    }

    const job = await Job.create({
      title,
      company,
      description,
      location,
      budget: parsedBudget,
      skills: Array.isArray(skills) ? skills : [],
      employmentType,
      postedBy: req.user._id,
    });

    return res.status(201).json(job);
  } catch (error) {
    return res.status(500).json({ message: "Could not create job", error: error.message });
  }
};

export const getJobs = async (req, res) => {
  try {
    const { search = "", location = "", skill = "", minBudget = "" } = req.query;
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

    const jobs = await Job.find(query)
      .populate("postedBy", "name email")
      .sort({ createdAt: -1 });
    return res.status(200).json(jobs);
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch jobs", error: error.message });
  }
};

export const getJobById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid job id" });
    }

    const job = await Job.findById(req.params.id).populate("postedBy", "name email");
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    return res.status(200).json(job);
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch job", error: error.message });
  }
};

export const getEmployerJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json(jobs);
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch employer jobs", error: error.message });
  }
};

export const toggleSaveJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: "Invalid job id" });
    }

    const jobExists = await Job.exists({ _id: jobId });
    if (!jobExists) {
      return res.status(404).json({ message: "Job not found" });
    }

    const user = await User.findById(req.user._id);

    const alreadySaved = user.savedJobs.some((id) => id.toString() === jobId);
    if (alreadySaved) {
      user.savedJobs = user.savedJobs.filter((id) => id.toString() !== jobId);
    } else {
      user.savedJobs.push(jobId);
    }

    await user.save();
    return res.status(200).json({ savedJobs: user.savedJobs });
  } catch (error) {
    return res.status(500).json({ message: "Could not update saved jobs", error: error.message });
  }
};
