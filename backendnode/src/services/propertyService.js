import { Op } from "sequelize";
import Property from "../models/Property.js";
import User from "../models/User.js";

const PROPERTY_FIELDS = [
    "title",
    "description",
    "propertyType",
    "listingType",
    "price",
    "areaSqft",
    "bedrooms",
    "bathrooms",
    "address",
    "city",
    "state",
    "pincode",
    "latitude",
    "longitude",
    "amenities",
];

const PROPERTY_STATUSES = [
    "draft",
    "pending_approval",
    "active",
    "sold",
    "rejected",
];

const createError = (message, statusCode = 400) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const getPagination = (query = {}) => {
    const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
    const limit = Math.min(
        100,
        Math.max(1, Number.parseInt(query.limit, 10) || 10)
    );

    return {
        page,
        limit,
        offset: (page - 1) * limit,
    };
};

const getAllowedPropertyData = (data = {}) => {
    const result = {};

    for (const field of PROPERTY_FIELDS) {
        if (data[field] !== undefined) {
            result[field] = data[field];
        }
    }

    return result;
};

const validatePropertyData = (data, { partial = false } = {}) => {
    if (!partial) {
        const requiredFields = [
            "title",
            "description",
            "propertyType",
            "listingType",
            "price",
            "address",
            "city",
            "state",
        ];

        for (const field of requiredFields) {
            if (
                data[field] === undefined ||
                data[field] === null ||
                String(data[field]).trim() === ""
            ) {
                throw createError(`${field} is required.`);
            }
        }
    }

    if (
        data.title !== undefined &&
        (typeof data.title !== "string" || !data.title.trim())
    ) {
        throw createError("A valid property title is required.");
    }

    if (
        data.propertyType !== undefined &&
        !["apartment", "house", "plot", "commercial"].includes(
            data.propertyType
        )
    ) {
        throw createError("Invalid property type.");
    }

    if (
        data.listingType !== undefined &&
        !["sale", "rent"].includes(data.listingType)
    ) {
        throw createError("Invalid listing type.");
    }

    if (data.price !== undefined) {
        const price = Number(data.price);

        if (!Number.isFinite(price) || price < 0) {
            throw createError("Price must be a valid non-negative number.");
        }

        data.price = price;
    }

    for (const field of ["areaSqft", "bedrooms", "bathrooms"]) {
        if (data[field] !== undefined && data[field] !== null && data[field] !== "") {
            const value = Number(data[field]);

            if (!Number.isFinite(value) || value < 0) {
                throw createError(`${field} must be a valid non-negative number.`);
            }

            data[field] = value;
        }
    }
};

/* PUBLIC: Get active properties */

export const fetchAllProperties = async (query = {}) => {
    const { page, limit, offset } = getPagination(query);

    const where = {
        status: "active",
    };

    if (query.city) {
        where.city = { [Op.iLike]: `%${query.city.trim()}%` };
    }

    if (query.propertyType) {
        where.propertyType = query.propertyType;
    }

    if (query.listingType) {
        where.listingType = query.listingType;
    }

    if (query.minPrice !== undefined && query.minPrice !== "") {
        const minPrice = Number(query.minPrice);

        if (!Number.isFinite(minPrice) || minPrice < 0) {
            throw createError("Invalid minimum price.");
        }

        where.price = {
            ...(where.price || {}),
            [Op.gte]: minPrice,
        };
    }

    if (query.maxPrice !== undefined && query.maxPrice !== "") {
        const maxPrice = Number(query.maxPrice);

        if (!Number.isFinite(maxPrice) || maxPrice < 0) {
            throw createError("Invalid maximum price.");
        }

        where.price = {
            ...(where.price || {}),
            [Op.lte]: maxPrice,
        };
    }

    if (
        where.price?.[Op.gte] !== undefined &&
        where.price?.[Op.lte] !== undefined &&
        where.price[Op.gte] > where.price[Op.lte]
    ) {
        throw createError("Minimum price cannot exceed maximum price.");
    }

    const result = await Property.findAndCountAll({
        where,
        limit,
        offset,
        order: [["id", "DESC"]],
    });

    return {
        success: true,
        total: result.count,
        page,
        limit,
        totalPages: Math.ceil(result.count / limit),
        properties: result.rows,
    };
};

/* PUBLIC: Get one active property */

export const fetchPropertyById = async (id) => {
    return Property.findOne({
        where: {
            id,
            status: "active",
        },
    });
};

/* AGENT / DEALER: Create property */

export const createProperty = async (userId, propertyData) => {
    const user = await User.findByPk(userId, {
        attributes: ["id", "role"],
    });

    if (!user || !["agent", "dealer"].includes(user.role)) {
        throw createError("Only agents and dealers can add properties.", 403);
    }

    const data = getAllowedPropertyData(propertyData);

    validatePropertyData(data);

    return Property.create({
        ...data,
        dealerId: userId,
        status: "pending_approval",
    });
};

/* AGENT / DEALER: Get own properties */

export const fetchProperties = async (userId, status) => {
    const where = {
        dealerId: userId,
    };

    if (status) {
        if (!PROPERTY_STATUSES.includes(status)) {
            throw createError("Invalid property status.");
        }

        where.status = status;
    }

    return Property.findAll({
        where,
        order: [["id", "DESC"]],
    });
};

/* AGENT / DEALER: Update own property */

export const updateProperty = async (
    propertyId,
    userId,
    propertyData
) => {
    const user = await User.findByPk(userId, {
        attributes: ["id", "role"],
    });

    if (!user || !["agent", "dealer"].includes(user.role)) {
        throw createError("Only agents and dealers can edit properties.", 403);
    }

    const property = await Property.findOne({
        where: {
            id: propertyId,
            dealerId: userId,
        },
    });

    if (!property) {
        return null;
    }

    const updates = getAllowedPropertyData(propertyData);

    if (Object.keys(updates).length === 0) {
        throw createError("No valid property fields were provided.");
    }

    validatePropertyData(updates, { partial: true });

    await property.update({
        ...updates,
        status: "pending_approval",
    });

    return property;
};

/* AGENT / DEALER: Delete own property */

export const deleteProperty = async (propertyId, userId) => {
    const user = await User.findByPk(userId, {
        attributes: ["id", "role"],
    });

    if (!user || !["agent", "dealer"].includes(user.role)) {
        throw createError("Only agents and dealers can delete properties.", 403);
    }

    const property = await Property.findOne({
        where: {
            id: propertyId,
            dealerId: userId,
        },
    });

    if (!property) {
        return false;
    }

    await property.destroy();

    return true;
};

/* ADMIN: View all properties */

export const adminGetAllPropertiesService = async (query = {}) => {
    const { page, limit, offset } = getPagination(query);

    const where = {};

    if (query.status) {
        if (!PROPERTY_STATUSES.includes(query.status)) {
            throw createError("Invalid property status.");
        }

        where.status = query.status;
    }

    if (query.search?.trim()) {
        const search = `%${query.search.trim()}%`;

        where[Op.or] = [
            { title: { [Op.iLike]: search } },
            { city: { [Op.iLike]: search } },
            { address: { [Op.iLike]: search } },
        ];
    }

    const result = await Property.findAndCountAll({
        where,
        include: [
            {
                model: User,
                as: "dealer",
                attributes: ["id", "name", "email", "phone", "role"],
            },
        ],
        limit,
        offset,
        order: [["id", "DESC"]],
        distinct: true,
    });

    return {
        total: result.count,
        page,
        limit,
        totalPages: Math.ceil(result.count / limit),
        properties: result.rows,
    };
};

/* ADMIN: Approve or reject pending property */

export const adminApproveRejectPropertyService = async (
    propertyId,
    status
) => {
    if (!["active", "rejected"].includes(status)) {
        throw createError('Status must be either "active" or "rejected".');
    }

    const property = await Property.findOne({
        where: {
            id: propertyId,
            status: "pending_approval",
        },
    });

    if (!property) {
        return null;
    }

    await property.update({ status });

    return property;
};
