import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const TicketBooking = () => {
    const navigate = useNavigate();
    const steps = [
        "Home",
        "Check Availability",
        "Confirmation & Payment",
        "Passenger Information",
        "Ticket Summary",
    ];

    const [currentStep, setCurrentStep] = useState(1);

    const goToNextStep = () => {
        if (currentStep < steps.length) {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const goToPreviousStep = () => {
        if (currentStep > 1) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto mt-10">
            {/* Progress Bar */}
            <div className="flex items-center justify-between mb-8">
                {steps.map((step, index) => (
                    <div key={index} className="relative flex-1 flex flex-col items-center">
                        {/* Step Indicator */}
                        <div
                            className={`w-10 h-10 flex items-center justify-center rounded-full border-2 ${index + 1 <= currentStep
                                    ? "bg-blue-500 text-white border-blue-500"
                                    : "bg-gray-300 text-gray-700 border-gray-400"
                                }`}
                        >
                            {index + 1}
                        </div>

                        {/* Step Name */}
                        <span
                            className={`text-sm mt-2 ${index + 1 <= currentStep ? "text-blue-500 font-semibold" : "text-gray-500"
                                }`}
                        >
                            {step}
                        </span>

                        {/* Line Connector */}
                        {index !== steps.length - 1 && (
                            <div
                                className={`absolute top-5 left-[100%] w-full h-1 ${index + 1 < currentStep ? "bg-blue-500" : "bg-gray-300"
                                    }`}
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
            <div className="flex justify-between mt-6">
                <button
                    onClick={goToPreviousStep}
                    disabled={currentStep === 1}
                    className={`px-6 py-2 rounded-md border ${currentStep === 1 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-gray-100 hover:bg-gray-200"
                        }`}
                >
                    Previous
                </button>

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
