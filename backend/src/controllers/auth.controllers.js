import bcrypt from "bcryptjs";
import { db } from "../libs/db.js";
import { UserRole } from "../generated/prisma/index.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../libs/sendEmail.js";

export const register = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const existingUser = await db.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return res.status(400).json({
        error: "User already exists",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: UserRole.USER,
      },
    });
    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        image: newUser.image,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await db.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(400).json({
        error: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        error: "Invalid credentials",
      });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        image: user.image,
      },
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
    });
    res.status(200).json({
      scuss: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    console.error("Error logging out:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const check = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "User authenticated successfully",
      user: req.user,
    });
  } catch (error) {
    console.error("Error checking user:", error);
    res.status(500).json({
      error: "Error checking user",
    });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await db.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(400).json({
        error: "User not found",
      });
    }

    const resetToken = jwt.sign(
      {
        id: user.id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m",
      }
    );

    const resetLink = `${process.env.BASE_URL}/api/v1/auth/reset-password?token=${resetToken}`;

    const subject = "Password Reset Request";
    const text = `Click the link to reset your password:\n\n${resetLink}`;

    await sendEmail(user.email, subject, text);

    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Token is missing",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const user = await db.user.update({
      where: {
        id: decoded.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        image: user.image,
      },
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
