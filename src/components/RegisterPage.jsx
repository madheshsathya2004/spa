import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'customer',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [passwordStrength, setPasswordStrength] = useState({ strength: '', color: '', width: 0 });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Calculate Password Strength
  const checkPasswordStrength = (password) => {
    if (!password) {
      return { strength: '', color: '', width: 0 };
    }

    let score = 0;
    
    // Length check
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    
    // Character type checks
    if (/[a-z]/.test(password)) score++; // lowercase
    if (/[A-Z]/.test(password)) score++; // uppercase
    if (/[0-9]/.test(password)) score++; // number
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++; // special char

    // Determine strength level
    if (score <= 2) {
      return { strength: 'Weak', color: '#ef4444', width: 33 };
    } else if (score <= 4) {
      return { strength: 'Medium', color: '#f59e0b', width: 66 };
    } else {
      return { strength: 'Strong', color: '#10b981', width: 100 };
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    
    // Update password strength dynamically
    if (name === 'password') {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  // Validation Functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length >= 10 && digitsOnly.length <= 15;
  };

  const validateFullName = (name) => {
    const nameRegex = /^[a-zA-Z\s]{2,}$/;
    return nameRegex.test(name.trim());
  };

  const validateStrongPassword = (password) => {
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!/[A-Z]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!/[0-9]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one number' };
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one special character (!@#$%^&*)' };
    }
    return { isValid: true, message: 'Strong password!' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation checks
    if (!formData.fullName || !formData.email || !formData.password || !formData.role) {
      setError('Please fill in all required fields');
      showToast('Please fill in all required fields', 'error');
      return;
    }

    if (!validateFullName(formData.fullName)) {
      setError('Full name should contain at least 2 letters and only alphabets');
      showToast('Invalid full name format', 'error');
      return;
    }

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address (e.g., user@example.com)');
      showToast('Invalid email format', 'error');
      return;
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      setError('Please enter a valid phone number (10-15 digits)');
      showToast('Invalid phone number', 'error');
      return;
    }

    const passwordCheck = validateStrongPassword(formData.password);
    if (!passwordCheck.isValid) {
      setError(passwordCheck.message);
      showToast(passwordCheck.message, 'error');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      showToast('Passwords do not match', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          email: formData.email.toLowerCase().trim(),
          phone: formData.phone.trim(),
          role: formData.role,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showToast(
          `Registration successful as ${formData.role === 'customer' ? 'Customer' : 'Spa Owner'}! 🎉`,
          'success'
        );
        
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setError(data.message || 'Registration failed');
        showToast(data.message || 'Registration failed', 'error');
      }
    } catch (err) {
      console.error('Registration error:', err);
      const errorMsg = 'Unable to connect to server. Please try again.';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Toast Notification */}
      {toast.show && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: toast.type === 'success' ? '#10b981' : '#ef4444',
            color: 'white',
            padding: '16px 24px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            minWidth: '300px',
            animation: 'slideIn 0.3s ease-out',
          }}
        >
          <span style={{ fontSize: '20px' }}>
            {toast.type === 'success' ? '✓' : '✕'}
          </span>
          <span style={{ flex: 1, fontSize: '14px', fontWeight: '500' }}>
            {toast.message}
          </span>
        </div>
      )}

      <div className="auth-container auth-container-large">
        <div className="auth-header">
          <h1>✨ Create Account</h1>
          <p>Join us for a relaxing spa experience</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div style={{
              padding: '12px',
              backgroundColor: '#fee',
              color: '#c33',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="fullName"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <small style={{ color: '#666', fontSize: '12px' }}>
              At least 2 letters, alphabets only
            </small>
          </div>

          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              name="email"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <small style={{ color: '#666', fontSize: '12px' }}>
              Must be a valid email format
            </small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="number"
                name="phone"
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={handleChange}
                disabled={loading}
              />
              <small style={{ color: '#666', fontSize: '12px' }}>
                10-15 digits (optional)
              </small>
            </div>

            <div className="form-group">
              <label>Role *</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="form-select"
                disabled={loading}
              >
                <option value="customer">Customer</option>
                <option value="spa_owner">Spa Owner</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                name="password"
                placeholder="Min. 8 characters"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
              />
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '4px'
                  }}>
                    <small style={{ fontSize: '12px', color: '#666' }}>
                      Password Strength:
                    </small>
                    <small style={{ 
                      fontSize: '12px', 
                      fontWeight: '600',
                      color: passwordStrength.color 
                    }}>
                      {passwordStrength.strength}
                    </small>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '4px',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${passwordStrength.width}%`,
                      height: '100%',
                      backgroundColor: passwordStrength.color,
                      transition: 'all 0.3s ease'
                    }} />
                  </div>
                </div>
              )}
              
              <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '8px' }}>
                Must include: uppercase, lowercase, number, special character
              </small>
            </div>

            <div className="form-group">
              <label>Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <small style={{ color: '#666', fontSize: '12px' }}>
                Must match password
              </small>
            </div>
          </div>

          <button type="submit" className="btn-auth" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/" className="link-accent">
                Sign In
              </Link>
            </p>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default RegisterPage;