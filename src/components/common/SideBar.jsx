import React from 'react';
import { Calendar, Users, Store, LogOut, X, Clock, TrendingUp, Package, CheckCircle } from 'lucide-react';
import "../styles/admin.css"

const Sidebar = ({ currentPage, setCurrentPage, sidebarOpen, setSidebarOpen, pendingRequests = 0, pendingServiceRequests = 0 }) => {
  const menuItems = [
    { id: 'dashboard', icon: TrendingUp, label: 'Dashboard' },
    { id: 'requests', icon: Clock, label: 'Spa Requests', badge: pendingRequests },
    { id: 'spa-owners', icon: Store, label: 'Spa Owners' },
    { id: 'service-requests', icon: Package, label: 'Service Requests', badge: pendingServiceRequests },
    { id: 'spa-services', icon: CheckCircle, label: 'Spa Services' },
    { id: 'customers', icon: Users, label: 'Customers' },
    { id: 'bookings', icon: Calendar, label: 'All Bookings' },
  ];
  
  const menuWidth = '18rem';

  const sidebarStyle = {
    background: 'linear-gradient(to bottom, #312e81, #3730a3)',
    color: 'white',
    transition: 'transform 0.3s ease-in-out, visibility 0.3s ease-in-out',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    position: 'fixed',
    right: 0,
    top: 0,
    zIndex: 50,
    width: menuWidth,
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
    transform: sidebarOpen ? 'translateX(0)' : `translateX(${menuWidth})`,
    visibility: sidebarOpen ? 'visible' : 'hidden',
  };

  const mobileOverlayStyle = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 40,
    transition: 'opacity 0.3s ease-in-out',
    opacity: sidebarOpen ? 1 : 0,
    pointerEvents: sidebarOpen ? 'auto' : 'none', 
  };
  
  const getMenuItemStyle = (itemId) => ({
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '0.75rem',
    padding: '0.75rem',
    borderRadius: '0.5rem',
    marginBottom: '0.5rem',
    background: currentPage === itemId ? 'rgba(255,255,255,0.2)' : 'transparent',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    position: 'relative',
    transition: 'background-color 0.2s',
  });

  const getHoverStyle = (isActive) => ({
    backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
  });

  return (
    <>
      <div 
        style={mobileOverlayStyle} 
        onClick={() => setSidebarOpen(false)}
      ></div>

      <div style={sidebarStyle}>
        <div style={{ 
          padding: '1rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          height: '4rem',
        }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Admin Menu</h1>
          <button 
            onClick={() => setSidebarOpen(false)} 
            style={{ 
              padding: '0.5rem', 
              background: 'transparent', 
              border: 'none', 
              color: 'white', 
              cursor: 'pointer', 
              borderRadius: '0.375rem',
            }}
            aria-label="Close Menu"
          >
            <X size={20} />
          </button>
        </div>
        
        <nav style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
          {menuItems.map(item => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setSidebarOpen(false);
                }}
                style={getMenuItemStyle(item.id)}
                onMouseEnter={(e) => Object.assign(e.currentTarget.style, getHoverStyle(isActive))}
                onMouseLeave={(e) => Object.assign(e.currentTarget.style, getMenuItemStyle(item.id))}
              >
                <item.icon size={20} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.label}
                </span>
                {item.badge > 0 && (
                  <span style={{
                    marginLeft: 'auto',
                    background: '#ef4444',
                    color: 'white',
                    fontSize: '0.75rem',
                    width: '1.25rem',
                    height: '1.25rem',
                    borderRadius: '9999px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    flexShrink: 0,
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        
        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button 
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: '0.75rem',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              background: 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <LogOut size={20} style={{ flexShrink: 0 }} />
            <span style={{ textAlign: 'left' }}>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
