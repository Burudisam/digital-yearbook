import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import './Auth.css';

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
    // Signup logic here...
  };

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setProfilePictureSrc(imageSrc);
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


