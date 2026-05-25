import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { User } from "../../modules/users/user.model.js";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  askUsers,
} from "../../modules/users/users.v2.controller.js";
import { authUser } from "../../middlewares/auth.js";

export const router = Router();

// MongoDB routes (/api/v2/users)

// Read all users
router.get("/", getUsers);

// Create a user
router.post("/", createUser);

// Update a user
router.put("/:id", updateUser);

// Delete a user
router.delete("/:id", deleteUser);

// Login a user
router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and Password required!" });
  }

  try {
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found!" });
    }

    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect password!" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h", // 1 hours expiration
    });

    const isProd = process.env.NODE_ENV === "production";

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: isProd, // only send over HTTPS in production
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    return res.status(200).json({
      success: true,
      message: "Login successful!",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Check user session/token
router.get("/auth/me", authUser, async (req, res, next) => {
  try {
    const userId = req.user.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found!",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Logout a user
router.post("/auth/logout", (req, res) => {
  const isProd = process.env.NODE_ENV === "production";

  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: isProd, // only send over HTTPS in production
    sameSite: isProd ? "none" : "lax",
    path: "/",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully!",
  });
});

// RAG: ask about users (auth required)
router.post("/ask", authUser, askUsers);
