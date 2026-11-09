import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { errorHandler } from "./middleware/errorMiddleware.js";

import leadRoutes from "./routes/leadRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import propertyRoutes from "./routes/propertyRoutes.js";

const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));


app.use(helmet());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Node.js AI Lead API is running",
    });
});

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        service: "node-ai-lead-api",
        status: "healthy",
    });
});

app.use("/api/v1/properties", propertyRoutes);
app.use("/api/v1/leads", leadRoutes);
app.use("/api/v1/auth", authRoutes);
app.use(errorHandler);

export default app;