import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './Auth.css';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Sign-up handler
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

    // Insert data into the 'students' table
    console.log("Inserting data into 'students' table");
    const { error: dbError } = await supabase
      .from('students')
      .insert([{ id: user.id, name, email, profile_picture: profilePictureUrl }]);

    if (dbError) {
      console.log("Database error:", dbError.message);
      setError(dbError.message);
      return; // Exit early if there's an error
    }

    console.log("Data inserted successfully");
    // Navigate to the login page after successful sign-up
    navigate('/login');
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
        
        <input 
          type="file" 
          onChange={(e) => setProfilePictureFile(e.target.files[0])} 
        />

        {error && <p className="error-message">{error}</p>}
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default Signup;



