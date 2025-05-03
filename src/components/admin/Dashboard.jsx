import React from "react";

function Dashboard() {
    return (
        <div className="min-h-screen">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">
                Admin Dashboard
            </h1>

            {/* First Row - 4 Small Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[15px] mb-6 h-40">
                <div className="bg-white text-black item -center p-6 rounded-2xl shadow">
                    Card 1
                </div>
                <div className="bg-white text-black p-6 rounded-2xl shadow">
                    Card 2
                </div>
                <div className="bg-white text-black p-6 rounded-2xl shadow">
                    Card 3
                </div>
                <div className="bg-white text-black p-6 rounded-2xl shadow">
                    Card 4
                </div>
            </div>

            {/* Second Row - 2 Large Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-[15px]">
                <div className="bg-white p-6 rounded-2xl shadow border border-gray-200">
                    <h2 className="text-xl font-semibold mb-2 text-gray-700 h-80">
                        Payment Overview
                    </h2>
                    <p className="text-gray-500">
                        .............
                    </p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow border border-gray-200">
                    <h2 className="text-xl font-semibold mb-2 text-gray-700">
                        User Engagement
                    </h2>
                    <p className="text-gray-500">.....................</p>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-[15px] mt-6">
                <div className="bg-white text-black p-6 rounded-2xl shadow h-80">
                    <h2 className="text-xl font-semibold mb-2">Fraud Overview</h2>
                    <p>...........................</p>
                </div>
                <div className="bg-white text-black p-6 rounded-2xl shadow h-80">
                    <h2 className="text-xl font-semibold mb-2">Activitys</h2>
                    <p>..........................</p>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
