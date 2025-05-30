import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import db from "./config/database.js";

import User from "./models/UserModel.js";
import Task from "./models/TaskModel.js";
import Category from "./models/CategoryModel.js";

import AuthRoute from "./routes/AuthRoute.js";
import TaskRoute from "./routes/TaskRoute.js";
import CategoryRoute from "./routes/CategoryRoute.js";

import { authenticateToken } from "./middleware/authMiddleware.js";

const app = express();

app.use(cors());
app.use(express.json());

// Definisikan relasi Sequelize
User.hasMany(Task, { foreignKey: "userId" });
Task.belongsTo(User, { foreignKey: "userId" });

Category.hasMany(Task, { foreignKey: "categoryId" });
Task.belongsTo(Category, { foreignKey: "categoryId" });

// Public routes (tidak perlu autentikasi)
app.use(AuthRoute);

// Middleware JWT untuk proteksi route selanjutnya
app.use(authenticateToken);

// Routes yang dilindungi JWT
app.use(CategoryRoute);
app.use(TaskRoute);

const PORT = process.env.PORT || 5000;

// Sync database dengan alter:true agar tabel dan kolom terbaru otomatis dibuat tanpa menghapus data lama
db.sync({ alter: true })
  .then(() => console.log("Database connected and synced"))
  .catch((err) => console.error("DB connection error:", err));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
