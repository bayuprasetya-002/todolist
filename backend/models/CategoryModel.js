import { DataTypes } from "sequelize";
import db from "../config/database.js";

const Category = db.define("categories", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
}, {
  timestamps: true,
});

export default Category;
