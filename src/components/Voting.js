import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

const VotingSystem = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [category, setCategory] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from('students')
      .select('*');

    if (error) console.error('Error fetching students:', error);
    else setStudents(data);
  };

  const voteForStudent = async () => {
    const { data, error } = await supabase
      .from('votes')
      .insert([{ student_id: selectedStudent, category, votes_count: 1 }]);

    if (error) console.error('Error voting:', error);
  };

  return (
    <div>
      <h2>Vote for Most Likely To...</h2>
      <select onChange={e => setSelectedStudent(e.target.value)}>
        {students.map(student => (
          <option key={student.id} value={student.id}>{student.name}</option>
        ))}
      </select>
      <input type="text" placeholder="Category" onChange={e => setCategory(e.target.value)} />
      <button onClick={voteForStudent}>Vote</button>
    </div>
  );
};

export default VotingSystem;
