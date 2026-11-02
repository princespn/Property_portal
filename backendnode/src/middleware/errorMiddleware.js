
export const errorHandler = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    console.error(err);

    if (err.name === "SequelizeValidationError") {
        return res.status(400).json({
            success: false,
            message: "Database validation failed.",
            errors: err.errors.map((item) => item.message),
        });
    }

    if (err.name === "SequelizeUniqueConstraintError") {
        return res.status(409).json({
            success: false,
            message: "A record with this value already exists.",
        });
    }

    return res.status(500).json({
        success: false,
        message: "An unexpected server error occurred.",
    });
};

//module.exports = { errorHandler };