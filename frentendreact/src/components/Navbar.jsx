import { Link, useNavigate } from "react-router-dom";

const Navbar = ({
    onLogin,
    onRegister,
}) => {
    const navigate = useNavigate();

    const token = localStorage.getItem("node_ai_token");

    const logout = () => {
        localStorage.removeItem("node_ai_token");
        localStorage.removeItem("node_ai_user");

        navigate("/");
    };

    return (
        <nav className="navbar navbar-expand-lg bg-dark navbar-dark">

            <div className="container">

                <Link
                    className="navbar-brand fw-bold"
                    to="/"
                >
                    AI Lead Manager
                </Link>

                <div className="navbar-nav ms-auto">

                    <Link
                        className="nav-link"
                        to="/"
                    >
                        Home
                    </Link>

                    {token ? (
                        <>
                            <Link
                                className="nav-link"
                                to="/dashboard"
                            >
                                Dashboard
                            </Link>

                            <button
                                type="button"
                                className="btn btn-outline-light btn-sm ms-3"
                                onClick={logout}
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                type="button"
                                className="btn btn-link nav-link"
                                onClick={onLogin}
                            >
                                Login
                            </button>

                            <button
                                type="button"
                                className="btn btn-primary btn-sm ms-2"
                                onClick={onRegister}
                            >
                                Register
                            </button>
                        </>
                    )}

                </div>

            </div>

        </nav>
    );
};

export default Navbar;