import React, { Suspense, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import { supabase } from '../supabaseClient';
import './StudentDirectory.css';

const Navbar = React.lazy(() => import('./Navbar'));
const Hero = React.lazy(() => import('./Hero'));

const PAGE_SIZE = 10; // Number of students per page

const StudentDirectory = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate(); // Initialize useNavigate hook

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    setFilteredStudents(
      students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, students]);

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from('students')
      .select('*');

    if (error) {
      console.error('Error fetching students:', error);
    } else {
      // Update profile_picture to ensure valid URLs or a default image
      const updatedData = data.map(student => ({
        ...student,
        profile_picture: student.profile_picture || '/images/default-placeholder.jpg', // Fallback image
      }));
      setStudents(updatedData);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleCardClick = (studentId) => {
    navigate(`/student/${studentId}`); // Navigate to student profile page
  };

  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const totalPages = Math.ceil(filteredStudents.length / PAGE_SIZE);

  return (
    <div className="directory-container">
      <Suspense fallback={<div>Loading Navbar...</div>}>
        <Navbar />
      </Suspense>
      
      <Suspense fallback={<div>Loading Hero...</div>}>
        <Hero />
      </Suspense>

      <h1>Student Directory</h1>
      <input
        type="text"
        className="search-input"
        placeholder="Search students..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="student-list">
        {paginatedStudents.length > 0 ? (
          paginatedStudents.map(student => (
            <div 
              className="student-card" 
              key={student.id} 
              onClick={() => handleCardClick(student.id)} // Handle card click
            >
              <img src={student.profile_picture} alt={student.name} className="student-photo" />
              <div className="student-info">
                <h2>{student.name}</h2>
                <p>{student.message}</p>
              </div>
            </div>
          ))
        ) : (
          <p>No students found.</p>
        )}
      </div>

      <div className="pagination">
        {[...Array(totalPages).keys()].map(number => (
          <button
            key={number + 1}
            className={`pagination-button ${currentPage === number + 1 ? 'active' : ''}`}
            onClick={() => handlePageChange(number + 1)}
          >
            {number + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StudentDirectory;
