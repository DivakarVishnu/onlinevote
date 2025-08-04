import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Vote, Shield, Users, BarChart } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home">
      <div className="hero-section">
        <div className="hero-content">
          <h1>Secure Online Voting System</h1>
          <p>Experience democracy in the digital age with our secure, transparent voting platform</p>
          {!user ? (
            <div className="hero-buttons">
              <Link to="/register" className="btn btn-primary">Get Started</Link>
              <Link to="/elections" className="btn btn-secondary">View Elections</Link>
            </div>
          ) : (
            <div className="hero-buttons">
              <Link to="/elections" className="btn btn-primary">View Elections</Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="btn btn-secondary">Admin Dashboard</Link>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="features-section">
        <div className="container">
          <h2>Why Choose VoteSecure?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <Shield className="feature-icon" />
              <h3>Secure & Encrypted</h3>
              <p>All votes are encrypted and stored securely using industry-standard security practices</p>
            </div>
            <div className="feature-card">
              <Users className="feature-icon" />
              <h3>User-Friendly</h3>
              <p>Simple and intuitive interface makes voting accessible to everyone</p>
            </div>
            <div className="feature-card">
              <BarChart className="feature-icon" />
              <h3>Real-Time Results</h3>
              <p>View election results as they come in with interactive charts and graphs</p>
            </div>
            <div className="feature-card">
              <Vote className="feature-icon" />
              <h3>Transparent</h3>
              <p>Open source and transparent voting process ensures trust and accountability</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;