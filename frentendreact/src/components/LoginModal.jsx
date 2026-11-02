import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const LoginModal = ({
    show,
    onClose,
    onSwitchRegister,
}) => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    if (!show) return null;

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await api.post("/auth/login", form);

            const { token, user } = response.data.data || response.data;

            // Save auth details to localStorage
            localStorage.setItem("node_ai_token", token);
            localStorage.setItem("node_ai_user", JSON.stringify(user));

            // Reset form & close modal
            setForm({ email: "", password: "" });
            onClose();

            // Redirect based on user role
            if (user.role === "admin") {
                navigate("/admin/dashboard");
            } else if (user.role === "dealer") {
                navigate("/dealer/dashboard");
            } else {
                navigate("/dashboard");
            }
        } catch (error) {
            setError(
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Invalid email or password. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Dark backdrop */}
            <div
                className="modal-backdrop fade show"
                onClick={onClose}
            />

            {/* Login modal */}
            <div
                className="modal fade show d-block"
                tabIndex="-1"
                role="dialog"
                aria-modal="true"
                style={{ zIndex: 1055 }}
            >
                <div className="modal-dialog modal-dialog-centered">
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h5 className="modal-title fw-bold">
                                Login to Account
                            </h5>

                            <button
                                type="button"
                                className="btn-close"
                                onClick={onClose}
                                aria-label="Close"
                            />
                        </div>

                        <div className="modal-body">
                            {error && (
                                <div className="alert alert-danger">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        className="form-control"
                                        placeholder="Enter your email"
                                        value={form.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        className="form-control"
                                        placeholder="Enter your password"
                                        value={form.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary w-100"
                                    disabled={loading}
                                >
                                    {loading ? "Logging in..." : "Login"}
                                </button>
                            </form>

                            <div className="text-center mt-3">
                                <span className="text-muted">
                                    Don't have an account?
                                </span>{" "}
                                <button
                                    type="button"
                                    className="btn btn-link p-0"
                                    onClick={onSwitchRegister}
                                >
                                    Register
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LoginModal;