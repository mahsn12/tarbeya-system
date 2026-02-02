import React, { useState, useEffect } from 'react';
import { enrolledStudentsApi } from '../services/api';

function EnrolledStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    national_id: '',
    sequence_number: '',
    student_name: '',
    faculty_name: '',
    registered_research: false,
    finished_research: false
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await enrolledStudentsApi.getAll();
      setStudents(response.data);
    } catch (err) {
      setError('Failed to fetch enrolled students');
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
        await enrolledStudentsApi.update(editingId, formData);
        setSuccess('Student updated successfully');
      } else {
        await enrolledStudentsApi.create(formData);
        setSuccess('Student created successfully');
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
      faculty_name: student.faculty_name,
      registered_research: student.registered_research,
      finished_research: student.finished_research
    });
    setEditingId(student._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await enrolledStudentsApi.delete(id);
        setSuccess('Student deleted successfully');
        fetchStudents();
      } catch (err) {
        setError('Failed to delete student');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      national_id: '',
      sequence_number: '',
      student_name: '',
      faculty_name: '',
      registered_research: false,
      finished_research: false
    });
    setEditingId(null);
  };

  return (
    <div>
      <div className="card">
        <h2>{editingId ? 'Edit Enrolled Student' : 'Add Enrolled Student'}</h2>
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
              <label>Faculty Name</label>
              <input
                type="text"
                value={formData.faculty_name}
                onChange={(e) => setFormData({ ...formData, faculty_name: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="registered_research"
                  checked={formData.registered_research}
                  onChange={(e) => setFormData({ ...formData, registered_research: e.target.checked })}
                />
                <label htmlFor="registered_research">Registered Research</label>
              </div>
            </div>
            <div className="form-group">
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="finished_research"
                  checked={formData.finished_research}
                  onChange={(e) => setFormData({ ...formData, finished_research: e.target.checked })}
                />
                <label htmlFor="finished_research">Finished Research</label>
              </div>
            </div>
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
        <h2>Enrolled Students List</h2>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>National ID</th>
                  <th>Sequence #</th>
                  <th>Name</th>
                  <th>Faculty</th>
                  <th>Registered</th>
                  <th>Finished</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id}>
                    <td>{student.national_id}</td>
                    <td>{student.sequence_number}</td>
                    <td>{student.student_name}</td>
                    <td>{student.faculty_name}</td>
                    <td>
                      <span className={`badge ${student.registered_research ? 'badge-success' : 'badge-warning'}`}>
                        {student.registered_research ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${student.finished_research ? 'badge-success' : 'badge-warning'}`}>
                        {student.finished_research ? 'Yes' : 'No'}
                      </span>
                    </td>
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

export default EnrolledStudents;
