import { Carousel } from 'antd';
import React from 'react';
import slideimg1 from '../../assets/images/corosal image1.webp';
import slideimg2 from '../../assets/images/corosal image1.webp';
import slideimg3 from '../../assets/images/corosal image1.webp';
import '../../assets/styles/AuthLayout.css';

const contentStyle = {
  height: '97vh',
  width: '100%',
  color: '#fff',
  lineHeight: '160px',
  textAlign: 'center',
  background: '#fff',
};

const AuthLayout = ({ children }) => {

  return (
      <div className="carousel-container">
        <Carousel autoplay>
          <div>
            <img src={slideimg1} alt="Slide 1" style={contentStyle} />
          </div>
          <div>
            <img src={slideimg2} alt="Slide 2" style={contentStyle} />
          </div>
          <div>
            <img src={slideimg3} alt="Slide 3" style={contentStyle} />
          </div>
        </Carousel>
        {children}
      </div>
    
  );
};

export default AuthLayout;