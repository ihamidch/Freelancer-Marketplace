import express from "express";
import {
  createJob,
  getEmployerJobs,
  getJobById,
  getJobs,
  toggleSaveJob,
} from "../controllers/jobController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getJobs);
router.get("/dashboard/employer", protect, authorizeRoles("employer"), getEmployerJobs);
router.post("/", protect, authorizeRoles("employer"), createJob);
router.put("/:id/save", protect, authorizeRoles("job_seeker"), toggleSaveJob);
router.get("/:id", getJobById);

export default router;
