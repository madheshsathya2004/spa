import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom'; // Removed BrowserRouter and Router

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

// Owner Components (from app2.jsx)
import Navbar from './components/Navbar';
import SpaPage from './pages/SpaPage';
import ServicesPage from './pages/ServicesPage';
import BookingsPage from './pages/BookingsPage';
import ProfilePage from './pages/ProfilePage';

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
      <header>
        {/* Admin Header */}
      </header>
    );
  }

  return null;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [selectedSpa, setSelectedSpa] = useState(null);

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
  };

  return (
    // Removed <Router> wrapper - it should be in main.jsx
    <div className="App">
      <Navigation 
        user={user} 
        onLogout={handleLogout}
        selectedSpa={selectedSpa}
        setSelectedSpa={setSelectedSpa}
      />
      
      <div className="container-xl py-5 page-fade">
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={!user ? <LoginPage /> : <Navigate to={user.role === 'spa_owner' ? '/ownerdashboard' : '/'} />} 
          />
          <Route 
            path="/register" 
            element={!user ? <RegisterPage /> : <Navigate to={user.role === 'spa_owner' ? '/ownerdashboard' : '/'} />} 
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
            element={user?.role === 'spa_owner' ? <ProfilePage user={user} setUser={setUser} /> : <Navigate to="/login" />} 
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to={user ? (user.role === 'spa_owner' ? '/ownerdashboard' : '/') : '/'} />} />
        </Routes>
      </div>
    </div>
  );
}