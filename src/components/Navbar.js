
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

const Navbar = () => {useStickyNavbar();
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
        <div className="navbar-toggle" onClick={() => setMenuOpen(!isMenuOpen)}>
        ☰
        </div>
        <ul className={`navbar-menu ${isMenuOpen ? 'open' : ''}`}>
        <ul className="navbar-menu">
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
            <Link to="/Event" className="navbar-link">Events</Link>
          </li>
          <li className="navbar-item">
            <Link to="/about" className="navbar-link">About</Link>
          </li>
        </ul>
        <div className="navbar-search">
          <input type="text" placeholder="Search..." />
          <i className="fas fa-search search-icon"></i> {/* Font Awesome search icon */}
        </div>
        </ul>
      </div>
    </nav>
  );
};


export default Navbar;

