import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Trophy, Users, Vote } from 'lucide-react';

const Results = () => {
  const { id } = useParams();
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    fetchElectionResults();
  }, [id]);

  const fetchElectionResults = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/elections/${id}`);
      setElection(response.data);
    } catch (err) {
      setError('Failed to fetch election results');
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    if (!election?.candidates) return [];
    
    return election.candidates.map(candidate => ({
      name: candidate.name,
      votes: candidate.voteCount || 0,
      party: candidate.party
    })).sort((a, b) => b.votes - a.votes);
  };

  const getWinner = () => {
    if (!election?.candidates || election.candidates.length === 0) return null;
    
    return election.candidates.reduce((winner, candidate) => 
      (candidate.voteCount || 0) > (winner.voteCount || 0) ? candidate : winner
    );
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

  if (loading) return <div className="loading">Loading results...</div>;
  if (error) return <div className="error">{error}</div>;

  const chartData = getChartData();
  const winner = getWinner();

  return (
    <div className="results-page">
      <div className="container">
        <div className="results-header">
          <h1>Election Results</h1>
          <h2>{election?.title}</h2>
          <p>{election?.description}</p>
          
          <div className="election-stats">
            <div className="stat-card">
              <Vote className="stat-icon" />
              <div className="stat-info">
                <h3>{election?.totalVotes || 0}</h3>
                <p>Total Votes</p>
              </div>
            </div>
            <div className="stat-card">
              <Users className="stat-icon" />
              <div className="stat-info">
                <h3>{election?.candidates?.length || 0}</h3>
                <p>Candidates</p>
              </div>
            </div>
            <div className="stat-card">
              <Trophy className="stat-icon" />
              <div className="stat-info">
                <h3>{winner?.name || 'TBD'}</h3>
                <p>Leading Candidate</p>
              </div>
            </div>
          </div>
        </div>

        {winner && election?.totalVotes > 0 && (
          <div className="winner-section">
            <div className="winner-card">
              <Trophy className="winner-icon" />
              <div className="winner-info">
                <h3>Current Leader</h3>
                <h2>{winner.name}</h2>
                <p>{winner.party}</p>
                <div className="winner-stats">
                  <span>{winner.voteCount || 0} votes</span>
                  <span>({((winner.voteCount || 0) / (election.totalVotes || 1) * 100).toFixed(1)}%)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {chartData.length > 0 && election?.totalVotes > 0 ? (
          <div className="charts-section">
            <div className="chart-container">
              <h3>Vote Distribution (Bar Chart)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [value, 'Votes']}
                    labelFormatter={(label) => `Candidate: ${label}`}
                  />
                  <Bar dataKey="votes" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-container">
              <h3>Vote Share (Pie Chart)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({name, percent}) => `${name} (${(percent * 100).toFixed(1)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="votes"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="no-votes">
            <Vote size={64} className="no-votes-icon" />
            <h3>No Votes Cast Yet</h3>
            <p>Results will appear here once voting begins.</p>
          </div>
        )}

        <div className="detailed-results">
          <h3>Detailed Results</h3>
          <div className="results-table">
            {chartData.map((candidate, index) => (
              <div key={index} className="result-row">
                <div className="candidate-info">
                  <span className="rank">#{index + 1}</span>
                  <div className="candidate-details">
                    <h4>{candidate.name}</h4>
                    <p>{candidate.party}</p>
                  </div>
                </div>
                <div className="vote-info">
                  <span className="vote-count">{candidate.votes} votes</span>
                  <span className="vote-percentage">
                    ({election?.totalVotes > 0 ? ((candidate.votes / election.totalVotes) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="election-info">
          <div className="info-grid">
            <div className="info-item">
              <strong>Start Date:</strong>
              <span>{formatDate(election?.startDate)}</span>
            </div>
            <div className="info-item">
              <strong>End Date:</strong>
              <span>{formatDate(election?.endDate)}</span>
            </div>
            <div className="info-item">
              <strong>Created By:</strong>
              <span>{election?.createdBy?.username}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;