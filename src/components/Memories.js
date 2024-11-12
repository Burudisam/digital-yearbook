import React, { useEffect, useState } from 'react';
import { EffectCoverflow, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css'; // Import Swiper styles
import { supabase } from '../supabaseClient';
import './Memories.css';
import Navbar from './Navbar'; // Import Navbar component

const Memories = () => {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch memories data from the database
  const fetchMemories = async () => {
    const { data, error } = await supabase
      .from('memories')
      .select('event, description, image_url, author_name')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching memories:', error);
    } else {
      setMemories(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  return (
    <div>
      <Navbar /> {/* Add the fixed Navbar here */}
      <div className="memories-page">
        <h1 className="memories-title">Memories</h1>
        {loading ? (
          <p>Loading memories...</p>
        ) : (
          <Swiper
            effect="coverflow"
            grabCursor={true}
            centeredSlides={true}
            slidesPerView="auto"
            coverflowEffect={{
              rotate: 50, // Rotate effect
              stretch: 0, // Space between slides
              depth: 100, // Depth offset
              modifier: 1, // Effect multiplier
              slideShadows: true, // Enable slide shadows
            }}
            pagination={{
              clickable: true,
            }}
            modules={[EffectCoverflow, Pagination]} // Include necessary modules
            className="mySwiper" // Custom class for styling
          >
            {memories.map((memory, index) => (
              <SwiperSlide key={index} className="memory-card">
                <img src={memory.image_url} alt={memory.event} className="memory-image" />
                <div className="memory-details">
                  <h2 className="memory-event">{memory.event}</h2>
                  <p className="memory-description">{memory.description}</p>
                  <p className="memory-author">Posted by: {memory.author_name || 'Anonymous'}</p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </div>
  );
};

export default Memories;



