import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

const StudentDirectory = () => {
  const [students, setStudents] = useState([]);

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

  return (
    <div>
      <h1>Student Directory</h1>
      <ul>
        {students.map(student => (
          <li key={student.id}>
            <img src={student.profile_picture} alt={student.name} />
            <p>{student.name}</p>
            <p>{student.message}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StudentDirectory;
