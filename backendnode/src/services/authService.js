import bcrypt from "bcryptjs";

import User from "../models/User.js";
import { generateToken } from "../utils/jwt.js";

const register = async ({ name, email, password }) => {
    const existingUser = await User.findOne({
        where: { email },
    });

    if (existingUser) {
        throw new Error("EMAIL_EXISTS");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
    });

    const token = generateToken(user);

    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        token,
    };
};

const login = async ({ email, password }) => {
    const user = await User.findOne({
        where: { email },
    });

    if (!user) {
        throw new Error("INVALID_CREDENTIALS");
    }

    const passwordMatches = await bcrypt.compare(
        password,
        user.password
    );

    if (!passwordMatches) {
        throw new Error("INVALID_CREDENTIALS");
    }

    const token = generateToken(user);

    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        token,
    };
};

export {
    register,
    login,
};