import React from 'react';
import './Hero.css';

const Hero = () => {
  return (
    <div className="hero-wrapper">
      <div className="hero">
        <img src='videos/giphy.gif'/>
        <div className="hero-content">
          <h1>Welcome to the Digital Yearbook</h1>
          <p className="hero-subtitle" data-text="Capture and cherish memories forever">
            Capture and cherish memories forever
          </p>
        </div>
      </div>
    </div>
  );
};

export default Hero;



