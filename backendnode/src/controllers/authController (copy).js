import {
    register as registerUser,
    login as loginUser,
} from "../services/authService.js";

import { Op } from "sequelize";
import { User } from "../models/index.js";


const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required.",
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 8 characters.",
            });
        }

        const result = await registerUser({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
        });

        return res.status(201).json({
            success: true,
            message: "Registration successful.",
            data: result,
        });

    } catch (error) {
        console.error("Register error:", error);

        if (error.message === "EMAIL_EXISTS") {
            return res.status(409).json({
                success: false,
                message: "Email already registered.",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Unable to register user.",
        });
    }
};


const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required.",
            });
        }

        const result = await loginUser({
            email: email.trim().toLowerCase(),
            password,
        });

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            data: result,
        });

    } catch (error) {
        console.error("Login error:", error);

        if (error.message === "INVALID_CREDENTIALS") {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Unable to login.",
        });
    }
};


const me = async (req, res) => {
    return res.status(200).json({
        success: true,
        data: req.user,
    });
};


const Alluser = async (req, res) => {
    try {
        const page = Math.max(
            parseInt(req.query.page, 10) || 1,
            1
        );

        const limit = Math.min(
            Math.max(parseInt(req.query.limit, 10) || 10, 1),
            100
        );

        const offset = (page - 1) * limit;
        const search = (req.query.search || "").trim();

        const whereCondition = {};

        if (search) {
            whereCondition[Op.or] = [
                {
                    name: {
                        [Op.like]: `%${search}%`,
                    },
                },
                {
                    email: {
                        [Op.like]: `%${search}%`,
                    },
                },
                {
                    phone: {
                        [Op.like]: `%${search}%`,
                    },
                },
            ];
        }

        const { count, rows } = await User.findAndCountAll({
            where: whereCondition,

            attributes: {
                exclude: [
                    "password",
                    "password_hash",
                    "passwordHash",
                ],
            },

            order: [["createdAt", "DESC"]],

            limit,
            offset,
        });

        return res.status(200).json({
            success: true,
            message: "Users fetched successfully.",
            data: rows,
            pagination: {
                totalUsers: count,
                currentPage: page,
                totalPages: Math.ceil(count / limit),
                limit,
            },
        });

    } catch (error) {
        console.error("Alluser error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch users.",
        });
    }
};


export {
    register,
    login,
    me,
    Alluser,
};