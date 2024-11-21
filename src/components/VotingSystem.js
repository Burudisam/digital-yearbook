import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { supabase } from '../supabaseClient';
import Navbar from './Navbar';
import './VotingSystem.css';

const VotingSystem = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [category, setCategory] = useState('');
  const [voteWeight, setVoteWeight] = useState(1);
  const [votesData, setVotesData] = useState(null);

  // Fetch students and votes on component mount
  useEffect(() => {
    fetchStudents();
    fetchVotesData();
  }, []);

  // Fetch students from 'students' table
  const fetchStudents = async () => {
    const { data, error } = await supabase.from('students').select('*');
    if (error) {
      console.error('Error fetching students:', error.message);
      alert('Failed to load students. Please try again later.');
    } else {
      console.log('Students fetched:', data);
      setStudents(data);
    }
  };

  // Fetch votes and format data for chart
  const fetchVotesData = async () => {
    const { data, error } = await supabase.from('votes').select('*');
    if (error) {
      console.error('Error fetching votes:', error.message);
    } else {
      const chartData = formatVotesForChart(data);
      setVotesData(chartData);
    }
  };

  // Format votes data for chart display
  const formatVotesForChart = (votes) => {
    if (!votes || votes.length === 0) return null;
    const categoryCounts = votes.reduce((acc, vote) => {
      acc[vote.category] = acc[vote.category]
        ? acc[vote.category] + vote.votes_count
        : vote.votes_count;
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

  // Submit vote to 'votes' table
  const voteForStudent = async () => {
    if (!selectedStudent || !category) {
      alert('Please select a student and enter a category.');
      return;
    }

    try {
      console.log('Submitting vote:', { selectedStudent, category, voteWeight });

      const { data, error } = await supabase.from('votes').insert([
        {
          student_id: selectedStudent,
          category: category.trim(),
          votes_count: voteWeight,
        },
      ]);

      if (error) {
        console.error('Error voting:', error.message);
        alert(`Error voting: ${error.message}`);
      } else {
        alert('Vote submitted successfully!');
        console.log('Vote inserted:', data);
        fetchVotesData(); // Refresh chart data
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('Unexpected error occurred while voting. Please try again.');
    }
  };

  return (
    <div>
      <Navbar />
      {/* Aurora Effect Background */}
      <motion.div
        className="aurora-effect"
        initial={{ backgroundPosition: '0% 50%' }}
        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
      />
      <div className="voting-container">
        <h2 className="voting-title">Vote for Most Likely To...</h2>
        <div className="voting-form">
          <label htmlFor="student" className="voting-label">
            Select Student:
          </label>
          <select
            id="student"
            className="voting-select"
            onChange={(e) => setSelectedStudent(e.target.value)}
            value={selectedStudent}
          >
            <option value="">Select a student</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </select>

          <label htmlFor="category" className="voting-label">
            Category:
          </label>
          <input
            id="category"
            type="text"
            className="voting-input"
            placeholder="Enter category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

          <label htmlFor="weight" className="voting-label">
            Vote Weight:
          </label>
          <input
            id="weight"
            type="number"
            min="1"
            max="5"
            className="voting-input"
            value={voteWeight}
            onChange={(e) => setVoteWeight(parseInt(e.target.value))}
          />

          <button onClick={voteForStudent} className="vote-button">
            Vote
          </button>
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


