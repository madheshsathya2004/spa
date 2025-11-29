// frontend/src/components/common/StatCard.jsx
import React from 'react';

const StatCard = ({ icon: Icon, value, label, color }) => {
  // Keep inline styles simple and consistent with app theme
  const base = {
    padding: '1rem',
    borderRadius: '0.75rem',
    minHeight: 120,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    border: '1px solid rgba(255,255,255,0.06)',
    background: '#1a2332',
    color: '#fff'
  };

  const valueStyle = {
    fontSize: '1.75rem',
    fontWeight: 700,
  };

  const labelStyle = {
    color: '#9ca3af',
    fontSize: '0.9rem'
  };

  return (
    <div style={base}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {Icon && <Icon size={28} />}
        <div style={valueStyle}>{value}</div>
      </div>
      <div style={labelStyle}>{label}</div>
    </div>
  );
};

export default StatCard;
