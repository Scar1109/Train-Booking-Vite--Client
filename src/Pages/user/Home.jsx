import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Carousel, Button, Switch } from "antd";
import { Icon } from "@iconify/react";
import Footer from "../../components/Footer";
import NavBar from "../../components/NavBar";

const Home = () => {
    const [activeTab, setActiveTab] = useState("general");
    const [isReturn, setIsReturn] = useState(false);
    const [passengers, setPassengers] = useState(1);
    const [selectedImage, setSelectedImage] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const carouselImages = [
        "https://i.ibb.co/xKC5MnLY/360-F-290795351-i0k-JX32-HPEdj-Tg-K1i-Sja-Dj-Tb9-MN3qk4-O.jpg",
        "https://i.ibb.co/V0RzdmCb/this-tour-takes-you-on.jpg",
        "https://i.ibb.co/xtjSCYxF/beach-side-scene-sri-lanka-600nw-2411759029.jpg",
        "https://i.ibb.co/YmwRDyM/18746020394-2cca2c3547-b.jpg",
        "https://i.ibb.co/s945KHJ9/train-sri-lanka-stock-031425-c2ae7e79d84d424f98218e8ec8d232b3.jpg",
    ];

    const images = [
        "https://i.ibb.co/xKC5MnLY/360-F-290795351-i0k-JX32-HPEdj-Tg-K1i-Sja-Dj-Tb9-MN3qk4-O.jpg",
        "https://i.ibb.co/V0RzdmCb/this-tour-takes-you-on.jpg",
        "https://i.ibb.co/xtjSCYxF/beach-side-scene-sri-lanka-600nw-2411759029.jpg",
        "https://i.ibb.co/YmwRDyM/18746020394-2cca2c3547-b.jpg",
        "https://i.ibb.co/s945KHJ9/train-sri-lanka-stock-031425-c2ae7e79d84d424f98218e8ec8d232b3.jpg",
        "https://i.ibb.co/Q3cZ6CFw/photo-1566296314736-6eaac1ca0cb9.jpg",
      ];

    const handleReturnChange = (checked) => {
        setIsReturn(checked);
        console.log(`Switch to ${checked}`);
    };

    const handlePassengerChange = (e) => {
        setPassengers(Number(e.target.value)); // Ensures value is a number
    };

    // Open Image in Lightbox
    const openLightbox = (index) => {
        setCurrentIndex(index);
        setSelectedImage(images[index]);
    };

    // Close Lightbox
    const closeLightbox = () => {
        setSelectedImage(null);
    };

    // Navigate Images
    const nextImage = () => {
        const newIndex = (currentIndex + 1) % images.length;
        setCurrentIndex(newIndex);
        setSelectedImage(images[newIndex]);
    };

    const prevImage = () => {
        const newIndex = (currentIndex - 1 + images.length) % images.length;
        setCurrentIndex(newIndex);
        setSelectedImage(images[newIndex]);
    };

    /* Different Forms */
    /* General Passenger Form */
    const GeneralPassengerForm = () => {
        const [isReturn, setIsReturn] = useState(false);
        const [passengers, setPassengers] = useState(1);

        return (
            /* General Passenger Form */
            <div className="mt-4 space-y-3 border border-gray-300 rounded-lg p-6">
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-gray-600 text-sm font-medium">From</label>
                        <select className="border rounded-md px-4 py-2 w-full">
                            <option>Choose Station</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-gray-600 text-sm font-medium">To</label>
                        <select className="border rounded-md px-4 py-2 w-full">
                            <option>Choose Station</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-gray-600 text-sm font-medium">Date</label>
                        <input type="date" className="border rounded-md px-4 py-2 w-full" />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                    <div>
                        <input
                            type="number"
                            min="1"
                            value={passengers}
                            onChange={(e) => setPassengers(Number(e.target.value))}
                            className="border rounded-md px-4 py-2 w-full"
                        />
                    </div>

                    <div className="flex items-center space-x-3">
                        <Switch checked={isReturn} onChange={() => setIsReturn(!isReturn)} />
                        <span className="text-gray-700 font-medium">Return</span>
                    </div>

                    {isReturn && (
                        <input type="date" className="border rounded-md px-4 py-2 w-full" placeholder="Pick Return Date" />
                    )}
                </div>

                <div className="flex justify-end space-x-4">
                    <button className="border px-6 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition duration-300 ease-in-out cursor-pointer">
                        Search
                    </button>
                    <button className="border px-6 py-2 rounded-md hover:bg-gray-100 transition duration-300 ease-in-out cursor-pointer">
                        Reset
                    </button>
                </div>
            </div>
        );
    };

    /* Warrant Passenger Form */
    const WarrantPassengerForm = () => (
        <div className="border border-gray-300 rounded-lg p-6 space-y-6">
            {/* Warrant Information Section */}
            <h2 className="text-lg font-bold text-gray-700 border-b pb-2">Warrant Information</h2>
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="block text-gray-600 text-sm font-medium">Warrant Number <span className="text-blue-500">?</span></label>
                    <input type="text" className="border rounded-md px-4 py-2 w-full" placeholder="Warrant Number" />
                </div>
                <div>
                    <label className="block text-gray-600 text-sm font-medium">Department Code <span className="text-blue-500">?</span></label>
                    <input type="text" className="border rounded-md px-4 py-2 w-full" placeholder="Department Code" />
                </div>
                <div>
                    <label className="block text-gray-600 text-sm font-medium">Class Type <span className="text-blue-500">?</span></label>
                    <select className="border rounded-md px-4 py-2 w-full">
                        <option>Class Type</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="block text-gray-600 text-sm font-medium">Warrant Issuing Date <span className="text-blue-500">?</span></label>
                    <input type="date" className="border rounded-md px-4 py-2 w-full" />
                </div>
                <div>
                    <label className="block text-gray-600 text-sm font-medium">Proposed Travel Date <span className="text-blue-500">?</span></label>
                    <input type="date" className="border rounded-md px-4 py-2 w-full" />
                </div>
                <div>
                    <label className="block text-gray-600 text-sm font-medium">NIC of the Warrant Holder <span className="text-blue-500">?</span></label>
                    <input type="text" className="border rounded-md px-4 py-2 w-full" placeholder="NIC" />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="block text-gray-600 text-sm font-medium">Title</label>
                    <select className="border rounded-md px-4 py-2 w-full">
                        <option>Mr.</option>
                        <option>Mrs.</option>
                        <option>Ms.</option>
                    </select>
                </div>
                <div>
                    <label className="block text-gray-600 text-sm font-medium">First Name</label>
                    <input type="text" className="border rounded-md px-4 py-2 w-full" placeholder="First Name" />
                </div>
                <div>
                    <label className="block text-gray-600 text-sm font-medium">Last Name</label>
                    <input type="text" className="border rounded-md px-4 py-2 w-full" placeholder="Last Name" />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 items-center">
                <div>
                    <label className="block text-gray-600 text-sm font-medium">Gender</label>
                    <select className="border rounded-md px-4 py-2 w-full">
                        <option>Gender</option>
                        <option>Male</option>
                        <option>Female</option>
                    </select>
                </div>
                <div>
                    <label className="block text-gray-600 text-sm font-medium">Mobile Number <span className="text-blue-500">?</span></label>
                    <input type="text" className="border rounded-md px-4 py-2 w-full" placeholder="ex: 07x xxx xxxx" />
                </div>
                <div className="flex items-end justify mt-5">
                    <button className="border px-6 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition duration-300 ease-in-out cursor-pointer">
                        Verify
                    </button>
                </div>
            </div>

            {/* Journey Information Section */}
            <h2 className="text-lg font-bold text-gray-700 border-b pb-2">Journey Information</h2>
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="block text-gray-600 text-sm font-medium">From</label>
                    <select className="border rounded-md px-4 py-2 w-full">
                        <option>Choose Station</option>
                    </select>
                </div>
                <div>
                    <label className="block text-gray-600 text-sm font-medium">To</label>
                    <select className="border rounded-md px-4 py-2 w-full">
                        <option>Choose Station</option>
                    </select>
                </div>
                <div>
                    <label className="block text-gray-600 text-sm font-medium">Date</label>
                    <input type="date" className="border rounded-md px-4 py-2 w-full" />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="block text-gray-600 text-sm font-medium">No of Passengers</label>
                    <input type="number" className="border rounded-md px-4 py-2 w-full" placeholder="No of Passengers" />
                </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-4 mt-4">
                <button className="border px-6 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition duration-300 ease-in-out cursor-pointer">
                    Search
                </button>
                <button className="border px-6 py-2 rounded-md hover:bg-gray-100 transition duration-300 ease-in-out cursor-pointer">
                    Reset
                </button>
            </div>
        </div>
    );



    /* Pension Warrant Passenger Form */
    const PensionPassengerForm = () => (
        <div className="space-y-3 border border-gray-300 rounded-lg p-6">
            <h2 className="text-lg font-bold">Pension Warrant Information</h2>
            <div className="grid grid-cols-3 gap-55">
                <input type="text" placeholder="Pensioner Trip ID" className=" border rounded-md px-4 py-2 w-79" />
                <input type="text" placeholder="NIC Number" className="border rounded-md px-4 py-2 w-79" />
                <button className="w-30 border px-6 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition duration-300 ease-in-out cursor-pointer">
                    Verify
                </button>
            </div>
        </div>
    );
    return (
        <div className="bg-white min-h-screen">
            {/* Header Section */}
            {/* <NavBar /> */}

            {/* Hero Section */}
            <div className="relative w-full h-[879px] mx-auto">
                {/* Carousel (Background) */}
                <Carousel autoplay className="absolute top-0 left-0 w-screen h-[879px] z-0">
                    {carouselImages.map((src, index) => (
                        <div key={index} className="w-full h-[879px]">
                            <img src={src} alt={`carousel-${index}`} className="w-full h-full object-cover" />
                        </div>
                    ))}
                </Carousel>

                {/* Hero Content */}
                <div className="absolute top-[50%] left-[50%] transform -translate-x-[120%] -translate-y-[50%] flex flex-col items-left text-left text-white z-20">
                    <Icon icon="mdi:train" className="text-5xl mb-2" />
                    <h2 className="text-5xl font-bold text-white drop-shadow-[2px_2px_4px_rgba(0,0,0,0.8)]">
                        Welcome to Sri Lanka Railways
                    </h2>
                    <p className="text-lg mt-2 opacity-90 text-white drop-shadow-[2px_2px_4px_rgba(0,0,0,0.8)]">
                        Online Advance Train Seats Reservation
                    </p>
                    <Link to="/booking">
                        <button className="mt-6 px-6 py-3 text-lg font-medium border-2 border-white text-white bg-transparent rounded-full hover:bg-white hover:text-black transition duration-300 ease-in-out">
                            Book Your Seat
                        </button>
                    </Link>
                </div>
            </div>

            {/* Booking Section */}
            <div className="relative w-full p-2 flex items-center justify-center  overflow-hidden mt-[-100px]">
                <div className="w-full max-w-[1140px] bg-white p-0 shadow-lg  flex mb-10 mt-[-20px]">
                    {/* Left Section (Blue Background) */}
                    <div
                        className={`w-[285px] transition-all duration-300 ${activeTab === "general"
                            ? "h-[385px]"
                            : activeTab === "warrant"
                                ? "h-[830px]"
                                : "h-[580px]"
                            } bg-gradient-to-b from-blue-700 to-blue-400 text-white flex flex-col p-5`}
                    >
                        <h2 className="text-3xl mt-5">Book Your Seat</h2>
                        <p className="mt-2 opacity-80">You can book both ways</p>

                        {/* Show "Government Circulars" when not General Passenger */}
                        {activeTab !== "general" && (
                            <div className="mt-4 p-4 border border-white rounded-lg">
                                <h3 className="text-lg font-semibold">Government Circulars</h3>
                                <ul className="mt-2 space-y-7 text-sm ">
                                    <li>Establishment Code Chapter XIII</li>
                                    <li>Establishment Code Chapter XVI</li>
                                    <li>Establishment Code Chapter XVI —
                                        Amendments to the paragraph 2
                                        of the circular number 26/201
                                        issued by the Public
                                        Administration.</li>
                                    <li>Terms and Conditions for Users —
                                        Will attach in PDE</li>
                                    <li>Guidelines</li>
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Right Section (White Background) */}
                    <div
                        className={`w-[855px] transition-all duration-300 ${activeTab === "general"
                            ? "h-[385px]"
                            : activeTab === "warrant"
                                ? "h-[830px]"
                                : "h-[580px]"
                            } bg-white p-6 rounded-r-lg `}
                    >
                        {/* Tabs */}
                        <div className="flex  space-x-2">
                            {["general", "warrant", "pension"].map((tab) => (
                                <button
                                    key={tab}
                                    className={`px-6 py-2 font-medium rounded-t-md transition-all duration-300 ease-in-out ${activeTab === tab
                                        ? "bg-gradient-to-r from-blue-600 to-blue-400 text-white shadow-md"
                                        : "bg-gray-300 text-gray-700"
                                        }`}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tab === "general" && "General Passenger"}
                                    {tab === "warrant" && "Warrant Passenger"}
                                    {tab === "pension" && "Pension Warrant Passenger"}
                                </button>
                            ))}
                        </div>

                        {/* Form Content (Changes Based on Active Tab) */}
                        <div className="mt-4">
                            {activeTab === "general" && <GeneralPassengerForm />}
                            {activeTab === "warrant" && <WarrantPassengerForm />}
                            {activeTab === "pension" && <PensionPassengerForm />}
                        </div>
                    </div>
                </div>
            </div>
            <div className="container mx-auto p-8">
                {/* Heading */}
                <h2 className="text-5xl mb-6">Gallery</h2>

                {/* Image Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {images.map((src, index) => (
                        <div
                            key={index}
                            className="rounded-lg shadow-2xl overflow-hidden cursor-pointer hover:shadow-lg transition duration-300"
                            onClick={() => openLightbox(index)}
                        >
                            <img src={src} alt={`Gallery ${index + 1}`} className="w-full h-60 object-cover" />
                        </div>
                    ))}
                </div>

                {/* Lightbox Overlay */}
                {selectedImage && (
                    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
                        {/* Close Button */}
                        <button onClick={closeLightbox} className="absolute top-5 right-5 text-white text-3xl">
                            &times;
                        </button>

                        {/* Left Navigation */}
                        <button
                            onClick={prevImage}
                            className="absolute left-5 text-white text-4xl bg-gray-800 p-2 rounded-full hover:bg-gray-700"
                        >
                            &#10094;
                        </button>

                        {/* Image Display */}
                        <img src={selectedImage} alt="Lightbox" className="max-w-[90%] max-h-[80vh] object-contain" />

                        {/* Right Navigation */}
                        <button
                            onClick={nextImage}
                            className="absolute right-5 text-white text-4xl bg-gray-800 p-2 rounded-full hover:bg-gray-700"
                        >
                            &#10095;
                        </button>
                    </div>
                )}
            </div>
            
            {/* Footer Section */}
            {/* <Footer /> */}
        </div>
    );
};

export default Home;
