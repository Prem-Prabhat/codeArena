import bcrypt from "bcryptjs"
import { db } from "../libs/db.js"
import { UserRole } from "../generated/prisma/index.js"
import jwt from "jsonwebtoken"

export const register = async (req, res) => {
    const { email, password, name } = req.body
    
    try {
        const existingUser = await db.user.findUnique({
            where: {
                email
            }
        })

        if (existingUser) {
            return res.status(400).json({
                error: "User already exists"
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = await db.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role:UserRole.USER
            }
        })
        const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
            expiresIn: "1d"
        })
        res.cookie("jwt", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== "development",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        })
        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role,
                image:newUser.image
            }
        })

    } catch (error) {
        console.error("Error creating user:",error)
        res.status(500).json({
            error: "Internal server error"
        })
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body

    try {
        const user = await db.user.findUnique({
            where: {
                email
            }
        })

        if (!user) {
            return res.status(400).json({
                error: "User not found"
            })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(400).json({
                error: "Invalid credentials"
            })
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: "1d"
        })

        res.cookie("jwt", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== "development",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        })

        res.status(200).json({
            success: true,
            message: "User logged in successfully",
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role:user.role,
                image:user.image
            }
        })
    } catch (error) {
        console.error("Error logging in:",error)
        res.status(500).json({
            error: "Internal server error"
        })
    }
}

export const logout = async (req, res) => {
   
   
}

export const check = async (req, res) => {
    
}

export const forgotPassword = async (req, res) => { }

export const resetPassword = async (req, res) => { }
