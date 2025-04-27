import jwt from "jsonwebtoken";
import { db } from "../libs/db.js";

export const authMiddleware = async (req, res, next) => { 
    try {
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized access - No token provided"
            })
        }

        let decoded;

        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized access - Invalid token"
            })
        }
        const user = await db.user.findUnique({
            where: {
                id: decoded.id
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                image: true
            }
        })

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Unauthorized access - User not found"
            })
        }

        req.user = user;
        next();

    } catch (error) {
        console.error("Error in auth middleware:", error);
        return res.status(500).json({
            success: false,
            message: "Error authenticating user",
        })
    }
}