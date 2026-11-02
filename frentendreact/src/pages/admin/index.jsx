import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const AdminLogin = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

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

            const { token, user } =
                response.data.data || response.data;

            localStorage.setItem("node_ai_token", token);
            localStorage.setItem("node_ai_user", JSON.stringify(user));

            // Redirect according to user role
            switch (user.role) {
                case "admin":
                    navigate("/dashboard", {
                        replace: true,
                    });
                    break;

                case "agent":
                case "dealer":
                    navigate("/properties", {
                        replace: true,
                    });
                    break;

                default:
                    localStorage.removeItem("node_ai_token");
                    localStorage.removeItem("node_ai_user");

                    setError("Your account role is not authorized.");
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Invalid email or password."
            );
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">

            <div className="container">

                <div className="row justify-content-center">

                    <div className="col-md-6 col-lg-4">

                        <div className="card border-0 shadow">

                            <div className="card-body p-4">

                                <div className="text-center mb-4">

                                    <div
                                        className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                                        style={{
                                            width: "70px",
                                            height: "70px",
                                            fontSize: "28px",
                                        }}
                                    >
                                        <i className="bi bi-shield-lock"></i>
                                    </div>

                                    <h3 className="fw-bold">
                                    Glowb Property Portal
                                    </h3>


                                </div>

                                {/* Error */}
                                {error && (
                                    <div className="alert alert-danger">
                                        {error}
                                    </div>
                                )}

                                {/* Form */}
                                <form onSubmit={handleSubmit}>

                                    <div className="mb-3">

                                        <label className="form-label fw-semibold">
                                            Email Address
                                        </label>

                                        <input
                                            type="email"
                                            name="email"
                                            className="form-control"
                                            placeholder="Please enter email"
                                            value={form.email}
                                            onChange={handleChange}
                                            required
                                        />

                                    </div>

                                    <div className="mb-4">

                                        <label className="form-label fw-semibold">
                                            Password
                                        </label>

                                        <input
                                            type="password"
                                            name="password"
                                            className="form-control"
                                            placeholder="Please enter password"
                                            value={form.password}
                                            onChange={handleChange}
                                            required
                                        />

                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-dark w-100"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span
                                                    className="spinner-border spinner-border-sm me-2"
                                                ></span>

                                                Logging in...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-box-arrow-in-right me-2"></i>
                                                Login here
                                            </>
                                        )}
                                    </button>

                                </form>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default AdminLogin;