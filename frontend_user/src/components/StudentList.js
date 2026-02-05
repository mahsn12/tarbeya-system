import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StudentList.css';

const API_URL = 'http://localhost:4000/api';

function StudentList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${API_URL}/students`);
      setStudents(response.data);
      setLoading(false);
    } catch (err) {
      setError('حدث خطأ في جلب البيانات');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الطالب؟')) {
      try {
        await axios.delete(`${API_URL}/students/${id}`);
        setStudents(students.filter(s => s.id !== id));
      } catch (err) {
        alert('حدث خطأ أثناء الحذف');
      }
    }
  };

  if (loading) {
    return (
      <div className="list-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="list-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="list-container">
      <div className="list-header">
        <h3>قائمة الطلاب المسجلين</h3>
        <p>إجمالي عدد الطلاب: {students.length}</p>
      </div>

      {students.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📋</span>
          <p>لا يوجد طلاب مسجلين حتى الآن</p>
        </div>
      ) : (
        <div className="students-table-wrapper">
          <table className="students-table">
            <thead>
              <tr>
                <th>#</th>
                <th>الاسم الرباعي</th>
                <th>رقم الهاتف</th>
                <th>الرقم القومي</th>
                <th>الرقم التسلسلي</th>
                <th>رقم الفصيلة</th>
                <th>الكلية</th>
                <th>السنة الدراسية</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={student.id}>
                  <td>{index + 1}</td>
                  <td className="name-cell">
                    {student.fullName}
                  </td>
                  <td dir="ltr">{student.telephone}</td>
                  <td dir="ltr">{student.nationalId}</td>
                  <td dir="ltr">{student.serialNumber}</td>
                  <td dir="ltr">{student.squadNumber || '-'}</td>
                  <td>{student.college}</td>
                  <td>{student.academicYear}</td>
                  <td>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDelete(student.id)}
                      title="حذف الطالب"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default StudentList;
