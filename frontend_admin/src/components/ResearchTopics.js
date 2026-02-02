import React, { useState, useEffect } from 'react';
import { researchTopicsApi } from '../services/api';

function ResearchTopics() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({ topic_name: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const response = await researchTopicsApi.getAll();
      setTopics(response.data);
    } catch (err) {
      setError('Failed to fetch research topics');
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
        await researchTopicsApi.update(editingId, formData);
        setSuccess('Research topic updated successfully');
      } else {
        await researchTopicsApi.create(formData);
        setSuccess('Research topic created successfully');
      }
      setFormData({ topic_name: '' });
      setEditingId(null);
      fetchTopics();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (topic) => {
    setFormData({ topic_name: topic.topic_name });
    setEditingId(topic._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this research topic?')) {
      try {
        await researchTopicsApi.delete(id);
        setSuccess('Research topic deleted successfully');
        fetchTopics();
      } catch (err) {
        setError('Failed to delete research topic');
      }
    }
  };

  const handleCancel = () => {
    setFormData({ topic_name: '' });
    setEditingId(null);
  };

  return (
    <div>
      <div className="card">
        <h2>{editingId ? 'Edit Research Topic' : 'Add Research Topic'}</h2>
        {error && <div className="message error">{error}</div>}
        {success && <div className="message success">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Topic Name</label>
            <input
              type="text"
              value={formData.topic_name}
              onChange={(e) => setFormData({ ...formData, topic_name: e.target.value })}
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
        <h2>Research Topics List</h2>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Topic Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {topics.map((topic) => (
                  <tr key={topic._id}>
                    <td>{topic.topic_name}</td>
                    <td>
                      <div className="actions">
                        <button className="btn btn-primary" onClick={() => handleEdit(topic)}>
                          Edit
                        </button>
                        <button className="btn btn-danger" onClick={() => handleDelete(topic._id)}>
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

export default ResearchTopics;
