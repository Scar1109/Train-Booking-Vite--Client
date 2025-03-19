import React, { useEffect, useState } from "react";
import AdminRoutes from "../../components/AdminRoutes";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loader";
import SideMenu from "../../components/admin/SideMenu";
import NavBar from "../../components/admin/NavBar";
import "../../assets/styles/AdminGlobalStyles.css";

function AdminDashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Uncomment and update if using localStorage authentication
        // const user = JSON.parse(localStorage.getItem("currentUser"));
        // if (!user) {
        //     navigate("/login");
        // } else if (user.userType !== "Admin") {
        //     navigate("/accessdenied");
        // } else {
        //     setLoading(false);
        // }
        setTimeout(() => {
            setLoading(false);
        }, 2000);
    }, [navigate]);

    return (
        <>
            {loading ? (
                <div className="center" style={{ height: "100vh" }}>
                    <Loader />
                </div>
            ) : (
                <div className="Admin_DashboardContainer">
                    <div className="Admin_SideMenuAndPageContent">
                        <div className="admin_sidebar_container">
                            <SideMenu />
                        </div>
                        <div className="Admin_PageContent">
                            <NavBar />
                            <AdminRoutes />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default AdminDashboard;
