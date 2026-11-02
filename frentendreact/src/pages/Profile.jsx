import React, { useEffect, useState } from "react";
import api from "../services/api";

const ProfileDashboard = () => {
    const [user, setUser] = useState(null);
    const [properties, setProperties] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            // Get logged-in user
            const userResponse = await api.get("/auth/me");

            const loggedInUser =
                userResponse.data.user ||
                userResponse.data.data ||
                userResponse.data;

            setUser(loggedInUser);

            // Get user's properties
            const propertyResponse =
                await api.get("/properties");

            const propertyData =
                propertyResponse.data.properties ||
                propertyResponse.data.data ||
                propertyResponse.data ||
                [];

            setProperties(propertyData);

        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to load dashboard."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const totalProperties = properties.length;

    const activeProperties = properties.filter(
        (property) => property.status === "active"
    ).length;

    const pendingProperties = properties.filter(
        (property) =>
            property.status === "pending_approval"
    ).length;

    const rejectedProperties = properties.filter(
        (property) => property.status === "rejected"
    ).length;

    if (loading) {
        return (
            <div className="container py-5 text-center">

                <div
                    className="spinner-border text-primary"
                    role="status"
                >
                    <span className="visually-hidden">
                        Loading...
                    </span>
                </div>

                <p className="text-muted mt-2">
                    Loading dashboard...
                </p>

            </div>
        );
    }

    return (
        <div className="container-fluid bg-light min-vh-100 py-4">

            {/* Header */}
            <div className="container">

                <div className="mb-4">

                    <h2 className="fw-bold mb-1">
                        My Dashboard
                    </h2>

                    <p className="text-muted mb-0">
                        Manage your profile and property listings.
                    </p>

                </div>

                {/* Error */}
                {error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )}

                {/* Profile + Stats */}
                <div className="row g-4">

                    {/* Profile */}
                    <div className="col-lg-4">

                        <div className="card border-0 shadow-sm">

                            <div className="card-body text-center p-4">

                                {/* Avatar */}
                                <div
                                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3"
                                    style={{
                                        width: "90px",
                                        height: "90px",
                                        fontSize: "32px",
                                    }}
                                >
                                    {user?.name
                                        ?.charAt(0)
                                        ?.toUpperCase() || "U"}
                                </div>

                                <h4 className="fw-bold mb-1">
                                    {user?.name || "User"}
                                </h4>

                                <p className="text-muted mb-2">
                                    {user?.email}
                                </p>

                                <span className="badge bg-primary">
                                    {user?.role || "User"}
                                </span>

                                <hr />

                                <div className="text-start">

                                    <div className="mb-3">

                                        <small className="text-muted">
                                            Name
                                        </small>

                                        <div className="fw-semibold">
                                            {user?.name || "N/A"}
                                        </div>

                                    </div>

                                    <div className="mb-3">

                                        <small className="text-muted">
                                            Email
                                        </small>

                                        <div className="fw-semibold">
                                            {user?.email || "N/A"}
                                        </div>

                                    </div>

                                    <div className="mb-3">

                                        <small className="text-muted">
                                            Phone
                                        </small>

                                        <div className="fw-semibold">
                                            {user?.phone || "N/A"}
                                        </div>

                                    </div>

                                    <div>

                                        <small className="text-muted">
                                            Member Since
                                        </small>

                                        <div className="fw-semibold">
                                            {user?.createdAt
                                                ? new Date(
                                                      user.createdAt
                                                  ).toLocaleDateString(
                                                      "en-IN"
                                                  )
                                                : "N/A"}
                                        </div>

                                    </div>

                                </div>

                                <button
                                    type="button"
                                    className="btn btn-primary w-100 mt-4"
                                >
                                    <i className="bi bi-pencil me-2"></i>
                                    Edit Profile
                                </button>

                            </div>

                        </div>

                    </div>

                    {/* Right Side */}
                    <div className="col-lg-8">

                        {/* Statistics */}
                        <div className="row g-3 mb-4">

                            <div className="col-md-6 col-xl-3">

                                <div className="card border-0 shadow-sm h-100">

                                    <div className="card-body">

                                        <div className="text-muted small">
                                            Total Properties
                                        </div>

                                        <h3 className="fw-bold mt-2 mb-0">
                                            {totalProperties}
                                        </h3>

                                    </div>

                                </div>

                            </div>

                            <div className="col-md-6 col-xl-3">

                                <div className="card border-0 shadow-sm h-100">

                                    <div className="card-body">

                                        <div className="text-muted small">
                                            Active
                                        </div>

                                        <h3 className="fw-bold text-success mt-2 mb-0">
                                            {activeProperties}
                                        </h3>

                                    </div>

                                </div>

                            </div>

                            <div className="col-md-6 col-xl-3">

                                <div className="card border-0 shadow-sm h-100">

                                    <div className="card-body">

                                        <div className="text-muted small">
                                            Pending
                                        </div>

                                        <h3 className="fw-bold text-warning mt-2 mb-0">
                                            {pendingProperties}
                                        </h3>

                                    </div>

                                </div>

                            </div>

                            <div className="col-md-6 col-xl-3">

                                <div className="card border-0 shadow-sm h-100">

                                    <div className="card-body">

                                        <div className="text-muted small">
                                            Rejected
                                        </div>

                                        <h3 className="fw-bold text-danger mt-2 mb-0">
                                            {rejectedProperties}
                                        </h3>

                                    </div>

                                </div>

                            </div>

                        </div>

                        {/* Properties */}
                        <div className="card border-0 shadow-sm">

                            <div className="card-header bg-white border-0 py-3">

                                <div className="d-flex justify-content-between align-items-center">

                                    <h5 className="fw-bold mb-0">
                                        My Properties
                                    </h5>

                                    <button
                                        type="button"
                                        className="btn btn-sm btn-primary"
                                    >
                                        + Add Property
                                    </button>

                                </div>

                            </div>

                            <div className="card-body p-0">

                                {properties.length === 0 ? (

                                    <div className="text-center py-5">

                                        <i className="bi bi-building fs-1 text-muted"></i>

                                        <h6 className="mt-3">
                                            No Properties
                                        </h6>

                                        <p className="text-muted">
                                            You have not added any properties yet.
                                        </p>

                                    </div>

                                ) : (

                                    <div className="table-responsive">

                                        <table className="table table-hover align-middle mb-0">

                                            <thead className="table-light">

                                                <tr>

                                                    <th className="px-3">
                                                        Property
                                                    </th>

                                                    <th>
                                                        Type
                                                    </th>

                                                    <th>
                                                        Price
                                                    </th>

                                                    <th>
                                                        Location
                                                    </th>

                                                    <th>
                                                        Status
                                                    </th>

                                                </tr>

                                            </thead>

                                            <tbody>

                                                {properties
                                                    .slice(0, 10)
                                                    .map(
                                                        (
                                                            property
                                                        ) => (
                                                            <tr
                                                                key={
                                                                    property.id
                                                                }
                                                            >

                                                                <td className="px-3">

                                                                    <div className="fw-semibold">
                                                                        {
                                                                            property.title
                                                                        }
                                                                    </div>

                                                                    <small className="text-muted">
                                                                        #
                                                                        {
                                                                            property.id
                                                                        }
                                                                    </small>

                                                                </td>

                                                                <td>
                                                                    {
                                                                        property.propertyType
                                                                    }
                                                                </td>

                                                                <td>
                                                                    ₹
                                                                    {Number(
                                                                        property.price
                                                                    ).toLocaleString(
                                                                        "en-IN"
                                                                    )}
                                                                </td>

                                                                <td>
                                                                    {
                                                                        property.city
                                                                    }
                                                                    ,{" "}
                                                                    {
                                                                        property.state
                                                                    }
                                                                </td>

                                                                <td>

                                                                    <span
                                                                        className={`badge ${
                                                                            property.status ===
                                                                            "active"
                                                                                ? "bg-success"
                                                                                : property.status ===
                                                                                  "pending_approval"
                                                                                ? "bg-warning text-dark"
                                                                                : property.status ===
                                                                                  "rejected"
                                                                                ? "bg-danger"
                                                                                : "bg-secondary"
                                                                        }`}
                                                                    >
                                                                        {property.status.replaceAll(
                                                                            "_",
                                                                            " "
                                                                        )}
                                                                    </span>

                                                                </td>

                                                            </tr>
                                                        )
                                                    )}

                                            </tbody>

                                        </table>

                                    </div>

                                )}

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default ProfileDashboard;
