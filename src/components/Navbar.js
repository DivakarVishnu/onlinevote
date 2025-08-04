import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Vote, LogOut, User, Settings } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <Vote size={24} />
          <span>VoteSecure</span>
        </Link>
        
        <div className="nav-menu">
          <Link to="/elections" className="nav-link">Elections</Link>
          
          {user ? (
            <div className="nav-user">
              <span className="welcome-text">Welcome, {user.username}</span>
              {user.role === 'admin' && (
                <Link to="/admin" className="nav-link admin-link">
                  <Settings size={16} />
                  Admin
                </Link>
              )}
              <button onClick={handleLogout} className="logout-btn">
                <LogOut size={16} />
                Logout
              </button>
            </div>
          ) : (
            <div className="nav-auth">
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="register-btn">Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;