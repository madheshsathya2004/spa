// src/components/admin/Dashboard.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Clock, Store, Users, Calendar } from 'lucide-react';
import api from '../../api';
import { useToast } from '../../contexts/ToastContext';

const Dashboard = ({ setCurrentPage }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);

  // raw data
  const [users, setUsers] = useState([]);
  const [spas, setSpas] = useState([]);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [spaRequests, setSpaRequests] = useState([]);

  useEffect(() => {
    let mounted = true;

    const loadAll = async () => {
      try {
        setLoading(true);
        const [uRes, sRes, svcRes, bRes, srRes] = await Promise.all([
          api.get('/users'),
          api.get('/spas'),
          api.get('/services'),
          api.get('/bookings'),
          api.get('/spa-requests'),
        ]);

        if (!mounted) return;

        setUsers(Array.isArray(uRes.data) ? uRes.data : (uRes.data?.data || []));
        setSpas(Array.isArray(sRes.data) ? sRes.data : (sRes.data?.data || []));
        setServices(Array.isArray(svcRes.data) ? svcRes.data : (svcRes.data?.data || []));
        setBookings(Array.isArray(bRes.data) ? bRes.data : (bRes.data?.data || []));
        setSpaRequests(Array.isArray(srRes.data) ? srRes.data : (srRes.data?.data || []));
      } catch (err) {
        console.error('Failed to load dashboard data', err);
        toast?.show?.('Failed to load dashboard data', { type: 'error' });
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadAll();
    return () => { mounted = false; };
  }, [toast]);

  // derived stats
  const stats = useMemo(() => {
    const totalCustomers = (users || []).filter(u => u.role === 'customer').length;
    const totalBookings = (bookings || []).length;
    // approvedOwners = number of spa_owner users who have at least one APPROVED spa
    const spaOwners = (users || []).filter(u => u.role === 'spa_owner');
    const approvedOwners = spaOwners.filter(owner => {
      return (spas || []).some(sp => String(sp.ownerId) === String(owner.id) && String(sp.status).toUpperCase() === 'APPROVED');
    });

    return {
      totalCustomers,
      totalBookings,
      approvedOwnersCount: spaOwners.length,
      spaOwners, // array (might be useful)
    };
  }, [users, spas, bookings]);

  // pending spa owner requests (spaRequests already returns spas with status PENDING)
  const pendingSpaRequests = useMemo(() => {
    return (spaRequests || []).filter(r => String(r.status).toUpperCase() === 'PENDING');
  }, [spaRequests]);

  // pending service requests: services with status PENDING
  const pendingServiceRequests = useMemo(() => {
    return (services || []).filter(s => String(s.status).toUpperCase() === 'PENDING');
  }, [services]);

  // helper get spa name by id
  const getSpaName = (spaId) => {
    const found = (spas || []).find(sp => String(sp.id) === String(spaId) || String(sp.id) === String(Number(spaId)));
    return found ? (found.name || found.spaName || '-') : '-';
  };

  // helper to get owner name by id (new)
  const getOwnerName = (ownerId) => {
    if (ownerId === undefined || ownerId === null) return '-';
    const found = (users || []).find(u => String(u.id) === String(ownerId) || String(u.id) === String(Number(ownerId)));
    return found ? (found.fullName || found.ownerName || found.name || '-') : String(ownerId);
  };

  if (loading) {
    return <div style={{ color: '#9ca3af' }}>Loading dashboard...</div>;
  }

  const cardStyle = {
    base: {
      padding: '1.5rem',
      borderRadius: '0.75rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
      color: 'white',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      background: '#1a2332',
    },
  };

  const gradientButtonStyle = {
    background: 'linear-gradient(to right, #9333ea, #ec4899)',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'transform 0.2s',
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#fbbf24' }}>
        🏠 Find Your Perfect Spa
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Pending Spa Requests */}
        <div
          onClick={() => setCurrentPage?.('requests')}
          style={{
            ...cardStyle.base,
            cursor: 'pointer',
            transform: 'scale(1)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(147, 51, 234, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.3)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <Clock size={32} color="#ec4899" />
            <span style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>{pendingSpaRequests.length}</span>
          </div>
          <p style={{ opacity: 0.9, fontSize: '0.875rem' }}>Pending Spa Requests</p>
        </div>

        {/* Pending Service Requests */}
        <div
          onClick={() => setCurrentPage?.('service-requests')}
          style={{
            ...cardStyle.base,
            cursor: 'pointer',
            transform: 'scale(1)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(147, 51, 234, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.3)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <Clock size={32} color="#ec4899" />
            <span style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>{pendingServiceRequests.length}</span>
          </div>
          <p style={{ opacity: 0.9, fontSize: '0.875rem' }}>Pending Service Requests</p>
        </div>

        {/* Approved Spa Owners */}
        <div
          onClick={() => setCurrentPage?.('spa-owners')}
          style={{
            ...cardStyle.base,
            cursor: 'pointer',
            transform: 'scale(1)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(147, 51, 234, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.3)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <Store size={32} color="#9333ea" />
            <span style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>{stats.approvedOwnersCount}</span>
          </div>
          <p style={{ opacity: 0.9, fontSize: '0.875rem' }}>Active Spa Owners</p>
        </div>

        {/* Customers */}
        <div
          onClick={() => setCurrentPage?.('customers')}
          style={{
            ...cardStyle.base,
            cursor: 'pointer',
            transform: 'scale(1)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(147, 51, 234, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.3)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <Users size={32} color="#ec4899" />
            <span style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>{stats.totalCustomers}</span>
          </div>
          <p style={{ opacity: 0.9, fontSize: '0.875rem' }}>Total Customers</p>
        </div>

        {/* All Bookings */}
        <div
          onClick={() => setCurrentPage?.('bookings')}
          style={{
            ...cardStyle.base,
            cursor: 'pointer',
            transform: 'scale(1)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(147, 51, 234, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.3)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <Calendar size={32} color="#9333ea" />
            <span style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>{stats.totalBookings}</span>
          </div>
          <p style={{ opacity: 0.9, fontSize: '0.875rem' }}>All Bookings</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        <div style={{ background: '#1a2332', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#fbbf24' }}>Recent Spa Requests</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {pendingSpaRequests.slice(0, 3).map(request => (
              <div key={request.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: '#0f1829', borderRadius: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div>
                  <p style={{ fontWeight: '600', color: '#e5e7eb', marginBottom: '0.25rem' }}>
                    <span style={{ color: '#ec4899', marginRight: '0.5rem' }}>📍</span>
                    {request.name || request.spaName || '-'}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                    Owner: {getOwnerName(request.ownerId)}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentPage?.('requests');
                  }}
                  style={gradientButtonStyle}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  Review
                </button>
              </div>
            ))}
            {pendingSpaRequests.length === 0 && (
              <p style={{ color: '#9ca3af', textAlign: 'center', padding: '1rem' }}>No pending requests</p>
            )}
          </div>
        </div>

        <div style={{ background: '#1a2332', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#fbbf24' }}>Recent Service Requests</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {pendingServiceRequests.slice(0, 3).map(service => (
              <div key={service.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: '#0f1829', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <p style={{ fontWeight: '600', color: '#e5e7eb', marginBottom: '0.25rem' }}>
                    <span style={{ color: '#ec4899', marginRight: '0.5rem' }}>💆</span>
                    {service.name || service.serviceName || '-'}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                    {getSpaName(service.spaId)}
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentPage?.('service-requests');
                  }}
                  style={gradientButtonStyle}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  Review
                </button>
              </div>
            ))}

            {pendingServiceRequests.length === 0 && (
              <p style={{ color: '#9ca3af', textAlign: 'center', padding: '1rem' }}>No pending service requests</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;