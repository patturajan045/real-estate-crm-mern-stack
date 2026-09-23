import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import { useCms } from '../context/CmsContext';
import { error as showError } from '../utils/alerts';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const { t } = useCms();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      showError('Please enter your email or username and password.', 'Missing Fields');
      return;
    }

    setLoading(true);
    try {
      const res = await login({
        email: identifier.trim(),
        username: identifier.trim(),
        password,
      });

      Swal.fire({
        icon: 'success',
        title: 'Welcome Back!',
        text: `Signed in as ${res.user.name} (${res.user.role})`,
        showConfirmButton: false,
        timer: 1400,
        timerProgressBar: true,
      }).then(() => {
        navigate(res.redirect || '/dashboard');
      });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to authenticate. Please check your credentials.';
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card-centered login-container">
        <div
          className="login-card"
          style={{
            background: 'var(--crm-card-bg)',
            border: '1px solid var(--crm-border)',
            borderRadius: 'var(--crm-radius)',
            boxShadow: 'var(--crm-shadow-lg)',
            padding: 'clamp(1.25rem, 4vw, 2.5rem)',
          }}
        >
          {/* Dynamic Brand Header */}
          <div className="text-center mb-3 mb-sm-4">
            <div
              className="sidebar-brand-icon mx-auto mb-3 d-inline-flex align-items-center justify-content-center"
              style={{
                width: 'clamp(44px, 5vw, 52px)',
                height: 'clamp(44px, 5vw, 52px)',
                fontSize: 'clamp(1.3rem, 2vw, 1.6rem)',
                borderRadius: '12px',
                background: 'transparent',
              }}
            >
              <i className="fas fa-city" style={{ color: 'var(--crm-primary)' }}></i>
            </div>
            <h2 className="fw-bold mb-1" style={{ fontSize: 'clamp(1.2rem, 2.2vw, 1.5rem)' }}>
              {t('login_brand_title', 'Real Estate CRM')}
            </h2>
            <p className="text-secondary small mb-0">
              {t('login_brand_subtitle', 'Real Estate Sales & Booking Platform')}
            </p>
          </div>

          <div className="mb-3 mb-sm-4 text-center">
            <h4 className="fw-bold mb-1" style={{ fontSize: 'clamp(1.05rem, 1.8vw, 1.3rem)' }}>
              {t('login_heading', 'Sign In to Your Account')}
            </h4>
            <p className="text-secondary small mb-0">
              {t('login_subheading', 'Enter your verified credentials to access your real estate workspace')}
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                {t('login_label_identifier', 'Email or Username')}
              </label>
              <div className="input-group">
                <span className="input-group-text border-end-0 text-muted">
                  <i className="fas fa-user"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  id="email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  autoComplete="username"
                  placeholder="Enter email or username"
                />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="input-group">
                <span className="input-group-text border-end-0 text-muted">
                  <i className="fas fa-lock"></i>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control border-start-0 border-end-0 ps-0"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter password"
                />
                <button
                  className="password-eye-btn btn btn-outline-secondary border-start-0"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  title="Show/Hide Password"
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            <div className="d-flex align-items-center justify-content-between mb-4">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label className="form-check-label small text-secondary" htmlFor="rememberMe">
                  Remember me
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2 fw-semibold mb-3 d-flex align-items-center justify-content-center"
              disabled={loading}
            >
              <span>{loading ? 'Verifying...' : 'Sign In to Dashboard'}</span>
              {loading && <span className="spinner-border spinner-border-sm ms-2" role="status"></span>}
            </button>

            <div className="text-center">
              <span className="text-secondary small">Don't have an account?</span>
              <Link to="/register" className="small fw-semibold text-primary text-decoration-none ms-1">
                Register here
              </Link>
            </div>
          </form>
        </div>

        <div className="text-center mt-3 text-secondary small">
          {t('login_footer_text', '© 2026 Real Estate CRM. Protected by Kosal IT Solutions.')}
        </div>
      </div>
    </div>
  );
}
