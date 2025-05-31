import express from "express";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../controllers/CategoryController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/categories", authenticateToken, getCategories);
router.post("/categories", authenticateToken, createCategory);
router.put("/categories/:id", authenticateToken, updateCategory);
router.delete("/categories/:id", authenticateToken, deleteCategory);

export default router;
