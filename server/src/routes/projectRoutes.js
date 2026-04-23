import express from "express";
import { getMyProjects, updateProjectStatus } from "../controllers/projectController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getMyProjects);
router.put("/:projectId/status", protect, updateProjectStatus);

export default router;
