import { useEffect, useState } from "react";
import api from "../../services/api";

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get("/auth/users");

                const result = response.data.data;
                setUsers(Array.isArray(result) ? result : result?.users ?? []);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Unable to load users. Check the users API."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    return (
        <div>
            <div className="mb-4">
                <h3 className="mb-1">Users</h3>
                <p className="text-muted mb-0">
                    View registered users.
                </p>
            </div>

            {error && (
                <div className="alert alert-danger">{error}</div>
            )}

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" />
                    <p className="mt-2">Loading users...</p>
                </div>
            ) : (
                <div className="card border-0 shadow-sm">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Status</th>
                                    <th>Role</th>
                                    <th>Date</th>
                                </tr>
                            </thead>

                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td>{user.id}</td>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                <td><span className={`badge ${user.is_active ? "bg-success" : "bg-danger"}`}>
    {user.is_active ? "Active" : "Inactive"}</span></td>

                                        <td>
                                            <span className="badge text-bg-secondary">
                                                {user.role || "user"}
                                            </span>
                                        </td>
                                        <td>
                                            {user.created_at
                                                ? new Date(
                                                    user.created_at
                                                ).toLocaleDateString()
                                                : "-"}
                                        </td>
                                    </tr>
                                ))}

                                {users.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="text-center py-4 text-muted"
                                        >
                                            No users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
