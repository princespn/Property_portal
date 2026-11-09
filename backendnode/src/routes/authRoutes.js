import express from   "express";

import { authenticate } from "../middleware/authMiddleware.js";
import * as authController from "../controllers/authController.js";

const router = express.Router();

router.post("/register", authController.register);

router.post("/login", authController.login);

router.get("/profile", authenticate, authController.me);

router.get("/users", authenticate, authController.Alluser);



export default router;