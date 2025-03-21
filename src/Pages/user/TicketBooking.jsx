import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Table, Button, Tabs } from "antd";

const TicketBooking = () => {
    const steps = [
        "Home",
        "Check Availability",
        "Confirmation & Payment",
        "Passenger Information",
        "Ticket Summary",
    ];

    const location = useLocation();
    const navigate = useNavigate();
    const isReturnTrip = location.state?.isReturn || false;
    const [currentStep, setCurrentStep] = useState(location.state?.startStep || 2); // Default to Check Availability step
    const [activeTab, setActiveTab] = useState("oneway");

    const goToStep = (step) => {
        if (step === 1) {
            navigate("/"); // Navigate to home page if Home step is clicked
        } else {
            setCurrentStep(step);
        }
    };

    const goToNextStep = () => {
        if (currentStep < steps.length) {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const goToPreviousStep = () => {
        if (currentStep > 2) {
            setCurrentStep((prev) => prev - 1);
        } else {
            navigate("/");
        }
    };

    // Train Data
    const trainData = [
        {
            key: "1",
            name: "1 Special 01 - Colombo Fort - Badulla",
            departs: "19:30",
            arrives: "05:04",
            class: [
                { type: "Air Conditioned Saloon", seats: 88 },
                { type: "Second Class Reserved Seats", seats: 48 },
            ],
            available: 7,
            price: "LKR 3,000.00",
        },
        {
            key: "2",
            name: "1045 Night Mail - Colombo Fort - Badulla",
            departs: "20:30",
            arrives: "05:37",
            class: [{ type: "Third Class Sleepers", seats: 48 }],
            available: 7,
            price: "LKR 1,500.00",
        },
        {
            key: "3",
            name: "11041 Ella Odyssey - Colombo Fort - Badulla",
            departs: "05:30",
            arrives: "15:53",
            class: [
                { type: "Air Conditioned Saloon", seats: 176 },
                { type: "Second Class Reserved Seats", seats: 144 },
                { type: "Third Class Reserved Seats", seats: 39 },
            ],
            available: 70,
            price: "LKR 8,000.00",
        },
    ];

    const columns = [
        {
            title: "Train Name",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Departs",
            dataIndex: "departs",
            key: "departs",
        },
        {
            title: "Arrives",
            dataIndex: "arrives",
            key: "arrives",
        },
        {
            title: "Class",
            key: "class",
            render: (_, record) => (
                <div className="flex flex-col space-y-1">
                    {record.class.map((c, index) => (
                        <span
                            key={index}
                            className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                        >
                            {c.type} ({c.seats})
                        </span>
                    ))}
                </div>
            ),
        },
        {
            title: "Available",
            dataIndex: "available",
            key: "available",
        },
        {
            title: "Price",
            dataIndex: "price",
            key: "price",
        },
    ];

    return (
        <div className="w-full max-w-6xl mx-auto mt-10">
            {/* Progress Bar */}
            <div className="flex items-center justify-between mb-8">
                {steps.map((step, index) => (
                    <div
                        key={index}
                        className="relative flex-1 flex flex-col items-center cursor-pointer"
                        onClick={() => goToStep(index + 1)}
                    >
                        {/* Step Indicator */}
                        <div
                            className={`w-10 h-10 flex items-center justify-center rounded-full border-2 text-lg font-bold transition-all
                                ${index + 1 === currentStep
                                    ? "border-blue-500 bg-white text-blue-500"
                                    : index + 1 < currentStep
                                        ? "bg-green-500 text-white border-green-500"
                                        : "bg-gray-300 text-gray-700 border-gray-400"
                                }`}
                        >
                            {index + 1}
                        </div>

                        {/* Step Name */}
                        <span
                            className={`text-sm mt-2 font-semibold transition-all
                                ${index + 1 === currentStep
                                    ? "text-blue-500"
                                    : index + 1 < currentStep
                                        ? "text-green-600"
                                        : "text-gray-500"
                                }`}
                        >
                            {step}
                        </span>

                        {/* Line Connector */}
                        {index !== steps.length - 1 && (
                            <div
                                className={`absolute top-5 left-[58%] w-full h-1 transition-all 
                                    ${index + 1 < currentStep
                                        ? "bg-green-500"
                                        : index + 1 === currentStep
                                            ? "bg-blue-500"
                                            : "bg-gray-300"
                                    }`}
                            ></div>
                        )}
                    </div>
                ))}
            </div>

            {/* Page Content */}
            <div className="bg-white shadow-md p-6 rounded-md">
                {currentStep === 2 && (
                    <>
                        <h2 className="text-2xl font-semibold mb-4">Check Availability</h2>
                        <Tabs activeKey={activeTab} onChange={setActiveTab}>
                            <Tabs.TabPane tab="Oneway Train" key="oneway">
                                <Table columns={columns} dataSource={trainData} pagination={false} />
                            </Tabs.TabPane>
                            {isReturnTrip && (
                                <Tabs.TabPane tab="Return Train" key="return">
                                    <Table columns={columns} dataSource={trainData} pagination={false} />
                                </Tabs.TabPane>
                            )}
                        </Tabs>
                    </>
                )}

                {currentStep === 3 && (
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">Confirmation & Payment</h2>
                        <p>Enter your payment details here...</p>
                    </div>
                )}

                {currentStep === 4 && (
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">Passenger Information</h2>
                        <p>Enter passenger details here...</p>
                    </div>
                )}

                {currentStep === 5 && (
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">Ticket Summary</h2>
                        <p>Here is the summary of your booking...</p>
                    </div>
                )}
            </div>

            {/* Bottom Navigation */}
            <div className="flex justify-end mt-6">
                {/* <button
                    onClick={goToPreviousStep}
                    className={`px-6 py-2 rounded-md border transition-all
                        ${currentStep === 2 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-gray-100 hover:bg-gray-200"}`}
                >
                    Previous
                </button> */}

                {currentStep < steps.length ? (
                    <button
                        onClick={goToNextStep}
                        className="px-6 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition duration-300"
                    >
                        Next
                    </button>
                ) : (
                    <button
                        onClick={() => alert("Booking Completed!")}
                        className="px-6 py-2 rounded-md bg-green-500 text-white hover:bg-green-600 transition duration-300"
                    >
                        Finish
                    </button>
                )}
            </div>
        </div>
    );
};

export default TicketBooking;
