import User from "../models/User.js";
import { verifyToken } from "../utils/jwt.js";

/**
 * Authenticate logged-in user
 */
export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication token is required.",
            });
        }

        const token = authHeader.substring(7);

        const decoded = verifyToken(token);

        if (!decoded?.id) {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication token.",
            });
        }

        const user = await User.findByPk(decoded.id, {
            attributes: [
                "id",
                "name",
                "email",
                "phone",
                "role",
            ],
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User no longer exists.",
            });
        }

        // Attach logged-in user to request
        req.user = user;

        next();
    } catch (error) {
        console.error("Authentication error:", error.message);

        return res.status(401).json({
            success: false,
            message: "Invalid or expired authentication token.",
        });
    }
};


/**
 * Generic role authorization
 *
 * Example:
 * allowRoles("admin")
 * allowRoles("agent", "dealer")
 */
export const allowRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to access this resource.",
            });
        }

        next();
    };
};



export const verifyAdmin = allowRoles("admin");



export const verifyAgent = allowRoles("agent");



export const verifyDealer = allowRoles("dealer");



export const verifyAgentOrDealer = allowRoles(
    "agent",
    "dealer"
);



export const verifyDashboardAccess = allowRoles(
    "admin",
    "agent",
    "dealer"
);


/**
 * Optional authentication
 *
 * User does NOT need to be logged in.
 *
 * If a valid token exists:
 *     req.user = user
 *
 * Otherwise:
 *     req.user remains undefined
 *
 * Request continues in both cases.
 */
export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (
            authHeader &&
            authHeader.startsWith("Bearer ")
        ) {
            const token = authHeader.substring(7);

            const decoded = verifyToken(token);

            if (decoded?.id) {
                const user = await User.findByPk(decoded.id, {
                    attributes: [
                        "id",
                        "name",
                        "email",
                        "phone",
                        "role",
                    ],
                });

                if (user) {
                    req.user = user;
                }
            }
        }
    } catch (error) {
        // Optional authentication should never block the request.
    }

    next();
};
