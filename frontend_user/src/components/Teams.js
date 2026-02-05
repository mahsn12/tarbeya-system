import React, { useState, useEffect } from 'react';
import { teamsApi, enrolledStudentsApi, configApi, registeredStudentsApi } from '../services/api';
import './Teams.css';

function Teams({ onClose, student }) {
  const [teamMembers, setTeamMembers] = useState(['']);
  const [minTeamSize, setMinTeamSize] = useState(1);
  const [maxTeamSize, setMaxTeamSize] = useState(5);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    // Fetch config for team size limits first
    const fetchConfig = async () => {
      try {
        const configRes = await configApi.get();
        const min = configRes.data.min_team_members || 1;
        const max = configRes.data.max_team_members || 5;
        setMinTeamSize(min);
        setMaxTeamSize(max);
        
        // Initialize team members array based on max size
        if (student) {
          const initialMembers = new Array(max).fill('');
          initialMembers[0] = String(student.nationalId); // Leader
          setTeamMembers(initialMembers);

          // Try to populate from existing registered/team data
          try {
            // Check if this student has a registered record with a team_code
            const regRes = await registeredStudentsApi.getByNationalId(student.nationalId);
            const reg = regRes.data;
            if (reg.team_code && reg.team_code !== 'UNASSIGNED') {
              try {
                const teamRes = await teamsApi.getByCode(reg.team_code);
                const team = teamRes.data;
                const nids = (team.national_ids && team.national_ids.length) ? team.national_ids.map(String) : [];
                const filled = new Array(max).fill('');
                for (let i = 0; i < nids.length && i < max; i++) filled[i] = String(nids[i]);
                // ensure leader is at position 0
                if (!filled[0]) filled[0] = String(student.nationalId);
                setTeamMembers(filled);
              } catch (teamErr) {
                // ignore team lookup errors
              }
            } else {
              // If not registered, try to find any team that already includes this student
              try {
                const allTeamsRes = await teamsApi.getAll();
                const teams = allTeamsRes.data || [];
                const found = teams.find(t => {
                  const nids = t.national_ids || [];
                  return nids.map(String).includes(String(student.nationalId));
                });
                if (found) {
                  const nids = (found.national_ids && found.national_ids.length) ? found.national_ids.map(String) : [];
                  const filled = new Array(max).fill('');
                  for (let i = 0; i < nids.length && i < max; i++) filled[i] = String(nids[i]);
                  if (!filled[0]) filled[0] = String(student.nationalId);
                  setTeamMembers(filled);
                }
              } catch (allErr) {
                // ignore
              }
            }
          } catch (err) {
            // no registered record — try to find a team that includes this student
            try {
              const allTeamsRes = await teamsApi.getAll();
              const teams = allTeamsRes.data || [];
              const found = teams.find(t => {
                const nids = t.national_ids || [];
                return nids.map(String).includes(String(student.nationalId));
              });
              if (found) {
                const nids = (found.national_ids && found.national_ids.length) ? found.national_ids.map(String) : [];
                const filled = new Array(max).fill('');
                for (let i = 0; i < nids.length && i < max; i++) filled[i] = String(nids[i]);
                if (!filled[0]) filled[0] = String(student.nationalId);
                setTeamMembers(filled);
              }
            } catch (allErr) {
              // ignore
            }
          }
        }
      } catch (err) {
        // Use defaults if config not available
        console.error('Error fetching config:', err);
        if (student) {
          const initialMembers = new Array(5).fill('');
          initialMembers[0] = String(student.nationalId);
          setTeamMembers(initialMembers);
        }
      }
    };
    fetchConfig();
  }, [student]);

  const handleMemberChange = (index, value) => {
    // Only allow numbers
    const numericValue = value.replace(/\D/g, '').slice(0, 14);
    const newMembers = [...teamMembers];
    newMembers[index] = numericValue;
    setTeamMembers(newMembers);
  };

  const validateTeam = () => {
    // Leader (first member) is required
    if (!teamMembers[0] || teamMembers[0].length !== 14) {
      setMessage({ type: 'error', text: 'رقم قائد الفريق مطلوب ويجب أن يكون 14 رقم' });
      return false;
    }

    // Check for duplicate national IDs
    const filledMembers = teamMembers.filter(m => m.trim());
    const uniqueMembers = new Set(filledMembers);
    if (filledMembers.length !== uniqueMembers.size) {
      setMessage({ type: 'error', text: 'لا يمكن تكرار الرقم القومي لأكثر من عضو' });
      return false;
    }

    // Check team size limits
    if (filledMembers.length < minTeamSize) {
      setMessage({ type: 'error', text: `الحد الأدنى لأعضاء الفريق هو ${minTeamSize}` });
      return false;
    }

    if (filledMembers.length > maxTeamSize) {
      setMessage({ type: 'error', text: `الحد الأقصى لأعضاء الفريق هو ${maxTeamSize}` });
      return false;
    }

    // Validate each filled member's national ID format
    for (let i = 0; i < filledMembers.length; i++) {
      const nid = filledMembers[i];
      if (!/^[23]\d{13}$/.test(nid)) {
        setMessage({ type: 'error', text: `الرقم القومي للعضو ${i + 1} يجب أن يبدأ بـ 2 أو 3 ويتكون من 14 رقم` });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!validateTeam()) {
      return;
    }

    setLoading(true);

    try {
      const validMembers = teamMembers.filter(m => m.trim());
      
      // Verify all members are enrolled students
      const studentNames = [];
      const nationalIds = [];
      
      for (const nationalId of validMembers) {
        try {
          const res = await enrolledStudentsApi.getByNationalId(nationalId);
          studentNames.push(res.data.student_name);
          nationalIds.push(res.data.national_id);
        } catch (err) {
          if (err.response?.status === 404) {
            setMessage({ type: 'error', text: `الرقم القومي ${nationalId} غير مسجل في النظام` });
            setLoading(false);
            return;
          }
          throw err;
        }
      }

      // Generate team code
      const teamCode = `TEAM-${Date.now().toString(36).toUpperCase()}`;
      
      // Create the team
      const teamData = {
        team_code: teamCode,
        faculty_name: student.college,
        student_names: studentNames,
        national_ids: nationalIds,
        research_topics: []
      };

      const createdTeamRes = await teamsApi.create(teamData);
      const createdTeam = createdTeamRes.data;

      // If some members already registered individually, update their registered student records
      for (const nid of nationalIds) {
        try {
          const regRes = await registeredStudentsApi.getByNationalId(nid);
          const reg = regRes.data;
          await registeredStudentsApi.update(reg._id, { team_code: teamCode });
        } catch (err) {
          // ignore not-found (404) — member not registered yet
          if (err.response?.status && err.response.status !== 404) {
            console.error('Error updating registered student for team assignment', err);
          }
        }
      }

      setMessage({ 
        type: 'success', 
        text: `✅ تم تسجيل الفريق بنجاح — كود الفريق: ${teamCode}` 
      });

      // Reset form after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.error || 'حدث خطأ أثناء تسجيل الفريق' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="teams-overlay" onClick={onClose}>
      <div className="teams-content" onClick={e => e.stopPropagation()}>
        <div className="teams-header">
          <h3>تسجيل فريق الطلاب</h3>
          <button className="teams-close-btn" onClick={onClose}>×</button>
        </div>

        <p className="team-size-info">
          الحد الأدنى: {minTeamSize} أعضاء | الحد الأقصى: {maxTeamSize} أعضاء
        </p>

        {message.text && (
          <div className={`teams-message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="teams-form-group">
            <label>الكلية</label>
            <div className="college-display">{student.college}</div>
          </div>

          <div className="team-members-section">
            <h4>أعضاء الفريق</h4>
            <p className="team-note">القائد هو العضو الأول (الرقم القومي الخاص بك)</p>

            {teamMembers.map((member, index) => (
              <div key={index} className="teams-form-group">
                <label className={index === 0 ? 'required' : ''}>
                  {index === 0 ? ' قائد الفريق (الرقم القومي)' : `الرقم القومي للعضو ${index + 1}`}
                </label>
                <input
                  type="text"
                  value={member}
                  onChange={(e) => handleMemberChange(index, e.target.value)}
                  placeholder={index === 0 ? 'الرقم القومي للقائد (أنت)' : 'اختياري'}
                  maxLength="14"
                  required={index === 0}
                  disabled={index === 0} // Leader is the logged-in student
                  dir="ltr"
                />
              </div>
            ))}
          </div>

          <div className="teams-actions">
            <button type="submit" className="teams-submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  جاري تسجيل الفريق...
                </>
              ) : (
                'تسجيل الفريق'
              )}
            </button>
            <button type="button" className="teams-cancel-btn" onClick={onClose} disabled={loading}>
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Teams;
