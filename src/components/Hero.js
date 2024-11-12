import React from 'react';
import './Hero.css';

const Hero = () => {
  return (
    <div className="hero-wrapper">
      <div className="hero">
        <video autoPlay loop muted playsInline className="backgrounds-video">
          <source src="/videos/hero_background.mp4" type="video/mp4" />
          <source src="/videos/hero_background.webm" type="video/webm" />
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



