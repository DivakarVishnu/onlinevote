import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Calendar, Users, Vote, Clock } from 'lucide-react';

const Elections = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/elections');
      setElections(response.data);
    } catch (err) {
      setError('Failed to fetch elections');
    } finally {
      setLoading(false);
    }
  };

  const isElectionActive = (startDate, endDate) => {
    const now = new Date();
    return new Date(startDate) <= now && now <= new Date(endDate);
  };

  const hasUserVoted = (electionId) => {
    return user?.hasVoted?.some(vote => vote.electionId === electionId);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <div className="loading">Loading elections...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="elections-page">
      <div className="container">
        <div className="page-header">
          <h1>Available Elections</h1>
          <p>Participate in active elections or view results from completed ones</p>
        </div>

        {elections.length === 0 ? (
          <div className="no-elections">
            <Vote size={64} className="no-elections-icon" />
            <h3>No Elections Available</h3>
            <p>There are currently no elections to display.</p>
          </div>
        ) : (
          <div className="elections-grid">
            {elections.map(election => (
              <div key={election._id} className="election-card">
                <div className="election-header">
                  <h3>{election.title}</h3>
                  <div className={`election-status ${isElectionActive(election.startDate, election.endDate) ? 'active' : 'inactive'}`}>
                    {isElectionActive(election.startDate, election.endDate) ? 'Active' : 'Ended'}
                  </div>
                </div>

                <p className="election-description">{election.description}</p>

                <div className="election-info">
                  <div className="info-item">
                    <Calendar size={16} />
                    <span>Start: {formatDate(election.startDate)}</span>
                  </div>
                  <div className="info-item">
                    <Clock size={16} />
                    <span>End: {formatDate(election.endDate)}</span>
                  </div>
                  <div className="info-item">
                    <Users size={16} />
                    <span>{election.candidates?.length || 0} Candidates</span>
                  </div>
                  <div className="info-item">
                    <Vote size={16} />
                    <span>{election.totalVotes || 0} Total Votes</span>
                  </div>
                </div>

                <div className="election-actions">
                  {isElectionActive(election.startDate, election.endDate) ? (
                    user ? (
                      hasUserVoted(election._id) ? (
                        <div className="voted-status">
                          <span>✓ You have voted</span>
                          <Link to={`/results/${election._id}`} className="btn btn-secondary">
                            View Results
                          </Link>
                        </div>
                      ) : (
                        <Link to={`/vote/${election._id}`} className="btn btn-primary">
                          Cast Your Vote
                        </Link>
                      )
                    ) : (
                      <Link to="/login" className="btn btn-primary">
                        Login to Vote
                      </Link>
                    )
                  ) : (
                    <Link to={`/results/${election._id}`} className="btn btn-secondary">
                      View Results
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Elections;