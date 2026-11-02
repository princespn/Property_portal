import { NavLink, useNavigate } from "react-router-dom";

const LeftSidebar = () => {
    const navigate = useNavigate();

    const user = JSON.parse(
        localStorage.getItem("node_ai_user") || "{}"
    );

    const handleLogout = () => {
        localStorage.removeItem("node_ai_token");
        localStorage.removeItem("node_ai_user");

        navigate("/admin", {
            replace: true,
        });
    };

    const menuItems = [
        {
            label: "Dashboard",
            path: "/admin",
            icon: "bi-speedometer2",
        },
        {
            label: "Properties",
            path: "/properties",
            icon: "bi-buildings",
        },
        {
            label: "Leads",
            path: "/leads",
            icon: "bi-people",
        },
        {
            label: "Users",
            path: "/users",
            icon: "bi-person-lines-fill",
        },
        
    ];

    return (
        <aside
            className="bg-dark text-white d-flex flex-column"
            style={{
                width: "250px",
                minHeight: "100vh",
                position: "fixed",
                left: 0,
                top: 0,
                bottom: 0,
                zIndex: 1000,
            }}
        >

            {/* Brand */}
            <div className="p-3 border-bottom border-secondary">

                <div className="d-flex align-items-center">

                    <div
                        className="bg-primary rounded d-flex align-items-center justify-content-center me-2"
                        style={{
                            width: "40px",
                            height: "40px",
                        }}
                    >
                        <i className="bi bi-building fs-5"></i>
                    </div>

                    <div>
                        <div className="fw-bold">
                            Property Portal
                        </div>

                        <small className="text-secondary">
                            Admin Panel
                        </small>
                    </div>

                </div>

            </div>

            {/* Admin Information */}
            <div className="p-3 border-bottom border-secondary">

                <div className="d-flex align-items-center">

                    <div
                        className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2"
                        style={{
                            width: "42px",
                            height: "42px",
                        }}
                    >
                        {user?.name
                            ?.charAt(0)
                            ?.toUpperCase() || "A"}
                    </div>

                    <div className="overflow-hidden">

                        <div className="fw-semibold text-truncate">
                            {user?.name || "Administrator"}
                        </div>

                        <small className="text-secondary">
                            Administrator
                        </small>

                    </div>

                </div>

            </div>

            {/* Menu */}
            <div className="flex-grow-1 p-2">

                <div className="text-uppercase text-secondary small px-3 py-2">
                    Main Menu
                </div>

                <nav className="nav flex-column">

                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === "/admin"}
                            className={({ isActive }) =>
                                `nav-link text-white rounded px-3 py-2 mb-1 ${
                                    isActive
                                        ? "bg-primary"
                                        : ""
                                }`
                            }
                        >
                            <i
                                className={`bi ${item.icon} me-3`}
                            ></i>

                            {item.label}
                        </NavLink>
                    ))}

                </nav>

            </div>

            {/* Bottom */}
            <div className="p-2 border-top border-secondary">

                <button
                    type="button"
                    className="btn btn-outline-light w-100 text-start"
                    onClick={handleLogout}
                >
                    <i className="bi bi-box-arrow-right me-3"></i>
                    Logout
                </button>

            </div>

        </aside>
    );
};

export default LeftSidebar;