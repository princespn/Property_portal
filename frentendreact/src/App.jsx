import { useState } from "react";
import {
    BrowserRouter,
    Routes,
    Route,
} from "react-router-dom";

import Navbar from "./components/Navbar";

import LoginModal from "./components/LoginModal";
import RegisterModal from "./components/UserRegisterModal";

import ProtectedRoute from "./components/ProtectedRoute";

import AdminLayout from "./layouts/AdminLayout";

import Home from "./pages/index";
import AdminLogin from "./pages/admin/index";
import Dashboard from "./pages/admin/adminDashbord";
import Properties from "./pages/admin/agantDashboard";
import User from "./components/admin/User";

import Leads from "./components/admin/Leads";

const App = () => {

    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);

    const openLogin = () => {
        setShowRegister(false);
        setShowLogin(true);
    };

    const openRegister = () => {
        setShowLogin(false);
        setShowRegister(true);
    };

    const closeModals = () => {
        setShowLogin(false);
        setShowRegister(false);
    };

    return (
        <BrowserRouter>

            <Routes>

               
                <Route
                    path="/"
                    element={
                        <>
                            <Navbar
                                onLogin={openLogin}
                                onRegister={openRegister}
                            />

                            <Home
                                onLogin={openLogin}
                                onRegister={openRegister}
                            />
                        </>
                    }
                />

               
                <Route
                    path="/admin"
                    element={<AdminLogin />}
                />

                <Route
                    element={
                        <ProtectedRoute>
                            <AdminLayout />
                        </ProtectedRoute>
                    }
                >

                    <Route
                        path="/dashboard"
                        element={<Dashboard />}
                    />
                    <Route
                        path="/properties/"
                        element={<Properties />}
                    />

                    <Route
                        path="/leads"
                        element={<Leads />}
                    />

                    <Route
                        path="/users"
                        element={<User />}
                    />

                </Route>


                <Route
                    path="*"
                    element={
                        <div className="container py-5 text-center">

                            <h3>
                                Page not found
                            </h3>

                            <button
                                className="btn btn-primary mt-3"
                                onClick={() => {
                                    window.location.href = "/";
                                }}
                            >
                                Go Home
                            </button>

                        </div>
                    }
                />

            </Routes>


            <LoginModal
                show={showLogin}
                onClose={closeModals}
                onSwitchRegister={openRegister}
            />


            <RegisterModal
                show={showRegister}
                onClose={closeModals}
                onSwitchLogin={openLogin}
            />

        </BrowserRouter>
    );
};

export default App;