import express from "express";
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getStatistics  // <--- import function baru
} from "../controllers/TaskController.js";

import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Daftarkan route spesifik dulu agar tidak tertangkap :id
router.get("/tasks/statistics", authenticateToken, getStatistics);

// Route lain
router.get("/tasks", authenticateToken, getTasks);
router.get("/tasks/:id", authenticateToken, getTaskById);
router.post("/tasks", authenticateToken, createTask);
router.put("/tasks/:id", authenticateToken, updateTask);
router.delete("/tasks/:id", authenticateToken, deleteTask);

export default router;
