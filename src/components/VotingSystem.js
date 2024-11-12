import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2'; // Import Chart.js
import { supabase } from '../supabaseClient';
import Navbar from './Navbar'; // Import Navbar component
import './VotingSystem.css';

const VotingSystem = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [category, setCategory] = useState('');
  const [voteWeight, setVoteWeight] = useState(1); // Weight for voting
  const [votesData, setVotesData] = useState(null); // Store vote data for charts

  useEffect(() => {
    fetchStudents();
    fetchVotesData(); // Fetch initial vote data
  }, []);

  const fetchStudents = async () => {
    const { data, error } = await supabase.from('students').select('*');
    if (error) console.error('Error fetching students:', error);
    else setStudents(data);
  };

  const fetchVotesData = async () => {
    const { data, error } = await supabase.from('votes').select('*');
    if (error) console.error('Error fetching votes:', error);
    else {
      const chartData = formatVotesForChart(data); // Format data for charts
      setVotesData(chartData);
    }
  };

  const formatVotesForChart = (votes) => {
    if (!votes || votes.length === 0) return null; // Safeguard against empty or undefined data

    const categoryCounts = votes.reduce((acc, vote) => {
      acc[vote.category] = acc[vote.category] ? acc[vote.category] + vote.votes_count : vote.votes_count;
      return acc;
    }, {});

    return {
      labels: Object.keys(categoryCounts),
      datasets: [
        {
          label: 'Vote Count',
          data: Object.values(categoryCounts),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  const voteForStudent = async () => {
    if (!selectedStudent || !category) {
      alert('Please select a student and enter a category.');
      return;
    }

    const { data, error } = await supabase
      .from('votes')
      .insert([{ student_id: selectedStudent, category, votes_count: voteWeight }]); // Include vote weight

    if (error) console.error('Error voting:', error);
    else {
      alert('Vote submitted successfully!');
      fetchVotesData(); // Refresh vote data after voting
    }
  };

  return (
    <div>
      <Navbar /> {/* Add the Navbar here */}
      <div className="voting-container">
        <h2 className="voting-title">Vote for Most Likely To...</h2>
        <div className="voting-form">
          <label htmlFor="student" className="voting-label">Select Student:</label>
          <select
            id="student"
            className="voting-select"
            onChange={e => setSelectedStudent(e.target.value)}
            value={selectedStudent}
          >
            <option value="">Select a student</option>
            {students.length > 0 ? students.map(student => (
              <option key={student.id} value={student.id}>{student.name}</option>
            )) : <option disabled>No students available</option>}
          </select>
          <label htmlFor="category" className="voting-label">Category:</label>
          <input
            id="category"
            type="text"
            className="voting-input"
            placeholder="Enter category"
            value={category}
            onChange={e => setCategory(e.target.value)}
          />
          <label htmlFor="weight" className="voting-label">Vote Weight:</label>
          <input
            id="weight"
            type="number"
            min="1"
            max="5"
            className="voting-input"
            value={voteWeight}
            onChange={e => setVoteWeight(parseInt(e.target.value))}
          />
          <button onClick={voteForStudent} className="vote-button">Vote</button>
        </div>
        <div className="chart-container">
          {votesData ? (
            <Bar
              data={votesData}
              options={{
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          ) : (
            <p>No voting data available yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VotingSystem;

