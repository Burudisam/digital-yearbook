import React from 'react';
import './Faculty.css';

const Faculty = () => {
  const facultyMembers = [
    { id: 1, name: 'Mr. Smith', role: 'Principal', image: 'smith.jpg' },
    { id: 2, name: 'Ms. Johnson', role: 'Teacher', image: 'johnson.jpg' },
    // Add more members
  ];

  return (
    <div className="faculty">
      <h1>Faculty</h1>
      <div className="faculty-grid">
        {facultyMembers.map((member) => (
          <div key={member.id} className="faculty-card">
            <img src={`/images/${member.image}`} alt={member.name} />
            <h3>{member.name}</h3>
            <p>{member.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Faculty;
