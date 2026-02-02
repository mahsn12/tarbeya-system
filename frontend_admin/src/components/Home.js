import React from 'react';

function Home() {
  return (
    <div className="card">
      <h2>Welcome to Tarbeya</h2>
      <p style={{ marginBottom: '20px' }}>
        Student Research Management System
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        <div className="card">
          <h3>📚 Faculties</h3>
          <p>Manage faculty information</p>
        </div>
        <div className="card">
          <h3>🔬 Research Topics</h3>
          <p>Manage research topics</p>
        </div>
        <div className="card">
          <h3>👨‍🎓 Enrolled Students</h3>
          <p>View and manage enrolled students</p>
        </div>
        <div className="card">
          <h3>📝 Registered Students</h3>
          <p>Manage student registrations</p>
        </div>
        <div className="card">
          <h3>👥 Teams</h3>
          <p>Manage research teams</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
