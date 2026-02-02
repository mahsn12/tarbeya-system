import React, { useState, useEffect } from 'react';
import { registeredStudentsApi } from '../services/api';

function RegisteredStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    national_id: '',
    sequence_number: '',
    student_name: '',
    phone_number: '',
    faculty_name: '',
    research_name: '',
    educational_level: '',
    team_code: ''
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await registeredStudentsApi.getAll();
      setStudents(response.data);
    } catch (err) {
      setError('Failed to fetch registered students');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingId) {
        await registeredStudentsApi.update(editingId, formData);
        setSuccess('Student updated successfully');
      } else {
        await registeredStudentsApi.create(formData);
        setSuccess('Student registered successfully');
      }
      resetForm();
      fetchStudents();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (student) => {
    setFormData({
      national_id: student.national_id,
      sequence_number: student.sequence_number,
      student_name: student.student_name,
      phone_number: student.phone_number,
      faculty_name: student.faculty_name,
      research_name: student.research_name,
      educational_level: student.educational_level,
      team_code: student.team_code
    });
    setEditingId(student._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this registration?')) {
      try {
        await registeredStudentsApi.delete(id);
        setSuccess('Registration deleted successfully');
        fetchStudents();
      } catch (err) {
        setError('Failed to delete registration');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      national_id: '',
      sequence_number: '',
      student_name: '',
      phone_number: '',
      faculty_name: '',
      research_name: '',
      educational_level: '',
      team_code: ''
    });
    setEditingId(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div>
      <div className="card">
        <h2>{editingId ? 'Edit Registration' : 'Register Student'}</h2>
        {error && <div className="message error">{error}</div>}
        {success && <div className="message success">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>National ID</label>
              <input
                type="text"
                value={formData.national_id}
                onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Sequence Number</label>
              <input
                type="text"
                value={formData.sequence_number}
                onChange={(e) => setFormData({ ...formData, sequence_number: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Student Name</label>
              <input
                type="text"
                value={formData.student_name}
                onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Faculty Name</label>
              <input
                type="text"
                value={formData.faculty_name}
                onChange={(e) => setFormData({ ...formData, faculty_name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Research Name</label>
              <input
                type="text"
                value={formData.research_name}
                onChange={(e) => setFormData({ ...formData, research_name: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Educational Level</label>
              <input
                type="text"
                value={formData.educational_level}
                onChange={(e) => setFormData({ ...formData, educational_level: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Team Code</label>
              <input
                type="text"
                value={formData.team_code}
                onChange={(e) => setFormData({ ...formData, team_code: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="actions">
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Update' : 'Register'}
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
        <h2>Registered Students List</h2>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>National ID</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Faculty</th>
                  <th>Research</th>
                  <th>Level</th>
                  <th>Team</th>
                  <th>Reg. Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id}>
                    <td>{student.national_id}</td>
                    <td>{student.student_name}</td>
                    <td>{student.phone_number}</td>
                    <td>{student.faculty_name}</td>
                    <td>{student.research_name}</td>
                    <td>{student.educational_level}</td>
                    <td>{student.team_code}</td>
                    <td>{formatDate(student.registration_date)}</td>
                    <td>
                      <div className="actions">
                        <button className="btn btn-primary" onClick={() => handleEdit(student)}>
                          Edit
                        </button>
                        <button className="btn btn-danger" onClick={() => handleDelete(student._id)}>
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

export default RegisteredStudents;
