
const ALLOWED_STATUSES = [
    "new",
    "contacted",
    "qualified",
    "converted",
    "rejected",
];

export const validateLead = (req, res, next) => {
    const isUpdate = req.method === "PUT";
    const body = req.body || {};
    const errors = [];

    const allowedFields = [
        "name",
        "email",
        "company",
        "message",
        "status",
    ];

    const suppliedFields = Object.keys(body);

    if (suppliedFields.some((field) => !allowedFields.includes(field))) {
        errors.push("Request contains unsupported fields.");
    }

    if (!isUpdate || body.name !== undefined) {
        if (
            typeof body.name !== "string" ||
            body.name.trim().length < 2 ||
            body.name.trim().length > 100
        ) {
            errors.push("Name must contain 2 to 100 characters.");
        }
    }

    if (!isUpdate || body.email !== undefined) {
        if (
            typeof body.email !== "string" ||
            body.email.length > 150 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)
        ) {
            errors.push("A valid email address is required.");
        }
    }

    if (body.company !== undefined) {
        if (
            body.company !== null &&
            (typeof body.company !== "string" ||
                body.company.length > 150)
        ) {
            errors.push("Company must be a string of at most 150 characters.");
        }
    }

    if (!isUpdate || body.message !== undefined) {
        if (
            typeof body.message !== "string" ||
            body.message.trim().length < 1 ||
            body.message.length > 10000
        ) {
            errors.push("Message is required and must not exceed 10000 characters.");
        }
    }

    if (body.status !== undefined) {
        if (!ALLOWED_STATUSES.includes(body.status)) {
            errors.push("Invalid lead status.");
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: "Validation failed.",
            errors,
        });
    }

    next();
};

export default { validateLead };