import React from 'react';
import './SuccessPage.css'; // Optional: add styling for the success page

const SuccessPage = () => {
  return (
    <div className="success-page-container">
      <video autoPlay loop muted className="background-video">
        <source src="/SUCCESS.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="content">
        <h1>Upload Successful!</h1>
        <p>Your photo and message have been successfully uploaded.</p>
      </div>
    </div>
  );
};

export default SuccessPage;
