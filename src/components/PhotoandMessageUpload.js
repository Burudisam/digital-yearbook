import React, { useState } from 'react';
import { supabase } from './supabaseClient';

const UploadForm = () => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);

  const handleUpload = async () => {
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('public')
      .upload(`profile-pictures/${profilePicture.name}`, profilePicture);

    if (uploadError) console.error('Error uploading file:', uploadError);

    const profileUrl = uploadData.Key;

    const { data, error } = await supabase
      .from('students')
      .insert([{ name, message, profile_picture: profileUrl }]);

    if (error) console.error('Error adding student:', error);
  };

  return (
    <div>
      <h2>Upload your Photo and Message</h2>
      <input type="text" placeholder="Your Name" onChange={e => setName(e.target.value)} />
      <input type="file" onChange={e => setProfilePicture(e.target.files[0])} />
      <textarea placeholder="Your Message" onChange={e => setMessage(e.target.value)}></textarea>
      <button onClick={handleUpload}>Submit</button>
    </div>
  );
};

export default UploadForm;
