import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/admin/LeftSidebar";

const AdminLayout = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Remove admin authentication
        localStorage.removeItem("node_ai_token");
        localStorage.removeItem("node_ai_user");

        // Remove old authentication keys if they exist
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("user_id");

        localStorage.removeItem("glowbtech_token");
        localStorage.removeItem("glowbtech_user_id");

        // Go to admin login
        navigate("/admin", {
            replace: true,
        });
    };

    return (
        <div className="container-fluid min-vh-100 bg-light p-0">

            <div className="row g-0 min-vh-100">

                {/* =================================================
                    LEFT SIDEBAR
                ================================================== */}

                <aside className="col-12 col-md-3 col-lg-2 bg-dark text-white">

                    <div
                        className="p-3"
                        style={{
                            minHeight: "100vh",
                        }}
                    >
                        <Sidebar />
                    </div>

                </aside>

              
                <main className="col-12 col-md-9 col-lg-10">
                    <header className="d-flex justify-content-between align-items-center bg-white border-bottom px-3 px-md-4 py-3">

                        <div>

                            <h5 className="mb-0 fw-bold">
                                Property Portal Listing
                            </h5>

                            <small className="text-muted">
                                Manage your property portal
                            </small>

                        </div>

                        <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={handleLogout}
                        >
                            <i className="bi bi-box-arrow-right me-1"></i>
                            Logout
                        </button>

                    </header>

                  <section className="container-fluid p-3 p-md-4">

                        <Outlet />

                    </section>

                </main>

            </div>

        </div>
    );
};

export default AdminLayout;