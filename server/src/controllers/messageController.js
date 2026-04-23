import mongoose from "mongoose";
import Message from "../models/Message.js";
import Job from "../models/Job.js";
import asyncHandler from "../middleware/asyncHandler.js";
import AppError from "../utils/appError.js";

export const sendMessage = asyncHandler(async (req, res) => {
  const { jobId, receiverId, content } = req.body;
  if (!jobId || !receiverId || !content?.trim()) {
    throw new AppError("jobId, receiverId and content are required", 400);
  }
  if (!mongoose.Types.ObjectId.isValid(jobId) || !mongoose.Types.ObjectId.isValid(receiverId)) {
    throw new AppError("Invalid jobId or receiverId", 400);
  }
  const job = await Job.findById(jobId);
  if (!job) {
    throw new AppError("Job not found", 404);
  }
  const message = await Message.create({
    job: jobId,
    sender: req.user._id,
    receiver: receiverId,
    content: content.trim(),
  });
  res.status(201).json(message);
});

export const getConversation = asyncHandler(async (req, res) => {
  const { jobId, participantId } = req.query;
  if (!jobId || !participantId) {
    throw new AppError("jobId and participantId are required", 400);
  }
  const messages = await Message.find({
    job: jobId,
    $or: [
      { sender: req.user._id, receiver: participantId },
      { sender: participantId, receiver: req.user._id },
    ],
  })
    .populate("sender", "name role")
    .populate("receiver", "name role")
    .sort({ createdAt: 1 });
  res.status(200).json(messages);
});
