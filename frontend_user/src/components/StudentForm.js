import React, { useState, useEffect } from 'react';
import { 
  enrolledStudentsApi, 
  registeredStudentsApi, 
  facultiesApi, 
  researchTopicsApi,
  configApi 
} from '../services/api';
import { teamsApi } from '../services/api';
import './StudentForm.css';

const academicYears = [
  'الفرقة الأولى',
  'الفرقة الثانية',
  'الفرقة الثالثة',
  'الفرقة الرابعة',
  'الفرقة الخامسة',
  'الفرقة السادسة'
];

function StudentForm({ onSuccess, registrationOpen = true }) {
  const [colleges, setColleges] = useState([]);
  const [researchTopics, setResearchTopics] = useState([]);
  const [formData, setFormData] = useState({
    fullName: '',
    telephone: '',
    nationalId: '',
    serialNumber: '',
    squadNumber: '',
    college: '',
    academicYear: '',
    researchTopic: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch faculties, research topics, and config on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch faculties
        const facultiesRes = await facultiesApi.getAll();
        setColleges(facultiesRes.data.map(f => f.faculty_name));

        // Fetch research topics
        const topicsRes = await researchTopicsApi.getAll();
        setResearchTopics(topicsRes.data.map(t => t.topic_name));
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, []);

  // Validation rules
  const arabicRegex = /^[\u0600-\u06FF\s]+$/;
  const englishNumbersRegex = /^[0-9]+$/;
  const phoneRegex = /^01[0-9]{9}$/;
  const nationalIdRegex = /^[0-9]{14}$/;

  // Real-time validation function
  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'fullName':
        if (!value.trim()) {
          error = 'الاسم الرباعي مطلوب';
        } else if (!arabicRegex.test(value)) {
          error = 'يجب إدخال الاسم باللغة العربية فقط';
        } else {
          const nameParts = value.trim().split(/\s+/);
          if (nameParts.length < 4) {
            error = 'يجب إدخال الاسم الرباعي كاملاً (4 أسماء على الأقل)';
          }
        }
        break;

      case 'telephone':
        if (!value) {
          error = 'رقم الهاتف مطلوب';
        } else if (!englishNumbersRegex.test(value)) {
          error = 'يجب إدخال أرقام إنجليزية فقط';
        } else if (!phoneRegex.test(value)) {
          error = 'رقم الهاتف يجب أن يبدأ بـ 01 ويتكون من 11 رقم';
        }
        break;

      case 'nationalId':
        if (!value) {
          error = 'الرقم القومي مطلوب';
        } else if (!englishNumbersRegex.test(value)) {
          error = 'يجب إدخال أرقام إنجليزية فقط';
        } else if (!nationalIdRegex.test(value)) {
          error = 'الرقم القومي يجب أن يتكون من 14 رقم';
        } else if (!value.startsWith('2') && !value.startsWith('3')) {
          error = 'الرقم القومي يجب أن يبدأ بـ 2 أو 3';
        }
        break;

      case 'serialNumber':
        if (!value) {
          error = 'الرقم التسلسلي مطلوب';
        } else if (!englishNumbersRegex.test(value)) {
          error = 'يجب إدخال أرقام إنجليزية فقط';
        }
        break;

      case 'squadNumber':
        if (value && !englishNumbersRegex.test(value)) {
          error = 'يجب إدخال أرقام إنجليزية فقط';
        }
        break;

      case 'college':
        if (!value) {
          error = 'يجب اختيار الكلية';
        }
        break;

      case 'academicYear':
        if (!value) {
          error = 'يجب اختيار السنة الدراسية';
        }
        break;

      default:
        break;
    }

    return error;
  };

  // Handle input change with real-time validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For Arabic name field, only allow Arabic characters and spaces
    if (name === 'fullName') {
      if (value && !arabicRegex.test(value) && value !== '') {
        return; // Prevent non-Arabic input
      }
    }
    
    // For number fields, only allow English digits
    if (['telephone', 'nationalId', 'serialNumber', 'squadNumber'].includes(name)) {
      if (value && !englishNumbersRegex.test(value) && value !== '') {
        return; // Prevent non-numeric input
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate on change if field was touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  // Handle field blur
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  // Validate entire form
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched({
      fullName: true,
      telephone: true,
      nationalId: true,
      serialNumber: true,
      squadNumber: true,
      college: true,
      academicYear: true
    });

    return isValid;
  };

  // Get field class based on validation state
  const getFieldClass = (fieldName) => {
    if (!touched[fieldName]) return '';
    return errors[fieldName] ? 'invalid' : 'valid';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!registrationOpen) {
      setMessage({ type: 'error', text: 'التسجيل مغلق حالياً' });
      return;
    }

    if (!validateForm()) {
      setMessage({ type: 'error', text: 'يرجى تصحيح الأخطاء في النموذج' });
      return;
    }

    setLoading(true);

    try {
      // First verify student is enrolled
      let enrolledStudent;
      try {
        const enrolledRes = await enrolledStudentsApi.getByNationalId(formData.nationalId);
        enrolledStudent = enrolledRes.data;
      } catch (err) {
        if (err.response?.status === 404) {
          setMessage({ type: 'error', text: 'الرقم القومي غير مسجل في قوائم الطلاب المقيدين' });
          setLoading(false);
          return;
        }
        throw err;
      }

      // Check if already registered for research
      try {
        await registeredStudentsApi.getByNationalId(formData.nationalId);
        setMessage({ type: 'error', text: 'هذا الطالب مسجل بالفعل في نظام البحث' });
        setLoading(false);
        return;
      } catch (err) {
        // 404 means not registered yet - that's what we want
        if (err.response?.status !== 404) {
          throw err;
        }
      }

      // Register the student for research
      const registrationData = {
        national_id: parseInt(formData.nationalId),
        sequence_number: parseInt(formData.serialNumber),
        student_name: formData.fullName,
        phone_number: formData.telephone,
        faculty_name: formData.college,
        research_name: formData.researchTopic || 'غير محدد',
        educational_level: formData.academicYear,
        team_code: formData.squadNumber || 'UNASSIGNED'
      };

      await registeredStudentsApi.create(registrationData);

      // If the provided team code corresponds to an existing team, update other members' registered records
      if (registrationData.team_code && registrationData.team_code !== 'UNASSIGNED') {
        try {
          const teamRes = await teamsApi.getByCode(registrationData.team_code);
          const team = teamRes.data;
          const otherNids = (team.national_ids || team.student_names || []).filter(n => String(n) !== String(registrationData.national_id));
          for (const nid of otherNids) {
            try {
              const regRes = await registeredStudentsApi.getByNationalId(nid);
              const reg = regRes.data;
              await registeredStudentsApi.update(reg._id, { team_code: registrationData.team_code });
            } catch (err) {
              if (err.response?.status && err.response.status !== 404) {
                console.error('Error updating teammate after registration', err);
              }
            }
          }
        } catch (err) {
          // team not found or error — ignore
        }
      }
      // Update enrolled student to mark as registered
      await enrolledStudentsApi.update(enrolledStudent._id, {
        registered_research: true
      });

      setMessage({ type: 'success', text: 'تم التسجيل بنجاح! يمكنك الآن تسجيل الدخول.' });
      setFormData({
        fullName: '',
        telephone: '',
        nationalId: '',
        serialNumber: '',
        squadNumber: '',
        college: '',
        academicYear: '',
        researchTopic: ''
      });
      setErrors({});
      setTouched({});
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'حدث خطأ أثناء التسجيل' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      fullName: '',
      telephone: '',
      nationalId: '',
      serialNumber: '',
      squadNumber: '',
      college: '',
      academicYear: '',
      researchTopic: ''
    });
    setErrors({});
    setTouched({});
    setMessage({ type: '', text: '' });
  };

  return (
    <div className="form-container">
      {!registrationOpen && (
        <div className="message error">
          التسجيل مغلق حالياً. يرجى المحاولة لاحقاً.
        </div>
      )}
      <div className="form-header">
        <h3>استمارة تسجيل الطلاب</h3>
        <p>يرجى ملء جميع البيانات المطلوبة</p>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h4>الاسم الرباعي (باللغة العربية)</h4>
          <div className="form-group full-width">
            <label>الاسم الرباعي *</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="أدخل الاسم الرباعي باللغة العربية"
              className={getFieldClass('fullName')}
              dir="rtl"
            />
            {touched.fullName && errors.fullName && (
              <span className="error-text">{errors.fullName}</span>
            )}
            {touched.fullName && !errors.fullName && formData.fullName && (
              <span className="success-text">✓ صحيح</span>
            )}
            <span className="hint-text">أدخل الاسم الأول واسم الأب واسم الجد واسم العائلة</span>
          </div>
        </div>

        <div className="form-section">
          <h4>بيانات الهوية (بالأرقام الإنجليزية)</h4>
          <div className="identity-grid">
            <div className="form-group">
              <label>رقم الهاتف *</label>
              <input
                type="text"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="01XXXXXXXXX"
                className={getFieldClass('telephone')}
                dir="ltr"
                maxLength="11"
              />
              {touched.telephone && errors.telephone && (
                <span className="error-text">{errors.telephone}</span>
              )}
              {touched.telephone && !errors.telephone && formData.telephone && (
                <span className="success-text">✓ صحيح</span>
              )}
              <span className="hint-text">مثال: 01012345678</span>
            </div>
            <div className="form-group">
              <label>الرقم القومي *</label>
              <input
                type="text"
                name="nationalId"
                value={formData.nationalId}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="XXXXXXXXXXXXXX"
                className={getFieldClass('nationalId')}
                dir="ltr"
                maxLength="14"
              />
              {touched.nationalId && errors.nationalId && (
                <span className="error-text">{errors.nationalId}</span>
              )}
              {touched.nationalId && !errors.nationalId && formData.nationalId && (
                <span className="success-text">✓ صحيح</span>
              )}
              <span className="hint-text">14 رقم من البطاقة الشخصية</span>
            </div>
            <div className="form-group">
              <label>الرقم التسلسلي *</label>
              <input
                type="text"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="أدخل الرقم التسلسلي"
                className={getFieldClass('serialNumber')}
                dir="ltr"
              />
              {touched.serialNumber && errors.serialNumber && (
                <span className="error-text">{errors.serialNumber}</span>
              )}
              {touched.serialNumber && !errors.serialNumber && formData.serialNumber && (
                <span className="success-text">✓ صحيح</span>
              )}
            </div>
            <div className="form-group">
              <label>رقم الفصيلة (للذكور - اختياري)</label>
              <input
                type="text"
                name="squadNumber"
                value={formData.squadNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="أدخل رقم الفصيلة"
                className={getFieldClass('squadNumber')}
                dir="ltr"
              />
              {touched.squadNumber && errors.squadNumber && (
                <span className="error-text">{errors.squadNumber}</span>
              )}
              {touched.squadNumber && !errors.squadNumber && formData.squadNumber && (
                <span className="success-text">✓ صحيح</span>
              )}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h4>البيانات الأكاديمية</h4>
          <div className="academic-grid">
            <div className="form-group">
              <label>الكلية *</label>
              <select
                name="college"
                value={formData.college}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClass('college')}
              >
                <option value="">-- اختر الكلية --</option>
                {colleges.map((college, index) => (
                  <option key={index} value={college}>
                    {college}
                  </option>
                ))}
              </select>
              {touched.college && errors.college && (
                <span className="error-text">{errors.college}</span>
              )}
              {touched.college && !errors.college && formData.college && (
                <span className="success-text">✓ تم الاختيار</span>
              )}
            </div>
            <div className="form-group">
              <label>السنة الدراسية *</label>
              <select
                name="academicYear"
                value={formData.academicYear}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClass('academicYear')}
              >
                <option value="">-- اختر السنة الدراسية --</option>
                {academicYears.map((year, index) => (
                  <option key={index} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              {touched.academicYear && errors.academicYear && (
                <span className="error-text">{errors.academicYear}</span>
              )}
              {touched.academicYear && !errors.academicYear && formData.academicYear && (
                <span className="success-text">✓ تم الاختيار</span>
              )}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-small"></span>
                جاري التسجيل...
              </>
            ) : (
              'تسجيل الطالب'
            )}
          </button>
          <button 
            type="button" 
            className="reset-btn"
            onClick={handleReset}
            disabled={loading}
          >
            مسح البيانات
          </button>
        </div>
      </form>
    </div>
  );
}

export default StudentForm;
