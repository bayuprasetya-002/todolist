import { DataTypes } from "sequelize";
import db from "../config/database.js";

const Category = db.define(
  "categories",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false, // unique per user, jadi tidak perlu unique global
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

export default Category;
