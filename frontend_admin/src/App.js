import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Faculties from './components/Faculties';
import ResearchTopics from './components/ResearchTopics';
import EnrolledStudents from './components/EnrolledStudents';
import RegisteredStudents from './components/RegisteredStudents';
import Teams from './components/Teams';
import Home from './components/Home';

function App() {
  return (
    <Router>
      <div className="App">
        <div className="navbar">
          <h1>Tarbeya - Student Research Management</h1>
          <nav>
            <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink>
            <NavLink to="/faculties" className={({ isActive }) => isActive ? 'active' : ''}>Faculties</NavLink>
            <NavLink to="/research-topics" className={({ isActive }) => isActive ? 'active' : ''}>Research Topics</NavLink>
            <NavLink to="/enrolled-students" className={({ isActive }) => isActive ? 'active' : ''}>Enrolled Students</NavLink>
            <NavLink to="/registered-students" className={({ isActive }) => isActive ? 'active' : ''}>Registered Students</NavLink>
            <NavLink to="/teams" className={({ isActive }) => isActive ? 'active' : ''}>Teams</NavLink>
          </nav>
        </div>
        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/faculties" element={<Faculties />} />
            <Route path="/research-topics" element={<ResearchTopics />} />
            <Route path="/enrolled-students" element={<EnrolledStudents />} />
            <Route path="/registered-students" element={<RegisteredStudents />} />
            <Route path="/teams" element={<Teams />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
