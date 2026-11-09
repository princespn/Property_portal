import { useEffect, useState } from "react";
import api from "../services/api";

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({
        totalUsers: 0,
        totalPages: 0,
        limit: 10,
    });

    // Logged-in user
    const loggedInUser = JSON.parse(
        localStorage.getItem("node_ai_user") || "{}"
    );

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/auth/users", {
                params: {
                    page,
                    limit: pagination.limit,
                    search,
                },
            });

            const result = response.data;

            setUsers(result.data || []);

            setPagination(
                result.pagination || {
                    totalUsers: 0,
                    totalPages: 0,
                    limit: 10,
                }
            );

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load users."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (loggedInUser.role !== "admin") {
            setError("Access denied. Admin only.");
            setLoading(false);
            return;
        }

        fetchUsers();
    }, [page, search]);

    // Role badge
    const getRoleBadge = (role) => {
        switch (role) {
            case "admin":
                return "bg-danger";

            case "agent":
                return "bg-primary";

            case "dealer":
                return "bg-success";

            default:
                return "bg-secondary";
        }
    };

    // Access condition
    if (loggedInUser.role !== "admin") {
        return (
            <div className="alert alert-danger">
                You are not authorized to access this page.
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="mb-1">Users Management</h3>
                    <p className="text-muted mb-0">
                        Manage registered users.
                    </p>
                </div>

                <span className="badge bg-primary fs-6">
                    Total: {pagination.totalUsers}
                </span>
            </div>

            {/* Search */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search by name, email or phone..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            {/* Loading */}
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" />
                    <p className="mt-2">Loading users...</p>
                </div>
            ) : (
                <>
                    {/* Users Table */}
                    <div className="card border-0 shadow-sm">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">

                                <thead className="table-light">
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Role</th>
                                        <th>Registered</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id}>
                                            <td>{user.id}</td>

                                            <td className="fw-semibold">
                                                {user.name}
                                            </td>

                                            <td>{user.email}</td>

                                            <td>{user.phone || "-"}</td>

                                            <td>
                                                <span
                                                    className={`badge ${getRoleBadge(user.role)}`}
                                                >
                                                    {user.role || "user"}
                                                </span>
                                            </td>

                                            <td>
                                                {user.createdAt
                                                    ? new Date(
                                                        user.createdAt
                                                    ).toLocaleDateString("en-IN")
                                                    : "-"}
                                            </td>
                                        </tr>
                                    ))}

                                    {users.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan="6"
                                                className="text-center py-4 text-muted"
                                            >
                                                No users found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>

                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="card-footer bg-white d-flex justify-content-between align-items-center">

                            <small className="text-muted">
                                Page {page} of {pagination.totalPages || 1}
                                {" | "}
                                Total Users: {pagination.totalUsers}
                            </small>

                            <div className="d-flex gap-2">
                                <button
                                    className="btn btn-outline-primary btn-sm"
                                    disabled={page <= 1 || loading}
                                    onClick={() => setPage(page - 1)}
                                >
                                    Previous
                                </button>

                                <button
                                    className="btn btn-outline-primary btn-sm"
                                    disabled={
                                        page >= pagination.totalPages ||
                                        loading ||
                                        pagination.totalPages === 0
                                    }
                                    onClick={() => setPage(page + 1)}
                                >
                                    Next
                                </button>
                            </div>

                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Users;
