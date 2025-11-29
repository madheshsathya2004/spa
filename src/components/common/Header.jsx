import React from 'react';
import { Menu, Home } from 'lucide-react';
import "../styles/admin.css"

const Header = ({ pendingRequests = 0, onMenuToggle, setCurrentPage }) => {
  return (
    <div
      style={{
        background: "#1a2332",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        padding: "1rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "4rem",
        position: "sticky",
        top: 0,
        zIndex: 30,
        color: "#e5e7eb",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <button
          onClick={() => setCurrentPage('dashboard')}
          style={{
            padding: "0.5rem",
            background: "#0f1829",
            color: "#e5e7eb",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "0.5rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label="Home"
        >
          <Home size={20} />
        </button>

        <h1
          style={{
            fontSize: "1.25rem",
            fontWeight: "700",
            color: "#fbbf24",
            letterSpacing: "0.5px",
          }}
        >
          ADMIN DASHBOARD
        </h1>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
        <button
          onClick={onMenuToggle}
          style={{
            padding: "0.5rem 0.6rem",
            background: "#0f1829",
            color: "#e5e7eb",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "0.5rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label="Toggle Menu"
        >
          <Menu size={20} />
        </button>
      </div>
    </div>
  );
};

export default Header;
