import { Carousel } from 'antd';
import React from 'react';
import '../../assets/styles/AuthLayout.css';

const contentStyle = {
  height: '100vh',
  width: '100%',
  objectFit: 'cover',
};

const AuthLayout = ({ children }) => {
  return (
    <div className="carousel-container">
      <Carousel autoplay>
        <div>
          <img
            src="https://i.ibb.co/xKC5MnLY/360-F-290795351-i0k-JX32-HPEdj-Tg-K1i-Sja-Dj-Tb9-MN3qk4-O.jpg"
            alt="Slide 1"
            style={contentStyle}
            className="object-cover w-full h-full"
          />
        </div>
        {/* <div>
          <img
            src="https://i.ibb.co/V0RzdmCb/this-tour-takes-you-on.jpg"
            alt="Slide 2"
            style={contentStyle}
            className="object-cover w-full h-full"
          />
        </div>
        <div>
          <img
            src="https://i.ibb.co/xtjSCYxF/beach-side-scene-sri-lanka-600nw-2411759029.jpg"
            alt="Slide 3"
            style={contentStyle}
            className="object-cover w-full h-full"
          />
        </div>
        <div>
          <img
            src="https://i.ibb.co/YmwRDyM/18746020394-2cca2c3547-b.jpg"
            alt="Slide 4"
            style={contentStyle}
            className="object-cover w-full h-full"
          />
        </div>
        <div>
          <img
            src="https://i.ibb.co/s945KHJ9/train-sri-lanka-stock-031425-c2ae7e79d84d424f98218e8ec8d232b3.jpg"
            alt="Slide 5"
            style={contentStyle}
            className="object-cover w-full h-full"
          />
        </div> */}
      </Carousel>
      {children}
    </div>
  );
};

export default AuthLayout;
