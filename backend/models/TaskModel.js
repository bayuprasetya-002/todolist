import { DataTypes } from "sequelize";
import db from "../config/database.js";

const Task = db.define("tasks", {
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  status: {
    type: DataTypes.ENUM("pending", "completed"),
    defaultValue: "pending",
    allowNull: false,
  },
  deadline: { type: DataTypes.DATE, allowNull: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  categoryId: { type: DataTypes.INTEGER, allowNull: true },
}, { timestamps: true });

export default Task;
