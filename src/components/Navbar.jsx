import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar({ user, onLogout }) {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark" style={{ background: 'linear-gradient(90deg,#050816,#071026)' }}>
      <div className="container-xl">
        <Link className="navbar-brand d-flex align-items-center" to="/spa">
          <div className="rounded-circle d-flex align-items-center justify-content-center me-2" style={{width:44,height:44, background:'linear-gradient(90deg,#7c3aed,#f59e0b)'}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C8 2 5 5 5 9c0 5 7 11 7 11s7-6 7-11c0-4-3-7-7-7z" stroke="#071026" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{fontFamily:'Playfair Display, serif'}} className="fw-bold"> Welcome SpaOwner</span>
        </Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navMenu">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-3">
            <li className="nav-item"><Link className="nav-link" to="/spa">My Spa</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/services">Services</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/bookings">Bookings</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/owner/profile">Profile</Link></li>
          </ul>

          <div className="d-flex align-items-center">
            {user ? (
              <>
                <div className="text-end me-3">
                  <div className="small text-muted">Signed in as</div>
                  <div className="fw-semibold">{user.fullName}</div>
                </div>
                <button className="btn btn-outline-light" onClick={onLogout}>Logout</button>
              </>
            ) : (
              <Link className="btn btn-outline-light" to="/">Demo Login</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}