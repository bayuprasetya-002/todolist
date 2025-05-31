import User from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Op } from "sequelize";

dotenv.config();

const generateAccessToken = (user) =>
  jwt.sign(
    { id: user.id, username: user.username },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "30m" }
  );

const generateRefreshToken = (user) =>
  jwt.sign(
    { id: user.id, username: user.username },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    // Cek apakah username sudah dipakai
    const usernameExist = await User.findOne({ where: { username } });
    if (usernameExist)
      return res.status(409).json({ message: "Username already registered" });

    // Cek apakah email sudah dipakai
    const emailExist = await User.findOne({ where: { email } });
    if (emailExist)
      return res.status(409).json({ message: "Email already registered" });

    const password_hash = await bcrypt.hash(password, 10);

    const newUser = await User.create({ username, email, password_hash });

    res.status(201).json({ message: "User registered successfully", userId: newUser.id });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;
    if (!usernameOrEmail || !password)
      return res.status(400).json({ message: "All fields are required" });

    console.log("Login attempt:", usernameOrEmail);

    const user = await User.findOne({
      where: {
        [Op.or]: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      },
    });

    console.log("User found:", user ? user.username : "none");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    console.log("Password valid:", validPassword);

    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      accessToken,
      refreshToken,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message });
  }
};
