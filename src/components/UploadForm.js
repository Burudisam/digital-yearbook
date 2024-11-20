import AWS from 'aws-sdk';
import { motion } from 'framer-motion';
import React, { useState } from 'react';
import Navbar from '../components/Navbar'; // Adjust the path if necessary
import { supabase } from '../supabaseClient';
import './UploadForm.css';

// AWS Rekognition setup
AWS.config.update({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  region: 'us-west-2',
});

const rekognition = new AWS.Rekognition();

const Upload = () => {
  const [event, setEvent] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 4 * 1024 * 1024) {
        alert('File is too large. Please select a file under 4MB.');
        return;
      }
      setFile(selectedFile);
      setFilePreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    if (!file || !event) {
      alert('Please provide all required details.');
      return;
    }
    setError('');
    setUploadStatus(null);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setError('You must be logged in to upload a memory.');
        return;
      }

      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('name')
        .eq('id', user.id)
        .single();

      if (studentError) {
        setError('Error fetching student information.');
        return;
      }

      const authorName = studentData?.name || 'Anonymous';
      const fileArrayBuffer = await file.arrayBuffer();

      const rekognitionParams = {
        Image: {
          Bytes: fileArrayBuffer,
        },
      };

      const rekognitionResponse = await rekognition.detectModerationLabels(rekognitionParams).promise();
      const moderationLabels = rekognitionResponse.ModerationLabels || [];
      if (moderationLabels.some((label) => label.Confidence > 75)) {
        setError('Inappropriate content detected. Upload denied.');
        return;
      }

      const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_').toLowerCase()}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('memories')
        .upload(`memories/${fileName}`, file);

      if (uploadError) {
        setError('Error uploading file to storage.');
        return;
      }

      const fileUrl = `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/memories/${uploadData.path}`;

      const { error: insertError } = await supabase
        .from('memories')
        .insert([{ event, description, image_url: fileUrl, author_name: authorName }]);

      if (insertError) {
        setError('Error saving memory to the database.');
        return;
      }

      setUploadStatus('Memory uploaded successfully!');
      setEvent('');
      setDescription('');
      setFile(null);
      setFilePreviewUrl(null);
    } catch (err) {
      console.error('Upload Error:', err);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="upload-page">
      {/* Navbar */}
      <Navbar />
      
      {/* Aurora effect background */}
      <motion.div
        className="aurora-effect"
        initial={{ backgroundPosition: '0% 50%' }}
        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
      />
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
              accept="image/*"
              onChange={handleFileChange}
              className="upload-input-file"
            />
            Upload Image
          </label>
          {filePreviewUrl && (
            <div className="file-preview-container">
              <img src={filePreviewUrl} alt="Selected Preview" className="image-preview" />
            </div>
          )}
          <button onClick={handleUpload} className="upload-button">
            Upload Memory
          </button>
          {uploadStatus && <p className="upload-status">{uploadStatus}</p>}
          {error && <p className="error-message">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default Upload;





