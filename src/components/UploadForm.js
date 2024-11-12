import AWS from 'aws-sdk'; // Import AWS SDK
import React, { useState } from 'react';
import { supabase } from '../supabaseClient'; // Import Supabase client
import Navbar from './Navbar'; // Import Navbar component
import './UploadForm.css';

// Initialize AWS Rekognition with credentials
AWS.config.update({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  region: 'us-west-2', // Replace with your preferred AWS region
});

const rekognition = new AWS.Rekognition();

const Upload = () => {
  const [event, setEvent] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null); // To preview the image or video
  const [uploadStatus, setUploadStatus] = useState(null); // To track upload progress/status

  // Function to check for illicit content using AWS Rekognition
  const checkImageContent = async (base64Image) => {
    try {
      const byteArray = new Uint8Array(atob(base64Image).split('').map(char => char.charCodeAt(0)));

      const params = {
        Image: { Bytes: byteArray },
        MinConfidence: 75,
      };

      const response = await rekognition.detectModerationLabels(params).promise();
      const unsafeLabels = response.ModerationLabels.some(label =>
        ['Explicit Nudity', 'Violence', 'Hate Symbols', 'Racy'].includes(label.Name) && label.Confidence >= 75
      );

      return !unsafeLabels;
    } catch (error) {
      console.error('Error checking image content with Rekognition:', error);
      return false;
    }
  };

  // Convert file to base64
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]); // Get base64 part only
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle file change and preview
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 4 * 1024 * 1024) { // 4MB size limit
        alert('File is too large. Please select a file under 4MB.');
        return;
      }
      setFile(selectedFile);
      setFilePreviewUrl(URL.createObjectURL(selectedFile)); // Set preview URL
    }
  };

  // Handle upload
  const handleUpload = async () => {
    if (!event || !file) {
      alert('Please provide all the details.');
      return;
    }

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('You must be logged in to upload a memory.');

      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('name')
        .eq('id', user.id)
        .single();

      if (studentError) throw new Error('Error fetching student profile.');

      const author_name = studentData?.name || 'Anonymous';

      // Check if the file is an image or video
      if (file.type.startsWith('image/')) {
        const base64Image = await convertFileToBase64(file);

        const isSafe = await checkImageContent(base64Image);
        if (!isSafe) throw new Error('The selected image contains inappropriate content and cannot be uploaded.');
      }

      const fileName = `${Date.now()}_${file.name}`;
      const { data, error: uploadError } = await supabase.storage
        .from('memories')
        .upload(fileName, file);

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      const fileUrl = `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/memories/${data.path}`;
      const { error: insertError } = await supabase
        .from('memories')
        .insert([{ event, description, image_url: fileUrl, author_name }]);

      if (insertError) throw new Error('Failed to save memory.');

      setUploadStatus('Memory uploaded successfully!');
      setEvent('');
      setDescription('');
      setFile(null);
      setFilePreviewUrl(null);
    } catch (error) {
      setUploadStatus(error.message);
      console.error(error);
    }
  };

  return (
    <div>
      <Navbar /> {/* Add the Navbar at the top */}
      <div className="upload-container">
        <h1 className="upload-title">Share a Memory</h1>
        <div className="upload-form">
          <input
            type="text"
            placeholder="Event Name"
            value={event}
            onChange={(e) => setEvent(e.target.value)}
            className="upload-input"
          />
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="upload-textarea"
          />
          <label className="upload-file-label">
            <input
              type="file"
              accept="image/*, video/*"
              onChange={handleFileChange}
              className="upload-input-file"
            />
            Upload Image or Video
          </label>
          {filePreviewUrl && (
            <div className="file-preview-container">
              {file.type.startsWith('image/') ? (
                <img src={filePreviewUrl} alt="Selected Preview" className="image-preview" />
              ) : (
                <video controls src={filePreviewUrl} className="video-preview" />
              )}
            </div>
          )}
          <button onClick={handleUpload} className="upload-button">
            Upload Memory
          </button>
          {uploadStatus && <p className="upload-status">{uploadStatus}</p>}
        </div>
      </div>
    </div>
  );
};

export default Upload;







