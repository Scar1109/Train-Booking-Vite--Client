import React from "react";
import { Link } from "react-router-dom";
import { Carousel } from "antd";
import Footer from "../../components/Footer";
import NavBar from "../../components/Navbar.Jsx";

const Home = () => {

    const contentStyle = "w-full h-[879px] object-cover";

    return (
        <div className="bg-gray-100 min-h-screen">
            {/* Header Section */}
            {/* <NavBar /> */}

            {/* Main Content Section */}
            <div className="relative w-[1903px] h-[879px] mx-auto">
                {/* Heading positioned over the Carousel */}
                <h2 className="absolute top-[50%] left-[50%] transform -translate-x-[50%] -translate-y-[50%] text-white text-4xl font-bold font-[Product Sans] bg-black bg-opacity-50 px-6 py-3 rounded-md z-10">
                    Welcome to Sri Lanka Railways
                </h2>

                {/* Carousel */}
                <div className="flex justify-center items-center">
                    <Carousel autoplay className="w-[1903px] h-[879px] mt-10">
                        <div>
                            <img
                                className={contentStyle}
                                src="https://i.ibb.co/xKC5MnLY/360-F-290795351-i0k-JX32-HPEdj-Tg-K1i-Sja-Dj-Tb9-MN3qk4-O.jpg"
                                alt="corosal4"
                            />
                        </div>
                        <div>
                            <img
                                className={contentStyle}
                                src="https://i.ibb.co/V0RzdmCb/this-tour-takes-you-on.jpg"
                                alt="corosal1"
                            />
                        </div>
                        <div>
                            <img
                                className={contentStyle}
                                src="https://i.ibb.co/xtjSCYxF/beach-side-scene-sri-lanka-600nw-2411759029.jpg"
                                alt="corosal2"
                            />
                        </div>
                        <div>
                            <img
                                className={contentStyle}
                                src="https://i.ibb.co/YmwRDyM/18746020394-2cca2c3547-b.jpg"
                                alt="corosal3"
                            />
                        </div>
                        <div>
                            <img
                                className={contentStyle}
                                src="https://i.ibb.co/s945KHJ9/train-sri-lanka-stock-031425-c2ae7e79d84d424f98218e8ec8d232b3.jpg"
                                alt="corosal4"
                            />
                        </div>
                    </Carousel>
                </div>
            </div>




            {/* Footer Section */}
            {/* <Footer /> */}
        </div>
    );
};

export default Home;
