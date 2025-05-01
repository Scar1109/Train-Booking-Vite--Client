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
    const [acceptTerms, setAcceptTerms] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState("")

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
                    <div className="space-y-6">
                        <h2 className="text-2xl font-semibold mb-4">Confirmation & Payment</h2>

                        {/* Primary Passenger Details */}
                        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-800 mb-3">Primary Passenger Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center">
                                        <span className="text-red-500 mr-1">*</span>
                                        <label className="text-sm">Title</label>
                                    </div>
                                    <select className="w-full border border-gray-300 rounded p-2 text-sm">
                                        <option>Mr.</option>
                                        <option>Mrs.</option>
                                        <option>Ms.</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center">
                                        <span className="text-red-500 mr-1">*</span>
                                        <label className="text-sm">First Name</label>
                                    </div>
                                    <input type="text" placeholder="First Name" className="w-full border border-gray-300 rounded p-2 text-sm" />
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center">
                                        <span className="text-red-500 mr-1">*</span>
                                        <label className="text-sm">Last Name</label>
                                    </div>
                                    <input type="text" placeholder="Last Name" className="w-full border border-gray-300 rounded p-2 text-sm" />
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center">
                                        <span className="text-red-500 mr-1">*</span>
                                        <label className="text-sm">Gender</label>
                                    </div>
                                    <select className="w-full border border-gray-300 rounded p-2 text-sm">
                                        <option>Male</option>
                                        <option>Female</option>
                                    </select>
                                </div>

                                <div className="space-y-1 md:col-span-2">
                                    <div className="flex items-center">
                                        <span className="text-red-500 mr-1">*</span>
                                        <label className="text-sm">Email</label>
                                    </div>
                                    <input type="email" placeholder="Email" className="w-full border border-gray-300 rounded p-2 text-sm" />
                                    <p className="text-xs text-red-500">
                                        You must provide a valid email address to receive ticket information via email
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center">
                                        <span className="text-red-500 mr-1">*</span>
                                        <label className="text-sm">Select Type</label>
                                    </div>
                                    <div className="grid grid-cols-2 gap-1">
                                        <button className="bg-gray-700 text-white py-1 px-2 text-sm">NIC</button>
                                        <button className="bg-gray-400 text-white py-1 px-2 text-sm">Passport</button>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center">
                                        <span className="text-red-500 mr-1">*</span>
                                        <label className="text-sm">NIC</label>
                                    </div>
                                    <input type="text" placeholder="NIC" className="w-full border border-gray-300 rounded p-2 text-sm" />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm">Mobile No</label>
                                    <input type="text" placeholder="Mobile No" className="w-full border border-gray-300 rounded p-2 text-sm" />
                                    <p className="text-xs text-gray-500">
                                        If you wish to receive the ticket information via SMS, kindly provide a valid local mobile number
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Other Passenger Details */}
                        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-800 mb-1">Other Passenger Details</h3>
                            <p className="text-sm mb-2">Please enter details of all other passengers</p>
                            <p className="text-xs text-red-500 mb-3">
                                If the passenger is below 17 years and does not have either passport or NIC, please select the 'Dependent'
                                category.
                            </p>

                            <div className="overflow-x-auto">
                                <table className="w-full min-w-full">
                                    <thead>
                                        <tr className="text-left">
                                            <th className="pb-2 font-medium">Passenger</th>
                                            <th className="pb-2 font-medium">Type</th>
                                            <th className="pb-2 font-medium">Identification No</th>
                                            <th className="pb-2 font-medium">Gender</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="py-1">Passenger 1</td>
                                            <td className="py-1">
                                                <select className="w-full border border-gray-300 rounded p-1 text-sm">
                                                    <option>Select</option>
                                                </select>
                                            </td>
                                            <td className="py-1">
                                                <input
                                                    type="text"
                                                    placeholder="Identification No"
                                                    className="w-full border border-gray-300 rounded p-1 text-sm"
                                                />
                                            </td>
                                            <td className="py-1">
                                                <select className="w-full border border-gray-300 rounded p-1 text-sm">
                                                    <option>Select</option>
                                                </select>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-xs text-gray-600 mt-3">
                                Mandatory fields are marked with <span className="text-red-500">*</span>
                            </p>
                        </div>

                        {/* Seat Selection */}
                        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-800 mb-1">Seat Selection</h3>
                            <p className="text-sm mb-3">Select One Way Seat Class</p>
                            <hr className="border-gray-300 mb-4" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Air Conditioned Saloon */}
                                <div className="bg-white rounded-md overflow-hidden shadow-sm">
                                    <div className="p-4 flex justify-between">
                                        <div>
                                            <h4 className="font-medium">Air Conditioned</h4>
                                            <p className="text-gray-600">Saloon</p>
                                        </div>
                                        <div className="flex items-start">
                                            <div className="bg-gray-200 rounded-full px-2 py-1 flex items-center text-xs">
                                                <svg
                                                    className="w-4 h-4 text-gray-600 mr-1"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    ></path>
                                                </svg>
                                                LKR 3000
                                            </div>
                                        </div>
                                    </div>
                                    <div className="px-4 pb-4 flex justify-center">
                                        <img src="https://i.ibb.co/Pvg06fvw/seat.png?height=60&width=60" alt="Air Conditioned Seat" className="h-16 w-16" />
                                    </div>
                                    <div className="bg-blue-500 text-white p-2 flex justify-between">
                                        <span>Available</span>
                                        <span className="font-bold">15</span>
                                    </div>
                                </div>

                                {/* Third Class Reserved Seats */}
                                <div className="bg-white rounded-md overflow-hidden shadow-sm">
                                    <div className="p-4 flex justify-between">
                                        <div>
                                            <h4 className="font-medium">Third Class Reserved</h4>
                                            <p className="text-gray-600">Seats</p>
                                        </div>
                                        <div className="flex items-start">
                                            <div className="bg-gray-200 rounded-full px-2 py-1 flex items-center text-xs">
                                                <svg
                                                    className="w-4 h-4 text-gray-600 mr-1"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    ></path>
                                                </svg>
                                                LKR 1500
                                            </div>
                                        </div>
                                    </div>
                                    <div className="px-4 pb-4 flex justify-center">
                                        <img src="https://i.ibb.co/ns8n5myc/waiting-room.png?height=60&width=60" alt="Third Class Seats" className="h-16 w-16" />
                                    </div>
                                    <div className="bg-blue-500 text-white p-2 flex justify-between">
                                        <span>Available</span>
                                        <span className="font-bold">22</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Summary */}
                        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-800 mb-3">Summary</h3>

                            <div className="bg-white border border-gray-300 rounded-md mb-3">
                                <div className="bg-gray-100 p-2 text-center font-medium border-b border-gray-300">Forward Train</div>

                                <div className="p-2">
                                    <div className="grid grid-cols-2 py-1.5 px-2">
                                        <span className="text-sm font-medium">Train Name & No</span>
                                        <span className="text-sm">1005 Podi Menike</span>
                                    </div>

                                    <div className="grid grid-cols-2 py-1.5 px-2">
                                        <span className="text-sm font-medium">Start Station</span>
                                        <span className="text-sm">Colombo Fort</span>
                                    </div>

                                    <div className="grid grid-cols-2 py-1.5 px-2">
                                        <span className="text-sm font-medium">End Station</span>
                                        <span className="text-sm">Badulla</span>
                                    </div>

                                    <div className="grid grid-cols-2 py-1.5 px-2">
                                        <span className="text-sm font-medium">Departure Date</span>
                                        <span className="text-sm">2025-05-29</span>
                                    </div>

                                    <div className="grid grid-cols-2 py-1.5 px-2">
                                        <span className="text-sm font-medium">Time Start -&gt; End</span>
                                        <span className="text-sm">05:55 - 16:20</span>
                                    </div>

                                    <div className="grid grid-cols-2 py-1.5 px-2">
                                        <span className="text-sm font-medium">No of Passengers</span>
                                        <span className="text-sm">2</span>
                                    </div>

                                    <div className="grid grid-cols-2 py-1.5 px-2">
                                        <span className="text-sm font-medium">Train Class</span>
                                        <span className="text-sm flex items-center">
                                            <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded mr-2">Selected</span>
                                            Air Conditioned Saloon
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 py-1.5 px-2">
                                        <span className="text-sm font-medium">Price</span>
                                        <span className="text-sm flex items-center">
                                            <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded mr-2">One Person</span>
                                            3000
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-gray-700 text-white p-3 rounded-b-md flex items-center justify-between">
                                    <div className="flex items-center">
                                        <svg
                                            className="w-5 h-5 mr-2"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
                                            ></path>
                                        </svg>
                                    </div>
                                    <span className="font-medium">Total Price - LKR: 6000</span>
                                </div>
                            </div>
                        </div>
                        {/* Terms & Conditions and Payment Method */}
                        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                            <div className="mb-4 flex items-start">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    className="mt-1 mr-2"
                                    checked={acceptTerms}
                                    onChange={(e) => setAcceptTerms(e.target.checked)}
                                />
                                <label htmlFor="terms" className="text-sm">
                                    Terms & Conditions
                                </label>
                            </div>

                            <h3 className="text-lg font-medium text-gray-800 mb-3">Payment Method</h3>
                            <div className="flex items-center mb-4">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 mr-2 text-gray-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                    />
                                </svg>
                                <span className="text-sm">Please Select Payment Method</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="border border-gray-200 rounded-md p-3 flex flex-col items-center">
                                    <div className="flex items-center mb-2">
                                        <input
                                            type="radio"
                                            id="visa"
                                            name="paymentMethod"
                                            className="mr-2"
                                            checked={paymentMethod === "visa"}
                                            onChange={() => setPaymentMethod("visa")}
                                        />
                                        <label htmlFor="visa" className="flex items-center">
                                            <span className="text-blue-600 font-bold text-lg">VISA</span>
                                        </label>
                                    </div>
                                    <div className="text-sm text-center">
                                        <p>Service Charge</p>
                                        <p>5.0%</p>
                                    </div>
                                </div>

                                <div className="border border-gray-200 rounded-md p-3 flex flex-col items-center">
                                    <div className="flex items-center mb-2">
                                        <input
                                            type="radio"
                                            id="mastercard"
                                            name="paymentMethod"
                                            className="mr-2"
                                            checked={paymentMethod === "mastercard"}
                                            onChange={() => setPaymentMethod("mastercard")}
                                        />
                                        <label htmlFor="mastercard" className="flex items-center">
                                            <span className="text-red-500 font-bold text-lg">
                                                <span className="text-yellow-500">master</span>card
                                            </span>
                                        </label>
                                    </div>
                                    <div className="text-sm text-center">
                                        <p>Service Charge</p>
                                        <p>5.0%</p>
                                    </div>
                                </div>

                                <div className="border border-gray-200 rounded-md p-3 flex flex-col items-center">
                                    <div className="flex items-center mb-2">
                                        <input
                                            type="radio"
                                            id="discover"
                                            name="paymentMethod"
                                            className="mr-2"
                                            checked={paymentMethod === "discover"}
                                            onChange={() => setPaymentMethod("discover")}
                                        />
                                        <label htmlFor="discover" className="flex items-center">
                                            <span className="text-blue-800 font-bold text-lg">
                                                <span className="text-blue-500">D</span>iscover
                                            </span>
                                        </label>
                                    </div>
                                    <div className="text-sm text-center">
                                        <p>Service Charge</p>
                                        <p>6.5%</p>
                                    </div>
                                </div>

                                <div className="border border-gray-200 rounded-md p-3 flex flex-col items-center">
                                    <div className="flex items-center mb-2">
                                        <input
                                            type="radio"
                                            id="lankaQR"
                                            name="paymentMethod"
                                            className="mr-2"
                                            checked={paymentMethod === "lankaQR"}
                                            onChange={() => setPaymentMethod("lankaQR")}
                                        />
                                        <label htmlFor="lankaQR" className="flex items-center">
                                            <span className="font-bold text-lg">
                                                LANKA<span className="text-red-500">QR</span>
                                            </span>
                                        </label>
                                    </div>
                                    <div className="text-sm text-center">
                                        <p>Service Charge</p>
                                        <p>5.0%</p>
                                    </div>
                                </div>
                            </div>
                        </div>
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
