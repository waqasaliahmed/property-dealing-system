import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { authAPI } from '../utils/api';
import '../styles/Auth.css';

const Register = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const roleParam = searchParams.get('role');
  
  // Block admin signup - redirect to home
  useEffect(() => {
    if (roleParam === 'admin') {
      navigate('/');
    }
  }, [roleParam, navigate]);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    address: '',
  });
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: '',
    color: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  // Password validation function
  const validatePassword = (password) => {
    let score = 0;
    let message = '';
    let color = '';

    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score === 0) {
      message = 'Password too weak';
      color = 'danger';
    } else if (score <= 2) {
      message = 'Weak password';
      color = 'warning';
    } else if (score <= 4) {
      message = 'Good password';
      color = 'info';
    } else {
      message = 'Strong password';
      color = 'success';
    }

    setPasswordStrength({ score, message, color });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === 'password') {
      validatePassword(value);
    }
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Invalid email format');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (passwordStrength.score < 2) {
      setError('Password is too weak. Use uppercase, lowercase, numbers, and special characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.register(formData);
      const { token, user } = response.data;

      // Show role-specific success message
      setSuccess('User signup successfully! Redirecting...');

      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('userId', user.id);
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('fullName', user.fullName);
      localStorage.setItem('successMessage', 'User signup successfully!');
      if (user.profilePicture) {
        localStorage.setItem('profilePicture', user.profilePicture);
      }

      // Dispatch auth-change event to update App.js state
      window.dispatchEvent(new Event('auth-change'));

      // Redirect after showing success message
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Registration failed';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon-text">
              User Sign Up
            </div>
            <h1>User Sign Up</h1>
            <p>Start browsing properties</p>
          </div>

          <div className="auth-body">
            {error && (
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                <i className="fas fa-exclamation-circle"></i>
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="alert alert-success alert-dismissible fade show" role="alert">
                <i className="fas fa-check-circle"></i>
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-user"></i> Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  className="form-control"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-envelope"></i> Email
                </label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-lock"></i> Password
                </label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  placeholder="Enter a strong password (min 6 chars)"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                {formData.password && (
                  <div className={`password-strength password-strength-${passwordStrength.color}`}>
                    <div className="strength-bar">
                      <div 
                        className={`strength-fill strength-${passwordStrength.color}`}
                        style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                      ></div>
                    </div>
                    <small className={`text-${passwordStrength.color}`}>
                      {passwordStrength.message}
                    </small>
                  </div>
                )}
                <small className="form-help d-block mt-2">
                  <i className="fas fa-info-circle"></i> Use at least 6 characters with mix of uppercase, lowercase, numbers & symbols
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-phone"></i> Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  className="form-control"
                  placeholder="Enter your phone number"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-map-marker-alt"></i> Address (Optional)
                </label>
                <textarea
                  name="address"
                  className="form-control"
                  placeholder="Enter your address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="btn-submit w-100"
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Creating account...
                  </>
                ) : (
                  <>
                    <i className="fas fa-user-plus"></i> Sign Up
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="auth-footer">
            <p>
              Already have an account? <Link to={`/login?role=user`}>Login here</Link>
            </p>
            <p>
              <Link to="/"><i className="fas fa-arrow-left"></i> Back to home</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
