import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import { FacebookIcon, FacebookShareButton, TwitterIcon, TwitterShareButton } from 'react-share';
import { supabase } from '../supabaseClient';
import './Event.css';
import Navbar from './Navbar';

const Event = () => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [highlights, setHighlights] = useState('');
  const [videos, setVideos] = useState([]);
  const [memoryWall, setMemoryWall] = useState([]);
  const [newMemory, setNewMemory] = useState('');
  const [events, setEvents] = useState([]);
  const [selectedEventDetails, setSelectedEventDetails] = useState([]);
  const [reminder, setReminder] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase.from('events').select('*');
      if (error) {
        console.error('Error fetching events:', error);
      } else {
        setEvents(data);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    const fetchVideos = async () => {
      const { data, error } = await supabase.storage.from('memories').list();
      if (error) {
        console.error('Error fetching videos:', error);
      } else {
        const videoUrls = data.map(video => `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/memories/${video.name}`);
        setVideos(videoUrls);
      }
    };
    fetchVideos();
  }, []);

  const handleMemorySubmit = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.from('memories').insert([{ content: newMemory, event_title: title }]);
    if (error) {
      console.error('Error saving memory:', error);
    } else {
      setMemoryWall([...memoryWall, newMemory]);
      setNewMemory('');
    }
  };

  const handleDateClick = (selectedDate) => {
    const eventsForDate = events.filter(event => new Date(event.event_date).toDateString() === selectedDate.toDateString());
    setSelectedEventDetails(eventsForDate);
    setDate(selectedDate);
  };

  const handleReminderSubmit = (e) => {
    e.preventDefault();
    // You can integrate email or SMS reminder APIs here
    alert(`Reminder set for: ${reminder}`);
  };

  const handleShare = () => {
    alert(`Shared event: ${title}`);
  };

  return (
    <div className="event-page-container">
      <Navbar />
      <div className="aurora-effect"></div> {/* Aurora Effect */}
      <div className="event-container">
        <h1 className="event-title">{title || 'Event Title'}</h1>
        <input
          type="text"
          placeholder="Event Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="event-input"
        />
        <Calendar
          onChange={handleDateClick}
          value={date}
          tileClassName={({ date }) => {
            const isEventDate = events.some(event => new Date(event.event_date).toDateString() === date.toDateString());
            return isEventDate ? 'event-date' : null;
          }}
        />
        <div className="reminder-section">
          <input
            type="text"
            placeholder="Set a reminder for this event"
            value={reminder}
            onChange={(e) => setReminder(e.target.value)}
            className="reminder-input"
          />
          <button onClick={handleReminderSubmit} className="reminder-button">Set Reminder</button>
        </div>
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="event-input"
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="event-textarea"
        />
        <textarea
          placeholder="Highlights"
          value={highlights}
          onChange={(e) => setHighlights(e.target.value)}
          className="event-textarea"
        />
        <button onClick={handleShare} className="share-button">Share Event</button>

        {/* Display Event Videos */}
        <div className="event-gallery">
          {videos.length > 0 && (
            <div className="video-gallery">
              <h2>Event Videos</h2>
              {videos.map((video, index) => (
                <video key={index} controls className="event-video">
                  <source src={video} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ))}
            </div>
          )}
        </div>

        {/* Display Memory Wall */}
        <div className="memory-wall">
          <h2>Memory Wall</h2>
          <form onSubmit={handleMemorySubmit} className="memory-form">
            <input
              type="text"
              placeholder="Share a memory..."
              value={newMemory}
              onChange={(e) => setNewMemory(e.target.value)}
              className="memory-input"
            />
            <button type="submit" className="memory-submit-button">Submit</button>
          </form>
          <ul>
            {memoryWall.map((memory, index) => (
              <li key={index} className="memory-item">{memory}</li>
            ))}
          </ul>
        </div>

        {/* Display Event Details for Selected Date */}
        {selectedEventDetails.length > 0 && (
          <div className="event-details">
            <h2>Events on {date.toDateString()}</h2>
            {selectedEventDetails.map((event, index) => (
              <div key={index} className="event-item">
                <h3>{event.title}</h3>
                <p>{event.description}</p>
                <p><strong>Location:</strong> {event.location}</p>
                <p><strong>Highlights:</strong> {event.highlights}</p>
              </div>
            ))}
          </div>
        )}

        {/* Social Share Section */}
        <div className="social-share">
          <h2>Share on Social Media</h2>
          <FacebookShareButton url={window.location.href} quote={`Check out this event: ${title}`} className="social-button">
            <FacebookIcon size={32} round />
          </FacebookShareButton>
          <TwitterShareButton url={window.location.href} title={`Check out this event: ${title}`} className="social-button">
            <TwitterIcon size={32} round />
          </TwitterShareButton>
        </div>
      </div>
    </div>
  );
};

export default Event;




