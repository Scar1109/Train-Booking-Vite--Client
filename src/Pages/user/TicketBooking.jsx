import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

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
    const initialStep = location.state?.startStep || 1; // Default to 1 if no state is passed
    const [currentStep, setCurrentStep] = useState(initialStep);

    const goToNextStep = () => {
        if (currentStep < steps.length) {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const goToPreviousStep = () => {
        if (currentStep === 2) {
            navigate("/"); // Navigate to Home if "Check Availability" is the current step
        } else if (currentStep > 1) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    const handleStepClick = (index) => {
        if (index === 0) {
            navigate("/"); // Navigate to Home if Step 1 (Home) is clicked
        } else if (index + 1 <= currentStep) {
            setCurrentStep(index + 1);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto mt-10">
            {/* Progress Bar */}
            <div className="relative flex items-center justify-between mb-8">
                {steps.map((step, index) => (
                    <div key={index} className="relative flex-1 flex flex-col items-center">
                        {/* Step Indicator */}
                        <div
                            className={`w-10 h-10 flex items-center justify-center rounded-full border-2 text-lg font-bold transition-all cursor-pointer
                                ${index + 1 === currentStep
                                    ? "border-blue-500 bg-white text-blue-500"
                                    : index + 1 < currentStep
                                        ? "bg-green-500 text-white border-green-500"
                                        : "bg-gray-300 text-gray-700 border-gray-400"
                                }`}
                            onClick={() => handleStepClick(index)}
                        >
                            {index + 1}
                        </div>

                        {/* Step Name */}
                        <span
                            className={`text-sm mt-2 font-semibold transition-all cursor-pointer
                                ${index + 1 === currentStep
                                    ? "text-blue-500"
                                    : index + 1 < currentStep
                                        ? "text-green-600"
                                        : "text-gray-500"
                                }`}
                            onClick={() => handleStepClick(index)}
                        >
                            {step}
                        </span>

                        {/* Line Connector */}
                        {index !== steps.length - 1 && (
                            <div
                                className={`absolute top-5 left-[109%] transform -translate-x-[50%] w-full h-1 transition-all 
                                    ${index + 1 < currentStep
                                        ? "bg-green-500"
                                        : index + 1 === currentStep
                                            ? "bg-blue-500"
                                            : "bg-gray-300"
                                    }`}
                                style={{ width: "100%" }} // Ensures full-width for alignment
                            ></div>
                        )}
                    </div>
                ))}
            </div>

            {/* Page Content */}
            <div className="bg-white shadow-md p-6 rounded-md">
                <h2 className="text-2xl font-semibold mb-4">{steps[currentStep - 1]}</h2>
                <p className="text-gray-600">
                    This is the content for <b>{steps[currentStep - 1]}</b>. You can update this with the actual form or details.
                </p>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-end mt-6">
                {/* <button
                    onClick={goToPreviousStep}
                    className={`px-6 py-2 rounded-md border transition-all
                        ${currentStep === 1 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-gray-100 hover:bg-gray-200"}`}
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
