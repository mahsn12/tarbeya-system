import React from 'react';
import './RegistrationClosed.css';

function RegistrationClosed({ onBackToLogin }) {
  return (
    <div className="registration-closed-container">
      <div className="registration-closed-card">
        <div className="closed-icon">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        
        <h2>التسجيل مغلق حالياً</h2>
        
        <div className="closed-message">
          <p>عذراً، فترة التسجيل في نظام التربية العسكرية مغلقة حالياً.</p>
          <p>يرجى المحاولة لاحقاً أو التواصل مع الإدارة للمزيد من المعلومات.</p>
        </div>

        <div className="closed-info">
          <div className="info-box">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <div>
              <strong>ملاحظة:</strong>
              <p>إذا كنت مسجلاً بالفعل، يمكنك تسجيل الدخول لعرض بياناتك.</p>
            </div>
          </div>
        </div>

        <div className="closed-actions">
          <button className="back-btn" onClick={onBackToLogin}>
            العودة لصفحة تسجيل الدخول
          </button>
        </div>

        <div className="contact-info">
          <p>للاستفسارات والمساعدة، يرجى التواصل مع الإدارة</p>
        </div>
      </div>
    </div>
  );
}

export default RegistrationClosed;
