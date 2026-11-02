import express from "express";

import {
    getAllProperties,
    getPropertyById,
    createProperties,
    getMyProperties,
    updateProperties,
    deleteProperties,
    adminGetAllProperties,
    adminApproveRejectProperty
} from "../controllers/propertyController.js";

import {
    authenticate,
    verifyAdmin,
    verifyAgentOrDealer,
} from "../middleware/authMiddleware.js";

import { uploadPropertyImages } from "../middleware/uploadMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| ADMIN / SUPER ADMIN
|--------------------------------------------------------------------------
| Admin can view all properties and approve/reject pending properties.
| Admin cannot create, edit, or delete properties.
*/

// GET /api/v1/properties/admin/all
router.get(
    "/admin/all",
    authenticate,
    verifyAdmin,
    adminGetAllProperties
);

// PATCH /api/v1/properties/admin/:id/status
router.patch(
    "/admin/:id/status",
    authenticate,
    verifyAdmin,
    adminApproveRejectProperty
);


/*
|--------------------------------------------------------------------------
| AGENT / DEALER
|--------------------------------------------------------------------------
| Agent and Dealer can manage only their own properties.
*/

// GET /api/v1/properties/my-listings
router.get(
    "/my-listings",
    authenticate,
    verifyAgentOrDealer,
    getMyProperties
);

// POST /api/v1/properties
router.post(
    "/",
    authenticate,
    verifyAgentOrDealer,
    uploadPropertyImages.array("images", 5),
    createProperties
);

// PUT /api/v1/properties/:id
router.put(
    "/:id",
    authenticate,
    verifyAgentOrDealer,
    uploadPropertyImages.array("images", 5),
    updateProperties
);

// DELETE /api/v1/properties/:id
router.delete(
    "/:id",
    authenticate,
    verifyAgentOrDealer,
    deleteProperties
);


/*
|--------------------------------------------------------------------------
| PUBLIC
|--------------------------------------------------------------------------
| Only active properties are returned by the service.
*/

// GET /api/v1/properties
router.get("/", getAllProperties);

// GET /api/v1/properties/:id
router.get("/:id", getPropertyById);

export default router;
