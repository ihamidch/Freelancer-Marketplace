import express from "express";
import multer from "multer";
import path from "path";
import {
  applyToJob,
  getApplicantsForEmployer,
  getMyApplications,
  updateApplicationStatus,
  uploadResume,
} from "../controllers/applicationController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const destinationPath = process.env.VERCEL ? "/tmp" : "uploads/";
    cb(null, destinationPath);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({ storage });

router.get("/me", protect, authorizeRoles("job_seeker", "freelancer"), getMyApplications);
router.get(
  "/employer/applicants",
  protect,
  authorizeRoles("employer", "client"),
  getApplicantsForEmployer
);
router.get(
  "/client/proposals",
  protect,
  authorizeRoles("employer", "client"),
  getApplicantsForEmployer
);
router.put(
  "/:applicationId/status",
  protect,
  authorizeRoles("employer", "client"),
  updateApplicationStatus
);
router.post(
  "/resume/upload",
  protect,
  authorizeRoles("job_seeker", "freelancer"),
  upload.single("resume"),
  uploadResume
);
router.post("/:jobId", protect, authorizeRoles("job_seeker", "freelancer"), applyToJob);
router.post("/proposals/:jobId", protect, authorizeRoles("job_seeker", "freelancer"), applyToJob);

export default router;
