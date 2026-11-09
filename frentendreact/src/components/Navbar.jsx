import { Link, useNavigate } from "react-router-dom";

const Navbar = ({ onLogin,  onRegister }) => {

    const navigate = useNavigate();
    const token = localStorage.getItem("node_ai_token");

    const logout = () => {
        localStorage.removeItem("node_ai_token");
        localStorage.removeItem("node_ai_user");

        navigate("/");
    };

    return (
        <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top">
                <div className="container py-2">
                    <Link
                        to="/"
                        className="navbar-brand fw-bold fs-3 text-dark"
                    >
                        <i className="bi bi-house-heart-fill text-danger me-2"></i>
                        Glowbtech
                    </Link>

                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#homeNavbar"
                        aria-controls="homeNavbar"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div
                        className="collapse navbar-collapse"
                        id="homeNavbar"
                    >
                        <ul className="navbar-nav mx-auto gap-lg-3">
                            <li className="nav-item">
                                <button
                                    className="nav-link fw-semibold"
                                    onClick={() => selectListingType("sale")}
                                >
                                    Buy
                                </button>
                            </li>

                            <li className="nav-item">
                                <button
                                    className="nav-link fw-semibold"
                                    onClick={() => selectListingType("rent")}
                                >
                                    Rent
                                </button>
                            </li>

                            <li className="nav-item">
                                <a
                                    className="nav-link fw-semibold"
                                    href="#property-search"
                                >
                                    Sell
                                </a>
                            </li>

                            <li className="nav-item">
                                <a
                                    className="nav-link fw-semibold"
                                    href="#properties"
                                >
                                    Properties
                                </a>
                            </li>
                        </ul>

                        <div className="d-flex flex-wrap align-items-center gap-2">
                            <button
                                className="btn btn-danger fw-semibold"
                                onClick={onRegister}
                            >
                                Post Property Free
                            </button>

                            <button
                                className="btn btn-outline-dark"
                                onClick={onLogin}
                            >
                                Login
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
    );
};

export default Navbar;