import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import { useCms } from '../context/CmsContext';
import authService from '../services/authService';
import { error as showError, warning as showWarning } from '../utils/alerts';

export default function Register() {
  const { isAuthenticated, updateUser } = useAuth();
  const { t } = useCms();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    role: 'Sales Employee',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, phoneNumber, password, confirmPassword, role } = formData;

    if (!name.trim() || !email.trim() || !password) {
      showError('Please fill in all required fields.', 'Missing Information');
      return;
    }

    if (password.length < 6) {
      showWarning('Password should be at least 6 characters long.', 'Weak Password');
      return;
    }

    if (password !== confirmPassword) {
      showError('Passwords do not match. Please re-enter.', 'Password Mismatch');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.register({
        name: name.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        password,
        role,
      });

      if (res.token && res.user) {
        localStorage.setItem('crm_jwt_token', res.token);
        localStorage.setItem('crm_user_profile', JSON.stringify(res.user));
        updateUser(res.user);
      }

      Swal.fire({
        icon: 'success',
        title: 'Registration Successful!',
        text: `Account created for ${res.user.name} with role: ${res.user.role}`,
        showConfirmButton: false,
        timer: 1600,
        timerProgressBar: true,
      }).then(() => {
        navigate('/dashboard');
      });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Could not complete registration.';
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card-centered register register-container">
        <div
          className="register-card"
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
              {t('register_brand_title', 'Real Estate CRM')}
            </h2>
            <p className="text-secondary small mb-0">
              {t('register_brand_subtitle', 'Real Estate Sales & Booking Platform')}
            </p>
          </div>

          <div className="mb-3 mb-sm-4 text-center">
            <h4 className="fw-bold mb-1" style={{ fontSize: 'clamp(1.05rem, 1.8vw, 1.3rem)' }}>
              {t('register_heading', 'Create Team Account')}
            </h4>
            <p className="text-secondary small mb-0">
              {t('register_subheading', 'Join the sales and property management team')}
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-3">
              <div className="col-12">
                <label htmlFor="regName" className="form-label">
                  Full Name *
                </label>
                <div className="input-group">
                  <span className="input-group-text border-end-0 text-muted">
                    <i className="far fa-user"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    id="regName"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter full name"
                  />
                </div>
              </div>

              <div className="col-12 col-md-6">
                <label htmlFor="regEmail" className="form-label">
                  Email Address *
                </label>
                <div className="input-group">
                  <span className="input-group-text border-end-0 text-muted">
                    <i className="far fa-envelope"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control border-start-0 ps-0"
                    id="regEmail"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div className="col-12 col-md-6">
                <label htmlFor="regPhone" className="form-label">
                  Phone Number
                </label>
                <div className="input-group">
                  <span className="input-group-text border-end-0 text-muted">
                    <i className="fas fa-phone"></i>
                  </span>
                  <input
                    type="tel"
                    className="form-control border-start-0 ps-0"
                    id="regPhone"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div className="col-12 col-md-6">
                <label htmlFor="regPassword" className="form-label">
                  Password *
                </label>
                <div className="input-group">
                  <span className="input-group-text border-end-0 text-muted">
                    <i className="fas fa-lock"></i>
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control border-start-0 border-end-0 ps-0"
                    id="regPassword"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Min 6 characters"
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

              <div className="col-12 col-md-6">
                <label htmlFor="regConfirmPassword" className="form-label">
                  Confirm Password *
                </label>
                <div className="input-group">
                  <span className="input-group-text border-end-0 text-muted">
                    <i className="fas fa-check-double"></i>
                  </span>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="form-control border-start-0 border-end-0 ps-0"
                    id="regConfirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Re-enter password"
                  />
                  <button
                    className="password-eye-btn btn btn-outline-secondary border-start-0"
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    title="Show/Hide Password"
                  >
                    <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              <div className="col-12">
                <label className="form-label">
                  Assigned Account Role
                </label>
                <div className="input-group">
                  <span className="input-group-text border-end-0 text-muted">
                    <i className="fas fa-user-tag text-primary"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 bg-transparent text-secondary fw-medium"
                    value="Sales Employee (Standard Team Access)"
                    readOnly
                    disabled
                  />
                  <span className="input-group-text bg-success-subtle text-success border-start-0 small fw-semibold">
                    <i className="fas fa-lock me-1 small"></i> Default
                  </span>
                </div>
                <div className="form-text small text-muted mt-1">
                  Self-registration is strictly for Sales Employees. Administrative roles are provisioned by System Administrators.
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2 fw-semibold mb-3 d-flex align-items-center justify-content-center"
              disabled={loading}
            >
              <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
              {loading && <span className="spinner-border spinner-border-sm ms-2" role="status"></span>}
            </button>

            <div className="text-center">
              <span className="text-secondary small">Already registered?</span>
              <Link to="/login" className="small fw-semibold text-primary text-decoration-none ms-1">
                Sign in here
              </Link>
            </div>
          </form>
        </div>

        <div className="text-center mt-3 text-secondary small">
          {t('register_footer_text', 'Role permissions will be verified according to administrative policy.')}
        </div>
      </div>
    </div>
  );
}
