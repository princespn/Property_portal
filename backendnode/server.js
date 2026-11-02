import "dotenv/config";

import app from "./src/app.js";
import { sequelize, connectDatabase } from "./src/config/database.js";

import "./src/models/User.js";
import "./src/models/Lead.js";

import "./src/models/DealerProfile.js";
import "./src/models/Property.js";
import "./src/models/Inquiry.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDatabase();

        await sequelize.sync();

        console.log("Database tables synchronized successfully.");

        app.listen(PORT, () => {
            console.log(`Server running on http://127.0.0.1:${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server due to database sync error:", error);
        process.exit(1);
    }
};

startServer();