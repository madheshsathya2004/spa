import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';

// Customer Components
import HomePage from './components/customer/HomePage';
import SpaDetail from './components/customer/SpaDetail';
import SlotsPage from './components/customer/SlotsPage';
import PaymentPage from './components/customer/PaymentPage';
import WishlistPage from './components/customer/WishlistPage';
import MembershipPage from './components/customer/MembershipPage';
import Bookings from './components/customer/Bookings';
import CustomerProfilePage from './components/customer/ProfilePage';

// Auth Components
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';

// Owner Components
import Navbar from './components/Navbar';
import SpaPage from './pages/SpaPage';
import ServicesPage from './pages/ServicesPage';
import BookingsPage from './pages/BookingsPage';
import OwnerProfilePage from './pages/ProfilePage';

// Admin Components
import AdminDashboard from './components/admin/Dashboard';
import SpaRequests from './components/admin/SpaRequests';
import ServiceRequests from './components/admin/ServiceRequests';
import SpaOwners from './components/admin/SpaOwners';
import Customers from './components/admin/Customers';
import AdminBookings from './components/admin/Bookings';
import ApprovedServices from './components/admin/ApprovedServices';

function Navigation({ user, onLogout, selectedSpa, setSelectedSpa }) {
  // If no user is logged in, show basic navigation
  if (!user) {
    return (
      <header>
        <h2>✨ Spa Booking System</h2>
        <nav>
          <Link to="/" className="link-home">Home</Link>
          <Link to="/login" className="btn-login">Login</Link>
        </nav>
      </header>
    );
  }

  // If user is spa_owner, use the Navbar from app2.jsx
  if (user.role === 'spa_owner') {
    return <Navbar user={user} onLogout={onLogout} selectedSpa={selectedSpa} setSelectedSpa={setSelectedSpa} />;
  }

  // If user is customer, show customer navigation
  if (user.role === 'customer') {
    return (
      <header>
        <h2>✨ Spa Booking System</h2>
        <nav>
          <Link to="/" className="link-home">Home</Link>
          <Link to="/membership" className="link-membership">Membership</Link>
          <Link to="/wishlist" className="link-wishlist">Wishlist</Link>
          <Link to={`/bookings/${user.id}`} className="link-bookings">Bookings</Link>
          <Link to="/profile" className="profile-link">
            <span className="user-greeting">Hello, {user.fullName || user.email}</span>
          </Link>
          <button onClick={onLogout} className="btn-logout">Logout</button>
        </nav>
      </header>
    );
  }

  // If user is admin, show admin navigation
  if (user.role === 'admin') {
    return (
      <header style={{
        background: 'linear-gradient(135deg, #1a2332 0%, #0f1829 100%)',
        padding: '1rem 2rem',
        borderBottom: '2px solid rgba(147, 51, 234, 0.3)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1400px', margin: '0 auto' }}>
          <h2 style={{ color: '#fbbf24', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
            🏛️ Admin Panel
          </h2>
          <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <Link to="/admindashboard" style={{ color: '#e5e7eb', textDecoration: 'none', fontWeight: '500', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.target.style.color = '#fbbf24'}
              onMouseLeave={(e) => e.target.style.color = '#e5e7eb'}>
              Dashboard
            </Link>
            <Link to="/admin/requests" style={{ color: '#e5e7eb', textDecoration: 'none', fontWeight: '500', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.target.style.color = '#fbbf24'}
              onMouseLeave={(e) => e.target.style.color = '#e5e7eb'}>
              Spa Requests
            </Link>
            <Link to="/admin/service-requests" style={{ color: '#e5e7eb', textDecoration: 'none', fontWeight: '500', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.target.style.color = '#fbbf24'}
              onMouseLeave={(e) => e.target.style.color = '#e5e7eb'}>
              Service Requests
            </Link>
            <Link to="/admin/spa-owners" style={{ color: '#e5e7eb', textDecoration: 'none', fontWeight: '500', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.target.style.color = '#fbbf24'}
              onMouseLeave={(e) => e.target.style.color = '#e5e7eb'}>
              Spa Owners
            </Link>
            <Link to="/admin/customers" style={{ color: '#e5e7eb', textDecoration: 'none', fontWeight: '500', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.target.style.color = '#fbbf24'}
              onMouseLeave={(e) => e.target.style.color = '#e5e7eb'}>
              Customers
            </Link>
            <Link to="/admin/bookings" style={{ color: '#e5e7eb', textDecoration: 'none', fontWeight: '500', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.target.style.color = '#fbbf24'}
              onMouseLeave={(e) => e.target.style.color = '#e5e7eb'}>
              Bookings
            </Link>
            <Link to="/admin/services" style={{ color: '#e5e7eb', textDecoration: 'none', fontWeight: '500', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.target.style.color = '#fbbf24'}
              onMouseLeave={(e) => e.target.style.color = '#e5e7eb'}>
              Services
            </Link>
            <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
              {user.fullName || user.email}
            </span>
            <button 
              onClick={onLogout} 
              style={{
                background: 'linear-gradient(to right, #ef4444, #dc2626)',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.875rem',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Logout
            </button>
          </nav>
        </div>
      </header>
    );
  }

  return null;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [selectedSpa, setSelectedSpa] = useState(null);
  const [currentAdminPage, setCurrentAdminPage] = useState('dashboard');
  const navigate = useNavigate();

  // Check authentication status on mount and when storage changes
  useEffect(() => {
    checkAuthStatus();
    
    const handleStorageChange = () => {
      checkAuthStatus();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const checkAuthStatus = () => {
    const token = sessionStorage.getItem('token');
    const userData = sessionStorage.getItem('user');
    
    if (token && userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    } else {
      setUser(null);
      setSelectedSpa(null);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    localStorage.removeItem('spa_user');
    setUser(null);
    setSelectedSpa(null);
    navigate('/');
  };

  return (
    <div className="App" style={{ minHeight: '100vh', background: user?.role === 'admin' ? '#0f1829' : 'inherit' }}>
      <Navigation 
        user={user} 
        onLogout={handleLogout}
        selectedSpa={selectedSpa}
        setSelectedSpa={setSelectedSpa}
      />
      
      <div className={user?.role === 'admin' ? '' : 'container-xl py-5 page-fade'} style={user?.role === 'admin' ? { padding: '2rem', maxWidth: '1400px', margin: '0 auto' } : {}}>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={
              !user ? <LoginPage /> : 
              <Navigate to={
                user.role === 'spa_owner' ? '/ownerdashboard' : 
                user.role === 'admin' ? '/admindashboard' : 
                '/'
              } />
            } 
          />
          <Route 
            path="/register" 
            element={
              !user ? <RegisterPage /> : 
              <Navigate to={
                user.role === 'spa_owner' ? '/ownerdashboard' : 
                user.role === 'admin' ? '/admindashboard' : 
                '/'
              } />
            } 
          />
          
          {/* Customer Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/spa/:spaId/:spaName" element={<SpaDetail />} />
          <Route path="/spa/:spaId/slots" element={<SlotsPage />} />
          <Route 
            path="/payment" 
            element={user?.role === 'customer' ? <PaymentPage /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/wishlist" 
            element={user?.role === 'customer' ? <WishlistPage /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/membership" 
            element={user?.role === 'customer' ? <MembershipPage /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/bookings/:userId" 
            element={user?.role === 'customer' ? <Bookings /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/profile" 
            element={user?.role === 'customer' ? <CustomerProfilePage /> : <Navigate to="/login" />} 
          />

          {/* Owner Routes */}
          <Route 
            path="/ownerdashboard" 
            element={user?.role === 'spa_owner' ? <SpaPage user={user} selectedSpa={selectedSpa} setSelectedSpa={setSelectedSpa} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/spa" 
            element={user?.role === 'spa_owner' ? <SpaPage user={user} selectedSpa={selectedSpa} setSelectedSpa={setSelectedSpa} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/services" 
            element={user?.role === 'spa_owner' ? <ServicesPage user={user} selectedSpa={selectedSpa} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/bookings" 
            element={user?.role === 'spa_owner' ? <BookingsPage user={user} selectedSpa={selectedSpa} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/owner/profile" 
            element={user?.role === 'spa_owner' ? <OwnerProfilePage user={user} setUser={setUser} /> : <Navigate to="/login" />} 
          />

          {/* Admin Routes */}
          <Route 
            path="/admindashboard" 
            element={user?.role === 'admin' ? <AdminDashboard setCurrentPage={(page) => {
              const routeMap = {
                'requests': '/admin/requests',
                'service-requests': '/admin/service-requests',
                'spa-owners': '/admin/spa-owners',
                'customers': '/admin/customers',
                'bookings': '/admin/bookings',
                'approved-services': '/admin/services',
              };
              if (routeMap[page]) navigate(routeMap[page]);
            }} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/admin/requests" 
            element={user?.role === 'admin' ? <SpaRequests /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/admin/service-requests" 
            element={user?.role === 'admin' ? <ServiceRequests /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/admin/spa-owners" 
            element={user?.role === 'admin' ? <SpaOwners /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/admin/customers" 
            element={user?.role === 'admin' ? <Customers /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/admin/bookings" 
            element={user?.role === 'admin' ? <AdminBookings /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/admin/services" 
            element={user?.role === 'admin' ? <ApprovedServices /> : <Navigate to="/login" />} 
          />

          {/* Fallback */}
          <Route 
            path="*" 
            element={
              <Navigate to={
                user ? (
                  user.role === 'spa_owner' ? '/ownerdashboard' : 
                  user.role === 'admin' ? '/admindashboard' : 
                  '/'
                ) : '/'
              } />
            } 
          />
        </Routes>
      </div>
    </div>
  );
}