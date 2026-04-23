import jwt from "jsonwebtoken";
import User from "../models/User.js";
import asyncHandler from "./asyncHandler.js";
import AppError from "../utils/appError.js";

const normalizeRole = (role) => {
  if (role === "client") return "employer";
  if (role === "freelancer") return "job_seeker";
  return role;
};

export const protect = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization || "";
  const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
  const token = bearerToken || req.cookies?.accessToken;
  if (!token) {
    throw new AppError("Not authorized, token missing", 401);
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.userId).select("-password");

  if (!user) {
    throw new AppError("User no longer exists", 401);
  }

  req.user = user;
  req.user.normalizedRole = normalizeRole(user.role);
  next();
});

export const authorizeRoles = (...roles) => {
  const normalizedAllowedRoles = roles.map((role) => normalizeRole(role));
  return (req, _res, next) => {
    const userRole = req.user?.normalizedRole || normalizeRole(req.user?.role);
    if (!normalizedAllowedRoles.includes(userRole)) {
      throw new AppError("Forbidden for this role", 403);
    }
    next();
  };
};
