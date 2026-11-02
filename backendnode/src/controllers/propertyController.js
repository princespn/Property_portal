import {
    fetchAllProperties,
    fetchPropertyById,
    createProperty,
    fetchProperties,
    updateProperty,
    deleteProperty,
    adminGetAllPropertiesService,
    adminApproveRejectPropertyService,
} from "../services/propertyService.js";

const handleError = (res, error, fallbackMessage) => {
    console.error(fallbackMessage, error);

    return res.status(error.statusCode || 500).json({
        success: false,
        message:
            error.statusCode && error.statusCode < 500
                ? error.message
                : fallbackMessage,
    });
};

/* PUBLIC: Get active properties */

export const getAllProperties = async (req, res) => {
    try {
        const result = await fetchAllProperties(req.query);

        return res.status(200).json(result);
    } catch (error) {
        return handleError(res, error, "Unable to fetch properties.");
    }
};

/* PUBLIC: Get active property by ID */

export const getPropertyById = async (req, res) => {
    try {
        const property = await fetchPropertyById(req.params.id);

        if (!property) {
            return res.status(404).json({
                success: false,
                message: "Property not found.",
            });
        }

        return res.status(200).json({
            success: true,
            property,
        });
    } catch (error) {
        return handleError(res, error, "Unable to fetch property.");
    }
};

/* AGENT / DEALER: Create property */

export const createProperties = async (req, res) => {
    try {
        const property = await createProperty(
            req.user.id,
            req.body
        );

        return res.status(201).json({
            success: true,
            message: "Property submitted for admin approval.",
            property,
        });
    } catch (error) {
        return handleError(res, error, "Unable to create property.");
    }
};

/* AGENT / DEALER: Get own properties */

export const getMyProperties = async (req, res) => {
    try {
        const properties = await fetchProperties(
            req.user.id,
            req.query.status
        );

        return res.status(200).json({
            success: true,
            total: properties.length,
            properties,
        });
    } catch (error) {
        return handleError(res, error, "Unable to fetch your properties.");
    }
};

/* AGENT / DEALER: Update own property */

export const updateProperties = async (req, res) => {
    try {
        const property = await updateProperty(
            req.params.id,
            req.user.id,
            req.body
        );

        if (!property) {
            return res.status(404).json({
                success: false,
                message: "Property not found or access denied.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Property updated and submitted for approval.",
            property,
        });
    } catch (error) {
        return handleError(res, error, "Unable to update property.");
    }
};

/* AGENT / DEALER: Delete own property */

export const deleteProperties = async (req, res) => {
    try {
        const deleted = await deleteProperty(
            req.params.id,
            req.user.id
        );

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Property not found or access denied.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Property deleted successfully.",
        });
    } catch (error) {
        return handleError(res, error, "Unable to delete property.");
    }
};

/* ADMIN: Get all properties */


export const adminGetAllProperties = async (req, res) => {
    try {
        console.log("Admin properties query:", req.query);

        const result = await adminGetAllPropertiesService(req.query);

        console.log("Admin properties result:", result);

        return res.status(200).json({
            success: true,
            ...result,
        });
    } catch (error) {
        console.error("Admin get all properties error:", error);
        console.error("Error message:", error.message);
        console.error("SQL:", error.sql);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Unable to fetch all properties.",
        });
    }
};


/* ADMIN: Approve or reject pending property */

export const adminApproveRejectProperty = async (req, res) => {
    try {
        const { status } = req.body;

        if (!["active", "rejected"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Status must be either "active" or "rejected".',
            });
        }

        const property = await adminApproveRejectPropertyService(
            req.params.id,
            status
        );

        if (!property) {
            return res.status(404).json({
                success: false,
                message: "Pending property not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message:
                status === "active"
                    ? "Property approved successfully."
                    : "Property rejected successfully.",
            property,
        });
    } catch (error) {
        return handleError(
            res,
            error,
            "Unable to update property status."
        );
    }
};