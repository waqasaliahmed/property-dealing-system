import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/RoleSelection.css';

const RoleSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="role-selection-container">
      <div className="role-selection-content">
        <div className="hero-section">
          <h1>🏠 PropertyHub</h1>
          <p className="hero-subtitle">Pakistan's trusted property management platform</p>
          <p className="hero-description">Buy, sell, and manage properties with ease. Browse plots, houses, land, and more.</p>
        </div>

        <div className="role-cards">
          <div className="role-card user-card">
            <div className="role-card-icon">👤</div>
            <h2>User Portal</h2>
            <p>Browse verified properties, search by location, price & area. Add your own property listings.</p>
            <ul className="role-features">
              <li>✓ Browse all verified properties</li>
              <li>✓ Search & filter properties</li>
              <li>✓ Add your own property</li>
              <li>✓ Contact property owners</li>
            </ul>
            <div className="button-group">
              <button className="btn btn-primary" onClick={() => navigate('/login?role=user')}>
                Login
              </button>
              <button className="btn btn-outline" onClick={() => navigate('/register?role=user')}>
                Create Account
              </button>
            </div>
          </div>

          <div className="role-card admin-card">
            <div className="role-card-icon">🛡️</div>
            <h2>Admin Portal</h2>
            <p>Manage all property listings, verify properties, track deals and sales.</p>
            <ul className="role-features">
              <li>✓ Manage all properties</li>
              <li>✓ Verify/reject listings</li>
              <li>✓ Mark as dealing/sold</li>
              <li>✓ Full dashboard analytics</li>
            </ul>
            <div className="button-group">
              <button className="btn btn-danger" onClick={() => navigate('/login?role=admin')}>
                Admin Login
              </button>
            </div>
          </div>
        </div>

        <div className="features-section">
          <div className="feature-item">
            <span className="feature-icon">🔍</span>
            <h3>Easy Search</h3>
            <p>Search by location, price, area</p>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📸</span>
            <h3>Photo Gallery</h3>
            <p>Multiple property images</p>
          </div>
          <div className="feature-item">
            <span className="feature-icon">✅</span>
            <h3>Verified Listings</h3>
            <p>Admin verified properties</p>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📱</span>
            <h3>Responsive</h3>
            <p>Works on all devices</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
