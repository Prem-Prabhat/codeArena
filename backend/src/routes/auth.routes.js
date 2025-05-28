import express from "express";
import { check, forgotPassword, login, logout, register, resetPassword } from "../controllers/auth.controllers.js";
import { authMiddleware } from "../middleware/auth.middlewae.js";



const authRoutes = express.Router();

authRoutes.post("/register", register);

authRoutes.post("/login" , login)

authRoutes.post("/logout" , authMiddleware, logout);

authRoutes.get("/check", authMiddleware, check);

authRoutes.post("/forgot-password", forgotPassword);

authRoutes.post("/reset-password", resetPassword);



export default authRoutes;