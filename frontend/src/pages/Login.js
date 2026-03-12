import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { authAPI } from '../utils/api';
import '../styles/Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const role = searchParams.get('role') || 'user';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('⚠️ Email is required');
      return;
    }

    if (!password.trim()) {
      setError('⚠️ Password is required');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.login({ email, password, role });
      const { token, user } = response.data;

      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('userId', user.id);
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('fullName', user.fullName);
      if (user.profilePicture) {
        localStorage.setItem('profilePicture', user.profilePicture);
      }

      // Dispatch auth-change event to update App.js state (same window)
      window.dispatchEvent(new Event('auth-change'));

      // Show role-specific success message
      if (user.role === 'admin') {
        setSuccess('Welcome back, Admin! Redirecting to dashboard...');
        localStorage.setItem('successMessage', 'Welcome back, Admin! Login successful.');
      } else {
        setSuccess('Welcome back! Redirecting to dashboard...');
        localStorage.setItem('successMessage', 'Welcome! User login successful.');
      }

      // Redirect after showing success message
      setTimeout(() => {
        if (user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      }, 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed. Please try again.';
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
              {role === 'admin' ? 'Admin' : 'User'} Login
            </div>
            <h1>{role === 'admin' ? 'Admin Login' : 'User Login'}</h1>
            <p>
              {role === 'admin' 
                ? 'Manage your properties' 
                : 'Find your perfect property'}
            </p>
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
                  <i className="fas fa-envelope"></i> Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-control"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-lock"></i> Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="btn-submit"
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Logging in...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt"></i> Login
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="auth-footer">
            <p>
              Don't have an account? <Link to={`/register?role=${role}`}>Sign up here</Link>
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

export default Login;
