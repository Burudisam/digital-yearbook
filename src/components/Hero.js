import React from 'react';
import './Hero.css';

const Hero = () => {
  return (
    <div className="hero-wrapper">
      <div className="hero">
        <video 
          className="hero-video" 
          autoPlay 
          loop 
          muted 
          playsInline
        >
          <source 
            src="https://digital-yearbook-assets.s3.us-east-1.amazonaws.com/hero-background.mp4.mp4" 
            type="video/mp4" 
          />
          Your browser does not support the video tag.
        </video>
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


