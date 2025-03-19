import React from "react";
import { Link } from "react-router-dom";
import Footer from "../../components/Footer";
import NavBar from "../../components/Navbar.Jsx";

const Home = () => {
    return (
        <div className="bg-gray-100 min-h-screen">
            {/* Header Section */}
            <NavBar />

            {/* Main Content Section */}
            <main className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Intro Section */}
                    <section className="bg-white p-8 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-semibold text-blue-600 mb-4">
                            How It Works
                        </h2>
                        <p className="text-gray-700 text-lg">
                            Our system uses AI-powered fraud detection,
                            real-time ticketing, and a Virtual Waiting Room for
                            seamless ticket purchases during peak times.
                        </p>
                    </section>

                    {/* Features Section */}
                    <section className="bg-white p-8 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-semibold text-blue-600 mb-4">
                            Features
                        </h2>
                        <ul className="space-y-4">
                            <li className="flex items-center text-gray-700">
                                <span className="text-blue-600 font-bold mr-2">
                                    ✔
                                </span>{" "}
                                AI-Powered Fraud Detection
                            </li>
                            <li className="flex items-center text-gray-700">
                                <span className="text-blue-600 font-bold mr-2">
                                    ✔
                                </span>{" "}
                                Virtual Waiting Room
                            </li>
                            <li className="flex items-center text-gray-700">
                                <span className="text-blue-600 font-bold mr-2">
                                    ✔
                                </span>{" "}
                                Secure QR Code-Based Ticket Sharing
                            </li>
                        </ul>
                    </section>
                </div>

                {/* Call to Action Section */}
                <div className="text-center mt-12">
                    <h3 className="text-3xl font-semibold text-gray-800 mb-4">
                        Ready to Explore Our Trains?
                    </h3>
                    <Link
                        to="/trains-list"
                        className="bg-blue-600 text-white py-3 px-8 rounded-lg text-lg font-semibold hover:bg-blue-700 transition duration-300"
                    >
                        Explore Trains
                    </Link>
                </div>
            </main>

            {/* Footer Section */}
            <Footer />
        </div>
    );
};

export default Home;
