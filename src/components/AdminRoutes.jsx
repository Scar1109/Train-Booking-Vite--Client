import React from "react";
import { Routes, Route } from "react-router-dom";
import {
    Dashboard,
    FraudDetection,
    Tickets,
    Users,
    TrainList
} from "./admin";

function AdminRoutes() {
    return (
        <div style={{ margin: "15px" }}>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/fraud-detection" element={<FraudDetection />} />
                <Route path="/users" element={<Users />} />
                <Route path="/tickets" element={<Tickets />} />
                <Route path="/train-list" element={<TrainList />} />
            </Routes>
        </div>
    );
}

export default AdminRoutes;
