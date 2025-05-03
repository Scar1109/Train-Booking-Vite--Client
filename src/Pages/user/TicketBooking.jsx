import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import AxiosInstance from "../../AxiosInstance";
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
    const [currentStep, setCurrentStep] = useState(
        location.state?.startStep || 2
    ); // Default to Check Availability step
    const [activeTab, setActiveTab] = useState("oneway");
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("");
    const [idType, setIdType] = useState("NIC");
    const [showAllPassengers, setShowAllPassengers] = useState(false);
    const [selectedTrain, setSelectedTrain] = useState(null);
    const [selectedClass, setSelectedClass] = useState({});
    const [isReturnTrip, setIsReturnTrip] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [trainData, setTrainData] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Class color mapping
    const classColors = {
        "First Class": "bg-purple-600",
        "First Class Observation": "bg-purple-700",
        "Air Conditioned": "bg-gray-700",
        "Air Conditioned Saloon": "bg-gray-800",
        "Second Class": "bg-green-500",
        "Second Class Reserved": "bg-green-600",
        "Second Class Observation": "bg-green-700",
        "Third Class": "bg-blue-600",
        "Third Class Reserved": "bg-blue-700",
        "Third Class Sleeper": "bg-blue-800",
        // Default color for any other class
        default: "bg-gray-500",
    };

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

    // Function to get color for a class type
    const getClassColor = (classType) => {
        // Check if the class type exactly matches one of our defined colors
        if (classColors[classType]) {
            return classColors[classType];
        }

        // If not an exact match, check if it contains any of our class keywords
        for (const [key, color] of Object.entries(classColors)) {
            if (
                key !== "default" &&
                classType.toLowerCase().includes(key.toLowerCase())
            ) {
                return color;
            }
        }

        // Default color if no match found
        return classColors.default;
    };

    // Function to fetch trains from API
    const fetchTrains = async (page = 1, limit = 10) => {
        try {
            setLoading(true);
            const response = await AxiosInstance.get(
                `/api/trains?page=${page}&limit=${limit}`
            );

            if (response.data.success) {
                // Map API data to the format expected by the UI
                const formattedTrains = response.data.trains.map((train) => {
                    // Format all classes for display
                    const formattedClasses = train.classes.map((classItem) => {
                        return {
                            id:
                                classItem._id ||
                                `class-${Math.random()
                                    .toString(36)
                                    .substr(2, 9)}`,
                            type: classItem.type || "N/A",
                            color: getClassColor(classItem.type || ""),
                            capacity: classItem.capacity || 0,
                            available: classItem.available || 0,
                            price: `LKR ${
                                classItem.price?.toLocaleString() || 0
                            }`,
                            priceValue: classItem.price || 0,
                        };
                    });

                    return {
                        id: train._id,
                        name: train.name,
                        route: `${train.route.from} - ${train.route.to}`,
                        fullRoute: `${train.route.from} - ${train.route.to}`,
                        departs: train.departureTime,
                        arrives: train.arrivalTime,
                        classes: formattedClasses,
                    };
                });

                setTrainData(formattedTrains);

                // Calculate total pages
                const total = response.data.pagination.total;
                const totalPages = Math.ceil(total / limit);
                setTotalPages(totalPages);
            } else {
                setError(
                    "Failed to fetch train data: " +
                        (response.data?.message || "Unknown error")
                );
            }
        } catch (err) {
            console.error("Error fetching trains:", err);
            setError("Failed to fetch train data. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    // Fetch trains when component mounts or when page/limit changes
    useEffect(() => {
        fetchTrains(currentPage, limit);
    }, [currentPage, limit]);

    const handleTrainSelect = (trainId, classId = null) => {
        if (trainId === selectedTrain && !classId) {
            // If clicking the same train and no specific class is selected, deselect
            setSelectedTrain(null);
            setSelectedClass({});
        } else {
            // Select the train
            setSelectedTrain(trainId);

            // If a specific class was clicked, select it
            if (classId) {
                setSelectedClass({
                    trainId,
                    classId,
                });
            } else if (trainId !== selectedTrain) {
                // If selecting a new train without specifying class, clear class selection
                setSelectedClass({});
            }
        }
    };

    const handleClassSelect = (trainId, classId) => {
        setSelectedTrain(trainId);
        setSelectedClass({
            trainId,
            classId,
        });

        // Stop event propagation to prevent the train row click handler from firing
        event.stopPropagation();
    };

    const handleContinue = () => {
        if (selectedTrain) {
            const selectedTrainData = trainData.find(
                (train) => train.id === selectedTrain
            );
            const selectedClassData = selectedClass.classId
                ? selectedTrainData?.classes.find(
                    (c) => c.id === selectedClass.classId
                )
                : selectedTrainData?.classes[0];

            console.log("Selected train:", selectedTrainData?.name);
            console.log("Selected class:", selectedClassData?.type);

            // Navigate to the next step
            goToNextStep();
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    // Function to retry API fetch
    const handleRetry = () => {
        setError(null);
        fetchTrains(currentPage, limit);
    };

    // Toggle expanded view for a train to show all classes
    const toggleExpandTrain = (trainId) => {
        setExpandedTrain(expandedTrain === trainId ? null : trainId);
    };

    // Function to select a specific class for a train
    const selectTrainClass = (trainId, classType) => {
        // Find the train
        const train = trainData.find((t) => t.id === trainId);
        if (!train) return;

        // Update the primary class for this train
        const selectedClass = train.classes.find((c) => c.type === classType);
        if (!selectedClass) return;

        // Create a new array with the updated train
        const updatedTrainData = trainData.map((t) => {
            if (t.id === trainId) {
                return {
                    ...t,
                    primaryClass: selectedClass,
                };
            }
            return t;
        });

        setTrainData(updatedTrainData);
        setSelectedTrain(trainId);
    };

    const [passengers, setPassengers] = useState([
        {
            id: 1,
            type: "Adult",
            title: "Mr.",
            firstName: "",
            lastName: "",
            idType: "NIC",
            idNumber: "",
            gender: "Male",
            age: "",
            seatPreference: "Window",
            mealPreference: "Regular",
        },
        {
            id: 2,
            type: "Adult",
            title: "Mrs.",
            firstName: "",
            lastName: "",
            idType: "NIC",
            idNumber: "",
            gender: "Female",
            age: "",
            seatPreference: "Aisle",
            mealPreference: "Vegetarian",
        },
    ]);
    const handleInputChange = (id, field, value) => {
        setPassengers(
            passengers.map((passenger) =>
                passenger.id === id
                    ? { ...passenger, [field]: value }
                    : passenger
            )
        );
    };
    // Sample data - in a real app, this would come from your booking state
    const bookingData = {
        bookingReference: "SLR-2025052901",
        bookingDate: "2025-05-03",
        paymentStatus: "Confirmed",
        train: {
            name: "Podi Menike",
            number: "1005",
            startStation: "Colombo Fort",
            endStation: "Badulla",
            departureDate: "2025-05-29",
            departureTime: "05:55",
            arrivalTime: "16:20",
            class: "Air Conditioned Saloon",
            coach: "A",
            seats: ["A12", "A13"],
        },
        passengers: [
            {
                id: 1,
                type: "Adult",
                title: "Mr.",
                firstName: "John",
                lastName: "Doe",
                idType: "NIC",
                idNumber: "982731456V",
                seatNumber: "A12",
            },
            {
                id: 2,
                type: "Adult",
                title: "Mrs.",
                firstName: "Jane",
                lastName: "Doe",
                idType: "NIC",
                idNumber: "986543217V",
                seatNumber: "A13",
            },
        ],
        pricing: {
            baseFare: 3000,
            numberOfPassengers: 2,
            serviceCharge: 300,
            totalPrice: 6300,
        },
    };

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
                                ${
                                    index + 1 === currentStep
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
                                ${
                                    index + 1 === currentStep
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
                                    ${
                                        index + 1 < currentStep
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
                        <h2 className="text-2xl font-semibold mb-4">
                            Check Availability
                        </h2>

                        {/* Custom Tabs */}
                        <div className="border-b border-gray-200 mb-6">
                            <div className="flex -mb-px">
                                <button
                                    className={`py-2 px-4 font-medium text-sm border-b-2 ${
                                        activeTab === "oneway"
                                            ? "border-blue-600 text-blue-600"
                                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    }`}
                                    onClick={() => {
                                        setActiveTab("oneway");
                                        setIsReturnTrip(false);
                                    }}
                                >
                                    Oneway Train
                                </button>
                                <button
                                    className={`py-2 px-4 font-medium text-sm border-b-2 ${
                                        activeTab === "return"
                                            ? "border-blue-600 text-blue-600"
                                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    }`}
                                    onClick={() => {
                                        setActiveTab("return");
                                        setIsReturnTrip(true);
                                    }}
                                >
                                    Return Train
                                </button>
                            </div>
                        </div>

                        {/* Train Info Header */}
                        <div className="bg-gray-50 p-4 rounded-md mb-6">
                            <div className="flex items-center mb-1">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 mr-2 text-gray-700"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                                    />
                                </svg>
                                <span className="text-lg font-medium text-gray-700">
                                    Train Info
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="flex items-center text-2xl font-medium mb-2">
                                        <span>Colombo Fort</span>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-6 w-6 mx-2"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M14 5l7 7m0 0l-7 7m7-7H3"
                                            />
                                        </svg>
                                        <span>Badulla</span>
                                    </div>
                                    <div className="text-gray-600">
                                        Date -{" "}
                                        {new Date().toISOString().split("T")[0]}
                                    </div>

                                    <div className="flex items-center mt-3 text-blue-600">
                                        <span className="font-medium">
                                            Select a train and proceed
                                        </span>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5 ml-1"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M14 5l7 7m0 0l-7 7m7-7H3"
                                            />
                                        </svg>
                                    </div>
                                </div>

                                <div className="text-amber-500">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-10 w-10"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Loading and Error States */}
                        {loading && (
                            <div className="flex justify-center items-center py-10">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-medium">
                                            Error loading train data
                                        </p>
                                        <p className="text-sm">{error}</p>
                                    </div>
                                    <button
                                        onClick={handleRetry}
                                        className="bg-red-100 hover:bg-red-200 text-red-800 font-medium py-1 px-3 rounded text-sm"
                                    >
                                        Retry
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Train Table */}
                        {!loading && !error && (
                            <div className="overflow-x-auto border border-gray-200 rounded-md">
                                {/* Table Header */}
                                <div className="min-w-full">
                                    <div className="bg-gray-50 border-b border-gray-200 grid grid-cols-5 py-3 px-4">
                                        <div className="flex items-center text-sm font-medium text-gray-700">
                                            Train Name
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4 ml-1"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                                                />
                                            </svg>
                                        </div>
                                        <div className="flex items-center text-sm font-medium text-gray-700">
                                            Departs
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4 ml-1 text-gray-400"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                                                />
                                            </svg>
                                        </div>
                                        <div className="flex items-center text-sm font-medium text-gray-700">
                                            Arrives
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4 ml-1 text-gray-400"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                                                />
                                            </svg>
                                        </div>
                                        <div className="flex items-center text-sm font-medium text-gray-700">
                                            Class & Seats
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4 ml-1 text-gray-400"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                                                />
                                            </svg>
                                        </div>
                                        <div className="flex items-center text-sm font-medium text-gray-700">
                                            Price
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4 ml-1 text-gray-400"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                                                />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Table Body */}
                                    <div className="divide-y divide-gray-200">
                                        {trainData.length > 0 ? (
                                            trainData.map((train) => (
                                                <div
                                                    key={train.id}
                                                    className={`grid grid-cols-5 py-4 px-4 cursor-pointer hover:bg-gray-50 ${
                                                        selectedTrain ===
                                                        train.id
                                                            ? "bg-blue-50"
                                                            : ""
                                                    }`}
                                                    onClick={() =>
                                                        handleTrainSelect(
                                                            train.id
                                                        )
                                                    }
                                                >
                                                    <div>
                                                        <div className="font-medium">
                                                            {train.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {train.fullRoute}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center">
                                                        {train.departs}
                                                    </div>
                                                    <div className="flex items-center">
                                                        {train.arrives}
                                                    </div>
                                                    <div className="flex flex-col space-y-2">
                                                        {train.classes.map(
                                                            (classItem) => (
                                                                <div
                                                                    key={
                                                                        classItem.id
                                                                    }
                                                                    className="flex items-center justify-between w-full"
                                                                >
                                                                    <div
                                                                        className={`${classItem.color} text-white px-3 py-1.5 rounded-md text-sm flex-grow flex justify-between items-center`}
                                                                    >
                                                                        <span>
                                                                            {
                                                                                classItem.type
                                                                            }
                                                                        </span>
                                                                        <span className="ml-2 bg-white text-gray-800 rounded px-2.5 py-0.5 text-sm">
                                                                            {
                                                                                classItem.available
                                                                            }{" "}
                                                                            seats
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col space-y-2">
                                                        {train.classes.map(
                                                            (classItem) => (
                                                                <div
                                                                    key={
                                                                        classItem.id
                                                                    }
                                                                    className="flex items-center h-[34px] px-1"
                                                                    onClick={(
                                                                        e
                                                                    ) =>
                                                                        handleClassSelect(
                                                                            e
                                                                        )
                                                                    }
                                                                >
                                                                    <span className="font-medium">
                                                                        {
                                                                            classItem.price
                                                                        }
                                                                    </span>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-8 text-center text-gray-500">
                                                No trains available for this
                                                route
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Pagination */}
                        {!loading && !error && trainData.length > 0 && (
                            <div className="flex justify-end mt-4">
                                <button
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-2 hover:bg-gray-50"
                                    onClick={() =>
                                        handlePageChange(currentPage - 1)
                                    }
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>
                                {[...Array(totalPages).keys()].map((page) => (
                                    <button
                                        key={page + 1}
                                        className={`px-4 py-2 mr-2 ${
                                            currentPage === page + 1
                                                ? "bg-blue-600 text-white"
                                                : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                                        } rounded-md`}
                                        onClick={() =>
                                            handlePageChange(page + 1)
                                        }
                                    >
                                        {page + 1}
                                    </button>
                                ))}
                                <button
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                    onClick={() =>
                                        handlePageChange(currentPage + 1)
                                    }
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex justify-between pt-4 mt-4">
                            <button
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                                onClick={goToPreviousStep}
                            >
                                Back
                            </button>
                            <button
                                className={`px-4 py-2 ${
                                    selectedTrain
                                        ? "bg-blue-600 hover:bg-blue-700"
                                        : "bg-blue-300 cursor-not-allowed"
                                } text-white rounded-md transition-colors`}
                                disabled={!selectedTrain}
                                onClick={handleContinue}
                            >
                                Continue to Payment
                            </button>
                        </div>
                    </>
                )}

                {currentStep === 3 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-semibold mb-4">
                            Confirmation & Payment
                        </h2>

                        {/* Primary Passenger Details */}
                        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-800 mb-3">
                                Primary Passenger Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center">
                                        <span className="text-red-500 mr-1">
                                            *
                                        </span>
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
                                        <span className="text-red-500 mr-1">
                                            *
                                        </span>
                                        <label className="text-sm">
                                            First Name
                                        </label>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="First Name"
                                        className="w-full border border-gray-300 rounded p-2 text-sm"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center">
                                        <span className="text-red-500 mr-1">
                                            *
                                        </span>
                                        <label className="text-sm">
                                            Last Name
                                        </label>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Last Name"
                                        className="w-full border border-gray-300 rounded p-2 text-sm"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center">
                                        <span className="text-red-500 mr-1">
                                            *
                                        </span>
                                        <label className="text-sm">
                                            Gender
                                        </label>
                                    </div>
                                    <select className="w-full border border-gray-300 rounded p-2 text-sm">
                                        <option>Male</option>
                                        <option>Female</option>
                                    </select>
                                </div>

                                <div className="space-y-1 md:col-span-2">
                                    <div className="flex items-center">
                                        <span className="text-red-500 mr-1">
                                            *
                                        </span>
                                        <label className="text-sm">Email</label>
                                    </div>
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        className="w-full border border-gray-300 rounded p-2 text-sm"
                                    />
                                    <p className="text-xs text-red-500">
                                        You must provide a valid email address
                                        to receive ticket information via email
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center">
                                        <span className="text-red-500 mr-1">
                                            *
                                        </span>
                                        <label className="text-sm">
                                            Select Type
                                        </label>
                                    </div>
                                    <div className="grid grid-cols-2 gap-1">
                                        <button
                                            type="button"
                                            className={`${
                                                idType === "NIC"
                                                    ? "bg-gray-700"
                                                    : "bg-gray-400"
                                            } text-white py-1 px-2 text-sm`}
                                            onClick={() => setIdType("NIC")}
                                        >
                                            NIC
                                        </button>
                                        <button
                                            type="button"
                                            className={`${
                                                idType === "Passport"
                                                    ? "bg-gray-700"
                                                    : "bg-gray-400"
                                            } text-white py-1 px-2 text-sm`}
                                            onClick={() =>
                                                setIdType("Passport")
                                            }
                                        >
                                            Passport
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center">
                                        <span className="text-red-500 mr-1">
                                            *
                                        </span>
                                        <label className="text-sm">
                                            {idType}
                                        </label>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder={idType}
                                        className="w-full border border-gray-300 rounded p-2 text-sm"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm">Mobile No</label>
                                    <input
                                        type="text"
                                        placeholder="Mobile No"
                                        className="w-full border border-gray-300 rounded p-2 text-sm"
                                    />
                                    <p className="text-xs text-gray-500">
                                        If you wish to receive the ticket
                                        information via SMS, kindly provide a
                                        valid local mobile number
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Other Passenger Details */}
                        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-800 mb-1">
                                Other Passenger Details
                            </h3>
                            <p className="text-sm mb-2">
                                Please enter details of all other passengers
                            </p>
                            <p className="text-xs text-red-500 mb-3">
                                If the passenger is below 17 years and does not
                                have either passport or NIC, please select the
                                'Dependent' category.
                            </p>

                            <div className="overflow-x-auto">
                                <table className="w-full min-w-full">
                                    <thead>
                                        <tr className="text-left">
                                            <th className="pb-2 font-medium">
                                                Passenger
                                            </th>
                                            <th className="pb-2 font-medium">
                                                Type
                                            </th>
                                            <th className="pb-2 font-medium">
                                                Identification No
                                            </th>
                                            <th className="pb-2 font-medium">
                                                Gender
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="py-1">
                                                Passenger 1
                                            </td>
                                            <td className="py-1">
                                                <select className="w-full border border-gray-300 rounded p-1 text-sm">
                                                    <option>Select</option>
                                                    <option>Adult</option>
                                                    <option>Child</option>
                                                    <option>Dependent</option>
                                                    <option>Senior</option>
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
                                                    <option>Male</option>
                                                    <option>Female</option>
                                                </select>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-xs text-gray-600 mt-3">
                                Mandatory fields are marked with{" "}
                                <span className="text-red-500">*</span>
                            </p>
                        </div>

                        {/* Seat Selection */}
                        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-800 mb-1">
                                Seat Selection
                            </h3>
                            <p className="text-sm mb-3">
                                Select One Way Seat Class
                            </p>
                            <hr className="border-gray-300 mb-4" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Air Conditioned Saloon */}
                                <div className="bg-white rounded-md overflow-hidden shadow-sm">
                                    <div className="p-4 flex justify-between">
                                        <div>
                                            <h4 className="font-medium">
                                                Air Conditioned
                                            </h4>
                                            <p className="text-gray-600">
                                                Saloon
                                            </p>
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
                                        <img
                                            src="https://i.ibb.co/Pvg06fvw/seat.png"
                                            alt="Air Conditioned Seat"
                                            className="h-16 w-16"
                                        />
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
                                            <h4 className="font-medium">
                                                Third Class Reserved
                                            </h4>
                                            <p className="text-gray-600">
                                                Seats
                                            </p>
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
                                        <img
                                            src="https://i.ibb.co/ns8n5myc/waiting-room.png"
                                            alt="Third Class Seats"
                                            className="h-16 w-16"
                                        />
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
                            <h3 className="text-lg font-medium text-gray-800 mb-3">
                                Summary
                            </h3>

                            <div className="bg-white border border-gray-300 rounded-md mb-3">
                                <div className="bg-gray-100 p-2 text-center font-medium border-b border-gray-300">
                                    Forward Train
                                </div>

                                <div className="p-2">
                                    <div className="grid grid-cols-2 py-1.5 px-2">
                                        <span className="text-sm font-medium">
                                            Train Name & No
                                        </span>
                                        <span className="text-sm">
                                            1005 Podi Menike
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 py-1.5 px-2">
                                        <span className="text-sm font-medium">
                                            Start Station
                                        </span>
                                        <span className="text-sm">
                                            Colombo Fort
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 py-1.5 px-2">
                                        <span className="text-sm font-medium">
                                            End Station
                                        </span>
                                        <span className="text-sm">Badulla</span>
                                    </div>

                                    <div className="grid grid-cols-2 py-1.5 px-2">
                                        <span className="text-sm font-medium">
                                            Departure Date
                                        </span>
                                        <span className="text-sm">
                                            2025-05-29
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 py-1.5 px-2">
                                        <span className="text-sm font-medium">
                                            Time Start -&gt; End
                                        </span>
                                        <span className="text-sm">
                                            05:55 - 16:20
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 py-1.5 px-2">
                                        <span className="text-sm font-medium">
                                            No of Passengers
                                        </span>
                                        <span className="text-sm">2</span>
                                    </div>

                                    <div className="grid grid-cols-2 py-1.5 px-2">
                                        <span className="text-sm font-medium">
                                            Train Class
                                        </span>
                                        <span className="text-sm flex items-center">
                                            <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded mr-2">
                                                Selected
                                            </span>
                                            Air Conditioned Saloon
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 py-1.5 px-2">
                                        <span className="text-sm font-medium">
                                            Price
                                        </span>
                                        <span className="text-sm flex items-center">
                                            <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded mr-2">
                                                One Person
                                            </span>
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
                                    <span className="font-medium">
                                        Total Price - LKR: 6000
                                    </span>
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
                                    onChange={(e) =>
                                        setAcceptTerms(e.target.checked)
                                    }
                                />
                                <label htmlFor="terms" className="text-sm">
                                    Terms & Conditions
                                </label>
                            </div>

                            <h3 className="text-lg font-medium text-gray-800 mb-3">
                                Payment Method
                            </h3>
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
                                <span className="text-sm">
                                    Please Select Payment Method
                                </span>
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
                                            onChange={() =>
                                                setPaymentMethod("visa")
                                            }
                                        />
                                        <label
                                            htmlFor="visa"
                                            className="flex items-center"
                                        >
                                            <span className="text-blue-600 font-bold text-lg">
                                                VISA
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
                                            id="mastercard"
                                            name="paymentMethod"
                                            className="mr-2"
                                            checked={
                                                paymentMethod === "mastercard"
                                            }
                                            onChange={() =>
                                                setPaymentMethod("mastercard")
                                            }
                                        />
                                        <label
                                            htmlFor="mastercard"
                                            className="flex items-center"
                                        >
                                            <span className="text-red-500 font-bold text-lg">
                                                <span className="text-yellow-500">
                                                    master
                                                </span>
                                                card
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
                                            checked={
                                                paymentMethod === "discover"
                                            }
                                            onChange={() =>
                                                setPaymentMethod("discover")
                                            }
                                        />
                                        <label
                                            htmlFor="discover"
                                            className="flex items-center"
                                        >
                                            <span className="text-blue-800 font-bold text-lg">
                                                <span className="text-blue-500">
                                                    D
                                                </span>
                                                iscover
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
                                            checked={
                                                paymentMethod === "lankaQR"
                                            }
                                            onChange={() =>
                                                setPaymentMethod("lankaQR")
                                            }
                                        />
                                        <label
                                            htmlFor="lankaQR"
                                            className="flex items-center"
                                        >
                                            <span className="font-bold text-lg">
                                                LANKA
                                                <span className="text-red-500">
                                                    QR
                                                </span>
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

                        {/* Navigation Buttons */}
                        <div className="flex justify-between pt-4">
                            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors">
                                Back
                            </button>
                            <button
                                className={`px-4 py-2 ${
                                    acceptTerms
                                        ? "bg-blue-600 hover:bg-blue-700"
                                        : "bg-blue-300 cursor-not-allowed"
                                } text-white rounded-md transition-colors`}
                                disabled={!acceptTerms}
                            >
                                Proceed to Payment
                            </button>
                        </div>
                    </div>
                )}
                {currentStep === 4 && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-semibold">
                                Passenger Information
                            </h2>
                            <span className="text-sm text-gray-500">
                                <span className="text-red-500">*</span> Required
                                fields
                            </span>
                        </div>

                        {passengers.map((passenger, index) => (
                            <div
                                key={passenger.id}
                                className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium">
                                        Passenger {index + 1}
                                        <span className="ml-2 text-sm text-gray-500">
                                            ({passenger.type})
                                        </span>
                                    </h3>
                                    {index === 0 && (
                                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                            Primary Passenger
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {/* Title */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <span className="text-red-500">
                                                *
                                            </span>{" "}
                                            Title
                                        </label>
                                        <select
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={passenger.title}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    passenger.id,
                                                    "title",
                                                    e.target.value
                                                )
                                            }
                                        >
                                            <option value="Mr.">Mr.</option>
                                            <option value="Mrs.">Mrs.</option>
                                            <option value="Ms.">Ms.</option>
                                            <option value="Dr.">Dr.</option>
                                        </select>
                                    </div>

                                    {/* First Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <span className="text-red-500">
                                                *
                                            </span>{" "}
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter first name"
                                            value={passenger.firstName}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    passenger.id,
                                                    "firstName",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>

                                    {/* Last Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <span className="text-red-500">
                                                *
                                            </span>{" "}
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter last name"
                                            value={passenger.lastName}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    passenger.id,
                                                    "lastName",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>

                                    {/* Gender */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <span className="text-red-500">
                                                *
                                            </span>{" "}
                                            Gender
                                        </label>
                                        <select
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={passenger.gender}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    passenger.id,
                                                    "gender",
                                                    e.target.value
                                                )
                                            }
                                        >
                                            <option value="Male">Male</option>
                                            <option value="Female">
                                                Female
                                            </option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    {/* Age */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <span className="text-red-500">
                                                *
                                            </span>{" "}
                                            Age
                                        </label>
                                        <input
                                            type="number"
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter age"
                                            min="0"
                                            max="120"
                                            value={passenger.age}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    passenger.id,
                                                    "age",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>

                                    {/* ID Type */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <span className="text-red-500">
                                                *
                                            </span>{" "}
                                            ID Type
                                        </label>
                                        <div className="grid grid-cols-2 gap-1">
                                            <button
                                                className={`py-2 px-3 text-sm font-medium rounded-l-md ${
                                                    passenger.idType === "NIC"
                                                        ? "bg-gray-700 text-white"
                                                        : "bg-gray-200 text-gray-700"
                                                }`}
                                                onClick={() =>
                                                    handleInputChange(
                                                        passenger.id,
                                                        "idType",
                                                        "NIC"
                                                    )
                                                }
                                            >
                                                NIC
                                            </button>
                                            <button
                                                className={`py-2 px-3 text-sm font-medium rounded-r-md ${
                                                    passenger.idType ===
                                                    "Passport"
                                                        ? "bg-gray-700 text-white"
                                                        : "bg-gray-200 text-gray-700"
                                                }`}
                                                onClick={() =>
                                                    handleInputChange(
                                                        passenger.id,
                                                        "idType",
                                                        "Passport"
                                                    )
                                                }
                                            >
                                                Passport
                                            </button>
                                        </div>
                                    </div>

                                    {/* ID Number */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <span className="text-red-500">
                                                *
                                            </span>{" "}
                                            {passenger.idType} Number
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder={`Enter ${passenger.idType} number`}
                                            value={passenger.idNumber}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    passenger.id,
                                                    "idNumber",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>

                                    {/* Seat Preference */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Seat Preference
                                        </label>
                                        <select
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={passenger.seatPreference}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    passenger.id,
                                                    "seatPreference",
                                                    e.target.value
                                                )
                                            }
                                        >
                                            <option value="Window">
                                                Window
                                            </option>
                                            <option value="Aisle">Aisle</option>
                                            <option value="Middle">
                                                Middle
                                            </option>
                                            <option value="No Preference">
                                                No Preference
                                            </option>
                                        </select>
                                    </div>

                                    {/* Meal Preference */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Meal Preference
                                        </label>
                                        <select
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={passenger.mealPreference}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    passenger.id,
                                                    "mealPreference",
                                                    e.target.value
                                                )
                                            }
                                        >
                                            <option value="Regular">
                                                Regular
                                            </option>
                                            <option value="Vegetarian">
                                                Vegetarian
                                            </option>
                                            <option value="Vegan">Vegan</option>
                                            <option value="Halal">Halal</option>
                                            <option value="Kosher">
                                                Kosher
                                            </option>
                                            <option value="No Meal">
                                                No Meal
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                {/* Special Requirements */}
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Special Requirements
                                    </label>
                                    <textarea
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter any special requirements or assistance needed"
                                        rows="2"
                                    ></textarea>
                                </div>
                            </div>
                        ))}

                        <div className="flex justify-between mt-6">
                            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors">
                                Back
                            </button>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                                Continue to Ticket Summary
                            </button>
                        </div>
                    </div>
                )}

                {currentStep === 5 && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-semibold">
                                Ticket Summary
                            </h2>
                            <div className="flex space-x-2">
                                <button className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4 mr-1"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                                        />
                                    </svg>
                                    Print
                                </button>
                                <button className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4 mr-1"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                        />
                                    </svg>
                                    Download
                                </button>
                            </div>
                        </div>

                        {/* Booking Status */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
                            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 text-green-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-medium text-green-800">
                                    Booking Confirmed
                                </h3>
                                <p className="text-sm text-green-700">
                                    Your payment has been processed
                                    successfully.
                                </p>
                            </div>
                        </div>

                        {/* Ticket Card */}
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                            {/* Ticket Header */}
                            <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-bold">
                                        Sri Lanka Railways
                                    </h3>
                                    <p className="text-sm opacity-90">
                                        E-Ticket
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm opacity-90">
                                        Booking Reference
                                    </p>
                                    <p className="font-mono font-bold">
                                        {bookingData.bookingReference}
                                    </p>
                                </div>
                            </div>

                            {/* Train Details */}
                            <div className="p-4 border-b border-gray-200">
                                <h4 className="font-medium text-gray-700 mb-3">
                                    Train Details
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500">
                                            Train Name & No
                                        </p>
                                        <p className="font-medium">
                                            {bookingData.train.name} (
                                            {bookingData.train.number})
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">
                                            Class
                                        </p>
                                        <p className="font-medium">
                                            {bookingData.train.class}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">
                                            Coach & Seats
                                        </p>
                                        <p className="font-medium">
                                            Coach {bookingData.train.coach},
                                            Seats{" "}
                                            {bookingData.train.seats.join(", ")}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">
                                            Date
                                        </p>
                                        <p className="font-medium">
                                            {bookingData.train.departureDate}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Journey Details */}
                            <div className="p-4 border-b border-gray-200">
                                <h4 className="font-medium text-gray-700 mb-3">
                                    Journey
                                </h4>
                                <div className="flex items-center">
                                    <div className="flex flex-col items-center mr-4">
                                        <div className="w-4 h-4 rounded-full bg-blue-600"></div>
                                        <div className="w-0.5 h-14 bg-gray-300"></div>
                                        <div className="w-4 h-4 rounded-full bg-blue-600"></div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="mb-8">
                                            <p className="font-medium">
                                                {bookingData.train.startStation}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Departure:{" "}
                                                {
                                                    bookingData.train
                                                        .departureTime
                                                }
                                            </p>
                                        </div>
                                        <div>
                                            <p className="font-medium">
                                                {bookingData.train.endStation}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Arrival:{" "}
                                                {bookingData.train.arrivalTime}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="hidden md:block w-24 h-24 bg-gray-100 rounded-lg p-1">
                                        {/* This would be a QR code in a real app */}
                                        <div className="w-full h-full border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                                            <span className="text-xs text-gray-400">
                                                QR Code
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Passenger Details */}
                            <div className="p-4 border-b border-gray-200">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="font-medium text-gray-700">
                                        Passenger Details
                                    </h4>
                                    {bookingData.passengers.length > 1 && (
                                        <button
                                            className="text-sm text-blue-600 hover:underline"
                                            onClick={() =>
                                                setShowAllPassengers(
                                                    !showAllPassengers
                                                )
                                            }
                                        >
                                            {showAllPassengers
                                                ? "Show Less"
                                                : "Show All"}
                                        </button>
                                    )}
                                </div>

                                <div className="overflow-hidden">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th
                                                    scope="col"
                                                    className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    Name
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    Type
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    ID
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    Seat
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {bookingData.passengers
                                                .slice(
                                                    0,
                                                    showAllPassengers
                                                        ? bookingData.passengers
                                                              .length
                                                        : 1
                                                )
                                                .map((passenger) => (
                                                    <tr key={passenger.id}>
                                                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                                                            {passenger.title}{" "}
                                                            {
                                                                passenger.firstName
                                                            }{" "}
                                                            {passenger.lastName}
                                                        </td>
                                                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                                                            {passenger.type}
                                                        </td>
                                                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                                                            {passenger.idType}:{" "}
                                                            {passenger.idNumber}
                                                        </td>
                                                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                                                            {
                                                                passenger.seatNumber
                                                            }
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Price Breakdown */}
                            <div className="p-4">
                                <h4 className="font-medium text-gray-700 mb-3">
                                    Price Breakdown
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>
                                            Base Fare (
                                            {
                                                bookingData.pricing
                                                    .numberOfPassengers
                                            }{" "}
                                            passengers)
                                        </span>
                                        <span>
                                            LKR{" "}
                                            {bookingData.pricing.baseFare *
                                                bookingData.pricing
                                                    .numberOfPassengers}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Service Charge</span>
                                        <span>
                                            LKR{" "}
                                            {bookingData.pricing.serviceCharge}
                                        </span>
                                    </div>
                                    <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-medium">
                                        <span>Total</span>
                                        <span>
                                            LKR {bookingData.pricing.totalPrice}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Important Information */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <h4 className="font-medium text-yellow-800 mb-2">
                                Important Information
                            </h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
                                <li>
                                    Please arrive at the station at least 30
                                    minutes before departure.
                                </li>
                                <li>
                                    Have your ID ready for verification along
                                    with this e-ticket.
                                </li>
                                <li>
                                    Seats are confirmed and reserved as per the
                                    details above.
                                </li>
                                <li>
                                    For any changes or cancellations, please
                                    contact customer support at least 24 hours
                                    before departure.
                                </li>
                            </ul>
                        </div>
                        {/* Actions */}
                        <div className="flex justify-between pt-4">
                            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors">
                                Back
                            </button>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                                Complete Booking
                            </button>
                        </div>
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
