import express from "express";
import { getCategories, createCategory } from "../controllers/CategoryController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/categories", authenticateToken, getCategories);
router.post("/categories", authenticateToken, createCategory);

export default router;
