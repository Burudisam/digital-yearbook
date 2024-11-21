import * as faceapi from 'face-api.js'; // Face detection library
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { supabase } from '../supabaseClient';
import './Auth.css';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [scannedImage, setScannedImage] = useState(null);
  const [error, setError] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [faceData, setFaceData] = useState(null); // Store biometric data
  const [isFaceDetected, setIsFaceDetected] = useState(false); // Track if face(s) detected
  const [multipleFaces, setMultipleFaces] = useState(false); // Track multiple faces
  const [modelsLoaded, setModelsLoaded] = useState(false); // Track model loading status
  const webcamRef = useRef(null);
  const navigate = useNavigate();

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.ssdMobilenetv1.loadFromUri('/models'); // Load accurate face detection model
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models'); // For facial landmarks
        await faceapi.nets.faceRecognitionNet.loadFromUri('/models'); // For face descriptors
        setModelsLoaded(true); // Set to true once models are loaded
      } catch (err) {
        console.error("Error loading models: ", err);
        setError("Failed to load face detection models.");
      }
    };
    loadModels();
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    console.log("User sign-up process started");

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    const user = authData?.user;
    console.log("Auth data:", authData);
    
    if (authError || !user) {
      console.log("Auth error:", authError?.message);
      setError(authError?.message || 'Sign up failed');
      return;
    }

    let profilePictureUrl = '';
    let scannedImageUrl = '';

    // Upload profile picture
    if (profilePictureFile && user) {
      console.log("Uploading profile picture...");
      const fileName = `${user.id}-${profilePictureFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, profilePictureFile);
  
      if (uploadError) {
        console.log("Profile picture upload error:", uploadError.message);
        setError('Error uploading profile picture: ' + uploadError.message);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);
      
      console.log("Public URL:", publicUrlData?.publicUrl);
      profilePictureUrl = publicUrlData?.publicUrl || '';
    }

    // Upload scanned ID image
    if (scannedImage && user) {
      const scannedFileName = `${user.id}-scanned_id.jpg`;
      const response = await fetch(scannedImage);
      const blob = await response.blob();
    
      const { error: scannedUploadError } = await supabase.storage
        .from('scanned-ids') // Ensure this matches your storage bucket name
        .upload(scannedFileName, blob, {
          contentType: 'image/jpeg',
        });
    
      if (scannedUploadError) {
        setError('Error uploading scanned image: ' + scannedUploadError.message);
        return;
      }
    
      const { data: scannedPublicUrlData } = supabase.storage
        .from('scanned-ids')
        .getPublicUrl(scannedFileName);
    
      scannedImageUrl = scannedPublicUrlData?.publicUrl || '';
    }

    // Insert data into the 'students' table
    console.log("Inserting data into 'students' table");
    const { error: dbError } = await supabase
      .from('students')
      .insert([{ id: user.id, name, email, profile_picture: profilePictureUrl, scanned_id: scannedImageUrl }]);

    if (dbError) {
      console.log("Database error:", dbError.message);
      setError(dbError.message);
      return; // Exit early if there's an error
    }

    // Insert face data (biometrics) into the database after the student is created
    console.log("Face data:", faceData);
    if (faceData && user) {
      console.log("Inserting face data into 'biometrics'");
      const { error: biometricError } = await supabase
        .from('biometrics')
        .insert([{ student_id: user.id, face_descriptor: faceData }]);

      if (biometricError) {
        console.log("Biometric error:", biometricError.message);
        setError('Error storing biometric data: ' + biometricError.message);
        return;
      }
    }

    console.log("Data inserted successfully");
    // Navigate to the login page after successful sign-up
    navigate('/login');
  };

  // Function to detect face(s) in real-time
  const detectFaces = async () => {
    if (!modelsLoaded || !webcamRef.current || !(webcamRef.current.video.readyState === 4)) {
      console.log('Models are not loaded or video not ready yet!');
      return;
    }

    const video = webcamRef.current.video;

    // Ensure the video is loaded before detecting faces
    if (!video || video.readyState !== 4) {
      console.log('Video not ready for face detection');
      return;
    }

    try {
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.SsdMobilenetv1Options())
        .withFaceLandmarks()
        .withFaceDescriptors();

      console.log('Detections:', detections);

      if (detections.length === 1) {
        const faceDetection = detections[0];
        if (faceDetection && faceDetection.detection && faceDetection.detection.box) {
          setIsFaceDetected(true); // One face detected
          setMultipleFaces(false); // No multiple faces
          const faceDescriptorArray = Array.from(faceDetection.descriptor);
          setFaceData(faceDescriptorArray); // Store biometric data (face descriptor)
        } else {
          console.log('Face detection did not return a valid box');
          setIsFaceDetected(false); // No valid face detected
        }
      } else if (detections.length > 1) {
        setMultipleFaces(true); // Multiple faces detected
        setIsFaceDetected(false);
      } else {
        setIsFaceDetected(false); // No face detected
      }
    } catch (err) {
      console.error('Error during face detection:', err);
      setIsFaceDetected(false); // No face detected in case of an error
    }
  };

  // Capture scanned image once a face is detected
  const captureScannedImage = () => {
    if (isFaceDetected) {
      const imageSrc = webcamRef.current.getScreenshot();
      setScannedImage(imageSrc);
      setShowScanner(false); // Hide scanner after capturing
    }
  };

  useEffect(() => {
    let interval;
    if (showScanner && modelsLoaded) {
      interval = setInterval(detectFaces, 1000); // Run face detection every second
    }
    return () => clearInterval(interval);
  }, [showScanner, modelsLoaded]);

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
        
        <input 
          type="file" 
          onChange={(e) => setProfilePictureFile(e.target.files[0])} 
        />

        <button type="button" onClick={() => setShowScanner(true)}>
          Scan Face for ID
        </button>

        {showScanner && (
          <div className="scanner-container">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width="100%"
            />
            <div className="scanner-overlay"></div> {/* Light scanner effect */}
            {multipleFaces && <p className="error-message">Multiple faces detected. Please ensure only one face is visible.</p>}
            {isFaceDetected && <p className="success-message">Face detected! Click to capture.</p>}
            <button type="button" onClick={captureScannedImage}>
              Capture
            </button>
          </div>
        )}

        {scannedImage && (
          <div className="captured-image-container">
            <img src={scannedImage} alt="Scanned ID" />
            <p>Captured Image</p>
          </div>
        )}

        {error && <p className="error-message">{error}</p>}
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default Signup;



