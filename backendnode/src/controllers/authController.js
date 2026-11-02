
import {
    register as registerUser,
    login as loginUser,
} from "../services/authService.js";



const register = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
        } = req.body;

        
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
        const {
            email,
            password,
        } = req.body;

        // Required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required.",
            });
        }

        // Login through service
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


export {
    register,
    login,
    me,
};
