import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";

const PAGE_LIMIT = 10;

const AdminProperties = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [search, setSearch] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");
    const [status, setStatus] = useState("");

    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        totalPages: 1,
    });

    const [updatingId, setUpdatingId] = useState(null);
    const [viewingProperty, setViewingProperty] = useState(null);

    const loadProperties = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await api.get(
                "/properties/admin/all",
                {
                    params: {
                        page,
                        limit: PAGE_LIMIT,
                        search: appliedSearch || undefined,
                        status: status || undefined,
                    },
                }
            );

            const result = response.data;

            // Support common controller response structures.
            const data = result.data ?? result;
            const rows = Array.isArray(data)
                ? data
                : data.properties ??
                  data.rows ??
                  data.items ??
                  [];

            const paginationData =
                result.pagination ??
                data.pagination ??
                {};

            setProperties(rows);

            setPagination({
                total: Number(
                    paginationData.total ?? rows.length
                ),
                page: Number(paginationData.page ?? page),
                totalPages: Number(
                    paginationData.totalPages ?? 1
                ),
            });
        } catch (err) {
            setProperties([]);
            setError(
                err.response?.data?.message ||
                "Unable to load properties."
            );
        } finally {
            setLoading(false);
        }
    }, [page, appliedSearch, status]);

    useEffect(() => {
        loadProperties();
    }, [loadProperties]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        setAppliedSearch(search.trim());
    };

    const handleStatusFilter = (e) => {
        setStatus(e.target.value);
        setPage(1);
    };

    const updateStatus = async (propertyId, newStatus) => {
        const action = newStatus === "active"
            ? "approve"
            : "reject";

        if (
            !window.confirm(
                `Are you sure you want to ${action} this property?`
            )
        ) {
            return;
        }

        setError("");
        setSuccess("");
        setUpdatingId(propertyId);

        try {
            await api.patch(
                `/properties/admin/${propertyId}/status`,
                { status: newStatus }
            );

            setSuccess(
                `Property ${action}d successfully.`
            );

            // Reload the current list after approval/rejection.
            await loadProperties();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                `Unable to ${action} property.`
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const formatPrice = (price) => {
        if (price === null || price === undefined || price === "") {
            return "-";
        }

        const amount = Number(price);

        if (Number.isNaN(amount)) {
            return String(price);
        }

        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getStatusBadge = (value) => {
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
                    classes[value] || "text-bg-secondary"
                }`}
            >
                {labels[value] || value || "Unknown"}
            </span>
        );
    };

    const getPropertyType = (value) => {
        const types = {
            apartment: "Apartment",
            house: "House",
            plot: "Plot",
            commercial: "Commercial",
        };

        return types[value] || value || "-";
    };

    return (
        <div className="container-fluid py-3">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div>
                    <h3 className="fw-bold mb-1">
                        Admin Property Dashboard
                    </h3>
                    <p className="text-muted mb-0">
                        Review, approve, and reject property listings.
                    </p>
                </div>

                <span className="badge text-bg-dark fs-6">
                    Total: {pagination.total}
                </span>
            </div>

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

            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                    <form
                        onSubmit={handleSearch}
                        className="row g-3"
                    >
                        <div className="col-12 col-md-6">
                            <label className="form-label">
                                Search properties
                            </label>
                            <input
                                type="search"
                                className="form-control"
                                placeholder="Search by title, city, or address"
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
                                onChange={handleStatusFilter}
                            >
                                <option value="">All statuses</option>
                                <option value="pending_approval">
                                    Pending Approval
                                </option>
                                <option value="active">Active</option>
                                <option value="rejected">Rejected</option>
                                <option value="draft">Draft</option>
                                <option value="sold">Sold</option>
                            </select>
                        </div>

                        <div className="col-12 col-md-3 d-flex align-items-end">
                            <button
                                type="submit"
                                className="btn btn-dark w-100"
                            >
                                <i className="bi bi-search me-2" />
                                Search
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white py-3">
                    <h5 className="mb-0">All Properties</h5>
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
                                    <th>Owner</th>
                                    <th>Type</th>
                                    <th>Price</th>
                                    <th>Location</th>
                                    <th>Status</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {properties.map((property) => (
                                    <tr key={property.id}>
                                        <td>#{property.id}</td>

                                        <td>
                                            <div className="fw-semibold">
                                                {property.title}
                                            </div>
                                            <small className="text-muted">
                                                {property.listingType === "rent"
                                                    ? "Rent"
                                                    : "Sale"}
                                            </small>
                                        </td>

                                        <td>
                                            <div>
                                                {property.dealer?.name ||
                                                    property.owner?.name ||
                                                    "-"}
                                            </div>
                                            <small className="text-muted">
                                                {property.dealer?.email ||
                                                    property.owner?.email ||
                                                    ""}
                                            </small>
                                        </td>

                                        <td>
                                            {getPropertyType(
                                                property.propertyType
                                            )}
                                        </td>

                                        <td>{formatPrice(property.price)}</td>

                                        <td>
                                            <div>{property.city || "-"}</div>
                                            <small className="text-muted">
                                                {property.state || ""}
                                            </small>
                                        </td>

                                        <td>
                                            {getStatusBadge(property.status)}
                                        </td>

                                        <td>
                                            <div className="d-flex justify-content-end flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-secondary"
                                                    onClick={() =>
                                                        setViewingProperty(property)
                                                    }
                                                >
                                                    <i className="bi bi-eye me-1" />
                                                    View
                                                </button>

                                                {property.status ===
                                                    "pending_approval" && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-success"
                                                            disabled={
                                                                updatingId === property.id
                                                            }
                                                            onClick={() =>
                                                                updateStatus(
                                                                    property.id,
                                                                    "active"
                                                                )
                                                            }
                                                        >
                                                            {updatingId === property.id
                                                                ? "Updating..."
                                                                : "Approve"}
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-danger"
                                                            disabled={
                                                                updatingId === property.id
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
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {properties.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan="8"
                                            className="text-center text-muted py-5"
                                        >
                                            No properties found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

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

            {viewingProperty && (
                <>
                    <div
                        className="modal-backdrop fade show"
                        onClick={() => setViewingProperty(null)}
                    />

                    <div
                        className="modal fade show d-block"
                        tabIndex="-1"
                        role="dialog"
                        aria-modal="true"
                        onClick={() => setViewingProperty(null)}
                    >
                        <div
                            className="modal-dialog modal-dialog-centered modal-lg"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        Property Details
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() =>
                                            setViewingProperty(null)
                                        }
                                        aria-label="Close"
                                    />
                                </div>

                                <div className="modal-body">
                                    <h4 className="fw-bold">
                                        {viewingProperty.title}
                                    </h4>

                                    <p className="text-muted">
                                        {viewingProperty.description ||
                                            "No description available."}
                                    </p>

                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <strong>Status:</strong>
                                            <div>
                                                {getStatusBadge(
                                                    viewingProperty.status
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <strong>Price:</strong>
                                            <div>
                                                {formatPrice(
                                                    viewingProperty.price
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <strong>Property type:</strong>
                                            <div>
                                                {getPropertyType(
                                                    viewingProperty.propertyType
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <strong>Listing type:</strong>
                                            <div>
                                                {viewingProperty.listingType ||
                                                    "-"}
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <strong>Area:</strong>
                                            <div>
                                                {viewingProperty.areaSqft
                                                    ? `${viewingProperty.areaSqft} sqft`
                                                    : "-"}
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <strong>Bedrooms / Bathrooms:</strong>
                                            <div>
                                                {viewingProperty.bedrooms ?? "-"}
                                                {" / "}
                                                {viewingProperty.bathrooms ?? "-"}
                                            </div>
                                        </div>

                                        <div className="col-12">
                                            <strong>Address:</strong>
                                            <div>
                                                {viewingProperty.address || "-"}
                                            </div>
                                            <div>
                                                {[
                                                    viewingProperty.city,
                                                    viewingProperty.state,
                                                    viewingProperty.pincode,
                                                ]
                                                    .filter(Boolean)
                                                    .join(", ") || "-"}
                                            </div>
                                        </div>

                                        <div className="col-12">
                                            <strong>Submitted by:</strong>
                                            <div>
                                                {viewingProperty.dealer?.name ||
                                                    viewingProperty.owner?.name ||
                                                    "-"}
                                            </div>
                                            <div className="text-muted">
                                                {viewingProperty.dealer?.email ||
                                                    viewingProperty.owner?.email ||
                                                    ""}
                                            </div>
                                        </div>

                                        <div className="col-12">
                                            <strong>Amenities:</strong>
                                            <div className="mt-2">
                                                {Array.isArray(
                                                    viewingProperty.amenities
                                                ) &&
                                                viewingProperty.amenities.length ? (
                                                    viewingProperty.amenities.map(
                                                        (item, index) => (
                                                            <span
                                                                key={`${item}-${index}`}
                                                                className="badge text-bg-light border me-2 mb-2"
                                                            >
                                                                {item}
                                                            </span>
                                                        )
                                                    )
                                                ) : (
                                                    <span className="text-muted">
                                                        No amenities added.
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
                                        onClick={() =>
                                            setViewingProperty(null)
                                        }
                                    >
                                        Close
                                    </button>

                                    {viewingProperty.status ===
                                        "pending_approval" && (
                                        <>
                                            <button
                                                type="button"
                                                className="btn btn-success"
                                                disabled={
                                                    updatingId ===
                                                    viewingProperty.id
                                                }
                                                onClick={async () => {
                                                    const id = viewingProperty.id;
                                                    setViewingProperty(null);
                                                    await updateStatus(
                                                        id,
                                                        "active"
                                                    );
                                                }}
                                            >
                                                Approve
                                            </button>

                                            <button
                                                type="button"
                                                className="btn btn-outline-danger"
                                                disabled={
                                                    updatingId ===
                                                    viewingProperty.id
                                                }
                                                onClick={async () => {
                                                    const id = viewingProperty.id;
                                                    setViewingProperty(null);
                                                    await updateStatus(
                                                        id,
                                                        "rejected"
                                                    );
                                                }}
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}
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
