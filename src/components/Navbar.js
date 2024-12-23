import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const useStickyNavbar = () => {
  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.querySelector('.navbar');
      if (window.scrollY > 50) {
        navbar.classList.add('sticky');
      } else {
        navbar.classList.remove('sticky');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
};

const Navbar = () => {
  useStickyNavbar();
  const [isMenuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Video logo */}
        <Link to="/" className="navbar-logo">
          <video autoPlay loop muted playsInline className="video-logo">
            <source src="/videos/logo.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </Link>
        {/* Hamburger menu toggle */}
        <div
          className="navbar-toggle"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          ☰
        </div>
        {/* Navbar menu */}
        <ul className={`navbar-menu ${isMenuOpen ? 'open' : ''}`}>
          <li className="navbar-item">
            <Link to="/" className="navbar-link">Home</Link>
          </li>
          <li className="navbar-item">
            <Link to="/upload" className="navbar-link">Upload</Link>
          </li>
          <li className="navbar-item">
            <Link to="/voting" className="navbar-link">Voting</Link>
          </li>
          <li className="navbar-item">
            <Link to="/memories" className="navbar-link">Memories</Link>
          </li>
          <li className="navbar-item">
            <Link to="/event" className="navbar-link">Events</Link>
          </li>
          <li className="navbar-item">
            <Link to="/about" className="navbar-link">About</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;


