import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './Auth.css';

const Login = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      // Check if the error is related to an invalid account
      if (error.message.includes("Invalid login credentials") || error.message.includes("User not found")) {
        setError("Invalid account. Please sign up or scan your ID.");
      } else {
        setError(error.message);  // Show generic error message for other errors
      }
    } else {
      setError('');
      // Trigger session recheck in App after login success
      onAuthSuccess();  
      navigate('/');  
    }
  };

  const redirectToSignup = () => {
    navigate('/signup');
  };

  const redirectToForgotPassword = () => {
    navigate('/forgot-password'); // Navigate to the password recovery page
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input 
          type="email" 
          placeholder="Email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required 
        />
        <button type="submit">Login</button>
        {error && <p className="error-message">{error}</p>}
      </form>

      {/* If login fails, show additional options */}
      <div className="error-options">
        <p>Don't have an account?</p>
        <button onClick={redirectToSignup}>Sign Up</button>
        <p>Forgot your password?</p>
        <button onClick={redirectToForgotPassword}>Recover Password</button>
      </div>
    </div>
  );
};

export default Login;
