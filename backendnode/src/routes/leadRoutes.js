
import express from "express";

import * as leadController from "../controllers/leadController.js";import { authenticate }  from "../middleware/authMiddleware.js";
import { validateLead }  from "../middleware/validateLead.js";

const router = express.Router();

router.use(authenticate);

router.post("/", validateLead, leadController.createLead);
router.get("/", leadController.getAllLeads);
router.get("/:id", leadController.getLeadById);
router.put("/:id", validateLead, leadController.updateLead);
router.delete("/:id", leadController.deleteLead); 


export default router;