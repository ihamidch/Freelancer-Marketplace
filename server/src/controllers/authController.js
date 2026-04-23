import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import asyncHandler from "../middleware/asyncHandler.js";
import AppError from "../utils/appError.js";
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  refreshCookieOptions,
  verifyRefreshToken,
} from "../utils/tokenService.js";
import { isValidEmail, normalizeRoleInput } from "../utils/validators.js";

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  resumeUrl: user.resumeUrl,
  avatarUrl: user.avatarUrl,
  bio: user.bio,
  skills: user.skills,
  savedJobs: user.savedJobs || [],
});

const issueTokens = async (user, res) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  await RefreshToken.create({
    user: user._id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  res.cookie("refreshToken", refreshToken, refreshCookieOptions);
  res.cookie("accessToken", accessToken, { ...refreshCookieOptions, maxAge: 15 * 60 * 1000 });
  return accessToken;
};

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, avatarUrl = "", bio = "", skills = [] } = req.body;
  const normalizedName = name?.trim();
  const normalizedEmail = email?.trim().toLowerCase();
  const normalizedRole = normalizeRoleInput(role);

  if (!normalizedName || !normalizedEmail || !password || !normalizedRole) {
    throw new AppError("All fields are required", 400);
  }
  if (!isValidEmail(normalizedEmail)) {
    throw new AppError("Please provide a valid email address", 400);
  }
  if (password.length < 6) {
    throw new AppError("Password must be at least 6 characters", 400);
  }
  if (!["employer", "job_seeker"].includes(normalizedRole)) {
    throw new AppError("Invalid role provided", 400);
  }

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new AppError("Email already registered", 400);
  }

  const user = await User.create({
    name: normalizedName,
    email: normalizedEmail,
    password,
    role: normalizedRole,
    avatarUrl,
    bio,
    skills: Array.isArray(skills) ? skills : [],
  });

  const token = await issueTokens(user, res);
  res.status(201).json({ ...sanitizeUser(user), token });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }
  const normalizedEmail = email?.trim().toLowerCase();
  if (!isValidEmail(normalizedEmail)) {
    throw new AppError("Please provide a valid email address", 400);
  }

  const user = await User.findOne({ email: normalizedEmail });
  if (!user || !(await user.matchPassword(password))) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = await issueTokens(user, res);
  res.status(200).json({ ...sanitizeUser(user), token });
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const providedRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!providedRefreshToken) {
    throw new AppError("Refresh token is required", 401);
  }

  const decoded = verifyRefreshToken(providedRefreshToken);
  const tokenHash = hashToken(providedRefreshToken);
  const storedToken = await RefreshToken.findOne({
    user: decoded.userId,
    tokenHash,
    expiresAt: { $gt: new Date() },
  });
  if (!storedToken) {
    throw new AppError("Refresh token is invalid or expired", 401);
  }

  await RefreshToken.deleteOne({ _id: storedToken._id });
  const user = await User.findById(decoded.userId);
  if (!user) {
    throw new AppError("User no longer exists", 401);
  }

  const token = await issueTokens(user, res);
  res.status(200).json({ token });
});

export const logoutUser = asyncHandler(async (req, res) => {
  const providedRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
  if (providedRefreshToken) {
    const tokenHash = hashToken(providedRefreshToken);
    await RefreshToken.deleteOne({ tokenHash });
  }
  res.clearCookie("refreshToken");
  res.clearCookie("accessToken");
  res.status(200).json({ message: "Logged out successfully" });
});

export const getProfile = asyncHandler(async (req, res) => {
  res.status(200).json(req.user);
});
