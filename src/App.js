import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import About from './components/About';
import Event from './components/event';
import Faculty from './components/Faculty';
import Footer from './components/Footer';
import ForgotPassword from './components/ForgotPassword';
import Login from './components/Login';
import Memories from './components/Memories';
import Signup from './components/Signup';
import StudentDirectory from './components/Studentdirectory';
import StudentProfile from './components/StudentProfile';
import SuccessPage from './components/SuccessPage';
import UploadForm from './components/UploadForm';
import VotingSystem from './components/VotingSystem';
import { supabase } from './supabaseClient';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const timeoutRef = useRef(null);

  // Log out the user and redirect to login
  const handleLogout = useCallback(async () => {
    console.log("Logging out...");
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    window.location.href = '/login';
  }, []);

  useEffect(() => {
    const INACTIVITY_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setLoading(false);
    };

    checkAuth();

    const startInactivityTimer = () => {
      timeoutRef.current = setTimeout(() => {
        handleLogout();
      }, INACTIVITY_TIMEOUT);
    };

    const resetTimer = () => {
      clearTimeout(timeoutRef.current);
      startInactivityTimer();
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);

    startInactivityTimer();

    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
      clearTimeout(timeoutRef.current);
    };
  }, [handleLogout]);

  // Recheck authentication after login
  const handleAuthSuccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <Router>
        {/* Main content container */}
        <div className="main-content">
          <Routes>
            <Route path="/login" element={!isAuthenticated ? <Login onAuthSuccess={handleAuthSuccess} /> : <Navigate to="/" />} />
            <Route path="/signup" element={!isAuthenticated ? <Signup /> : <Navigate to="/" />} />
            <Route path="/forgot-password" element={!isAuthenticated ? <ForgotPassword /> : <Navigate to="/" />} />
            {/* Authenticated routes */}
            <Route path="/" element={isAuthenticated ? <StudentDirectory /> : <Navigate to="/login" />} />
            <Route path="/student/:studentId" element={isAuthenticated ? <StudentProfile /> : <Navigate to="/login" />} />
            <Route path="/upload" element={isAuthenticated ? <UploadForm /> : <Navigate to="/login" />} />
            <Route path="/voting" element={isAuthenticated ? <VotingSystem /> : <Navigate to="/login" />} />
            <Route path="/success" element={isAuthenticated ? <SuccessPage /> : <Navigate to="/login" />} />
            <Route path="/about" element={isAuthenticated ? <About /> : <Navigate to="/login" />} />
            <Route path="/memories" element={isAuthenticated ? <Memories /> : <Navigate to="/login" />} />
            <Route path="/Event" element={isAuthenticated ? <Event /> : <Navigate to="/login" />} />
            <Route path="/faculty" element={isAuthenticated ? <Faculty /> : <Navigate to="/login" />} />
          </Routes>
        </div>
        {/* Footer */}
        <Footer />
      </Router>
    </div>
  );
}

export default App;






