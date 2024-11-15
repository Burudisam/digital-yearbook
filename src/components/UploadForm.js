import AWS from 'aws-sdk';
import { motion } from 'framer-motion';
import React, { useState } from 'react';
import Navbar from './Navbar';
import './UploadForm.css';

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
    // Upload logic remains the same
  };

  return (
    <div className="upload-page">
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





