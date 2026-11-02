import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";

const INITIAL_FORM = {
    name: "",
    email: "",
    company: "",
    message: "",
    status: "new",
};

const Leads = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [analyzingId, setAnalyzingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [search, setSearch] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);
    const [refreshKey, setRefreshKey] = useState(0);

    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
    });

    const [form, setForm] = useState(INITIAL_FORM);

    // Load leads whenever page, filters, or refresh key changes.
    const loadLeads = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/leads", {
                params: {
                    page,
                    limit: 10,
                    search: appliedSearch,
                    status,
                    sortBy: "createdAt",
                    sortOrder: "DESC",
                },
            });

            const result = response.data;

            // Expected controller response:
            // { success: true, data: [...], pagination: {...} }
            const rows = Array.isArray(result.data)
                ? result.data
                : [];

            setLeads(rows);

            setPagination({
                total: Number(result.pagination?.total || 0),
                page: Number(result.pagination?.page || page),
                limit: Number(result.pagination?.limit || 10),
                totalPages: Number(
                    result.pagination?.totalPages || 0
                ),
            });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load leads."
            );
            setLeads([]);
        } finally {
            setLoading(false);
        }
    }, [page, appliedSearch, status, refreshKey]);

    useEffect(() => {
        loadLeads();
    }, [loadLeads]);

    // Search
    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        setAppliedSearch(search.trim());
    };

    const handleStatusChange = (e) => {
        setStatus(e.target.value);
        setPage(1);
    };

    // Form
    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const openCreateModal = () => {
        setEditingId(null);
        setForm({ ...INITIAL_FORM });
        setError("");
        setSuccess("");
        setShowModal(true);
    };

    const openEditModal = (lead) => {
        setEditingId(lead.id);

        setForm({
            name: lead.name || "",
            email: lead.email || "",
            company: lead.company || "",
            message: lead.message || "",
            status: lead.status || "new",
        });

        setError("");
        setSuccess("");
        setShowModal(true);
    };

    const closeModal = () => {
        if (!saving) {
            setShowModal(false);
        }
    };

    // Create / Update
    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");
        setSaving(true);

        try {
            const payload = {
                name: form.name.trim(),
                email: form.email.trim().toLowerCase(),
                company: form.company.trim(),
                message: form.message.trim(),
                status: form.status,
            };

            if (editingId !== null) {
                await api.put(`/leads/${editingId}`, payload);
                setSuccess("Lead updated successfully.");
            } else {
                await api.post("/leads", payload);
                setSuccess("Lead created successfully.");
            }

            setShowModal(false);
            setEditingId(null);
            setForm({ ...INITIAL_FORM });
            setPage(1);
            setAppliedSearch("");
            setSearch("");
            setStatus("");
            setRefreshKey((key) => key + 1);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to save lead."
            );
        } finally {
            setSaving(false);
        }
    };

    // Delete
    const handleDelete = async (id) => {
        if (
            !window.confirm(
                "Are you sure you want to delete this lead?"
            )
        ) {
            return;
        }

        setError("");
        setSuccess("");
        setDeletingId(id);

        try {
            await api.delete(`/leads/${id}`);

            setSuccess("Lead deleted successfully.");

            // Return to the previous page if the last row was deleted.
            if (leads.length === 1 && page > 1) {
                setPage((current) => current - 1);
            } else {
                setRefreshKey((key) => key + 1);
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to delete lead."
            );
        } finally {
            setDeletingId(null);
        }
    };

    // AI Analysis
    const handleAnalyze = async (lead) => {
        setError("");
        setSuccess("");
        setAnalyzingId(lead.id);

        try {
            await api.post(`/leads/${lead.id}/analyze`);

            setSuccess(
                `AI analysis completed for ${lead.name}.`
            );

            setRefreshKey((key) => key + 1);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "AI analysis failed. Check that the backend and Ollama are running."
            );
        } finally {
            setAnalyzingId(null);
        }
    };

    // Status badge
    const getStatusBadge = (leadStatus) => {
        const classes = {
            new: "text-bg-primary",
            contacted: "text-bg-warning",
            qualified: "text-bg-info",
            converted: "text-bg-success",
            rejected: "text-bg-danger",
        };

        return (
            <span
                className={`badge ${
                    classes[leadStatus] || "text-bg-secondary"
                }`}
            >
                {leadStatus || "new"}
            </span>
        );
    };

    const getPriorityBadge = (priority) => {
        const value = String(priority || "").toLowerCase();

        const classes = {
            high: "text-bg-danger",
            medium: "text-bg-warning",
            low: "text-bg-success",
        };

        return priority ? (
            <span
                className={`badge ${
                    classes[value] || "text-bg-secondary"
                }`}
            >
                {priority}
            </span>
        ) : (
            <span className="text-muted">Not analyzed</span>
        );
    };

    return (
        <div className="leads-page">
            {/* Page heading */}
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div>
                    <h3 className="fw-bold mb-1">
                        Lead Management
                    </h3>
                    <p className="text-muted mb-0">
                        Create, manage and analyze your leads.
                    </p>
                </div>

                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={openCreateModal}
                >
                    <i className="bi bi-plus-lg me-2"></i>
                    Create Lead
                </button>
            </div>

            {/* Alerts */}
            {error && (
                <div className="alert alert-danger alert-dismissible">
                    {error}
                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setError("")}
                        aria-label="Close"
                    />
                </div>
            )}

            {success && (
                <div className="alert alert-success alert-dismissible">
                    {success}
                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setSuccess("")}
                        aria-label="Close"
                    />
                </div>
            )}

            {/* Search and filter */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                    <form
                        onSubmit={handleSearch}
                        className="row g-3"
                    >
                        <div className="col-12 col-md-6">
                            <label className="form-label">
                                Search leads
                            </label>
                            <input
                                type="search"
                                className="form-control"
                                placeholder="Name, email or company..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                            />
                        </div>

                        <div className="col-12 col-md-3">
                            <label className="form-label">
                                Filter by status
                            </label>
                            <select
                                className="form-select"
                                value={status}
                                onChange={handleStatusChange}
                            >
                                <option value="">All Statuses</option>
                                <option value="new">New</option>
                                <option value="contacted">
                                    Contacted
                                </option>
                                <option value="qualified">
                                    Qualified
                                </option>
                                <option value="converted">
                                    Converted
                                </option>
                                <option value="rejected">
                                    Rejected
                                </option>
                            </select>
                        </div>

                        <div className="col-12 col-md-3 d-flex align-items-end">
                            <button
                                type="submit"
                                className="btn btn-dark w-100"
                            >
                                <i className="bi bi-search me-2"></i>
                                Search
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Leads table */}
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white py-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">All Leads</h5>
                        <span className="text-muted">
                            Total: {pagination.total}
                        </span>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <div
                            className="spinner-border text-primary"
                            role="status"
                        />
                        <p className="text-muted mt-3 mb-0">
                            Loading leads...
                        </p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>ID</th>
                                    <th>Name / Email</th>
                                    <th>Company</th>
                                    <th>Status</th>
                                    <th>AI Score</th>
                                    <th>Priority</th>
                                    <th>Created</th>
                                    <th className="text-end">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {leads.map((lead) => (
                                    <tr key={lead.id}>
                                        <td>#{lead.id}</td>

                                        <td>
                                            <div className="fw-semibold">
                                                {lead.name}
                                            </div>
                                            <small className="text-muted">
                                                {lead.email}
                                            </small>
                                        </td>

                                        <td>
                                            {lead.company || "-"}
                                        </td>

                                        <td>
                                            {getStatusBadge(lead.status)}
                                        </td>

                                        <td>
                                            {lead.aiScore ?? "-"}
                                        </td>

                                        <td>
                                            {getPriorityBadge(
                                                lead.aiPriority
                                            )}
                                        </td>

                                        <td>
                                            {lead.createdAt
                                                ? new Date(
                                                    lead.createdAt
                                                ).toLocaleDateString()
                                                : "-"}
                                        </td>

                                        <td>
                                            <div className="d-flex justify-content-end flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-success"
                                                    disabled={
                                                        analyzingId !== null
                                                    }
                                                    onClick={() =>
                                                        handleAnalyze(lead)
                                                    }
                                                    title="Analyze lead with AI"
                                                >
                                                    {analyzingId === lead.id ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-1" />
                                                            Analyzing
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="bi bi-robot me-1"></i>
                                                            Analyze
                                                        </>
                                                    )}
                                                </button>

                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() =>
                                                        openEditModal(lead)
                                                    }
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-danger"
                                                    disabled={
                                                        deletingId === lead.id
                                                    }
                                                    onClick={() =>
                                                        handleDelete(lead.id)
                                                    }
                                                >
                                                    {deletingId === lead.id
                                                        ? "Deleting..."
                                                        : "Delete"}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {leads.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan="8"
                                            className="text-center py-5 text-muted"
                                        >
                                            No leads found. Create your first lead.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {!loading && pagination.totalPages > 1 && (
                    <div className="card-footer bg-white">
                        <div className="d-flex justify-content-between align-items-center">
                            <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm"
                                disabled={page <= 1}
                                onClick={() =>
                                    setPage((current) => current - 1)
                                }
                            >
                                Previous
                            </button>

                            <span className="small">
                                Page {pagination.page} of{" "}
                                {pagination.totalPages}
                            </span>

                            <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm"
                                disabled={
                                    page >= pagination.totalPages
                                }
                                onClick={() =>
                                    setPage((current) => current + 1)
                                }
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create / Edit modal */}
            {showModal && (
                <>
                    <div
                        className="modal-backdrop fade show"
                        style={{ zIndex: 1050 }}
                        onClick={closeModal}
                    />

                    <div
                        className="modal fade show d-block"
                        tabIndex="-1"
                        role="dialog"
                        aria-modal="true"
                        style={{ zIndex: 1055 }}
                        onClick={closeModal}
                    >
                        <div
                            className="modal-dialog modal-dialog-centered modal-lg"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-content">
                                <form onSubmit={handleSubmit}>
                                    <div className="modal-header">
                                        <h5 className="modal-title">
                                            {editingId !== null
                                                ? "Edit Lead"
                                                : "Create New Lead"}
                                        </h5>

                                        <button
                                            type="button"
                                            className="btn-close"
                                            onClick={closeModal}
                                            disabled={saving}
                                            aria-label="Close"
                                        />
                                    </div>

                                    <div className="modal-body">
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label className="form-label">
                                                    Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    className="form-control"
                                                    value={form.name}
                                                    onChange={handleChange}
                                                    maxLength={100}
                                                    required
                                                />
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label">
                                                    Email *
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    className="form-control"
                                                    value={form.email}
                                                    onChange={handleChange}
                                                    maxLength={150}
                                                    required
                                                />
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label">
                                                    Company
                                                </label>
                                                <input
                                                    type="text"
                                                    name="company"
                                                    className="form-control"
                                                    value={form.company}
                                                    onChange={handleChange}
                                                    maxLength={150}
                                                />
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label">
                                                    Status
                                                </label>
                                                <select
                                                    name="status"
                                                    className="form-select"
                                                    value={form.status}
                                                    onChange={handleChange}
                                                >
                                                    <option value="new">
                                                        New
                                                    </option>
                                                    <option value="contacted">
                                                        Contacted
                                                    </option>
                                                    <option value="qualified">
                                                        Qualified
                                                    </option>
                                                    <option value="converted">
                                                        Converted
                                                    </option>
                                                    <option value="rejected">
                                                        Rejected
                                                    </option>
                                                </select>
                                            </div>

                                            <div className="col-12">
                                                <label className="form-label">
                                                    Message *
                                                </label>
                                                <textarea
                                                    name="message"
                                                    className="form-control"
                                                    rows="4"
                                                    value={form.message}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="modal-footer">
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={closeModal}
                                            disabled={saving}
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={saving}
                                        >
                                            {saving ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" />
                                                    Saving...
                                                </>
                                            ) : editingId !== null ? (
                                                "Update Lead"
                                            ) : (
                                                "Create Lead"
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Leads;