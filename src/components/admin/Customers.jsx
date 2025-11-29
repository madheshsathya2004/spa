// src/components/admin/Customers.jsx
import React, { useEffect, useState } from 'react';
import api from '../../admin_api';
import "../../styles/admin.css";
// Convert ISO → DD-MM-YYYY
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '-';

  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();

  return `${dd}-${mm}-${yyyy}`;
};

// Auto-expire membership
const evaluateMembership = (membership) => {
  if (!membership || !membership.endDate) {
    return { status: 'not-active', ...membership };
  }

  const today = new Date();
  const end = new Date(membership.endDate);

  if (today > end) {
    return { ...membership, status: 'not-active' }; // expired
  }

  return membership;
};

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadCustomers = async () => {
      try {
        setLoading(true);

        const res = await api.get('/users');
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];

        // Filter only customers and evaluate membership
        const onlyCustomers = data
          .filter((u) => String(u.role) === 'customer')
          .map((c) => ({
            ...c,
            membership: evaluateMembership(c.membership),
          }));

        if (mounted) setCustomers(onlyCustomers);
      } catch (err) {
        console.error('Failed to load customers', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadCustomers();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <div style={{ color: '#9ca3af' }}>Loading customers...</div>;
  }

  const cardStyle = {
    background: '#1a2332',
    padding: '1.5rem',
    borderRadius: '0.75rem',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  };

  const thStyle = {
    textAlign: 'left',
    padding: '1rem 1.5rem',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#9ca3af',
    textTransform: 'uppercase',
    background: '#0f1829',
  };

  const tdStyle = {
    padding: '1rem 1.5rem',
    color: '#e5e7eb',
    whiteSpace: 'nowrap',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  };

  return (
    <div>
      <h2
        style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          marginBottom: '1.5rem',
          color: '#fbbf24',
        }}
      >
        Registered Customers
      </h2>

      <div style={cardStyle}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Customer Name</th>
                <th style={thStyle}>Contact</th>
                <th style={thStyle}>Membership Status</th>
                <th style={thStyle}>Plan Name</th>
                <th style={thStyle}>Start Date</th>
                <th style={thStyle}>End Date</th>
              </tr>
            </thead>

            <tbody>
              {customers.map((customer) => {
                const membership = customer.membership || {};

                return (
                  <tr key={customer.id}>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            background: 'rgba(147, 51, 234, 0.2)',
                            color: '#9333ea',
                            borderRadius: '9999px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 600,
                            marginRight: '0.75rem',
                          }}
                        >
                          {customer.fullName?.charAt(0)}
                        </div>
                        <span style={{ fontWeight: 600 }}>
                          {customer.fullName}
                        </span>
                      </div>
                    </td>

                    <td style={tdStyle}>
                      <div>{customer.email}</div>
                      <div style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
                        {customer.phone}
                      </div>
                    </td>

                    <td style={tdStyle}>
                      <span
                        style={{
                          padding: '0.25rem 0.75rem',
                          background:
                            membership.status === 'active'
                              ? 'rgba(16, 185, 129, 0.2)'
                              : 'rgba(239, 68, 68, 0.2)',
                          color:
                            membership.status === 'active'
                              ? '#10b981'
                              : '#ef4444',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          border: `1px solid ${
                            membership.status === 'active'
                              ? '#10b981'
                              : '#ef4444'
                          }`,
                        }}
                      >
                        {membership.status || 'not-active'}
                      </span>
                    </td>

                    <td style={tdStyle}>
                      {membership.planName || '-'}
                    </td>

                    <td style={tdStyle}>
                      {formatDate(membership.startDate)}
                    </td>

                    <td style={tdStyle}>
                      {formatDate(membership.endDate)}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Customers;
