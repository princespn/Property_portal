
import { Op } from "sequelize";
import Lead from "../models/Lead.js";

export const ALLOWED_SORT_FIELDS = [
    "id",
    "name",
    "email",
    "company",
    "status",
    "aiScore",
    "createdAt",
    "updatedAt",
];

export const getAllLeads = async (userId, filters = {}) => {
    const parsedPage = Number.parseInt(filters.page, 10);
    const parsedLimit = Number.parseInt(filters.limit, 10);

    const page = Number.isInteger(parsedPage) && parsedPage > 0
        ? parsedPage
        : 1;

    const limit = Number.isInteger(parsedLimit) && parsedLimit > 0
        ? Math.min(parsedLimit, 100)
        : 10;

    const offset = (page - 1) * limit;

    const sortBy = ALLOWED_SORT_FIELDS.includes(filters.sortBy)
        ? filters.sortBy
        : "createdAt";

    const sortOrder =
        String(filters.sortOrder).toUpperCase() === "ASC"
            ? "ASC"
            : "DESC";

    const where = { userId };

    if (filters.status) {
        where.status = filters.status;
    }

    if (filters.search && filters.search.trim()) {
        const term = filters.search.trim().slice(0, 100);

        where[Op.or] = [
            { name: { [Op.iLike]: `%${term}%` } },
            { email: { [Op.iLike]: `%${term}%` } },
            { company: { [Op.iLike]: `%${term}%` } },
            { message: { [Op.iLike]: `%${term}%` } },
        ];
    }

    const { count, rows } = await Lead.findAndCountAll({
        where,
        order: [[sortBy, sortOrder], ["id", "DESC"]],
        limit,
        offset,
    });

    return {
        data: rows,
        pagination: {
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit),
        },
    };
};

export const createLead = async (data) => Lead.create(data);

export const getLeadById = async (id, userId) => {
    return Lead.findOne({ where: { id, userId } });
};

export const updateLead = async (id, userId, data) => {
    const lead = await Lead.findOne({ where: { id, userId } });

    if (!lead) {
        return null;
    }

    await lead.update(data);
    return lead;
};

export const deleteLead = async (id, userId) => {
    const lead = await Lead.findOne({ where: { id, userId } });

    if (!lead) {
        return null;
    }

    await lead.destroy();
    return true;
};

