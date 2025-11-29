import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = () => {
  const[toast, setToast] = useState({show : false, message : '', type : ''})

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  //const [error, setError] = useState('');

  function showToast(message, type = 'success') {
    setToast({show : true, message, type});
    setTimeout(()=>{
      setToast({show : false, message : '', type : ''});
    }, 3000);
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.email || !formData.password) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
       console.log("data sucess");
        // Store token in Session Storage
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('user', JSON.stringify(data.user));
        showToast('Login Success', 'success');
        window.dispatchEvent(new Event('storage'));
        setTimeout(() => {
          const role = data.user.role;
          if(role === 'customer') {
            
            navigate('/')
          }
          else if (role === 'spa_owner') {
            navigate('/ownerdashboard')
          }
          else if (role === 'admin') {
            navigate('/admindashboard')
          }
        }, 0);
        

      } else {
        let msg = data.message || 'Login failed';
        showToast(msg, 'error');
      }
    } catch (err) {
      console.error('Login error:', err);
      showToast('Unable to connect to server. Please try again.', 'error');
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
          <span style={{ flex: 1, fontSize: '14px', fontWeight: '500' , color : 'white'}}>
            {toast.message}
          </span>
        </div>
      )}

      <div className="auth-container">
        <div className="auth-header">
          <h1>✨ Welcome Back</h1>
          <p>Sign in to continue your spa journey</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* {error && (
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
          )} */}

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={handleChange}
              //required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              //required
              disabled={loading}
            />
          </div>
          
          <button type="submit" className="btn-auth" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="link-accent">
                Sign Up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
