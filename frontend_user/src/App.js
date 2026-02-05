import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import Home from './components/Home';
import StudentForm from './components/StudentForm';
import RegistrationClosed from './components/RegistrationClosed';
import { configApi } from './services/api';

function App() {
  const [currentPage, setCurrentPage] = useState('login'); // 'login', 'register', 'home'
  const [loggedInStudent, setLoggedInStudent] = useState(null);
  const [registrationOpen, setRegistrationOpen] = useState(true);

  const handleLogin = (student) => {
    setLoggedInStudent(student);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    setLoggedInStudent(null);
    setCurrentPage('login');
  };

  const handleRegistrationSuccess = () => {
    setCurrentPage('login');
  };

  const handleStudentUpdate = (updatedStudent) => {
    setLoggedInStudent(updatedStudent);
  };

  // Check registration status on mount
  useEffect(() => {
    const checkRegistrationStatus = async () => {
      try {
        const response = await configApi.get();
        setRegistrationOpen(response.data.registration_status);
      } catch (error) {
        console.error('Error fetching config:', error);
        // Default to open if config can't be fetched
        setRegistrationOpen(true);
      }
    };
    checkRegistrationStatus();
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return (
          <Login 
            onLogin={handleLogin}
            onNavigateToRegister={() => setCurrentPage('register')}
          />
        );
      case 'register':
        if (!registrationOpen) {
          return <RegistrationClosed onBackToLogin={() => setCurrentPage('login')} />;
        }
        return (
          <>
            <StudentForm onSuccess={handleRegistrationSuccess} registrationOpen={registrationOpen} />
            <div className="back-to-login">
              <button onClick={() => setCurrentPage('login')}>
                ← العودة لتسجيل الدخول
              </button>
            </div>
          </>
        );
      case 'home':
        return (
          <Home 
            student={loggedInStudent}
            onLogout={handleLogout}
            onStudentUpdate={handleStudentUpdate}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>نظام تسجيل الطلاب</h1>
          <h2>التربية العسكرية</h2>
        </div>
      </header>

      <main className="main-content">
        {renderPage()}
      </main>

      <footer className="footer">
        <p>جميع الحقوق محفوظة © {new Date().getFullYear()} - نظام التربية العسكرية</p>
      </footer>
    </div>
  );
}

export default App;
