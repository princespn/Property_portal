
import * as leadService from "../services/leadService.js";


export const createLead = async (req, res, next) => {
    try {
        const { name, email, company, message } = req.body;

        const lead = await leadService.createLead({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            company: company?.trim() || null,
            message: message.trim(),
            userId: req.user.id,
        });

        return res.status(201).json({
            success: true,
            message: "Lead created successfully.",
            data: lead,
        });
    } catch (error) {
        next(error);
    }
};

export const getAllLeads = async (req, res, next) => {
    try {
        const result = await leadService.getAllLeads(req.user.id, {
            page: req.query.page,
            limit: req.query.limit,
            search: req.query.search,
            status: req.query.status,
            sortBy: req.query.sortBy,
            sortOrder: req.query.sortOrder,
        });

        return res.json({
            success: true,
            ...result,
        });
    } catch (error) {
        next(error);
    }
};

export const getLeadById = async (req, res, next) => {
    try {
        const lead = await leadService.getLeadById(
            req.params.id,
            req.user.id
        );

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: "Lead not found.",
            });
        }

        return res.json({ success: true, data: lead });
    } catch (error) {
        next(error);
    }
};

export const updateLead = async (req, res, next) => {
    try {
        const allowedFields = [
            "name",
            "email",
            "company",
            "message",
            "status",
        ];

        const data = Object.fromEntries(
            Object.entries(req.body).filter(([key]) =>
                allowedFields.includes(key)
            )
        );

        if (data.name !== undefined) data.name = data.name.trim();
        if (data.email !== undefined) {
            data.email = data.email.trim().toLowerCase();
        }
        if (data.company !== undefined) {
            data.company = data.company?.trim() || null;
        }
        if (data.message !== undefined) {
            data.message = data.message.trim();
        }

        const lead = await leadService.updateLead(
            req.params.id,
            req.user.id,
            data
        );

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: "Lead not found.",
            });
        }

        return res.json({
            success: true,
            message: "Lead updated successfully.",
            data: lead,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteLead = async (req, res, next) => {
    try {
        const deleted = await leadService.deleteLead(
            req.params.id,
            req.user.id
        );

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Lead not found.",
            });
        }

        return res.json({
            success: true,
            message: "Lead deleted successfully.",
        });
    } catch (error) {
        next(error);
    }
};

