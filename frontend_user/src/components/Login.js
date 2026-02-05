import React, { useState, useEffect } from 'react';
import { enrolledStudentsApi, registeredStudentsApi, configApi } from '../services/api';
import './Login.css';

function Login({ onLogin, onNavigateToRegister }) {
  const [nationalId, setNationalId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(true);

  // Check registration status
  useEffect(() => {
    const checkRegistrationStatus = async () => {
      try {
        const response = await configApi.get();
        setRegistrationOpen(response.data.registration_status);
      } catch (error) {
        console.error('Error fetching config:', error);
      }
    };
    checkRegistrationStatus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate National ID
    if (!nationalId) {
      setError('يرجى إدخال الرقم القومي');
      return;
    }

    if (!/^[0-9]{14}$/.test(nationalId)) {
      setError('الرقم القومي يجب أن يتكون من 14 رقم');
      return;
    }

    setLoading(true);

    try {
      // First check if student is enrolled
      const enrolledResponse = await enrolledStudentsApi.getByNationalId(nationalId);
      const enrolledStudent = enrolledResponse.data;

      // Build student object for the app
      const student = {
        id: enrolledStudent._id,
        nationalId: enrolledStudent.national_id,
        fullName: enrolledStudent.student_name,
        college: enrolledStudent.faculty_name,
        serialNumber: enrolledStudent.sequence_number,
        registeredResearch: enrolledStudent.registered_research,
        finishedResearch: enrolledStudent.finished_research,
      };

      // Check if student has registered for research
      try {
        const registeredResponse = await registeredStudentsApi.getByNationalId(nationalId);
        const registeredStudent = registeredResponse.data;
        student.registeredId = registeredStudent._id;
        student.telephone = registeredStudent.phone_number;
        student.researchName = registeredStudent.research_name;
        student.educationalLevel = registeredStudent.educational_level;
        student.teamCode = registeredStudent.team_code;
        student.academicYear = registeredStudent.educational_level;
      } catch (regErr) {
        // Student not registered for research yet - that's OK
      }

      onLogin(student);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('الرقم القومي غير مسجل في النظام');
      } else {
        setError(err.response?.data?.error || 'حدث خطأ أثناء تسجيل الدخول');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <span className="login-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </span>
          <h2>تسجيل الدخول</h2>
          <p>أدخل الرقم القومي للدخول إلى حسابك</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="login-form-group">
            <label>الرقم القومي</label>
            <input
              type="text"
              value={nationalId}
              onChange={(e) => {
                const val = e.target.value;
                if (/^[0-9]*$/.test(val)) {
                  setNationalId(val);
                }
              }}
              placeholder="أدخل الرقم القومي (14 رقم)"
              maxLength="14"
              dir="ltr"
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-small"></span>
                جاري الدخول...
              </>
            ) : (
              'دخول'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>ليس لديك حساب؟</p>
          {registrationOpen ? (
            <button 
              type="button" 
              className="register-link"
              onClick={onNavigateToRegister}
            >
              سجل الآن
            </button>
          ) : (
            <div className="registration-closed-notice">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
              <span>التسجيل مغلق حالياً</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
