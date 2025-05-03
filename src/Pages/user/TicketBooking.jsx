import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AxiosInstance from "../../AxiosInstance";

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
    );
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
    const [passengerCount, setPassengerCount] = useState(2);
    const [cardDetails, setCardDetails] = useState({
        cardNumber: "",
        cardholderName: "",
        expiryDate: "",
        cvv: "",
    });
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [bookingData, setBookingData] = useState({
        bookingReference: `SLR-${Math.floor(Math.random() * 1000000000)
            .toString()
            .padStart(9, "0")}`,
        bookingDate: new Date().toISOString().split("T")[0],
        paymentStatus: "Pending",
        train: {
            name: "",
            number: "",
            startStation: "Aluthgama", // Updated default
            endStation: "Ambalangoda", // Updated default
            departureDate: "2025-05-30", // Updated default
            departureTime: "",
            arrivalTime: "",
            class: "",
            coach: "A",
            seats: [],
        },
        passengers: [],
        pricing: {
            baseFare: 0,
            numberOfPassengers: passengerCount,
            serviceCharge: 0,
            totalPrice: 0,
        },
    });

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

    // Modified fetchTrains to use bookingData.train for API query
    const fetchTrains = async (page = 1, limit = 10) => {
        try {
            setLoading(true);
            const { startStation, endStation, departureDate } =
                bookingData.train;
            const response = await AxiosInstance.get(
                `/api/trains?from=${startStation}&to=${endStation}&date=${departureDate}&page=${page}&limit=${limit}`
            );

            if (response.data.success) {
                const formattedTrains = response.data.trains.map((train) => {
                    const formattedClasses = train.classes.map((classItem) => ({
                        id:
                            classItem._id ||
                            `class-${Math.random().toString(36).substr(2, 9)}`,
                        type: classItem.type || "N/A",
                        color: getClassColor(classItem.type || ""),
                        capacity: classItem.capacity || 0,
                        available: classItem.available || 0,
                        price: `LKR ${classItem.price?.toLocaleString() || 0}`,
                        priceValue: classItem.price || 0,
                    }));

                    return {
                        id: train._id,
                        name: train.name,
                        number: train.number || "1005",
                        route: `${train.route.from} - ${train.route.to}`,
                        fullRoute: `${train.route.from} - ${train.route.to}`,
                        departs: train.departureTime,
                        arrives: train.arrivalTime,
                        classes: formattedClasses,
                    };
                });

                setTrainData(formattedTrains);
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

    // Fetch trains when bookingData.train or page/limit changes
    useEffect(() => {
        fetchTrains(currentPage, limit);

        const params = new URLSearchParams(location.search);
        const trainId = params.get("trainId");
        const passengers = params.get("passengers");

        if (passengers) {
            setPassengerCount(Number.parseInt(passengers, 10) || 2);
            setBookingData((prev) => ({
                ...prev,
                pricing: {
                    ...prev.pricing,
                    numberOfPassengers: Number.parseInt(passengers, 10) || 2,
                },
            }));
        }

        if (trainId) {
            setSelectedTrain(trainId);
        }
    }, [
        currentPage,
        limit,
        bookingData.train.startStation,
        bookingData.train.endStation,
        bookingData.train.departureDate,
        location.search,
    ]);

    // Initialize passengers array when passenger count changes
    useEffect(() => {
        const initialPassengers = Array.from(
            { length: passengerCount },
            (_, index) => ({
                id: index + 1,
                type: index === 0 ? "Adult" : "Adult",
                title: index === 0 ? "Mr." : "Mrs.",
                firstName: "",
                lastName: "",
                idType: "NIC",
                idNumber: "",
                gender: index === 0 ? "Male" : "Female",
                age: "",
                seatPreference: index === 0 ? "Window" : "Aisle",
                mealPreference: index === 0 ? "Regular" : "Vegetarian",
                seatNumber: "",
            })
        );

        setPassengers(initialPassengers);

        setBookingData((prev) => ({
            ...prev,
            pricing: {
                ...prev.pricing,
                numberOfPassengers: passengerCount,
            },
        }));
    }, [passengerCount]);

    // Update booking data when train is selected
    useEffect(() => {
        if (selectedTrain && trainData.length > 0) {
            const selectedTrainData = trainData.find(
                (train) => train.id === selectedTrain
            );
            if (selectedTrainData) {
                const selectedClassData = selectedClass.classId
                    ? selectedTrainData.classes.find(
                          (c) => c.id === selectedClass.classId
                      )
                    : selectedTrainData.classes[0];

                if (selectedClassData) {
                    const baseFare = selectedClassData.priceValue;
                    const serviceCharge = Math.round(baseFare * 0.05); // 5% service charge
                    const totalPrice =
                        baseFare * passengerCount + serviceCharge;

                    setBookingData((prev) => ({
                        ...prev,
                        train: {
                            ...prev.train,
                            name: selectedTrainData.name,
                            number: selectedTrainData.number,
                            departureTime: selectedTrainData.departs,
                            arrivalTime: selectedTrainData.arrives,
                            class: selectedClassData.type,
                            seats: Array.from(
                                { length: passengerCount },
                                (_, i) => `A${i + 12}`
                            ),
                        },
                        pricing: {
                            ...prev.pricing,
                            baseFare,
                            serviceCharge,
                            totalPrice,
                            numberOfPassengers: passengerCount,
                        },
                    }));
                }
            }
        }
    }, [selectedTrain, selectedClass, trainData, passengerCount]);

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

    const handleClassSelect = (trainId, classId, event) => {
        if (event) {
            event.stopPropagation();
        }

        setSelectedTrain(trainId);
        setSelectedClass({
            trainId,
            classId,
        });

        // Find the selected train and class
        const selectedTrainData = trainData.find(
            (train) => train.id === trainId
        );
        if (selectedTrainData) {
            const selectedClassData = selectedTrainData.classes.find(
                (c) => c.id === classId
            );
            if (selectedClassData) {
                const baseFare = selectedClassData.priceValue;
                const serviceCharge = Math.round(baseFare * 0.05); // 5% service charge
                const totalPrice = baseFare * passengerCount + serviceCharge;

                setBookingData((prev) => ({
                    ...prev,
                    train: {
                        ...prev.train,
                        name: selectedTrainData.name,
                        number: selectedTrainData.number,
                        departureTime: selectedTrainData.departs,
                        arrivalTime: selectedTrainData.arrives,
                        class: selectedClassData.type,
                        seats: Array.from(
                            { length: passengerCount },
                            (_, i) => `A${i + 12}`
                        ),
                    },
                    pricing: {
                        ...prev.pricing,
                        baseFare,
                        serviceCharge,
                        totalPrice,
                        numberOfPassengers: passengerCount,
                    },
                }));
            }
        }
    };

    // Modified handleContinue to avoid navigation and just change step
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

            if (selectedTrainData && selectedClassData) {
                console.log("Selected train:", selectedTrainData.name);
                console.log("Selected class:", selectedClassData.type);

                // Ensure bookingData is updated (already handled by useEffect, but confirm here)
                setBookingData((prev) => ({
                    ...prev,
                    train: {
                        ...prev.train,
                        name: selectedTrainData.name,
                        number: selectedTrainData.number,
                        departureTime: selectedTrainData.departs,
                        arrivalTime: selectedTrainData.arrives,
                        class: selectedClassData.type,
                        seats: Array.from(
                            { length: passengerCount },
                            (_, i) => `A${i + 12}`
                        ),
                    },
                    pricing: {
                        ...prev.pricing,
                        baseFare: selectedClassData.priceValue,
                        serviceCharge: Math.round(
                            selectedClassData.priceValue * 0.05
                        ),
                        totalPrice:
                            selectedClassData.priceValue * passengerCount +
                            Math.round(selectedClassData.priceValue * 0.05),
                        numberOfPassengers: passengerCount,
                    },
                }));

                // Move to Confirmation & Payment step
                setCurrentStep(3);
            } else {
                alert("Please select a valid train and class.");
            }
        } else {
            alert("Please select a train to continue.");
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

    const [passengers, setPassengers] = useState([]);
    const [selectedSeatType, setSelectedSeatType] = useState(null);

    const handleInputChange = (id, field, value) => {
        setPassengers(
            passengers.map((passenger) =>
                passenger.id === id
                    ? { ...passenger, [field]: value }
                    : passenger
            )
        );
    };

    const handleCardInputChange = (field, value) => {
        setCardDetails({
            ...cardDetails,
            [field]: value,
        });
    };

    const handleProceedToPayment = () => {
        if (!acceptTerms || !paymentMethod) {
            alert("Please accept terms and select a payment method");
            return;
        }

        setShowPaymentForm(true);
    };

    const handlePaymentSubmit = (e) => {
        e.preventDefault();

        // Validate card details
        if (
            !cardDetails.cardNumber ||
            !cardDetails.cardholderName ||
            !cardDetails.expiryDate ||
            !cardDetails.cvv
        ) {
            alert("Please fill in all card details");
            return;
        }

        // Update booking data with payment status
        setBookingData((prev) => ({
            ...prev,
            paymentStatus: "Confirmed",
        }));

        // Navigate to passenger information
        setCurrentStep(4);
        setShowPaymentForm(false);
    };

    const handleCompleteBooking = async () => {
        try {
            // Get userId from JWT token in localStorage
            let userId;
            const token = localStorage.getItem("UserToken");
            if (!token) {
                throw new Error("Please log in to complete the booking.");
            }
            // Prepare booking data for API
            const bookingPayload = {
                userId, // Valid ObjectId
                ticketId: bookingData.bookingReference,
                numTickets: passengerCount,
                paymentMethod: paymentMethod,
                price: bookingData.pricing.totalPrice,
                ipAddress: "127.0.0.1", // Replace with actual client IP if available
                passengers: passengers.map((p) => ({
                    title: p.title,
                    firstName: p.firstName,
                    lastName: p.lastName,
                    idType: p.idType,
                    idNumber: p.idNumber,
                    gender: p.gender,
                    age: p.age || "",
                    seatPreference: p.seatPreference || "",
                    mealPreference: p.mealPreference || "",
                    seatNumber: p.seatNumber || "",
                })),
                trainDetails: {
                    trainId: selectedTrain,
                    trainName: bookingData.train.name,
                    trainNumber: bookingData.train.number,
                    class: bookingData.train.class,
                    departureStation: bookingData.train.startStation,
                    arrivalStation: bookingData.train.endStation,
                    departureDate: bookingData.train.departureDate,
                    departureTime: bookingData.train.departureTime,
                    arrivalTime: bookingData.train.arrivalTime,
                },
            };
    
            // Call API to save booking
            const response = await AxiosInstance.post(
                "/api/bookings/create",
                bookingPayload
            );
    
            if (response.data.success) {
                alert("Booking completed successfully!");
                setCurrentStep(5); // Move to Ticket Summary step
            } else {
                alert("Failed to complete booking: " + response.data.message);
            }
        } catch (error) {
            console.error("Error completing booking:", error);
            alert(`Booking failed: ${error.message || "Please try again."}`);
        }
    };

    const handleContinueToTicketSummary = () => {
        // Validate passenger information
        const isValid = passengers.every(
            (p) => p.firstName && p.lastName && p.idNumber && p.age
        );

        if (!isValid) {
            alert("Please fill in all required passenger information");
            return;
        }

        // Update booking data with passenger information
        setBookingData((prev) => ({
            ...prev,
            passengers: passengers.map((p, index) => ({
                id: p.id,
                type: p.type,
                title: p.title,
                firstName: p.firstName,
                lastName: p.lastName,
                idType: p.idType,
                idNumber: p.idNumber,
                seatNumber: prev.train.seats[index] || `A${12 + index}`,
            })),
        }));

        // Navigate to ticket summary
        setCurrentStep(5);
    };

    // Modified useEffect to load localStorage data
    useEffect(() => {
        try {
            const savedBookingData = localStorage.getItem("trainBookingData");
            if (savedBookingData) {
                const parsedData = JSON.parse(savedBookingData);
                console.log(
                    "Loaded booking data from localStorage:",
                    parsedData
                );

                setBookingData((prev) => ({
                    ...prev,
                    train: {
                        ...prev.train,
                        startStation:
                            parsedData.fromStation || prev.train.startStation,
                        endStation:
                            parsedData.toStation || prev.train.endStation,
                        departureDate:
                            parsedData.date || prev.train.departureDate,
                    },
                    pricing: {
                        ...prev.pricing,
                        numberOfPassengers:
                            parsedData.passengers ||
                            prev.pricing.numberOfPassengers,
                    },
                }));

                // Update passenger count
                if (parsedData.passengers) {
                    setPassengerCount(parsedData.passengers);
                }

                // Set return trip and active tab
                if (parsedData.isReturn !== undefined) {
                    setIsReturnTrip(parsedData.isReturn);
                    setActiveTab(parsedData.isReturn ? "return" : "oneway");
                }
            }
        } catch (error) {
            console.error(
                "Error loading booking data from localStorage:",
                error
            );
        }
    }, []);

    // Add this function to handle ticket download
    const handleDownloadTicket = () => {
        // Create ticket content
        const ticketContent = `
=================================================
            SRI LANKA RAILWAYS E-TICKET
=================================================
Booking Reference: ${bookingData.bookingReference}
Booking Date: ${bookingData.bookingDate}
Payment Status: ${bookingData.paymentStatus}

TRAIN DETAILS
-------------------------------------------------
Train: ${bookingData.train.name} (${bookingData.train.number})
Class: ${bookingData.train.class}
Coach: ${bookingData.train.coach}
Seats: ${bookingData.train.seats.join(", ")}
Date: ${bookingData.train.departureDate}

JOURNEY
-------------------------------------------------
From: ${bookingData.train.startStation}
Departure: ${bookingData.train.departureTime}
To: ${bookingData.train.endStation}
Arrival: ${bookingData.train.arrivalTime}

PASSENGER DETAILS
-------------------------------------------------
${passengers
    .map(
        (p, i) => `
   ${i + 1}. ${p.title} ${p.firstName} ${p.lastName}
   ID: ${p.idType} ${p.idNumber}
   Seat: ${bookingData.train.seats[i] || `A${12 + i}`}`
    )
    .join("\n")}

PRICE BREAKDOWN
-------------------------------------------------
Base Fare (${bookingData.pricing.numberOfPassengers} passengers): LKR ${
            bookingData.pricing.baseFare *
            bookingData.pricing.numberOfPassengers
        }
Service Charge: LKR ${bookingData.pricing.serviceCharge}
Total: LKR ${bookingData.pricing.totalPrice}

IMPORTANT INFORMATION
-------------------------------------------------
- Please arrive at the station at least 30 minutes before departure.
- Have your ID ready for verification along with this e-ticket.
- Seats are confirmed and reserved as per the details above.
- For any changes or cancellations, please contact customer support
  at least 24 hours before departure.
=================================================
`;

        // Create a blob and download link
        const blob = new Blob([ticketContent], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `SLR_Ticket_${bookingData.bookingReference}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
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
                                        <span>
                                            {bookingData.train.startStation}
                                        </span>
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
                                        <span>
                                            {bookingData.train.endStation}
                                        </span>
                                    </div>
                                    <div className="text-gray-600">
                                        Date - {bookingData.train.departureDate}
                                    </div>

                                    <div className="flex items-center mt-3">
                                        <div className="mr-4">
                                            <label
                                                htmlFor="passengerCount"
                                                className="block text-sm font-medium text-gray-700"
                                            >
                                                Passengers: {passengerCount}
                                            </label>
                                        </div>

                                        <div className="flex items-center text-blue-600">
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
                                    <div className="bg-gray-50 border-b border-gray-200 grid grid-cols-6 py-3 px-4">
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
                                            Available Seats
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
                                                    className={`grid grid-cols-6 py-4 px-4 cursor-pointer hover:bg-gray-50 ${
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
                                                    <div className="flex items-center">
                                                        <div className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                                                            {train.classes.reduce(
                                                                (total, cls) =>
                                                                    total +
                                                                    cls.available,
                                                                0
                                                            )}{" "}
                                                            seats
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col space-y-2">
                                                        {train.classes.map(
                                                            (classItem) => (
                                                                <div
                                                                    key={
                                                                        classItem.id
                                                                    }
                                                                    className="flex items-center justify-between w-full"
                                                                    onClick={(
                                                                        e
                                                                    ) =>
                                                                        handleClassSelect(
                                                                            train.id,
                                                                            classItem.id,
                                                                            e
                                                                        )
                                                                    }
                                                                >
                                                                    <div
                                                                        className={`${
                                                                            classItem.color
                                                                        } text-white px-3 py-1.5 rounded-md text-sm flex-grow flex justify-between items-center ${
                                                                            selectedClass.trainId ===
                                                                                train.id &&
                                                                            selectedClass.classId ===
                                                                                classItem.id
                                                                                ? "ring-2 ring-blue-400 ring-offset-1"
                                                                                : ""
                                                                        }`}
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
                                                                            train.id,
                                                                            classItem.id,
                                                                            e
                                                                        )
                                                                    }
                                                                >
                                                                    <span
                                                                        className={`font-medium ${
                                                                            selectedClass.trainId ===
                                                                                train.id &&
                                                                            selectedClass.classId ===
                                                                                classItem.id
                                                                                ? "text-blue-600"
                                                                                : ""
                                                                        }`}
                                                                    >
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
                                    <select
                                        className="w-full border border-gray-300 rounded p-2 text-sm"
                                        value={passengers[0]?.title || "Mr."}
                                        onChange={(e) =>
                                            handleInputChange(
                                                1,
                                                "title",
                                                e.target.value
                                            )
                                        }
                                    >
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
                                        value={passengers[0]?.firstName || ""}
                                        onChange={(e) =>
                                            handleInputChange(
                                                1,
                                                "firstName",
                                                e.target.value
                                            )
                                        }
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
                                        value={passengers[0]?.lastName || ""}
                                        onChange={(e) =>
                                            handleInputChange(
                                                1,
                                                "lastName",
                                                e.target.value
                                            )
                                        }
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
                                    <select
                                        className="w-full border border-gray-300 rounded p-2 text-sm"
                                        value={passengers[0]?.gender || "Male"}
                                        onChange={(e) =>
                                            handleInputChange(
                                                1,
                                                "gender",
                                                e.target.value
                                            )
                                        }
                                    >
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
                                            onClick={() => {
                                                setIdType("NIC");
                                                handleInputChange(
                                                    1,
                                                    "idType",
                                                    "NIC"
                                                );
                                            }}
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
                                            onClick={() => {
                                                setIdType("Passport");
                                                handleInputChange(
                                                    1,
                                                    "idType",
                                                    "Passport"
                                                );
                                            }}
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
                                        value={passengers[0]?.idNumber || ""}
                                        onChange={(e) =>
                                            handleInputChange(
                                                1,
                                                "idNumber",
                                                e.target.value
                                            )
                                        }
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
                        {passengerCount > 1 && (
                            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                                <h3 className="text-lg font-medium text-gray-800 mb-1">
                                    Other Passenger Details
                                </h3>
                                <p className="text-sm mb-2">
                                    Please enter details of all other passengers
                                </p>
                                <p className="text-xs text-red-500 mb-3">
                                    If the passenger is below 17 years and does
                                    not have either passport or NIC, please
                                    select the 'Dependent' category.
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
                                            {passengers
                                                .slice(1)
                                                .map((passenger, index) => (
                                                    <tr key={passenger.id}>
                                                        <td className="py-1">
                                                            Passenger{" "}
                                                            {index + 2}
                                                        </td>
                                                        <td className="py-1">
                                                            <select
                                                                className="w-full border border-gray-300 rounded p-1 text-sm"
                                                                value={
                                                                    passenger.type
                                                                }
                                                                onChange={(e) =>
                                                                    handleInputChange(
                                                                        passenger.id,
                                                                        "type",
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                            >
                                                                <option value="">
                                                                    Select
                                                                </option>
                                                                <option value="Adult">
                                                                    Adult
                                                                </option>
                                                                <option value="Child">
                                                                    Child
                                                                </option>
                                                                <option value="Dependent">
                                                                    Dependent
                                                                </option>
                                                                <option value="Senior">
                                                                    Senior
                                                                </option>
                                                            </select>
                                                        </td>
                                                        <td className="py-1">
                                                            <input
                                                                type="text"
                                                                placeholder="Identification No"
                                                                className="w-full border border-gray-300 rounded p-1 text-sm"
                                                                value={
                                                                    passenger.idNumber
                                                                }
                                                                onChange={(e) =>
                                                                    handleInputChange(
                                                                        passenger.id,
                                                                        "idNumber",
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                        <td className="py-1">
                                                            <select
                                                                className="w-full border border-gray-300 rounded p-1 text-sm"
                                                                value={
                                                                    passenger.gender
                                                                }
                                                                onChange={(e) =>
                                                                    handleInputChange(
                                                                        passenger.id,
                                                                        "gender",
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                            >
                                                                <option value="">
                                                                    Select
                                                                </option>
                                                                <option value="Male">
                                                                    Male
                                                                </option>
                                                                <option value="Female">
                                                                    Female
                                                                </option>
                                                            </select>
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                                <p className="text-xs text-gray-600 mt-3">
                                    Mandatory fields are marked with{" "}
                                    <span className="text-red-500">*</span>
                                </p>
                            </div>
                        )}

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
                                {trainData.length > 0 ? (
                                    trainData
                                        .filter(
                                            (train) =>
                                                train.id === selectedTrain
                                        )
                                        .map((train) =>
                                            train.classes.map((classItem) => (
                                                <div
                                                    key={`${train.id}-${classItem.id}`}
                                                    className={`bg-white rounded-md overflow-hidden shadow-sm cursor-pointer transition-all ${
                                                        selectedSeatType ===
                                                        `${train.id}-${classItem.id}`
                                                            ? "ring-2 ring-blue-500"
                                                            : ""
                                                    }`}
                                                    onClick={(e) => {
                                                        handleClassSelect(
                                                            train.id,
                                                            classItem.id,
                                                            e
                                                        );
                                                        setSelectedSeatType(
                                                            `${train.id}-${classItem.id}`
                                                        );
                                                        setBookingData(
                                                            (prev) => ({
                                                                ...prev,
                                                                train: {
                                                                    ...prev.train,
                                                                    class: classItem.type,
                                                                },
                                                                pricing: {
                                                                    ...prev.pricing,
                                                                    baseFare:
                                                                        classItem.priceValue,
                                                                    serviceCharge:
                                                                        Math.round(
                                                                            classItem.priceValue *
                                                                                0.05
                                                                        ),
                                                                    totalPrice:
                                                                        classItem.priceValue *
                                                                            passengerCount +
                                                                        Math.round(
                                                                            classItem.priceValue *
                                                                                0.05
                                                                        ),
                                                                },
                                                            })
                                                        );
                                                    }}
                                                >
                                                    <div className="p-4 flex justify-between">
                                                        <div>
                                                            <h4 className="font-medium">
                                                                {classItem.type}
                                                            </h4>
                                                            <p className="text-gray-600">
                                                                {classItem.type.includes(
                                                                    "Air Conditioned"
                                                                )
                                                                    ? "Saloon"
                                                                    : "Seats"}
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
                                                                LKR{" "}
                                                                {
                                                                    classItem.priceValue
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="px-4 pb-4 flex justify-center">
                                                        <img
                                                            src={
                                                                classItem.type.includes(
                                                                    "Air Conditioned"
                                                                )
                                                                    ? "https://i.ibb.co/Pvg06fvw/seat.png"
                                                                    : "https://i.ibb.co/Pvg06fvw/seat.png"
                                                            }
                                                            alt={`${classItem.type} Seat`}
                                                            className="h-16 w-16"
                                                            onError={(e) => {
                                                                e.target.src =
                                                                    "https://via.placeholder.com/64?text=Seat";
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="bg-blue-500 text-white p-2 flex justify-between">
                                                        <span>Available</span>
                                                        <span className="font-bold">
                                                            {
                                                                classItem.available
                                                            }
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        )
                                ) : (
                                    <div className="col-span-2 text-center text-gray-500">
                                        No seat types available for this train
                                    </div>
                                )}
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
                                            {bookingData.train.number}{" "}
                                            {bookingData.train.name}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 py-1.5 px-2">
                                        <span className="text-sm font-medium">
                                            Start Station
                                        </span>
                                        <span className="text-sm">
                                            {bookingData.train.startStation}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 py-1.5 px-2">
                                        <span className="text-sm font-medium">
                                            End Station
                                        </span>
                                        <span className="text-sm">
                                            {bookingData.train.endStation}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 py-1.5 px-2">
                                        <span className="text-sm font-medium">
                                            Departure Date
                                        </span>
                                        <span className="text-sm">
                                            {bookingData.train.departureDate}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 py-1.5 px-2">
                                        <span className="text-sm font-medium">
                                            Time Start -&gt; End
                                        </span>
                                        <span className="text-sm">
                                            {bookingData.train.departureTime} -{" "}
                                            {bookingData.train.arrivalTime}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 py-1.5 px-2">
                                        <span className="text-sm font-medium">
                                            No of Passengers
                                        </span>
                                        <span className="text-sm">
                                            {passengerCount}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 py-1.5 px-2">
                                        <span className="text-sm font-medium">
                                            Train Class
                                        </span>
                                        <span className="text-sm flex items-center">
                                            <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded mr-2">
                                                Selected
                                            </span>
                                            {bookingData.train.class}
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
                                            {bookingData.pricing.baseFare}
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
                                        Total Price - LKR:{" "}
                                        {bookingData.pricing.totalPrice}
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

                        {/* Payment Form */}
                        {showPaymentForm && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                                    <h3 className="text-xl font-semibold mb-4">
                                        Enter Payment Details
                                    </h3>
                                    <form onSubmit={handlePaymentSubmit}>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Card Number
                                                </label>
                                                <input
                                                    type="text"
                                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                                    placeholder="1234 5678 9012 3456"
                                                    value={
                                                        cardDetails.cardNumber
                                                    }
                                                    onChange={(e) =>
                                                        handleCardInputChange(
                                                            "cardNumber",
                                                            e.target.value
                                                        )
                                                    }
                                                    maxLength={19}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Cardholder Name
                                                </label>
                                                <input
                                                    type="text"
                                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                                    placeholder="John Doe"
                                                    value={
                                                        cardDetails.cardholderName
                                                    }
                                                    onChange={(e) =>
                                                        handleCardInputChange(
                                                            "cardholderName",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Expiry Date
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                                                        placeholder="MM/YY"
                                                        value={
                                                            cardDetails.expiryDate
                                                        }
                                                        onChange={(e) =>
                                                            handleCardInputChange(
                                                                "expiryDate",
                                                                e.target.value
                                                            )
                                                        }
                                                        maxLength={5}
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        CVV
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                                                        placeholder="123"
                                                        value={cardDetails.cvv}
                                                        onChange={(e) =>
                                                            handleCardInputChange(
                                                                "cvv",
                                                                e.target.value
                                                            )
                                                        }
                                                        maxLength={3}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 flex justify-end space-x-3">
                                            <button
                                                type="button"
                                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                                                onClick={() =>
                                                    setShowPaymentForm(false)
                                                }
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                            >
                                                Pay LKR{" "}
                                                {bookingData.pricing.totalPrice}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between pt-4">
                            <button
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                                onClick={() => setCurrentStep(2)}
                            >
                                Back
                            </button>
                            <button
                                className={`px-4 py-2 ${
                                    acceptTerms && paymentMethod
                                        ? "bg-blue-600 hover:bg-blue-700"
                                        : "bg-blue-300 cursor-not-allowed"
                                } text-white rounded-md transition-colors`}
                                disabled={!acceptTerms || !paymentMethod}
                                onClick={handleProceedToPayment}
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
                                                type="button"
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
                                                type="button"
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
                                            <option value="Vegetarian">
                                                Vegetarian
                                            </option>
                                            <option value="Vegan">Vegan</option>
                                            <option value="Halal">Halal</option>
                                            <option value="Kosher">
                                                Kosher
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
                            <button
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                                onClick={() => setCurrentStep(3)}
                            >
                                Back
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                onClick={handleContinueToTicketSummary}
                            >
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
                                <button
                                    onClick={handleDownloadTicket}
                                    className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                >
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
                                            {passengers
                                                .slice(
                                                    0,
                                                    showAllPassengers
                                                        ? passengers.length
                                                        : 1
                                                )
                                                .map((passenger, index) => (
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
                                                            {bookingData.train
                                                                .seats[index] ||
                                                                `A${
                                                                    12 + index
                                                                }`}
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
                            <button
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                                onClick={() => setCurrentStep(4)}
                            >
                                Back
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                onClick={handleCompleteBooking}
                            >
                                Complete Booking
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Navigation */}
            {/* <div className="flex justify-end mt-6">
                {currentStep < steps.length ? (
                    <button
                        onClick={goToNextStep}
                        className="px-6 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition duration-300"
                    >
                        Next
                    </button>
                ) : (
                    <button
                        onClick={handleCompleteBooking}
                        className="px-6 py-2 rounded-md bg-green-500 text-white hover:bg-green-600 transition duration-300"
                    >
                        Finish
                    </button>
                )}
            </div> */}
        </div>
    );
};

export default TicketBooking;
