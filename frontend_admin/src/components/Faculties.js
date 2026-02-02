import React, { useState, useEffect } from 'react';
import { facultiesApi } from '../services/api';

function Faculties() {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({ faculty_name: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchFaculties();
  }, []);

  const fetchFaculties = async () => {
    try {
      setLoading(true);
      const response = await facultiesApi.getAll();
      setFaculties(response.data);
    } catch (err) {
      setError('Failed to fetch faculties');
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
        await facultiesApi.update(editingId, formData);
        setSuccess('Faculty updated successfully');
      } else {
        await facultiesApi.create(formData);
        setSuccess('Faculty created successfully');
      }
      setFormData({ faculty_name: '' });
      setEditingId(null);
      fetchFaculties();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (faculty) => {
    setFormData({ faculty_name: faculty.faculty_name });
    setEditingId(faculty._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this faculty?')) {
      try {
        await facultiesApi.delete(id);
        setSuccess('Faculty deleted successfully');
        fetchFaculties();
      } catch (err) {
        setError('Failed to delete faculty');
      }
    }
  };

  const handleCancel = () => {
    setFormData({ faculty_name: '' });
    setEditingId(null);
  };

  return (
    <div>
      <div className="card">
        <h2>{editingId ? 'Edit Faculty' : 'Add Faculty'}</h2>
        {error && <div className="message error">{error}</div>}
        {success && <div className="message success">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Faculty Name</label>
            <input
              type="text"
              value={formData.faculty_name}
              onChange={(e) => setFormData({ ...formData, faculty_name: e.target.value })}
              required
            />
          </div>
          <div className="actions">
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Update' : 'Create'}
            </button>
            {editingId && (
              <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <h2>Faculties List</h2>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Faculty Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {faculties.map((faculty) => (
                  <tr key={faculty._id}>
                    <td>{faculty.faculty_name}</td>
                    <td>
                      <div className="actions">
                        <button className="btn btn-primary" onClick={() => handleEdit(faculty)}>
                          Edit
                        </button>
                        <button className="btn btn-danger" onClick={() => handleDelete(faculty._id)}>
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

export default Faculties;
