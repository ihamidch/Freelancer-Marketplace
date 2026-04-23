import Project from "../models/Project.js";
import asyncHandler from "../middleware/asyncHandler.js";
import AppError from "../utils/appError.js";

const allowedStatuses = ["pending", "in-progress", "completed", "paid"];

export const getMyProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({
    $or: [{ client: req.user._id }, { freelancer: req.user._id }],
  })
    .populate("job", "title budget status")
    .populate("client", "name email")
    .populate("freelancer", "name email")
    .sort({ updatedAt: -1 });
  res.status(200).json(projects);
});

export const updateProjectStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!allowedStatuses.includes(status)) {
    throw new AppError("Invalid project status", 400);
  }
  const project = await Project.findById(req.params.projectId);
  if (!project) {
    throw new AppError("Project not found", 404);
  }
  const isParticipant =
    project.client.toString() === req.user._id.toString() ||
    project.freelancer.toString() === req.user._id.toString();
  if (!isParticipant) {
    throw new AppError("Not authorized to update this project", 403);
  }
  project.status = status;
  await project.save();
  res.status(200).json(project);
});
