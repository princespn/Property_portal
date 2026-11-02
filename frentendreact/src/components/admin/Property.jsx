import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";

const INITIAL_FORM = {
    title: "",
    description: "",
    propertyType: "apartment",
    listingType: "sale",
    price: "",
    areaSqft: "",
    bedrooms: "",
    bathrooms: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    latitude: "",
    longitude: "",
    amenities: "",
    status: "pending_approval",
};

const AdminProperties = () => {
    const [properties, setProperties] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [statusUpdatingId, setStatusUpdatingId] = useState(null);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);

    const [editingId, setEditingId] = useState(null);
    const [viewingProperty, setViewingProperty] = useState(null);

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

    // --------------------------------------------------
    // Load properties
    // --------------------------------------------------

    const loadProperties = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/properties/admin/all", {
                params: {
                    page,
                    limit: 10,
                    search: appliedSearch,
                    status,
                },
            });

            const result = response.data;

            const rows = Array.isArray(result.data)
                ? result.data
                : [];

            setProperties(rows);

            setPagination({
                total: Number(result.pagination?.total || rows.length),
                page: Number(result.pagination?.page || page),
                limit: Number(result.pagination?.limit || 10),
                totalPages: Number(
                    result.pagination?.totalPages || 1
                ),
            });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Unable to load properties."
            );

            setProperties([]);
        } finally {
            setLoading(false);
        }
    }, [page, appliedSearch, status, refreshKey]);

    useEffect(() => {
        loadProperties();
    }, [loadProperties]);

    // --------------------------------------------------
    // Search
    // --------------------------------------------------

    const handleSearch = (e) => {
        e.preventDefault();

        setPage(1);
        setAppliedSearch(search.trim());
    };

    // --------------------------------------------------
    // Status filter
    // --------------------------------------------------

    const handleStatusChange = (e) => {
        setStatus(e.target.value);
        setPage(1);
    };

    // --------------------------------------------------
    // Form
    // --------------------------------------------------

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // --------------------------------------------------
    // Create modal
    // --------------------------------------------------

    const openCreateModal = () => {
        setEditingId(null);
        setForm({ ...INITIAL_FORM });

        setError("");
        setSuccess("");

        setShowModal(true);
    };

    // --------------------------------------------------
    // Edit modal
    // --------------------------------------------------

    const openEditModal = (property) => {
        setEditingId(property.id);

        setForm({
            title: property.title || "",
            description: property.description || "",
            propertyType: property.propertyType || "apartment",
            listingType: property.listingType || "sale",
            price: property.price || "",
            areaSqft: property.areaSqft || "",
            bedrooms: property.bedrooms || "",
            bathrooms: property.bathrooms || "",
            address: property.address || "",
            city: property.city || "",
            state: property.state || "",
            pincode: property.pincode || "",
            latitude: property.latitude || "",
            longitude: property.longitude || "",
            amenities: Array.isArray(property.amenities)
                ? property.amenities.join(", ")
                : property.amenities || "",
            status: property.status || "pending_approval",
        });

        setError("");
        setSuccess("");

        setShowModal(true);
    };

    // --------------------------------------------------
    // View property
    // --------------------------------------------------

    const openViewModal = (property) => {
        setViewingProperty(property);
        setShowViewModal(true);
    };

    const closeModal = () => {
        if (!saving) {
            setShowModal(false);
        }
    };

    const closeViewModal = () => {
        setShowViewModal(false);
        setViewingProperty(null);
    };

    // --------------------------------------------------
    // Create / Update
    // --------------------------------------------------

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");
        setSaving(true);

        try {
            const payload = {
                title: form.title.trim(),
                description: form.description.trim(),

                propertyType: form.propertyType,
                listingType: form.listingType,

                price: form.price,

                areaSqft: form.areaSqft || null,
                bedrooms: form.bedrooms || null,
                bathrooms: form.bathrooms || null,

                address: form.address.trim(),
                city: form.city.trim(),
                state: form.state.trim(),
                pincode: form.pincode.trim(),

                latitude: form.latitude || null,
                longitude: form.longitude || null,

                amenities: form.amenities
                    ? form.amenities
                          .split(",")
                          .map((item) => item.trim())
                          .filter(Boolean)
                    : [],

                status: form.status,
            };

            if (editingId !== null) {
                await api.put(
                    `/properties/admin/${editingId}`,
                    payload
                );

                setSuccess(
                    "Property updated successfully."
                );
            } else {
                await api.post("/properties", payload);

                setSuccess(
                    "Property created successfully."
                );
            }

            setShowModal(false);
            setEditingId(null);
            setForm({ ...INITIAL_FORM });

            setPage(1);

            setRefreshKey((key) => key + 1);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Unable to save property."
            );
        } finally {
            setSaving(false);
        }
    };

    // --------------------------------------------------
    // Update property status
    // --------------------------------------------------

    const updateStatus = async (propertyId, newStatus) => {
        setError("");
        setSuccess("");

        setStatusUpdatingId(propertyId);

        try {
            await api.patch(
                `/properties/admin/${propertyId}/status`,
                {
                    status: newStatus,
                }
            );

            setSuccess(
                `Property ${newStatus.replace("_", " ")} successfully.`
            );

            setRefreshKey((key) => key + 1);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Unable to update property status."
            );
        } finally {
            setStatusUpdatingId(null);
        }
    };

    // --------------------------------------------------
    // Delete
    // --------------------------------------------------

    const handleDelete = async (id) => {
        if (
            !window.confirm(
                "Are you sure you want to delete this property?"
            )
        ) {
            return;
        }

        setError("");
        setSuccess("");

        setDeletingId(id);

        try {
            await api.delete(
                `/properties/admin/${id}`
            );

            setSuccess(
                "Property deleted successfully."
            );

            if (properties.length === 1 && page > 1) {
                setPage((current) => current - 1);
            } else {
                setRefreshKey((key) => key + 1);
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Unable to delete property."
            );
        } finally {
            setDeletingId(null);
        }
    };

    // --------------------------------------------------
    // Status badge
    // --------------------------------------------------

    const getStatusBadge = (propertyStatus) => {
        const classes = {
            draft: "text-bg-secondary",
            pending_approval: "text-bg-warning",
            active: "text-bg-success",
            sold: "text-bg-info",
            rejected: "text-bg-danger",
        };

        const labels = {
            draft: "Draft",
            pending_approval: "Pending Approval",
            active: "Active",
            sold: "Sold",
            rejected: "Rejected",
        };

        return (
            <span
                className={`badge ${
                    classes[propertyStatus] ||
                    "text-bg-secondary"
                }`}
            >
                {labels[propertyStatus] ||
                    propertyStatus ||
                    "Unknown"}
            </span>
        );
    };

    // --------------------------------------------------
    // Property type
    // --------------------------------------------------

    const getPropertyType = (type) => {
        const labels = {
            apartment: "Apartment",
            house: "House",
            plot: "Plot",
            commercial: "Commercial",
        };

        return labels[type] || type || "-";
    };

    // --------------------------------------------------
    // Listing type
    // --------------------------------------------------

    const getListingType = (type) => {
        return type === "rent" ? "Rent" : "Sale";
    };

    // --------------------------------------------------
    // Format price
    // --------------------------------------------------

    const formatPrice = (price) => {
        if (!price) {
            return "-";
        }

        const number = Number(price);

        if (Number.isNaN(number)) {
            return price;
        }

        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(number);
    };

    return (
        <div className="properties-page">

            {/* Page Heading */}

            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">

                <div>
                    <h3 className="fw-bold mb-1">
                        Property Management
                    </h3>

                    <p className="text-muted mb-0">
                        Create, manage and approve properties.
                    </p>
                </div>

                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={openCreateModal}
                >
                    <i className="bi bi-plus-lg me-2"></i>
                    Add Property
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

            {/* Search / Filter */}

            <div className="card border-0 shadow-sm mb-4">

                <div className="card-body">

                    <form
                        onSubmit={handleSearch}
                        className="row g-3"
                    >

                        <div className="col-12 col-md-5">

                            <label className="form-label">
                                Search properties
                            </label>

                            <input
                                type="search"
                                className="form-control"
                                placeholder="Title, city, address..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                            />

                        </div>

                        <div className="col-12 col-md-4">

                            <label className="form-label">
                                Filter by status
                            </label>

                            <select
                                className="form-select"
                                value={status}
                                onChange={handleStatusChange}
                            >
                                <option value="">
                                    All Statuses
                                </option>

                                <option value="draft">
                                    Draft
                                </option>

                                <option value="pending_approval">
                                    Pending Approval
                                </option>

                                <option value="active">
                                    Active
                                </option>

                                <option value="sold">
                                    Sold
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

            {/* Property Table */}

            <div className="card border-0 shadow-sm">

                <div className="card-header bg-white py-3">

                    <div className="d-flex justify-content-between align-items-center">

                        <h5 className="mb-0">
                            All Properties
                        </h5>

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
                            Loading properties...
                        </p>

                    </div>
                ) : (
                    <div className="table-responsive">

                        <table className="table table-hover align-middle mb-0">

                            <thead className="table-light">

                                <tr>
                                    <th>ID</th>
                                    <th>Property</th>
                                    <th>Dealer</th>
                                    <th>Type</th>
                                    <th>Price</th>
                                    <th>Location</th>
                                    <th>Status</th>
                                    <th className="text-end">
                                        Actions
                                    </th>
                                </tr>

                            </thead>

                            <tbody>

                                {properties.map((property) => (

                                    <tr key={property.id}>

                                        <td>
                                            #{property.id}
                                        </td>

                                        <td>
                                            <div className="fw-semibold">
                                                {property.title}
                                            </div>

                                            <small className="text-muted">
                                                {getListingType(
                                                    property.listingType
                                                )}
                                            </small>
                                        </td>

                                        <td>
                                            <div className="fw-semibold">
                                                {property.dealer?.name ||
                                                    "-"}
                                            </div>

                                            {property.dealer
                                                ?.dealerProfile
                                                ?.agencyName && (
                                                <small className="text-muted">
                                                    {
                                                        property.dealer
                                                            .dealerProfile
                                                            .agencyName
                                                    }
                                                </small>
                                            )}
                                        </td>

                                        <td>
                                            {getPropertyType(
                                                property.propertyType
                                            )}
                                        </td>

                                        <td>
                                            {formatPrice(
                                                property.price
                                            )}
                                        </td>

                                        <td>
                                            <div>
                                                {property.city || "-"}
                                            </div>

                                            <small className="text-muted">
                                                {property.state || ""}
                                            </small>
                                        </td>

                                        <td>
                                            {getStatusBadge(
                                                property.status
                                            )}
                                        </td>

                                        <td>

                                            <div className="d-flex justify-content-end flex-wrap gap-2">

                                                {/* View */}

                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-secondary"
                                                    onClick={() =>
                                                        openViewModal(
                                                            property
                                                        )
                                                    }
                                                >
                                                    <i className="bi bi-eye me-1"></i>
                                                    View
                                                </button>

                                                {/* Edit */}

                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() =>
                                                        openEditModal(
                                                            property
                                                        )
                                                    }
                                                >
                                                    Edit
                                                </button>

                                                {/* Approve */}

                                                {property.status ===
                                                    "pending_approval" && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-success"
                                                        disabled={
                                                            statusUpdatingId ===
                                                            property.id
                                                        }
                                                        onClick={() =>
                                                            updateStatus(
                                                                property.id,
                                                                "active"
                                                            )
                                                        }
                                                    >
                                                        {statusUpdatingId ===
                                                        property.id ? (
                                                            <>
                                                                <span className="spinner-border spinner-border-sm me-1" />
                                                                Updating
                                                            </>
                                                        ) : (
                                                            <>
                                                                <i className="bi bi-check-lg me-1"></i>
                                                                Approve
                                                            </>
                                                        )}
                                                    </button>
                                                )}

                                                {/* Reject */}

                                                {property.status ===
                                                    "pending_approval" && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-danger"
                                                        disabled={
                                                            statusUpdatingId ===
                                                            property.id
                                                        }
                                                        onClick={() =>
                                                            updateStatus(
                                                                property.id,
                                                                "rejected"
                                                            )
                                                        }
                                                    >
                                                        Reject
                                                    </button>
                                                )}

                                                {/* Unpublish */}

                                                {property.status ===
                                                    "active" && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-warning"
                                                        disabled={
                                                            statusUpdatingId ===
                                                            property.id
                                                        }
                                                        onClick={() =>
                                                            updateStatus(
                                                                property.id,
                                                                "draft"
                                                            )
                                                        }
                                                    >
                                                        Unpublish
                                                    </button>
                                                )}

                                                {/* Delete */}

                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-danger"
                                                    disabled={
                                                        deletingId ===
                                                        property.id
                                                    }
                                                    onClick={() =>
                                                        handleDelete(
                                                            property.id
                                                        )
                                                    }
                                                >
                                                    {deletingId ===
                                                    property.id
                                                        ? "Deleting..."
                                                        : "Delete"}
                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                ))}

                                {properties.length === 0 && (

                                    <tr>

                                        <td
                                            colSpan="8"
                                            className="text-center py-5 text-muted"
                                        >
                                            No properties found.
                                        </td>

                                    </tr>

                                )}

                            </tbody>

                        </table>

                    </div>
                )}

                {/* Pagination */}

                {!loading &&
                    pagination.totalPages > 1 && (

                        <div className="card-footer bg-white">

                            <div className="d-flex justify-content-between align-items-center">

                                <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm"
                                    disabled={page <= 1}
                                    onClick={() =>
                                        setPage(
                                            (current) =>
                                                current - 1
                                        )
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
                                        page >=
                                        pagination.totalPages
                                    }
                                    onClick={() =>
                                        setPage(
                                            (current) =>
                                                current + 1
                                        )
                                    }
                                >
                                    Next
                                </button>

                            </div>

                        </div>
                    )}

            </div>

            {/* ======================================================
                CREATE / EDIT MODAL
            ====================================================== */}

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
                            className="modal-dialog modal-dialog-centered modal-xl"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >

                            <div className="modal-content">

                                <form onSubmit={handleSubmit}>

                                    <div className="modal-header">

                                        <h5 className="modal-title">
                                            {editingId !== null
                                                ? "Edit Property"
                                                : "Add New Property"}
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

                                            {/* Title */}

                                            <div className="col-md-8">

                                                <label className="form-label">
                                                    Property Title *
                                                </label>

                                                <input
                                                    type="text"
                                                    name="title"
                                                    className="form-control"
                                                    value={form.title}
                                                    onChange={
                                                        handleChange
                                                    }
                                                    maxLength={255}
                                                    required
                                                />

                                            </div>

                                            {/* Property Type */}

                                            <div className="col-md-2">

                                                <label className="form-label">
                                                    Property Type *
                                                </label>

                                                <select
                                                    name="propertyType"
                                                    className="form-select"
                                                    value={
                                                        form.propertyType
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    required
                                                >
                                                    <option value="apartment">
                                                        Apartment
                                                    </option>

                                                    <option value="house">
                                                        House
                                                    </option>

                                                    <option value="plot">
                                                        Plot
                                                    </option>

                                                    <option value="commercial">
                                                        Commercial
                                                    </option>
                                                </select>

                                            </div>

                                            {/* Listing Type */}

                                            <div className="col-md-2">

                                                <label className="form-label">
                                                    Listing *
                                                </label>

                                                <select
                                                    name="listingType"
                                                    className="form-select"
                                                    value={
                                                        form.listingType
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    required
                                                >
                                                    <option value="sale">
                                                        Sale
                                                    </option>

                                                    <option value="rent">
                                                        Rent
                                                    </option>
                                                </select>

                                            </div>

                                            {/* Price */}

                                            <div className="col-md-3">

                                                <label className="form-label">
                                                    Price *
                                                </label>

                                                <input
                                                    type="number"
                                                    name="price"
                                                    className="form-control"
                                                    value={form.price}
                                                    onChange={
                                                        handleChange
                                                    }
                                                    min="0"
                                                    required
                                                />

                                            </div>

                                            {/* Area */}

                                            <div className="col-md-3">

                                                <label className="form-label">
                                                    Area Sqft
                                                </label>

                                                <input
                                                    type="number"
                                                    name="areaSqft"
                                                    className="form-control"
                                                    value={
                                                        form.areaSqft
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    min="0"
                                                />

                                            </div>

                                            {/* Bedrooms */}

                                            <div className="col-md-3">

                                                <label className="form-label">
                                                    Bedrooms
                                                </label>

                                                <input
                                                    type="number"
                                                    name="bedrooms"
                                                    className="form-control"
                                                    value={
                                                        form.bedrooms
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    min="0"
                                                />

                                            </div>

                                            {/* Bathrooms */}

                                            <div className="col-md-3">

                                                <label className="form-label">
                                                    Bathrooms
                                                </label>

                                                <input
                                                    type="number"
                                                    name="bathrooms"
                                                    className="form-control"
                                                    value={
                                                        form.bathrooms
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    min="0"
                                                />

                                            </div>

                                            {/* Address */}

                                            <div className="col-12">

                                                <label className="form-label">
                                                    Address *
                                                </label>

                                                <textarea
                                                    name="address"
                                                    className="form-control"
                                                    rows="2"
                                                    value={
                                                        form.address
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    required
                                                />

                                            </div>

                                            {/* City */}

                                            <div className="col-md-4">

                                                <label className="form-label">
                                                    City *
                                                </label>

                                                <input
                                                    type="text"
                                                    name="city"
                                                    className="form-control"
                                                    value={form.city}
                                                    onChange={
                                                        handleChange
                                                    }
                                                    required
                                                />

                                            </div>

                                            {/* State */}

                                            <div className="col-md-4">

                                                <label className="form-label">
                                                    State *
                                                </label>

                                                <input
                                                    type="text"
                                                    name="state"
                                                    className="form-control"
                                                    value={form.state}
                                                    onChange={
                                                        handleChange
                                                    }
                                                    required
                                                />

                                            </div>

                                            {/* Pincode */}

                                            <div className="col-md-4">

                                                <label className="form-label">
                                                    Pincode
                                                </label>

                                                <input
                                                    type="text"
                                                    name="pincode"
                                                    className="form-control"
                                                    value={
                                                        form.pincode
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    maxLength={20}
                                                />

                                            </div>

                                            {/* Latitude */}

                                            <div className="col-md-6">

                                                <label className="form-label">
                                                    Latitude
                                                </label>

                                                <input
                                                    type="number"
                                                    step="any"
                                                    name="latitude"
                                                    className="form-control"
                                                    value={
                                                        form.latitude
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                />

                                            </div>

                                            {/* Longitude */}

                                            <div className="col-md-6">

                                                <label className="form-label">
                                                    Longitude
                                                </label>

                                                <input
                                                    type="number"
                                                    step="any"
                                                    name="longitude"
                                                    className="form-control"
                                                    value={
                                                        form.longitude
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                />

                                            </div>

                                            {/* Amenities */}

                                            <div className="col-12">

                                                <label className="form-label">
                                                    Amenities
                                                </label>

                                                <input
                                                    type="text"
                                                    name="amenities"
                                                    className="form-control"
                                                    placeholder="Parking, Swimming Pool, Gym, Security"
                                                    value={
                                                        form.amenities
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                />

                                                <small className="text-muted">
                                                    Separate amenities
                                                    with commas.
                                                </small>

                                            </div>

                                            {/* Description */}

                                            <div className="col-12">

                                                <label className="form-label">
                                                    Description
                                                </label>

                                                <textarea
                                                    name="description"
                                                    className="form-control"
                                                    rows="4"
                                                    value={
                                                        form.description
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                />

                                            </div>

                                            {/* Status */}

                                            <div className="col-md-4">

                                                <label className="form-label">
                                                    Status
                                                </label>

                                                <select
                                                    name="status"
                                                    className="form-select"
                                                    value={form.status}
                                                    onChange={
                                                        handleChange
                                                    }
                                                >
                                                    <option value="draft">
                                                        Draft
                                                    </option>

                                                    <option value="pending_approval">
                                                        Pending Approval
                                                    </option>

                                                    <option value="active">
                                                        Active
                                                    </option>

                                                    <option value="sold">
                                                        Sold
                                                    </option>

                                                    <option value="rejected">
                                                        Rejected
                                                    </option>
                                                </select>

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
                                                "Update Property"
                                            ) : (
                                                "Create Property"
                                            )}
                                        </button>

                                    </div>

                                </form>

                            </div>

                        </div>

                    </div>
                </>
            )}

            {/* ======================================================
                VIEW MODAL
            ====================================================== */}

            {showViewModal && viewingProperty && (
                <>
                    <div
                        className="modal-backdrop fade show"
                        style={{ zIndex: 1050 }}
                        onClick={closeViewModal}
                    />

                    <div
                        className="modal fade show d-block"
                        tabIndex="-1"
                        role="dialog"
                        aria-modal="true"
                        style={{ zIndex: 1055 }}
                        onClick={closeViewModal}
                    >

                        <div
                            className="modal-dialog modal-dialog-centered modal-lg"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >

                            <div className="modal-content">

                                <div className="modal-header">

                                    <h5 className="modal-title">
                                        Property Details
                                    </h5>

                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={closeViewModal}
                                        aria-label="Close"
                                    />

                                </div>

                                <div className="modal-body">

                                    <div className="row g-3">

                                        <div className="col-md-8">

                                            <h4 className="fw-bold">
                                                {
                                                    viewingProperty.title
                                                }
                                            </h4>

                                            <p className="text-muted mb-2">
                                                {
                                                    viewingProperty.description ||
                                                    "No description available."
                                                }
                                            </p>

                                        </div>

                                        <div className="col-md-4 text-md-end">

                                            {getStatusBadge(
                                                viewingProperty.status
                                            )}

                                        </div>

                                        <div className="col-md-6">

                                            <strong>
                                                Property Type:
                                            </strong>

                                            <div>
                                                {getPropertyType(
                                                    viewingProperty.propertyType
                                                )}
                                            </div>

                                        </div>

                                        <div className="col-md-6">

                                            <strong>
                                                Listing Type:
                                            </strong>

                                            <div>
                                                {getListingType(
                                                    viewingProperty.listingType
                                                )}
                                            </div>

                                        </div>

                                        <div className="col-md-6">

                                            <strong>
                                                Price:
                                            </strong>

                                            <div>
                                                {formatPrice(
                                                    viewingProperty.price
                                                )}
                                            </div>

                                        </div>

                                        <div className="col-md-6">

                                            <strong>
                                                Area:
                                            </strong>

                                            <div>
                                                {viewingProperty.areaSqft
                                                    ? `${viewingProperty.areaSqft} sqft`
                                                    : "-"}
                                            </div>

                                        </div>

                                        <div className="col-md-6">

                                            <strong>
                                                Bedrooms:
                                            </strong>

                                            <div>
                                                {viewingProperty.bedrooms ??
                                                    "-"}
                                            </div>

                                        </div>

                                        <div className="col-md-6">

                                            <strong>
                                                Bathrooms:
                                            </strong>

                                            <div>
                                                {viewingProperty.bathrooms ??
                                                    "-"}
                                            </div>

                                        </div>

                                        <div className="col-12">

                                            <strong>
                                                Address:
                                            </strong>

                                            <div>
                                                {
                                                    viewingProperty.address
                                                }
                                            </div>

                                        </div>

                                        <div className="col-md-4">

                                            <strong>
                                                City:
                                            </strong>

                                            <div>
                                                {
                                                    viewingProperty.city
                                                }
                                            </div>

                                        </div>

                                        <div className="col-md-4">

                                            <strong>
                                                State:
                                            </strong>

                                            <div>
                                                {
                                                    viewingProperty.state
                                                }
                                            </div>

                                        </div>

                                        <div className="col-md-4">

                                            <strong>
                                                Pincode:
                                            </strong>

                                            <div>
                                                {
                                                    viewingProperty.pincode ||
                                                    "-"
                                                }
                                            </div>

                                        </div>

                                        <div className="col-12">

                                            <strong>
                                                Dealer:
                                            </strong>

                                            <div>
                                                {
                                                    viewingProperty.dealer
                                                        ?.name ||
                                                    "-"
                                                }
                                            </div>

                                            {viewingProperty.dealer
                                                ?.email && (
                                                <small className="text-muted">
                                                    {
                                                        viewingProperty
                                                            .dealer
                                                            .email
                                                    }
                                                </small>
                                            )}

                                        </div>

                                        <div className="col-12">

                                            <strong>
                                                Amenities:
                                            </strong>

                                            <div className="mt-2">

                                                {Array.isArray(
                                                    viewingProperty.amenities
                                                ) &&
                                                viewingProperty
                                                    .amenities
                                                    .length > 0 ? (
                                                    viewingProperty.amenities.map(
                                                        (
                                                            amenity,
                                                            index
                                                        ) => (
                                                            <span
                                                                key={
                                                                    index
                                                                }
                                                                className="badge text-bg-light border me-2 mb-2"
                                                            >
                                                                {
                                                                    amenity
                                                                }
                                                            </span>
                                                        )
                                                    )
                                                ) : (
                                                    <span className="text-muted">
                                                        No amenities
                                                        added.
                                                    </span>
                                                )}

                                            </div>

                                        </div>

                                    </div>

                                </div>

                                <div className="modal-footer">

                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={
                                            closeViewModal
                                        }
                                    >
                                        Close
                                    </button>

                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={() => {
                                            closeViewModal();
                                            openEditModal(
                                                viewingProperty
                                            );
                                        }}
                                    >
                                        Edit Property
                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>
                </>
            )}

        </div>
    );
};

export default AdminProperties;