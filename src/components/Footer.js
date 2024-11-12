import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
import { supabase } from '../supabaseClient'; // Import your supabase client
import './Footer.css';

const Footer = () => {
  const navigate = useNavigate(); // Initialize navigate

  const handleLogout = async () => {
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Optionally clear any other client-side authentication data
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');

      // Redirect to login page
      // Use window.location to force a page refresh
      window.location.href = '/login';
    } catch (error) {
      console.error('Error during logout:', error.message);
      // Handle errors or notify the user
    }
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <p>© 2024 Digital Yearbook. All Rights Reserved.</p>
        <nav className="footer-nav">
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
          <a href="#contact">Contact Us</a>
        </nav>
      </div>
      <div className="footer-social">
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
          <i className="fab fa-facebook"></i>
        </a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
          <i className="fab fa-twitter"></i>
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
          <i className="fab fa-instagram"></i>
        </a>
      </div>
      <div className="footer-logout">
        <button onClick={handleLogout} className="logout-button">
          <FontAwesomeIcon icon={faSignOutAlt} />
        </button>
      </div>
    </footer>
  );
};

export default Footer;



