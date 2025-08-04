import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Vote as VoteIcon, User, CheckCircle } from 'lucide-react';

const Vote = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [election, setElection] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchElection();
  }, [id]);

  const fetchElection = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/elections/${id}`);
      setElection(response.data);
      
      // Check if election is active
      const now = new Date();
      const startDate = new Date(response.data.startDate);
      const endDate = new Date(response.data.endDate);
      
      if (now < startDate || now > endDate) {
        setError('This election is not currently active');
      }
    } catch (err) {
      setError('Failed to fetch election details');
    } finally {
      setLoading(false);
    }
  };

  const handleVoteSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedCandidate) {
      setError('Please select a candidate');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/votes`, {
        electionId: id,
        candidateId: selectedCandidate
      });
      
      setSuccess(true);
      setTimeout(() => {
        navigate(`/results/${id}`);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cast vote');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading election...</div>;
  if (error && !election) return <div className="error">{error}</div>;

  if (success) {
    return (
      <div className="vote-success">
        <div className="success-content">
          <CheckCircle size={64} className="success-icon" />
          <h2>Vote Cast Successfully!</h2>
          <p>Thank you for participating in the democratic process.</p>
          <p>Redirecting to results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="vote-page">
      <div className="container">
        <div className="vote-header">
          <VoteIcon size={32} />
          <h1>Cast Your Vote</h1>
          <h2>{election?.title}</h2>
          <p>{election?.description}</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleVoteSubmit} className="vote-form">
          <div className="candidates-section">
            <h3>Select Your Candidate</h3>
            <div className="candidates-grid">
              {election?.candidates?.map(candidate => (
                <div 
                  key={candidate._id} 
                  className={`candidate-card ${selectedCandidate === candidate._id ? 'selected' : ''}`}
                  onClick={() => setSelectedCandidate(candidate._id)}
                >
                  <input
                    type="radio"
                    name="candidate"
                    value={candidate._id}
                    checked={selectedCandidate === candidate._id}
                    onChange={(e) => setSelectedCandidate(e.target.value)}
                    className="candidate-radio"
                  />
                  <div className="candidate-info">
                    <User size={32} className="candidate-avatar" />
                    <h4>{candidate.name}</h4>
                    <p className="candidate-party">{candidate.party}</p>
                    {candidate.description && (
                      <p className="candidate-description">{candidate.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="vote-actions">
            <button 
              type="button" 
              onClick={() => navigate('/elections')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={!selectedCandidate || submitting}
            >
              {submitting ? 'Casting Vote...' : 'Cast Vote'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Vote;