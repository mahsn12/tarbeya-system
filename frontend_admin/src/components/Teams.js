import React, { useState, useEffect } from 'react';
import { teamsApi } from '../services/api';

function Teams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    team_code: '',
    faculty_name: '',
    student_names: '',
    national_numbers: '',
    research_topics: ''
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await teamsApi.getAll();
      setTeams(response.data);
    } catch (err) {
      setError('Failed to fetch teams');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const dataToSend = {
      team_code: formData.team_code,
      faculty_name: formData.faculty_name,
      student_names: formData.student_names.split(',').map(s => s.trim()).filter(s => s),
      national_numbers: formData.national_numbers.split(',').map(s => s.trim()).filter(s => s),
      research_topics: formData.research_topics.split(',').map(s => s.trim()).filter(s => s)
    };

    try {
      if (editingId) {
        await teamsApi.update(editingId, dataToSend);
        setSuccess('Team updated successfully');
      } else {
        await teamsApi.create(dataToSend);
        setSuccess('Team created successfully');
      }
      resetForm();
      fetchTeams();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (team) => {
    setFormData({
      team_code: team.team_code,
      faculty_name: team.faculty_name,
      student_names: team.student_names.join(', '),
      national_numbers: team.national_numbers.join(', '),
      research_topics: team.research_topics.join(', ')
    });
    setEditingId(team._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      try {
        await teamsApi.delete(id);
        setSuccess('Team deleted successfully');
        fetchTeams();
      } catch (err) {
        setError('Failed to delete team');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      team_code: '',
      faculty_name: '',
      student_names: '',
      national_numbers: '',
      research_topics: ''
    });
    setEditingId(null);
  };

  return (
    <div>
      <div className="card">
        <h2>{editingId ? 'Edit Team' : 'Create Team'}</h2>
        {error && <div className="message error">{error}</div>}
        {success && <div className="message success">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Team Code</label>
              <input
                type="text"
                value={formData.team_code}
                onChange={(e) => setFormData({ ...formData, team_code: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Faculty Name</label>
              <input
                type="text"
                value={formData.faculty_name}
                onChange={(e) => setFormData({ ...formData, faculty_name: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Student Names (comma-separated)</label>
            <input
              type="text"
              value={formData.student_names}
              onChange={(e) => setFormData({ ...formData, student_names: e.target.value })}
              placeholder="John Doe, Jane Smith, ..."
            />
          </div>
          <div className="form-group">
            <label>National Numbers (comma-separated)</label>
            <input
              type="text"
              value={formData.national_numbers}
              onChange={(e) => setFormData({ ...formData, national_numbers: e.target.value })}
              placeholder="123456789, 987654321, ..."
            />
          </div>
          <div className="form-group">
            <label>Research Topics (comma-separated)</label>
            <input
              type="text"
              value={formData.research_topics}
              onChange={(e) => setFormData({ ...formData, research_topics: e.target.value })}
              placeholder="Topic 1, Topic 2, ..."
            />
          </div>
          <div className="actions">
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Update' : 'Create'}
            </button>
            {editingId && (
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <h2>Teams List</h2>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Team Code</th>
                  <th>Faculty</th>
                  <th>Student Names</th>
                  <th>National Numbers</th>
                  <th>Research Topics</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team) => (
                  <tr key={team._id}>
                    <td>{team.team_code}</td>
                    <td>{team.faculty_name}</td>
                    <td>{team.student_names.join(', ') || '-'}</td>
                    <td>{team.national_numbers.join(', ') || '-'}</td>
                    <td>{team.research_topics.join(', ') || '-'}</td>
                    <td>
                      <div className="actions">
                        <button className="btn btn-primary" onClick={() => handleEdit(team)}>
                          Edit
                        </button>
                        <button className="btn btn-danger" onClick={() => handleDelete(team._id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Teams;
