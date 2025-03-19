import React from "react";
import { Routes, Route } from "react-router-dom";
import {
    Dashboard,
    FraudDetection,
    Tickets,
    Users
} from "./admin";

function AdminRoutes() {
    return (
        <div style={{ margin: "15px" }}>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/fraud-detection" element={<FraudDetection />} />
                <Route path="/users" element={<Users />} />
                <Route path="/tickets" element={<Tickets />} />
            </Routes>
        </div>
    );
}

export default AdminRoutes;
