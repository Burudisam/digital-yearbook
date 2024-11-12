import EmojiPicker from 'emoji-picker-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './StudentProfile.css';

const StudentProfile = () => {
  const { studentId } = useParams();
  const [student, setStudent] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [showPictureModal, setShowPictureModal] = useState(false);
  const [additionalPictures, setAdditionalPictures] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [text, setText] = useState('');
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [autobiography, setAutobiography] = useState('');
  const [editingAutobiography, setEditingAutobiography] = useState(false);
  const fileInputRef = useRef(null);
  const defaultPlaceholder = '/images/default-placeholder.jpg';

  const fetchStudent = useCallback(async () => {
    if (!studentId) return;

    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single();

    if (error) {
      console.error('Error fetching student:', error);
    } else {
      const profilePictureUrl = data.profile_picture
        ? data.profile_picture
        : defaultPlaceholder;

      setStudent({ ...data, profile_picture: profilePictureUrl });
      setAutobiography(data.autobiography || '');
    }
  }, [studentId]);

  const fetchPosts = useCallback(async () => {
    const { data, error } = await supabase
      .from('student_posts')
      .select('*')
      .eq('student_id', studentId);

    if (error) {
      console.error('Error fetching posts:', error);
    } else {
      setPosts(data);
    }
  }, [studentId]);

  const fetchLoggedInUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error fetching logged-in user:', error);
    } else {
      setLoggedInUser(data.user);
    }
  };

  useEffect(() => {
    fetchStudent();
    fetchLoggedInUser();
    fetchPosts();
  }, [fetchStudent, fetchPosts]);

  const handleProfilePictureUpload = async (event) => {
    try {
      setUploading(true);
      const file = event.target.files[0];

      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${studentId}_${Date.now()}.${fileExt}`;
      const filePath = `profile-pictures/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase
        .storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('students')
        .update({ profile_picture: publicUrl })
        .eq('id', studentId);

      if (updateError) {
        throw updateError;
      }

      fetchStudent();
      setUploading(false);
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setUploading(false);
    }
  };

  const handlePostSubmit = async () => {
    if (text.trim()) {
      const { error } = await supabase
        .from('student_posts')
        .insert([{ student_id: studentId, content: text }]);

      if (error) {
        console.error('Error posting:', error);
      } else {
        setText('');
        fetchPosts();
      }
    }
  };

  const saveAutobiography = async () => {
    const { error } = await supabase
      .from('students')
      .update({ autobiography })
      .eq('id', studentId);

    if (error) {
      console.error('Error saving autobiography:', error);
    } else {
      setEditingAutobiography(false);
    }
  };

  const deletePost = async (postId) => {
    const { error } = await supabase
      .from('student_posts')
      .delete()
      .eq('id', postId);

    if (error) {
      console.error('Error deleting post:', error);
    } else {
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
    }
  };

  const isOwner = loggedInUser && loggedInUser.id === student?.id;

  // Define handleProfilePictureClick here to ensure it's accessible in the JSX
  const handleProfilePictureClick = () => {
    if (isOwner && fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      setShowPictureModal(true);
    }
  };

  const addEmoji = (emojiObject) => {
    setText((prevText) => prevText + emojiObject.emoji);
  };

  if (!student) return <p>Loading...</p>;

  return (
    <div className="student-profile">
      <img 
        src={student.profile_picture} 
        alt={student.name} 
        className="profile-photo" 
        onClick={handleProfilePictureClick}
      />
      <h1>{student.name}</h1>
      <p>{student.message}</p>

      {isOwner && (
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleProfilePictureUpload} 
          style={{ display: 'none' }} 
          disabled={uploading} 
        />
      )}

      <div className="autobiography-section">
        <h2>Autobiography</h2>
        {isOwner ? (
          editingAutobiography ? (
            <div>
              <textarea 
                value={autobiography} 
                onChange={(e) => setAutobiography(e.target.value)}
                rows="6"
                className="autobiography-textarea"
              />
              <button onClick={saveAutobiography}>Save</button>
              <button onClick={() => setEditingAutobiography(false)}>Cancel</button>
            </div>
          ) : (
            <div>
              <p>{autobiography || "Click to add your autobiography."}</p>
              <button onClick={() => setEditingAutobiography(true)}>Edit Autobiography</button>
            </div>
          )
        ) : (
          <p>{autobiography || "No autobiography available."}</p>
        )}
      </div>

      <div className="post-section">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Post something..."
          rows="4"
        />
        <button onClick={() => setEmojiPickerOpen(!emojiPickerOpen)}>
          {emojiPickerOpen ? 'Close Emoji' : 'Emoji'}
        </button>

        {emojiPickerOpen && <EmojiPicker onEmojiClick={addEmoji} />}

        <button onClick={handlePostSubmit}>Post</button>
      </div>

      <div className="posts">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className="post">
              <p>{post.content}</p>
              {loggedInUser && loggedInUser.id === student.id && (
                <button onClick={() => deletePost(post.id)}>Delete</button>
              )}
            </div>
          ))
        ) : (
          <p>No posts yet</p>
        )}
      </div>
    </div>
  );
};

export default StudentProfile;



