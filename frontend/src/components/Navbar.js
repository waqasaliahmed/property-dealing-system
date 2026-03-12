import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = localStorage.getItem('userRole');
  const fullName = localStorage.getItem('fullName');
  const profilePicture = localStorage.getItem('profilePicture');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('fullName');
    localStorage.removeItem('profilePicture');
    window.dispatchEvent(new Event('auth-change'));
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🏠</span>
          <span className="brand-text">PropertyHub</span>
        </Link>
      </div>

      <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
        <span className={`hamburger-line ${menuOpen ? 'open' : ''}`}></span>
        <span className={`hamburger-line ${menuOpen ? 'open' : ''}`}></span>
        <span className={`hamburger-line ${menuOpen ? 'open' : ''}`}></span>
      </button>

      <div className={`navbar-center ${menuOpen ? 'show' : ''}`}>
        <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
          Dashboard
        </Link>
        <Link to="/properties" className={`nav-link ${isActive('/properties') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
          All Properties
        </Link>
        {userRole === 'user' && (
          <Link to="/my-properties" className={`nav-link ${isActive('/my-properties') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
            My Properties
          </Link>
        )}
        {userRole === 'admin' ? (
          <Link to="/admin/add-property" className={`nav-link ${isActive('/admin/add-property') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
            + Add Property
          </Link>
        ) : (
          <Link to="/add-property" className={`nav-link ${isActive('/add-property') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
            + Add Property
          </Link>
        )}
      </div>

      <div className={`navbar-right ${menuOpen ? 'show' : ''}`}>
        <div className="user-info-section">
          {profilePicture ? (
            <img 
              src={profilePicture.startsWith('http') ? profilePicture : `http://localhost:5000${profilePicture}`}
              alt="Profile"
              className="navbar-profile-avatar"
            />
          ) : (
            <div className="navbar-avatar-placeholder">
              {fullName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          )}
          <div className="navbar-user-details">
            <span className="navbar-user-name">{fullName || 'User'}</span>
            <span className="navbar-user-role">{userRole === 'admin' ? 'Admin' : 'User'}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="navbar-logout-btn"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
