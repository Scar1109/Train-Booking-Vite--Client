import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Select from "react-select";
import { Carousel, Button, Switch, Card } from "antd";
import { Icon } from "@iconify/react";
import Footer from "../../components/Footer";
import NavBar from "../../components/NavBar";

const Home = () => {
    const [activeTab, setActiveTab] = useState("general");
    const [isReturn, setIsReturn] = useState(false);
    const [passengers, setPassengers] = useState(1);
    const [selectedImage, setSelectedImage] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const services = [
        {
            title: "Colombo Fort - Beliatta",
            description: "Intercity & Express trains",
            classTypes: "1st, 2nd and 3rd",
            bgColor: "bg-white text-black",
            border: "border border-gray-300",
        },
        {
            title: "Colombo Fort - Badulla",
            description: "Intercity & Express trains",
            classTypes: "1st, 2nd, 3rd and observations saloon",
            bgColor: "bg-white text-black",
            border: "border border-gray-300",
        },
        {
            title: "Colombo Fort - Talaimannar",
            description: "Night mail train",
            classTypes: "2nd class",
            bgColor: "bg-white text-black",
            border: "border border-gray-300",
        },
        {
            title: "Colombo Fort - Jaffna",
            description: "Intercity, Express & Night mail trains",
            classTypes: "1st, 2nd and 3rd",
            bgColor: "bg-gray-600 text-white",
        },
        {
            title: "Colombo Fort - Trincomalee",
            description: "Night mail train",
            classTypes: "2nd and 3rd",
            bgColor: "bg-gray-500 text-white",
        },
        {
            title: "Kandy - Badulla",
            description: "Slow train",
            classTypes: "Observations saloon",
            bgColor: "bg-gray-500 text-white",
        },
        {
            title: "Colombo Fort - Kandy",
            description: "Intercity & Express trains",
            classTypes: "1st, 2nd, 3rd and observations saloon",
            bgColor: "bg-gray-800 text-white",
        },
        {
            title: "Colombo Fort - Batticaloa",
            description: "Intercity, Express & Night mail trains",
            classTypes: "1st, 2nd and 3rd",
            bgColor: "bg-gray-800 text-white",
        },
    ];

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
        const [fromStation, setFromStation] = useState(null);
        const [toStation, setToStation] = useState(null);
        const [date, setDate] = useState("");
        const [returnDate, setReturnDate] = useState("");
        const navigate = useNavigate();

        // Error states for validation
        const [errors, setErrors] = useState({
            fromStation: false,
            toStation: false,
            date: false,
            returnDate: false
        });

        // List of stations
        const stationOptions = [
            "Ahangama", "Aluthgama", "Ambalangoda", "Ambewela", "Anuradhapura",
            "Anuradhapura Town", "Awissawella", "Bandarawela", "Batticaloa", "Beliatta",
            "Benthota", "Beruwala", "China bay", "Chunnakam", "Colombo Fort",
            "Demodara", "Demodara R", "Diyathalawa", "Ella", "Ella R",
            "Eraur", "Galgamuwa", "Galle", "Galoya", "Gampaha",
            "Gampola", "Greatwestern", "Habaraduwa", "Habarana", "Hali Ela",
            "Haputhale", "Hatton", "Hikkaduwa", "Hingurakgoda", "Idalgasinna",
            "Jaffna", "Kakirawa", "Kaluthara South", "Kamburugamuwa", "Kandy",
            "Kankesanthurai", "Kanthale", "Kilinochchi", "Kodikamam", "Koggala",
            "Kurunegala", "Madhupara", "Mahawa", "Makumbura", "Mannar",
            "Maradhana", "Mathale", "Mathara", "Medawachchiya", "Mirigama",
            "Mirissa", "Moratuwa", "Mount Laviniya", "Nagollagama", "Nanu Oya",
            "Nawalapitiya", "Nugegoda", "Ohiya", "Omantha", "Pallai",
            "Panadura", "Pattipola", "Peradeniya", "Polgahawela", "Puwakpitiya",
            "Ragama", "Rambukkana", "Rathmalana", "Return Colombo", "Return Waga",
            "Talimannar Pier", "Thambakagamuwa", "Thamuththegama", "Thandikulam", "Trincomalee",
            "Unawatuna", "Valachchena", "Vauniya", "Veyangoda", "Wadduwa",
            "Waligama", "Welikanda", "Wellawa", "Wellawatte"
        ].map((station) => ({ value: station, label: station }));

        // Handle Form Submission with Validation
        const handleSearch = (e) => {
            e.preventDefault();

            let newErrors = {
                fromStation: !fromStation,
                toStation: !toStation,
                date: !date,
                returnDate: isReturn && !returnDate,
                passengers: passengers < 1
            };

            setErrors(newErrors);
            
            // If no errors, navigate to TicketBooking page
            if (!Object.values(newErrors).includes(true)) {
                console.log("Form submitted:", { fromStation, toStation, date, passengers, isReturn, returnDate });
                navigate("/TicketBooking", { state: { startStep: 2 } }); // Navigate with state to start at step 2
            }
        };

        return (
            /* General Passenger Form */
            <form className="mt-4 space-y-3 border border-gray-300 rounded-lg p-6" onSubmit={handleSearch}>
                <div className="grid grid-cols-3 gap-4">
                    {/* From Station (Searchable) */}
                    <div>
                        <label className="block text-gray-600 text-sm font-medium">From</label>
                        <Select
                            options={stationOptions}
                            value={fromStation}
                            onChange={(selectedOption) => setFromStation(selectedOption)}
                            placeholder="Choose Station"
                            className={`border rounded-md w-full ${errors.fromStation ? "border-red-500" : ""}`}
                        />
                        {errors.fromStation && <p className="text-red-500 text-sm mt-1">Please select a station</p>}
                    </div>

                    {/* To Station (Searchable) */}
                    <div>
                        <label className="block text-gray-600 text-sm font-medium">To</label>
                        <Select
                            options={stationOptions}
                            value={toStation}
                            onChange={(selectedOption) => setToStation(selectedOption)}
                            placeholder="Choose Station"
                            className={`border rounded-md w-full ${errors.toStation ? "border-red-500" : ""}`}
                        />
                        {errors.toStation && <p className="text-red-500 text-sm mt-1">Please select a station</p>}
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-gray-600 text-sm font-medium">Date</label>
                        <input
                            type="date"
                            className={`border rounded-md px-4 py-2 w-full ${errors.date ? "border-red-500" : ""}`}
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                        {errors.date && <p className="text-red-500 text-sm mt-1">Please select a date</p>}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                    {/* No of Passengers */}
                    <div>
                        <label className="block text-gray-600 text-sm font-medium">No of Passengers</label>
                        <input
                            type="number"
                            min="1"
                            value={passengers}
                            onChange={(e) => setPassengers(Number(e.target.value))}
                            className={`border rounded-md px-4 py-2 w-full ${errors.passengers ? "border-red-500" : ""}`}
                        />
                        {errors.passengers && <p className="text-red-500 text-sm mt-1">Must be at least 1 passenger</p>}
                    </div>

                    {/* Return Toggle */}
                    <div className="flex items-center space-x-3">
                        <Switch checked={isReturn} onChange={() => setIsReturn(!isReturn)} />
                        <span className="text-gray-700 font-medium">Return</span>
                    </div>

                    {/* Return Date Picker */}
                    {isReturn && (
                        <div>
                            <label className="block text-gray-600 text-sm font-medium">Return Date</label>
                            <input
                                type="date"
                                className={`border rounded-md px-4 py-2 w-full ${errors.returnDate ? "border-red-500" : ""}`}
                                value={returnDate}
                                onChange={(e) => setReturnDate(e.target.value)}
                            />
                            {errors.returnDate && <p className="text-red-500 text-sm mt-1">Please select a return date</p>}
                        </div>
                    )}
                </div>

                {/* Buttons */}
                <div className="flex justify-end space-x-4">
                    <button
                        type="submit"
                        className="border px-6 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition duration-300 ease-in-out cursor-pointer"
                    >
                        Search
                    </button>
                    <button
                        type="reset"
                        onClick={() => {
                            setFromStation(null);
                            setToStation(null);
                            setDate("");
                            setReturnDate("");
                            setPassengers(1);
                            setErrors({});
                        }}
                        className="border px-6 py-2 rounded-md hover:bg-gray-100 transition duration-300 ease-in-out cursor-pointer"
                    >
                        Reset
                    </button>
                </div>
            </form>
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
        <div className="space-y-3 border border-gray-300 rounded-lg p-6 h-50">
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
            <div className="relative w-full h-[80vh] md:h-[90vh] lg:h-screen">
                {/* Carousel (Background) */}
                <Carousel autoplay className="absolute top-0 left-0 w-full h-full">
                    {carouselImages.map((src, index) => (
                        <div key={index} className="w-full h-screen">
                            <img src={src} alt={`carousel-${index}`} className="w-full h-full object-cover" />
                        </div>
                    ))}
                </Carousel>


                {/* Hero Content */}
                <div className="absolute top-[30%] left-[50%] transform -translate-x-[120%] -translate-y- 0%] flex flex-col items-left text-left text-white z-10">
                    <Icon icon="mdi:train" className="text-4xl mb-2" />
                    <h2 className="text-4xl font- text-white drop-shadow-[2px_2px_4px_rgba(0,0,0,0.8)]">
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
            <div className="relative w-full p-2 flex items-center justify-center  overflow-hidden mt-[-80px]">
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
                <h2 className="text-4xl mb-6">Gallery</h2>

                {/* Image Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
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
            <div className="container mx-auto p-8">
                {/* Heading */}
                <h1 className="text-4xl mb-6 text-gray-900">History</h1>

                {/* Paragraphs */}
                <p className="text-gray-700 text-lg text-justify leading-relaxed">
                    Rail was introduced in Sri Lanka in 1864 to transport coffee from plantations in the hill country district of Kandy to the port city of Colombo on its way to Europe and the world market. The coffee blight of 1871 destroyed many a fine plantation and tea replaced coffee. With the development of tea plantations in the 1880s, the joint-stock companies swallowed up the former individual proprietorship of the coffee era. Under corporate ownership and management control by companies, the process of production of tea became more sophisticated and needed more and more railways built to the Kandyan highlands. To send tea to Colombo and to transport labour, machinery, manure, rice, and foodstuff, etc to Kandy, another 100 miles of railways were constructed in the tea planting districts to serve the expanding tea domain.
                </p>

                <p className="text-gray-700 text-justify leading-relaxed mt-4">
                    To serve the coconut plantations flourishing in the west, southwest and northwest coastal areas of the country, and the wet inland rubber plantations below the tea belt, railway lines were built in the wake of these agricultural developments. Thereafter, the need for cheap and safe travel in order to open up the hinterland of the country led to the expansion of the railway.
                </p>

                <p className="text-gray-700 text-lg  text-justify leading-relaxed mt-4">
                    An extension of the Main Line to Kandy was made north to the ancient city of Anuradhapura, going further north to Kankesanturai and west to Talaimannar to connect the island with South India by ferry, to bring Indian labour for the tea and rubber plantations, and also import rice and other foodstuffs not indigenously produced in sufficient quantities.
                </p>

                <p className="text-gray-700 text-lg  text-justify leading-relaxed mt-4">
                    Towards the east, there was little economic justification to lay a line to the dry zone in that direction, but it became strategically worthwhile to lay a line to the natural harbour of Trincomalee and also connect it to the provincial capital of Batticaloa. These lines were laid with light (21 kg) section rails, as was the narrow gauge section to serve the rubber plantations east of Colombo, known as the Kelani Valley Line.
                </p>

                <p className="text-gray-700 text-lg  text-justify leading-relaxed mt-4">
                    Up country, a similar branch line was laid from Nanu Oya on the Main Line through very difficult terrain to serve the tea plantations around Nuwara Eliya. Track alignment was defined in this section about 140 years ago, when economic considerations were vastly different. The railways achieved modal superiority with speeds of 25 to 40 kmph in the hill country and 65 to 80 in the low country. Civil engineering criteria was influenced by the economic need to minimize cuts and fills, permitting gradients to 2 to 3% and minimizing bridge lengths. As a result, the alignment here is winding with very sharp curves.
                </p>

                <p className="text-gray-700 text-lg text-justify leading-relaxed mt-4 italic">
                    'In the early days of the railways, the bulk of the freight was carried to the port of Colombo and as the port expanded, rail lines were laid to serve every pier.'
                </p>
            </div>
            <div className="container mx-auto px-8 py-12">
                {/* Title */}
                <h2 className="text-4xl mb-8">Our Services</h2>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                    {services.map((service, index) => (
                        <Card
                            key={index}
                            className={`p-6 rounded-lg shadow-md ${service.bgColor} ${service.border}`}
                            bordered={true}
                        >
                            {/* Title */}
                            <h3 className="font-bold text-lg">{service.title}</h3>

                            {/* Description */}
                            <p className="text-sm opacity-80 mt-1">{service.description}</p>

                            {/* Available Class Types */}
                            <p className="mt-2 text-sm">
                                <span className="font-semibold">Available class types:</span>{" "}
                                <span className="text-blue-600 font-semibold italic">
                                    {service.classTypes}
                                </span>
                            </p>
                        </Card>
                    ))}
                </div>
            </div>
            {/* Footer Section */}
            {/* <Footer /> */}
        </div>
    );
};

export default Home;
