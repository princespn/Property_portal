import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";

const EMPTY_FORM = {
    title: "",
    description: "",
    propertyType: "house",
    propertySubType: "",
    listingType: "sale",
    price: "",
    priceBreakup: "",
    areaSqft: "",
    carpetAreaSqft: "",
    bedrooms: "",
    bathrooms: "",
    balconies: "",
    furnishing: "",
    facing: "",
    transactionType: "",
    availability: "",
    constructionAge: "",
    ownershipType: "",
    parkingSpaces: "",
    parkingType: "",
    projectName: "",
    locality: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    latitude: "",
    longitude: "",
    reraRegistered: "",
    reraNumber: "",
    amenities: "",
};

const AgentProperties = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [viewing, setViewing] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ ...EMPTY_FORM });
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

    const loadProperties = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const { data: result } = await api.get(
                "/properties/my-listings",
                {
                    params: {
                        page,
                        limit: 10,
                        search: appliedSearch,
                        status,
                    },
                }
            );

            const rows = Array.isArray(result.data)
                ? result.data
                : Array.isArray(result.properties)
                ? result.properties
                : Array.isArray(result.data?.properties)
                ? result.data.properties
                : [];

            const pg = result.pagination || result.data?.pagination || {};

            setProperties(rows);

            setPagination({
                total: Number(pg.total ?? rows.length),
                page: Number(pg.page ?? page),
                limit: Number(pg.limit ?? 10),
                totalPages: Number(pg.totalPages ?? 1),
            });
        } catch (err) {
            setProperties([]);
            setError(
                err.response?.data?.message ||
                "Unable to load your properties."
            );
        } finally {
            setLoading(false);
        }
    }, [page, appliedSearch, status, refreshKey]);

    useEffect(() => {
        loadProperties();
    }, [loadProperties]);

    const changeForm = (e) => {
        setForm((old) => ({
            ...old,
            [e.target.name]: e.target.value,
        }));
    };

    const openCreate = () => {
        setEditingId(null);
        setForm({ ...EMPTY_FORM });
        setError("");
        setShowForm(true);
    };

    const openEdit = (p) => {
        setEditingId(p.id);

        const updatedForm = {};

        Object.keys(EMPTY_FORM).forEach((key) => {
            if (key === "amenities") {
                updatedForm[key] = Array.isArray(p.amenities)
                    ? p.amenities.join(", ")
                    : p.amenities || "";
            } else if (key === "reraRegistered") {
                updatedForm[key] =
                    p.reraRegistered === true
                        ? "true"
                        : p.reraRegistered === false
                        ? "false"
                        : "";
            } else {
                updatedForm[key] = p[key] ?? EMPTY_FORM[key];
            }
        });

        setForm(updatedForm);
        setError("");
        setShowForm(true);
    };

    const submitForm = async (e) => {
        e.preventDefault();

        setSaving(true);
        setError("");
        setSuccess("");

        const numericOrNull = (value) =>
            value === "" || value === null ? null : Number(value);

        const payload = {
            ...form,

            title: form.title.trim(),
            description: form.description.trim(),
            address: form.address.trim(),
            city: form.city.trim(),
            state: form.state.trim(),
            pincode: form.pincode.trim(),

            price: Number(form.price),

            areaSqft: numericOrNull(form.areaSqft),
            carpetAreaSqft: numericOrNull(form.carpetAreaSqft),
            bedrooms: numericOrNull(form.bedrooms),
            bathrooms: numericOrNull(form.bathrooms),
            balconies: numericOrNull(form.balconies),
            parkingSpaces: numericOrNull(form.parkingSpaces),
            latitude: numericOrNull(form.latitude),
            longitude: numericOrNull(form.longitude),

            reraRegistered:
                form.reraRegistered === ""
                    ? null
                    : form.reraRegistered === "true",

            amenities: form.amenities
                ? form.amenities
                      .split(",")
                      .map((x) => x.trim())
                      .filter(Boolean)
                : [],
        };

        delete payload.status;

        try {
            if (editingId !== null) {
                await api.put(`/properties/${editingId}`, payload);
                setSuccess(
                    "Property updated and submitted for approval again."
                );
            } else {
                await api.post("/properties", payload);
                setSuccess(
                    "Property created and submitted for approval."
                );
            }

            setShowForm(false);
            setEditingId(null);
            setForm({ ...EMPTY_FORM });
            setPage(1);
            setRefreshKey((n) => n + 1);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to save property."
            );
        } finally {
            setSaving(false);
        }
    };

    const deleteProperty = async (p) => {
        if (!window.confirm(`Delete "${p.title}"? This cannot be undone.`)) {
            return;
        }

        setDeletingId(p.id);
        setError("");
        setSuccess("");

        try {
            await api.delete(`/properties/${p.id}`);

            setSuccess("Property deleted successfully.");

            if (properties.length === 1 && page > 1) {
                setPage((n) => n - 1);
            } else {
                setRefreshKey((n) => n + 1);
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

    const statusBadge = (value) => {
        const cls = {
            draft: "text-bg-secondary",
            pending_approval: "text-bg-warning",
            active: "text-bg-success",
            sold: "text-bg-info",
            rejected: "text-bg-danger",
        };

        const label = {
            draft: "Draft",
            pending_approval: "Pending Approval",
            active: "Active",
            sold: "Sold",
            rejected: "Rejected",
        };

        return (
            <span className={`badge ${cls[value] || "text-bg-secondary"}`}>
                {label[value] || value || "Unknown"}
            </span>
        );
    };

    const propertyTypeLabel = (value) =>
        ({
            apartment: "Apartment",
            house: "House",
            plot: "Plot",
            commercial: "Commercial",
        }[value] || value || "-");

    const price = (value) => {
        if (value === null || value === undefined || value === "") {
            return "-";
        }

        const n = Number(value);

        return Number.isNaN(n)
            ? value
            : new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
              }).format(n);
    };

    const detail = (label, value) => (
        <div className="col-md-6">
            <strong>{label}:</strong>
            <div>{value === null || value === undefined || value === "" ? "-" : value}</div>
        </div>
    );

    return (
        <div className="properties-page">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div>
                    <h3 className="fw-bold mb-1">My Properties</h3>
                    <p className="text-muted mb-0">
                        Manage your listings and track their approval status.
                    </p>
                </div>

                <button
                    className="btn btn-primary"
                    type="button"
                    onClick={openCreate}
                >
                    <i className="bi bi-plus-lg me-2" />
                    Add Property
                </button>
            </div>

            {error && (
                <div className="alert alert-danger alert-dismissible">
                    {error}
                    <button
                        className="btn-close"
                        type="button"
                        onClick={() => setError("")}
                    />
                </div>
            )}

            {success && (
                <div className="alert alert-success alert-dismissible">
                    {success}
                    <button
                        className="btn-close"
                        type="button"
                        onClick={() => setSuccess("")}
                    />
                </div>
            )}

            {/* Search and filters */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                    <form
                        className="row g-3"
                        onSubmit={(e) => {
                            e.preventDefault();
                            setPage(1);
                            setAppliedSearch(search.trim());
                        }}
                    >
                        <div className="col-md-6">
                            <label className="form-label">Search properties</label>
                            <input
                                className="form-control"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Title, city, address..."
                            />
                        </div>

                        <div className="col-md-3">
                            <label className="form-label">Status</label>
                            <select
                                className="form-select"
                                value={status}
                                onChange={(e) => {
                                    setStatus(e.target.value);
                                    setPage(1);
                                }}
                            >
                                <option value="">All statuses</option>
                                <option value="draft">Draft</option>
                                <option value="pending_approval">Pending Approval</option>
                                <option value="active">Active</option>
                                <option value="sold">Sold</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>

                        <div className="col-md-3 d-flex align-items-end">
                            <button className="btn btn-dark w-100" type="submit">
                                <i className="bi bi-search me-2" />
                                Search
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Properties table */}
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white py-3 d-flex justify-content-between">
                    <h5 className="mb-0">My Listings</h5>
                    <span className="text-muted">Total: {pagination.total}</span>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" />
                        <p className="text-muted mt-3">Loading properties...</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>ID</th>
                                    <th>Property</th>
                                    <th>Type</th>
                                    <th>Price</th>
                                    <th>Location</th>
                                    <th>Status</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {properties.map((p) => (
                                    <tr key={p.id}>
                                        <td>#{p.id}</td>
                                        <td>
                                            <div className="fw-semibold">{p.title}</div>
                                            <small className="text-muted">
                                                {p.listingType === "rent" ? "Rent" : "Sale"}
                                            </small>
                                        </td>
                                        <td>
                                            {p.propertySubType || propertyTypeLabel(p.propertyType)}
                                        </td>
                                        <td>{price(p.price)}</td>
                                        <td>
                                            {p.city || "-"}
                                            <small className="d-block text-muted">
                                                {p.state || ""}
                                            </small>
                                        </td>
                                        <td>{statusBadge(p.status)}</td>
                                        <td>
                                            <div className="d-flex justify-content-end flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-secondary"
                                                    onClick={() => setViewing(p)}
                                                >
                                                    <i className="bi bi-eye me-1" />
                                                    View
                                                </button>

                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => openEdit(p)}
                                                >
                                                    <i className="bi bi-pencil me-1" />
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-danger"
                                                    disabled={deletingId === p.id}
                                                    onClick={() => deleteProperty(p)}
                                                >
                                                    {deletingId === p.id ? "Deleting..." : "Delete"}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {!properties.length && (
                                    <tr>
                                        <td colSpan="7" className="text-center text-muted py-5">
                                            No properties found. Add your first listing.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && pagination.totalPages > 1 && (
                    <div className="card-footer bg-white d-flex justify-content-between align-items-center">
                        <button
                            className="btn btn-outline-secondary btn-sm"
                            disabled={page <= 1}
                            onClick={() => setPage((n) => n - 1)}
                        >
                            Previous
                        </button>

                        <span className="small">
                            Page {pagination.page} of {pagination.totalPages}
                        </span>

                        <button
                            className="btn btn-outline-secondary btn-sm"
                            disabled={page >= pagination.totalPages}
                            onClick={() => setPage((n) => n + 1)}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Add / Edit Property Modal */}
            {showForm && (
                <div
                    className="modal fade show d-block"
                    role="dialog"
                    aria-modal="true"
                    tabIndex="-1"
                    style={{ background: "rgba(0,0,0,0.5)", zIndex: 1055 }}
                    onClick={() => !saving && setShowForm(false)}
                >
                    <div
                        className="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-content">
                            <form onSubmit={submitForm}>
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        {editingId !== null ? "Edit Property" : "Add Property"}
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        disabled={saving}
                                        onClick={() => setShowForm(false)}
                                    />
                                </div>

                                <div className="modal-body">
                                    <div className="alert alert-info">
                                        New and edited properties are sent for admin approval.
                                        You cannot set approval status yourself.
                                    </div>

                                    <div className="row g-3">
                                        {/* Basic details */}
                                        <div className="col-12">
                                            <h6 className="fw-bold border-bottom pb-2">
                                                Basic Property Details
                                            </h6>
                                        </div>

                                        <div className="col-md-8">
                                            <label className="form-label">Title *</label>
                                            <input
                                                className="form-control"
                                                name="title"
                                                value={form.title}
                                                onChange={changeForm}
                                                maxLength="255"
                                                required
                                            />
                                        </div>

                                        <div className="col-md-4">
                                            <label className="form-label">Property Type *</label>
                                            <select
                                                className="form-select"
                                                name="propertyType"
                                                value={form.propertyType}
                                                onChange={changeForm}
                                                required
                                            >
                                                <option value="apartment">Apartment</option>
                                                <option value="house">House</option>
                                                <option value="plot">Plot</option>
                                                <option value="commercial">Commercial</option>
                                            </select>
                                        </div>

                                        <div className="col-md-4">
                                            <label className="form-label">Property Subtype</label>
                                            <input
                                                className="form-control"
                                                name="propertySubType"
                                                value={form.propertySubType}
                                                onChange={changeForm}
                                                placeholder="Villa, Independent House..."
                                            />
                                        </div>

                                        <div className="col-md-4">
                                            <label className="form-label">Listing Type *</label>
                                            <select
                                                className="form-select"
                                                name="listingType"
                                                value={form.listingType}
                                                onChange={changeForm}
                                                required
                                            >
                                                <option value="sale">Sale</option>
                                                <option value="rent">Rent</option>
                                            </select>
                                        </div>

                                        <div className="col-md-4">
                                            <label className="form-label">Transaction Type</label>
                                            <select
                                                className="form-select"
                                                name="transactionType"
                                                value={form.transactionType}
                                                onChange={changeForm}
                                            >
                                                <option value="">Select</option>
                                                <option value="New Property">New Property</option>
                                                <option value="Resale">Resale</option>
                                            </select>
                                        </div>

                                        {/* Price and area */}
                                        <div className="col-12 mt-4">
                                            <h6 className="fw-bold border-bottom pb-2">
                                                Price and Area Details
                                            </h6>
                                        </div>

                                        <div className="col-md-4">
                                            <label className="form-label">Actual Price (₹) *</label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                className="form-control"
                                                name="price"
                                                value={form.price}
                                                onChange={changeForm}
                                                required
                                            />
                                        </div>

                                        <div className="col-md-4">
                                            <label className="form-label">Price Breakup</label>
                                            <input
                                                className="form-control"
                                                name="priceBreakup"
                                                value={form.priceBreakup}
                                                onChange={changeForm}
                                                placeholder="₹1 Cr"
                                            />
                                        </div>

                                        <div className="col-md-4">
                                            <label className="form-label">Area (sqft)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                className="form-control"
                                                name="areaSqft"
                                                value={form.areaSqft}
                                                onChange={changeForm}
                                            />
                                        </div>

                                        <div className="col-md-4">
                                            <label className="form-label">Carpet Area (sqft)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                className="form-control"
                                                name="carpetAreaSqft"
                                                value={form.carpetAreaSqft}
                                                onChange={changeForm}
                                            />
                                        </div>

                                        <div className="col-md-4">
                                            <label className="form-label">Bedrooms</label>
                                            <input
                                                type="number"
                                                min="0"
                                                className="form-control"
                                                name="bedrooms"
                                                value={form.bedrooms}
                                                onChange={changeForm}
                                            />
                                        </div>

                                        <div className="col-md-4">
                                            <label className="form-label">Bathrooms</label>
                                            <input
                                                type="number"
                                                min="0"
                                                className="form-control"
                                                name="bathrooms"
                                                value={form.bathrooms}
                                                onChange={changeForm}
                                            />
                                        </div>

                                        <div className="col-md-4">
                                            <label className="form-label">Balconies</label>
                                            <input
                                                type="number"
                                                min="0"
                                                className="form-control"
                                                name="balconies"
                                                value={form.balconies}
                                                onChange={changeForm}
                                            />
                                        </div>

                                        {/* Furnishing and construction */}
                                        <div className="col-12 mt-4">
                                            <h6 className="fw-bold border-bottom pb-2">
                                                Furnishing and Construction
                                            </h6>
                                        </div>

                                        <div className="col-md-4">
                                            <label className="form-label">Furnishing</label>
                                            <select
                                                className="form-select"
                                                name="furnishing"
                                                value={form.furnishing}
                                                onChange={changeForm}
                                            >
                                                <option value="">Select</option>
                                                <option value="Furnished">Furnished</option>
                                                <option value="Semi-Furnished">Semi-Furnished</option>
                                                <option value="Unfurnished">Unfurnished</option>
                                            </select>
                                        </div>

                                        <div className="col-md-4">
                                            <label className="form-label">Facing</label>
                                            <select
                                                className="form-select"
                                                name="facing"
                                                value={form.facing}
                                                onChange={changeForm}
                                            >
                                                <option value="">Select</option>
                                                {["North", "South", "East", "West", "North-East", "North-West", "South-East", "South-West"].map((v) => (
                                                    <option key={v} value={v}>{v}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="col-md-4">
                                            <label className="form-label">Availability</label>
                                            <select
                                                className="form-select"
                                                name="availability"
                                                value={form.availability}
                                                onChange={changeForm}
                                            >
                                                <option value="">Select</option>
                                                <option value="Ready to Move">Ready to Move</option>
                                                <option value="Under Construction">Under Construction</option>
                                            </select>
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label">Construction Age</label>
                                            <input
                                                className="form-control"
                                                name="constructionAge"
                                                value={form.constructionAge}
                                                onChange={changeForm}
                                                placeholder="New Construction, 5 years..."
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label">Ownership Type</label>
                                            <select
                                                className="form-select"
                                                name="ownershipType"
                                                value={form.ownershipType}
                                                onChange={changeForm}
                                            >
                                                <option value="">Select</option>
                                                <option value="Freehold">Freehold</option>
                                                <option value="Leasehold">Leasehold</option>
                                                <option value="Power of Attorney">Power of Attorney</option>
                                                <option value="Co-operative Society">Co-operative Society</option>
                                            </select>
                                        </div>

                                        {/* Parking */}
                                        <div className="col-12 mt-4">
                                            <h6 className="fw-bold border-bottom pb-2">
                                                Parking Details
                                            </h6>
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label">Parking Spaces</label>
                                            <input
                                                type="number"
                                                min="0"
                                                className="form-control"
                                                name="parkingSpaces"
                                                value={form.parkingSpaces}
                                                onChange={changeForm}
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label">Parking Type</label>
                                            <select
                                                className="form-select"
                                                name="parkingType"
                                                value={form.parkingType}
                                                onChange={changeForm}
                                            >
                                                <option value="">Select</option>
                                                <option value="Open">Open</option>
                                                <option value="Covered">Covered</option>
                                                <option value="Both">Both</option>
                                            </select>
                                        </div>

                                        {/* Project and location */}
                                        <div className="col-12 mt-4">
                                            <h6 className="fw-bold border-bottom pb-2">
                                                Project and Location
                                            </h6>
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label">Project Name</label>
                                            <input
                                                className="form-control"
                                                name="projectName"
                                                value={form.projectName}
                                                onChange={changeForm}
                                                placeholder="Gillco Palm"
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label">Locality</label>
                                            <input
                                                className="form-control"
                                                name="locality"
                                                value={form.locality}
                                                onChange={changeForm}
                                                placeholder="Sector 115"
                                            />
                                        </div>

                                        <div className="col-12">
                                            <label className="form-label">Address *</label>
                                            <textarea
                                                className="form-control"
                                                rows="2"
                                                name="address"
                                                value={form.address}
                                                onChange={changeForm}
                                                required
                                            />
                                        </div>

                                        <div className="col-md-4">
                                            <label className="form-label">City *</label>
                                            <input
                                                className="form-control"
                                                name="city"
                                                value={form.city}
                                                onChange={changeForm}
                                                required
                                            />
                                        </div>

                                        <div className="col-md-4">
                                            <label className="form-label">State *</label>
                                            <input
                                                className="form-control"
                                                name="state"
                                                value={form.state}
                                                onChange={changeForm}
                                                required
                                            />
                                        </div>

                                        <div className="col-md-4">
                                            <label className="form-label">Pincode</label>
                                            <input
                                                className="form-control"
                                                name="pincode"
                                                value={form.pincode}
                                                onChange={changeForm}
                                                maxLength="20"
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label">Latitude</label>
                                            <input
                                                type="number"
                                                step="any"
                                                min="-90"
                                                max="90"
                                                className="form-control"
                                                name="latitude"
                                                value={form.latitude}
                                                onChange={changeForm}
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label">Longitude</label>
                                            <input
                                                type="number"
                                                step="any"
                                                min="-180"
                                                max="180"
                                                className="form-control"
                                                name="longitude"
                                                value={form.longitude}
                                                onChange={changeForm}
                                            />
                                        </div>

                                        {/* RERA */}
                                        <div className="col-12 mt-4">
                                            <h6 className="fw-bold border-bottom pb-2">
                                                RERA Details
                                            </h6>
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label">RERA Registered?</label>
                                            <select
                                                className="form-select"
                                                name="reraRegistered"
                                                value={form.reraRegistered}
                                                onChange={changeForm}
                                            >
                                                <option value="">Not specified</option>
                                                <option value="true">Yes</option>
                                                <option value="false">No</option>
                                            </select>
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label">RERA Number</label>
                                            <input
                                                className="form-control"
                                                name="reraNumber"
                                                value={form.reraNumber}
                                                onChange={changeForm}
                                                placeholder="Enter RERA registration number"
                                            />
                                        </div>

                                        {/* Other */}
                                        <div className="col-12 mt-4">
                                            <h6 className="fw-bold border-bottom pb-2">
                                                Other Details
                                            </h6>
                                        </div>

                                        <div className="col-12">
                                            <label className="form-label">Amenities</label>
                                            <input
                                                className="form-control"
                                                name="amenities"
                                                value={form.amenities}
                                                onChange={changeForm}
                                                placeholder="Parking, Gym, Security"
                                            />
                                            <small className="text-muted">
                                                Separate amenities with commas.
                                            </small>
                                        </div>

                                        <div className="col-12">
                                            <label className="form-label">Description</label>
                                            <textarea
                                                className="form-control"
                                                rows="4"
                                                name="description"
                                                value={form.description}
                                                onChange={changeForm}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        disabled={saving}
                                        onClick={() => setShowForm(false)}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={saving}
                                    >
                                        {saving
                                            ? "Saving..."
                                            : editingId !== null
                                            ? "Update Property"
                                            : "Create Property"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* View Property Modal */}
            {viewing && (
                <div
                    className="modal fade show d-block"
                    role="dialog"
                    aria-modal="true"
                    tabIndex="-1"
                    style={{ background: "rgba(0,0,0,0.5)", zIndex: 1055 }}
                    onClick={() => setViewing(null)}
                >
                    <div
                        className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Property Details</h5>
                                <button
                                    className="btn-close"
                                    type="button"
                                    onClick={() => setViewing(null)}
                                />
                            </div>

                            <div className="modal-body">
                                <div className="d-flex justify-content-between gap-3 mb-3">
                                    <h4>{viewing.title}</h4>
                                    {statusBadge(viewing.status)}
                                </div>

                                <p className="text-muted">
                                    {viewing.description || "No description available."}
                                </p>

                                <div className="row g-3">
                                    {detail("Property Type", propertyTypeLabel(viewing.propertyType))}
                                    {detail("Subtype", viewing.propertySubType)}
                                    {detail("Listing Type", viewing.listingType)}
                                    {detail("Price", price(viewing.price))}
                                    {detail("Price Breakup", viewing.priceBreakup)}
                                    {detail("Area", viewing.areaSqft ? `${viewing.areaSqft} sqft` : "-")}
                                    {detail("Carpet Area", viewing.carpetAreaSqft ? `${viewing.carpetAreaSqft} sqft` : "-")}
                                    {detail("Bedrooms", viewing.bedrooms)}
                                    {detail("Bathrooms", viewing.bathrooms)}
                                    {detail("Balconies", viewing.balconies)}
                                    {detail("Furnishing", viewing.furnishing)}
                                    {detail("Facing", viewing.facing)}
                                    {detail("Transaction Type", viewing.transactionType)}
                                    {detail("Availability", viewing.availability)}
                                    {detail("Construction Age", viewing.constructionAge)}
                                    {detail("Ownership", viewing.ownershipType)}
                                    {detail("Parking Spaces", viewing.parkingSpaces)}
                                    {detail("Parking Type", viewing.parkingType)}
                                    {detail("Project Name", viewing.projectName)}
                                    {detail("Locality", viewing.locality)}
                                    {detail("Address", viewing.address)}
                                    {detail("City", viewing.city)}
                                    {detail("State", viewing.state)}
                                    {detail("Pincode", viewing.pincode)}
                                    {detail("RERA Registered", viewing.reraRegistered === true ? "Yes" : viewing.reraRegistered === false ? "No" : "-")}
                                    {detail("RERA Number", viewing.reraNumber)}
                                    <div className="col-12">
                                        <strong>Amenities:</strong>
                                        <div>
                                            {Array.isArray(viewing.amenities) && viewing.amenities.length
                                                ? viewing.amenities.join(", ")
                                                : "None"}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    className="btn btn-secondary"
                                    type="button"
                                    onClick={() => setViewing(null)}
                                >
                                    Close
                                </button>

                                <button
                                    className="btn btn-primary"
                                    type="button"
                                    onClick={() => {
                                        const p = viewing;
                                        setViewing(null);
                                        openEdit(p);
                                    }}
                                >
                                    Edit Property
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgentProperties;