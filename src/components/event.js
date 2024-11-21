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
  const [events, setEvents] = useState([]);
  const [selectedEventDetails, setSelectedEventDetails] = useState([]);
  const [countdown, setCountdown] = useState('');

  // Fetch events from Supabase
  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase.from('events').select('*');
      if (error) {
        console.error('Error fetching events:', error.message);
      } else {
        setEvents(data);
      }
    };
    fetchEvents();
  }, []);

  // Fetch videos from Supabase storage
  useEffect(() => {
    const fetchVideos = async () => {
      const { data, error } = await supabase.storage.from('memories').list();
      if (error) {
        console.error('Error fetching videos:', error.message);
      } else {
        const videoUrls = data.map(
          (video) =>
            `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/memories/${video.name}`
        );
        setVideos(videoUrls);
      }
    };
    fetchVideos();
  }, []);

  // Handle countdown timer for the next event
  useEffect(() => {
    const nextEvent = events
      .map((event) => new Date(event.event_date))
      .filter((eventDate) => eventDate > new Date())
      .sort((a, b) => a - b)[0];

    if (nextEvent) {
      const interval = setInterval(() => {
        const now = new Date();
        const timeLeft = nextEvent - now;

        if (timeLeft <= 0) {
          clearInterval(interval);
          setCountdown('Event is happening now!');
        } else {
          const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
          const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

          setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [events]);

  // Submit a new event
  const handleEventSubmit = async () => {
    if (!title || !description || !location || !highlights) {
      alert('Please fill in all event details.');
      return;
    }

    const { data, error } = await supabase.from('events').insert([
      {
        title,
        event_date: date.toISOString(),
        description,
        location,
        highlights,
      },
    ]);

    if (error) {
      console.error('Error saving event:', error.message);
      alert('Failed to save the event. Please try again.');
    } else {
      alert('Event saved successfully!');
      setEvents([...events, data[0]]); // Update the local state
      setTitle('');
      setDescription('');
      setLocation('');
      setHighlights('');
    }
  };

  // Handle date click
  const handleDateClick = (selectedDate) => {
    const eventsForDate = events.filter(
      (event) =>
        new Date(event.event_date).toDateString() === selectedDate.toDateString()
    );
    setSelectedEventDetails(eventsForDate);
    setDate(selectedDate);
  };

  // Share the event
  const handleShare = () => {
    alert(`Shared event: ${title}`);
  };

  return (
    <div className="event-page-container">
      <Navbar />
      <div className="aurora-effect"></div>
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
            const isEventDate = events.some(
              (event) =>
                new Date(event.event_date).toDateString() === date.toDateString()
            );
            return isEventDate ? 'event-date' : null;
          }}
        />
        <div className="countdown-section">
          <h2>Countdown to Next Event</h2>
          <p>{countdown || 'No upcoming events'}</p>
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
        <button onClick={handleEventSubmit} className="event-submit-button">
          Submit Event
        </button>
        <button onClick={handleShare} className="share-button">
          Share Event
        </button>

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

        {/* Display Event Details for Selected Date */}
        {selectedEventDetails.length > 0 && (
          <div className="event-details">
            <h2>Events on {date.toDateString()}</h2>
            {selectedEventDetails.map((event, index) => (
              <div key={index} className="event-item">
                <h3>{event.title}</h3>
                <p>{event.description}</p>
                <p>
                  <strong>Location:</strong> {event.location}
                </p>
                <p>
                  <strong>Highlights:</strong> {event.highlights}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Social Share Section */}
        <div className="social-share">
          <h2>Share on Social Media</h2>
          <FacebookShareButton
            url={window.location.href}
            quote={`Check out this event: ${title}`}
            className="social-button"
          >
            <FacebookIcon size={32} round />
          </FacebookShareButton>
          <TwitterShareButton
            url={window.location.href}
            title={`Check out this event: ${title}`}
            className="social-button"
          >
            <TwitterIcon size={32} round />
          </TwitterShareButton>
        </div>
      </div>
    </div>
  );
};

export default Event;







