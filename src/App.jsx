import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from "react-router-dom";

// Customer Pages
import HomePage from "./components/customer/HomePage";
import SpaDetail from "./components/customer/SpaDetail";
import SlotsPage from "./components/customer/SlotsPage";
import PaymentPage from "./components/customer/PaymentPage";
import WishlistPage from "./components/customer/WishlistPage";
import MembershipPage from "./components/customer/MembershipPage";
import Bookings from "./components/customer/Bookings";
import ProfilePage from "./components/customer/ProfilePage";

// Owner Pages
import Navbar from "./components/Navbar";
import SpaPage from "./pages/SpaPage";
import ServicesPage from "./pages/ServicesPage";
import BookingsPage from "./pages/BookingsPage";

// Auth
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";

function AppNavigation({ user, setUser, selectedSpa, setSelectedSpa }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    localStorage.removeItem("spa_user");
    setUser(null);
    setSelectedSpa(null);
    navigate("/login");
  };

  if (!user) return null;

  // Owner Navbar
  if (user.role === "spa_owner") {
    return <Navbar user={user} onLogout={handleLogout} />;
  }

  // Customer Navbar
  return (
    <header style={{ padding: "1rem", borderBottom: "1px solid #ccc" }}>
      <h2>✨ Spa Booking System</h2>
      <nav style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
        <Link to="/customer">Home</Link>
        <Link to="/membership">Membership</Link>
        <Link to="/wishlist">Wishlist</Link>
        <Link to={`/bookings/${user.id}`}>Bookings</Link>
        <Link to="/profile">Profile</Link>
        <span>Hello, {user.fullName || user.email}</span>
        <button onClick={handleLogout}>Logout</button>
      </nav>
    </header>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    const storedUser = sessionStorage.getItem("user") || localStorage.getItem("spa_user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [selectedSpa, setSelectedSpa] = useState(null);
  const navigate = useNavigate();

  // Example Owner for testing (if no user exists)
  useEffect(() => {
    if (!user) {
      // Uncomment below to auto-login demo owner for testing
      /*
      const demoOwner = {
        id: 1,
        role: "OWNER",
        name: "Spa Owner",
        email: "owner@gmail.com"
      };
      localStorage.setItem("spa_user", JSON.stringify(demoOwner));
      setUser(demoOwner);
      */
    }
  }, []);

  // Redirect if not logged in
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage setUser={setUser} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <>
      <AppNavigation user={user} setUser={setUser} selectedSpa={selectedSpa} setSelectedSpa={setSelectedSpa} />
      <div className="container-xl py-5 page-fade">
        <Routes>
          {/* Customer Routes */}
          {user.role === "customer" && (
            <>
              <Route path="/customer" element={<HomePage />} />
              <Route path="/spa/:spaId/:spaName" element={<SpaDetail />} />
              <Route path="/spa/:spaId/slots" element={<SlotsPage />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/membership" element={<MembershipPage />} />
              <Route path="/bookings/:userId" element={<Bookings />} />
              <Route path="/profile" element={<ProfilePage />} />
            </>
          )}

          {/* Owner Routes */}
          {user.role === "spa_owner" && (
            <>
              <Route path="/" element={<SpaPage user={user} selectedSpa={selectedSpa} setSelectedSpa={setSelectedSpa} />} />
              <Route path="/spa" element={<SpaPage user={user} selectedSpa={selectedSpa} setSelectedSpa={setSelectedSpa} />} />
              <Route path="/services" element={<ServicesPage user={user} selectedSpa={selectedSpa} />} />
              <Route path="/bookings" element={<BookingsPage user={user} selectedSpa={selectedSpa} />} />
              <Route path="/profile" element={<ProfilePage user={user} setUser={setUser} />} />
            </>
          )}
        </Routes>
      </div>
    </>
  );
}
