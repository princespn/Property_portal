import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function UserRegisterModal({ show, onClose, onSwitchLogin }) {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    if (!show) return null;

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await api.post("/auth/register", { ...form, role: "user" });
            const { token, user } = response.data.data || response.data;

            localStorage.setItem("node_ai_token", token);
            localStorage.setItem("node_ai_user", JSON.stringify(user));

            onClose();
            navigate("/user/profile"); // Direct to normal user profile dashboard
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="modal-backdrop fade show" onClick={onClose} />
            <div className="modal fade show d-block" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h5 className="modal-title fw-bold">User Registration</h5>
                            <button type="button" className="btn-close" onClick={onClose} />
                        </div>
                        <div className="modal-body">
                            {error && <div className="alert alert-danger">{error}</div>}
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Full Name</label>
                                    <input type="text" name="name" className="form-control" required value={form.name} onChange={handleChange} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Email Address</label>
                                    <input type="email" name="email" className="form-control" required value={form.email} onChange={handleChange} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Phone Number</label>
                                    <input type="text" name="phone" className="form-control" placeholder="+91..." value={form.phone} onChange={handleChange} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Password</label>
                                    <input type="password" name="password" className="form-control" minLength={8} required value={form.password} onChange={handleChange} />
                                </div>
                                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                                    {loading ? "Registering..." : "Create User Account"}
                                </button>
                            </form>
                            <div className="text-center mt-3">
                                <span className="text-muted">Already have an account?</span>{" "}
                                <button className="btn btn-link p-0" onClick={onSwitchLogin}>Login</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}