import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './Auth.css'; // You can reuse the CSS from the login page if you'd like

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handlePasswordRecovery = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      setError('Error sending recovery email. Please try again.');
    } else {
      setSuccess('Password reset email sent! Check your inbox.');
      setEmail('');
      setTimeout(() => navigate('/login'), 5000);  // Redirect after 5 seconds to login
    }
  };

  return (
    <div className="auth-container">
      <h2>Recover Password</h2>
      <form onSubmit={handlePasswordRecovery}>
        <input 
          type="email" 
          placeholder="Enter your email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required 
        />
        <button type="submit">Send Recovery Email</button>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
      </form>
      <p>Remember your password? <button onClick={() => navigate('/login')}>Login</button></p>
    </div>
  );
};

export default ForgotPassword;
