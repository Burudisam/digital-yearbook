import React from 'react';
import './About.css';
import Navbar from './Navbar';

const About = () => {
  return (
    <div>
      <Navbar />
      <div className="about-page">
        <div className="about-container">
          <div className="star-wars-crawl">
            <div className="crawl-content">
              <h1 className="about-title">About Us</h1>
              <p>In a world where memories are fleeting...</p>
              <p>Our mission is to provide a digital sanctuary for the stories and experiences of our school community. Every laugh, every tear, and every triumph deserves to be celebrated.</p>
              <p>Our Digital Yearbook project serves as a canvas for students to express themselves, connect with one another, and preserve their unique journeys in a collaborative space.</p>
              <p>Here, students can share their achievements, vote for their peers in various categories, and relive the moments that define their high school experience.</p>
              <p>Join us as we embark on this adventure to capture the essence of our community, one memory at a time.</p>
              <p>May the memories be with you!</p>

              <h2 className="about-subtitle">Our Mission</h2>
              <p className="about-description">
                Our mission is to preserve the unique experiences of each student through a collaborative digital platform. We want to ensure that every voice is heard and every memory is cherished.
              </p>

              <h2 className="about-subtitle">Meet the Team</h2>
              <ul className="team-list">
                <li>Hillary Sam - Project Manager</li>
                <li>Hillary Sam - Lead Developer</li>
                <li>Hillary Sam - Designer</li>
                <li>Hillary Sam - Content Creator</li>
              </ul>

              <h2 className="about-subtitle">Contact Us</h2>
              <p className="about-description">
                If you have any questions, feedback, or want to get involved, feel free to reach out to us at <a href="mailto:info@digitalyearbook.com">info@digitalyearbook.com</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;


