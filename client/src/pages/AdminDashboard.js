import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, Users, Vote, Calendar } from 'lucide-react';

const AdminDashboard = () => {
  const [elections, setElections] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingElection, setEditingElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    candidates: [{ name: '', party: '', description: '' }]
  });

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/elections`);
      const data = response.data;

      // Handle different possible response formats
      if (Array.isArray(data)) {
        setElections(data);
      } else if (Array.isArray(data.elections)) {
        setElections(data.elections);
      } else {
        console.error("Unexpected response:", data);
        setElections([]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError('Failed to fetch elections');
      setElections([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingElection) {
        await axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/elections/${editingElection._id}`, formData);
      } else {
        await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/elections`, formData);
      }
      fetchElections();
      resetForm();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save election');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      candidates: [{ name: '', party: '', description: '' }]
    });
    setShowCreateForm(false);
    setEditingElection(null);
  };

  const handleEdit = (election) => {
    setEditingElection(election);
    setFormData({
      title: election.title,
      description: election.description,
      startDate: new Date(election.startDate).toISOString().slice(0, 16),
      endDate: new Date(election.endDate).toISOString().slice(0, 16),
      candidates: election.candidates || [{ name: '', party: '', description: '' }]
    });
    setShowCreateForm(true);
  };

  const addCandidate = () => {
    setFormData({
      ...formData,
      candidates: [...formData.candidates, { name: '', party: '', description: '' }]
    });
  };

  const removeCandidate = (index) => {
    const newCandidates = formData.candidates.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      candidates: newCandidates.length > 0 ? newCandidates : [{ name: '', party: '', description: '' }]
    });
  };

  const updateCandidate = (index, field, value) => {
    const newCandidates = [...formData.candidates];
    newCandidates[index][field] = value;
    setFormData({
      ...formData,
      candidates: newCandidates
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <button className="btn btn-primary" onClick={() => setShowCreateForm(true)}>
            <Plus size={20} />
            Create Election
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {showCreateForm && (
          <div className="form-modal">
            <div className="form-modal-content">
              <div className="form-header">
                <h2>{editingElection ? 'Edit Election' : 'Create New Election'}</h2>
                <button className="close-btn" onClick={resetForm}>×</button>
              </div>

              <form onSubmit={handleFormSubmit}>
                <div className="form-group">
                  <label>Election Title</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date & Time</label>
                    <input type="datetime-local" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>End Date & Time</label>
                    <input type="datetime-local" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} required />
                  </div>
                </div>

                <div className="candidates-section">
                  <div className="candidates-header">
                    <h3>Candidates</h3>
                    <button type="button" className="btn btn-secondary" onClick={addCandidate}>
                      Add Candidate
                    </button>
                  </div>

                  {formData.candidates.map((candidate, index) => (
                    <div key={index} className="candidate-form">
                      <div className="candidate-form-header">
                        <h4>Candidate {index + 1}</h4>
                        {formData.candidates.length > 1 && (
                          <button type="button" className="remove-candidate-btn" onClick={() => removeCandidate(index)}>
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Name</label>
                          <input type="text" value={candidate.name} onChange={(e) => updateCandidate(index, 'name', e.target.value)} required />
                        </div>
                        <div className="form-group">
                          <label>Party</label>
                          <input type="text" value={candidate.party} onChange={(e) => updateCandidate(index, 'party', e.target.value)} required />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Description (Optional)</label>
                        <textarea value={candidate.description} onChange={(e) => updateCandidate(index, 'description', e.target.value)} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{editingElection ? 'Update Election' : 'Create Election'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="elections-list">
          <h2>Manage Elections</h2>
          {!Array.isArray(elections) || elections.length === 0 ? (
            <div className="no-elections">
              <Vote size={64} />
              <h3>No Elections Created</h3>
              <p>Create your first election to get started.</p>
            </div>
          ) : (
            <div className="elections-table">
              {elections.map((election) => (
                <div key={election._id} className="election-row">
                  <div className="election-info">
                    <h3>{election.title}</h3>
                    <p>{election.description}</p>
                    <div className="election-meta">
                      <span className="meta-item"><Calendar size={14} /> {formatDate(election.startDate)} - {formatDate(election.endDate)}</span>
                      <span className="meta-item"><Users size={14} /> {election.candidates?.length || 0} candidates</span>
                      <span className="meta-item"><Vote size={14} /> {election.totalVotes || 0} votes</span>
                    </div>
                  </div>
                  <div className="election-actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(election)}>
                      <Edit size={16} /> Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
