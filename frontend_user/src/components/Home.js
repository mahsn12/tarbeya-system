import React, { useState, useEffect } from 'react';
import { registeredStudentsApi, enrolledStudentsApi, configApi, teamsApi } from '../services/api';
import './Home.css';
import Teams from './Teams';

function Home({ student, onLogout, onStudentUpdate }) {
  const [activeModal, setActiveModal] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [automaticAssignment, setAutomaticAssignment] = useState(false);

  // Fetch config to check automatic assignment
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const configRes = await configApi.get();
        setAutomaticAssignment(configRes.data.automatic_assignment || false);
      } catch (err) {
        console.error('Error fetching config:', err);
      }
    };
    fetchConfig();
  }, []);

  const handleDeleteAccount = async () => {
    if (!window.confirm('هل أنت متأكد من حذف حسابك؟ لا يمكن التراجع عن هذا الإجراء.')) {
      const handleOpenSearchInquiry = () => {
        setActiveModal('searchInquiry');
      };

      return;
    }
          <button onClick={handleOpenSearchInquiry}>استعلام عن البحث</button>

    setLoading(true);
    try {
      // Delete from registered students if exists
      if (student.registeredId) {
        await registeredStudentsApi.delete(student.registeredId);
      }
      
      // Update enrolled student to mark as not registered
      if (student.id) {
        await enrolledStudentsApi.update(student.id, {
          registered_research: false
        });
      }
      
      alert('تم حذف التسجيل بنجاح');
      onLogout();
    } catch (err) {
      setMessage({ type: 'error', text: 'حدث خطأ أثناء حذف الحساب' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      // Fetch latest data
      const enrolledRes = await enrolledStudentsApi.getByNationalId(student.nationalId);
      const enrolledData = enrolledRes.data;
      
      const result = {
        fullName: enrolledData.student_name,
        nationalId: enrolledData.national_id,
        serialNumber: enrolledData.sequence_number,
        college: enrolledData.faculty_name,
        registeredResearch: enrolledData.registered_research,
        finishedResearch: enrolledData.finished_research
      };

      // Try to get registered data
      try {
        const registeredRes = await registeredStudentsApi.getByNationalId(student.nationalId);
        const registeredData = registeredRes.data;
        result.telephone = registeredData.phone_number;
        result.researchName = registeredData.research_name;
        result.academicYear = registeredData.educational_level;
        result.teamCode = registeredData.team_code;
        // If team code exists, try to fetch team details
        if (registeredData.team_code && registeredData.team_code !== 'UNASSIGNED') {
          try {
            const teamRes = await teamsApi.getByCode(registeredData.team_code);
            const team = teamRes.data;
            result.teamMembers = team.student_names || team.national_ids || [];
            result.teamResearch = (team.research_topics || []).join(', ');
          } catch (teamErr) {
            // ignore team lookup errors
          }
        }
      } catch (regErr) {
        // Not registered for research — try to find a team that includes this student
        try {
          const teamRes = await teamsApi.getByMember(student.nationalId);
          const team = teamRes.data;
          if (team) {
            result.teamCode = team.team_code;
            result.teamMembers = team.student_names && team.student_names.length ? team.student_names : (team.national_ids || []).map(String);
            result.teamResearch = (team.research_topics || []).join(', ');
          }
        } catch (teamErr) {
          // ignore if no team found or error
        }
      }

      setSearchResult(result);
      setActiveModal('search');
    } catch (err) {
      setMessage({ type: 'error', text: 'حدث خطأ أثناء البحث' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
      <div className="welcome-section">
        <span className="welcome-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
            <path d="M2 17l10 5 10-5M2 12l10 5 10-5"></path>
          </svg>
        </span>
        <h2>مرحباً، {student.fullName}</h2>
        <p>اختر أحد الخيارات التالية</p>
      </div>

      {message.text && (
        <div className={`home-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="options-grid">
        <button 
          className="option-card"
          onClick={() => setActiveModal('edit')}
        >
          <span className="option-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </span>
          <h3>تعديل الحساب</h3>
          <p>تعديل بياناتك الشخصية</p>
        </button>

        <button 
          className="option-card delete"
          onClick={handleDeleteAccount}
          disabled={loading}
        >
          <span className="option-icon">
            {loading ? (
              <div className="spinner-icon"></div>
            ) : (
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            )}
          </span>
          <h3>حذف الحساب</h3>
          <p>حذف حسابك نهائياً</p>
        </button>

        <button 
          className="option-card"
          onClick={handleSearch}
          disabled={loading}
        >
          <span className="option-icon">
            {loading ? (
              <div className="spinner-icon"></div>
            ) : (
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            )}
          </span>
          <h3>استعلام عن البحث</h3>
          <p>عرض بياناتك المسجلة</p>
        </button>

        <button 
          className={`option-card ${automaticAssignment ? 'disabled-card' : ''}`}
          onClick={() => !automaticAssignment && setActiveModal('teams')}
          disabled={automaticAssignment}
        >
          <span className="option-icon">
            {automaticAssignment ? (
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            ) : (
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            )}
          </span>
          <h3>تسجيل فريق</h3>
          <p>{automaticAssignment ? 'التوزيع التلقائي مفعّل' : 'تسجيل فريق الطلاب'}</p>
          {automaticAssignment && (
            <span className="closed-badge">مغلق</span>
          )}
        </button>
      </div>

      <button className="logout-btn" onClick={onLogout}>
        تسجيل الخروج
      </button>

      {/* Edit Modal */}
      {activeModal === 'edit' && (
        <EditModal 
          student={student} 
          onClose={() => setActiveModal(null)}
          onUpdate={(updatedStudent) => {
            onStudentUpdate(updatedStudent);
            setActiveModal(null);
            setMessage({ type: 'success', text: 'تم تحديث البيانات بنجاح' });
          }}
        />
      )}

      {/* Search Result Modal */}
      {activeModal === 'search' && searchResult && (
        <SearchModal 
          student={searchResult}
          onClose={() => {
            setActiveModal(null);
            setSearchResult(null);
          }}
        />
      )}

      {/* Teams Modal */}
      {activeModal === 'teams' && (
        <Teams 
          student={student}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
}

function EditModal({ student, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    fullName: student.fullName || '',
    telephone: student.telephone || '',
    serialNumber: student.serialNumber || '',
    squadNumber: student.squadNumber || '',
    college: student.college || '',
    academicYear: student.academicYear || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const colleges = [
    'كلية الهندسة', 'كلية الطب', 'كلية الصيدلة', 'كلية طب الأسنان',
    'كلية العلوم', 'كلية الآداب', 'كلية الحقوق', 'كلية التجارة',
    'كلية الزراعة', 'كلية التربية', 'كلية الحاسبات والمعلومات',
    'كلية التربية النوعية', 'كلية التمريض', 'كلية الفنون الجميلة',
    'كلية الإعلام', 'كلية الاقتصاد والعلوم السياسية', 'كلية الألسن',
    'كلية السياحة والفنادق', 'كلية التربية الرياضية', 'كلية العلاج الطبيعي'
  ];

  const academicYears = [
    'الفرقة الأولى', 'الفرقة الثانية', 'الفرقة الثالثة',
    'الفرقة الرابعة', 'الفرقة الخامسة', 'الفرقة السادسة'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Update enrolled student
      await enrolledStudentsApi.update(student.id, {
        student_name: formData.fullName,
        faculty_name: formData.college,
        sequence_number: parseInt(formData.serialNumber)
      });

      // Update registered student if exists
      if (student.registeredId) {
        await registeredStudentsApi.update(student.registeredId, {
          student_name: formData.fullName,
          phone_number: formData.telephone,
          faculty_name: formData.college,
          educational_level: formData.academicYear,
          sequence_number: parseInt(formData.serialNumber)
        });
      }

      // Return updated student object
      const updatedStudent = {
        ...student,
        fullName: formData.fullName,
        telephone: formData.telephone,
        serialNumber: formData.serialNumber,
        squadNumber: formData.squadNumber,
        college: formData.college,
        academicYear: formData.academicYear
      };
      onUpdate(updatedStudent);
    } catch (err) {
      setError(err.response?.data?.error || 'حدث خطأ أثناء التحديث');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>تعديل الحساب</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {error && <div className="modal-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="modal-form-group">
            <label>الاسم الرباعي</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={e => setFormData({...formData, fullName: e.target.value})}
              dir="rtl"
            />
          </div>

          <div className="modal-form-group">
            <label>رقم الهاتف</label>
            <input
              type="text"
              value={formData.telephone}
              onChange={e => setFormData({...formData, telephone: e.target.value})}
              dir="ltr"
              maxLength="11"
            />
          </div>

          <div className="modal-form-group">
            <label>الرقم التسلسلي</label>
            <input
              type="text"
              value={formData.serialNumber}
              onChange={e => setFormData({...formData, serialNumber: e.target.value})}
              dir="ltr"
            />
          </div>

          <div className="modal-form-group">
            <label>رقم الفصيلة (اختياري)</label>
            <input
              type="text"
              value={formData.squadNumber}
              onChange={e => setFormData({...formData, squadNumber: e.target.value})}
              dir="ltr"
            />
          </div>

          <div className="modal-form-group">
            <label>الكلية</label>
            <select
              value={formData.college}
              onChange={e => setFormData({...formData, college: e.target.value})}
            >
              {colleges.map((college, i) => (
                <option key={i} value={college}>{college}</option>
              ))}
            </select>
          </div>

          <div className="modal-form-group">
            <label>السنة الدراسية</label>
            <select
              value={formData.academicYear}
              onChange={e => setFormData({...formData, academicYear: e.target.value})}
            >
              {academicYears.map((year, i) => (
                <option key={i} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div className="modal-actions">
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  جاري الحفظ...
                </>
              ) : (
                'حفظ التغييرات'
              )}
            </button>
            <button type="button" className="cancel-btn" onClick={onClose} disabled={loading}>
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SearchModal({ student, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>بيانات الطالب</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="student-info">
          <div className="info-row">
            <span className="info-label">الاسم الرباعي:</span>
            <span className="info-value">{student.fullName}</span>
          </div>
          {student.telephone && (
            <div className="info-row">
              <span className="info-label">رقم الهاتف:</span>
              <span className="info-value" dir="ltr">{student.telephone}</span>
            </div>
          )}
          <div className="info-row">
            <span className="info-label">الرقم القومي:</span>
            <span className="info-value" dir="ltr">{student.nationalId}</span>
          </div>
          <div className="info-row">
            <span className="info-label">الرقم التسلسلي:</span>
            <span className="info-value" dir="ltr">{student.serialNumber}</span>
          </div>
          <div className="info-row">
            <span className="info-label">الكلية:</span>
            <span className="info-value">{student.college}</span>
          </div>
          {student.academicYear && (
            <div className="info-row">
              <span className="info-label">السنة الدراسية:</span>
              <span className="info-value">{student.academicYear}</span>
            </div>
          )}
          {student.researchName && (
            <div className="info-row">
              <span className="info-label">اسم البحث:</span>
              <span className="info-value">{student.researchName}</span>
            </div>
          )}
          {student.teamCode && student.teamCode !== 'UNASSIGNED' && (
            <div className="info-row">
              <span className="info-label">كود الفريق:</span>
              <span className="info-value" dir="ltr">{student.teamCode}</span>
            </div>
          )}
          {student.teamMembers && student.teamMembers.length > 0 && (
            <div className="info-row">
              <span className="info-label">أعضاء الفريق:</span>
              <span className="info-value">{student.teamMembers.join('، ')}</span>
            </div>
          )}
          {student.teamResearch && (
            <div className="info-row">
              <span className="info-label">موضوعات البحث (الفريق):</span>
              <span className="info-value">{student.teamResearch}</span>
            </div>
          )}
          <div className="info-row">
            <span className="info-label">حالة التسجيل في البحث:</span>
            <span className="info-value">
              {student.registeredResearch ? '✅ مسجل' : '❌ غير مسجل'}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">حالة البحث:</span>
            <span className="info-value">
              {student.finishedResearch ? '✅ مكتمل' : '⏳ قيد التنفيذ'}
            </span>
          </div>
        </div>

        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose}>إغلاق</button>
        </div>
      </div>
    </div>
  );
}

export default Home;
