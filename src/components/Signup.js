import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import './Auth.css';
import { supabase } from './supabaseClient'; // Import the Supabase client

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [profilePictureSrc, setProfilePictureSrc] = useState(null);
  const [error, setError] = useState('');
  const [showWebcam, setShowWebcam] = useState(false);
  const webcamRef = useRef(null);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    // Ensure all fields are filled
    if (!name || !email || !password) {
      setError('Please fill in all the fields.');
      return;
    }

    if (!profilePictureFile) {
      setError('Please add a profile picture.');
      return;
    }

    try {
      // Step 1: Upload the profile picture to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(`${Date.now()}-${profilePictureFile.name}`, profilePictureFile);

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL of the uploaded image
      const profilePictureUrl = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(data.path).publicURL;

      // Step 2: Insert the user data into the 'students' table
      const { data: studentData, error: insertError } = await supabase
        .from('students')
        .insert([
          {
            name,
            email,
            password, // Make sure to hash/store the password securely
            profile_picture_url: profilePictureUrl,
          },
        ]);

      if (insertError) {
        throw insertError;
      }

      // If the sign-up is successful, navigate to another page (e.g., home)
      navigate('/home');
    } catch (err) {
      setError(err.message || 'Error signing up. Please try again.');
    }
  };

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setProfilePictureSrc(imageSrc);
    setProfilePictureFile(imageSrc); // Optionally set the file for uploading
    setShowWebcam(false);
  };

  return (
    <div className="auth-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSignup}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
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

        <div className="profile-selection">
          {/* File Input for Profile Picture */}
          <label className="profile-box">
            <input
              type="file"
              onChange={(e) => {
                setProfilePictureFile(e.target.files[0]);
                setProfilePictureSrc(URL.createObjectURL(e.target.files[0]));
              }}
              hidden
            />
            <span>Add Profile Image</span>
          </label>

          {/* Webcam Capture for Profile Picture */}
          <div
            className="profile-box webcam-box"
            onClick={() => setShowWebcam(!showWebcam)}
          >
            <span>Use Webcam</span>
          </div>
        </div>

        {/* Webcam display and Capture */}
        {showWebcam && (
          <>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width="100%"
              className="webcam-view"
            />
            <button type="button" onClick={capture} className="capture-button">
              Capture
            </button>
          </>
        )}

        {/* Display Profile Picture Preview */}
        {profilePictureSrc && (
          <div className="profile-picture-preview">
            <img src={profilePictureSrc} alt="Profile Preview" />
            <p>Profile Picture Preview</p>
          </div>
        )}

        {error && <p className="error-message">{error}</p>}
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default Signup;


