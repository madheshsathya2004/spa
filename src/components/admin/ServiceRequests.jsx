// frontend/src/components/admin/ServiceRequests.jsx
import React, { useEffect, useState } from 'react';
import { X, Eye, Clock, DollarSign, IndianRupee } from 'lucide-react';
import api from '../../admin_api';
import { useToast } from '../contexts/ToastContext';
import "../../styles/admin.css";

const eqId = (a, b) => String(a) === String(b);

const ServiceRequests = () => {
  const [services, setServices] = useState([]);
  const [spas, setSpas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const toast = useToast();

  useEffect(() => {
    let mounted = true;

    const loadAll = async () => {
      try {
        setLoading(true);
        // fetch spas and services in parallel
        const [spasRes, servicesRes] = await Promise.all([
          api.get('/spas'),
          api.get('/services'),
        ]);

        const spasData = Array.isArray(spasRes.data) ? spasRes.data : (spasRes.data?.data || []);
        const servicesData = Array.isArray(servicesRes.data) ? servicesRes.data : (servicesRes.data?.data || []);

        // filter only valid service objects and only pending ones
        const cleaned = servicesData
          .filter(s => s && (s.name || s.serviceName)) // ensure real object
          .filter(s => String(s.status || '').toUpperCase() === 'PENDING'); // only pending requests

        if (!mounted) return;

        setSpas(spasData);
        // attach spaName for quick access (if spaId matches)
        const withSpaName = cleaned.map(s => {
          const spaMatch = spasData.find(sp => eqId(sp.id, s.spaId) || eqId(sp.id, Number(s.spaId)));
          return {
            ...s,
            spaName: spaMatch ? (spaMatch.name || spaMatch.spaName || '-') : '-',
          };
        });

        setServices(withSpaName);
      } catch (err) {
        console.error('Failed to load services/spas', err);
        toast?.show?.('Failed to load service requests', { type: 'error' });
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadAll();
    return () => { mounted = false; };
  }, [toast]);

  const persistStatus = async (id, newStatus) => {
    // Optimistic UI update
    setServices(prev => prev.map(s => String(s.id) === String(id) ? { ...s, status: newStatus } : s));
    try {
      // try dedicated approve endpoint if exists
      if (newStatus === 'approved') {
        // prefer POST /services/:id/approve if you have it
        try {
          await api.post(`/services/${id}/approve`);
        } catch (e) {
          // fallback to patch
          await api.patch(`/services/${id}`, { status: 'approved' });
        }
      } else {
        await api.patch(`/services/${id}`, { status: newStatus });
      }
      toast?.show?.(`Service ${newStatus}`, { type: 'success' });
    } catch (err) {
      console.error('Failed to persist status', err);
      toast?.show?.('Failed to update service status on server', { type: 'error' });
      // revert optimistic change by reloading minimal (simple approach)
      try {
        const res = await api.get('/services');
        const servicesData = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        const cleaned = servicesData
          .filter(s => s && (s.name || s.serviceName))
          .filter(s => String(s.status || '').toUpperCase() === 'PENDING');
        setServices(cleaned);
      } catch (e) {
        // ignore
      }
    }
  };

  const handleApproveRequest = (id) => {
    persistStatus(id, 'approved');
    setSelectedRequest(null);
  };

  const handleRejectRequest = (id) => {
    persistStatus(id, 'rejected');
    setSelectedRequest(null);
  };

  if (loading) return <div style={{ color: '#9ca3af' }}>Loading service requests...</div>;

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#fbbf24' }}>
        Service Registration Requests
      </h2>

      {/* Modal */}
      {selectedRequest && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '1rem',
        }}>
          <div style={{
            background: '#1a2332',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            maxWidth: '42rem',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#fbbf24' }}>Service Request Details</h3>
              <button
                onClick={() => setSelectedRequest(null)}
                style={{
                  color: '#9ca3af',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* First row: Service Name + Spa Name */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Service Name</p>
                  <p style={{ fontWeight: '600', color: '#e5e7eb' }}>{selectedRequest.name || selectedRequest.serviceName}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Spa Name</p>
                  <p style={{ fontWeight: '600', color: '#e5e7eb' }}>{selectedRequest.spaName || '-'}</p>
                </div>
              </div>

              {/* Second row: Duration + Price */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Duration</p>
                  <p style={{ fontWeight: '600', color: '#e5e7eb' }}>{selectedRequest.duration || '-'} mins</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Price</p>
                  <p style={{ fontWeight: '600', color: '#10b981', fontSize: '1.25rem' }}>{selectedRequest.price ? `₹${selectedRequest.price}` : '-'}</p>
                </div>
              </div>

              <div>
                <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Description</p>
                <p style={{ color: '#e5e7eb', lineHeight: '1.5' }}>{selectedRequest.description || '-'}</p>
              </div>

              {String(selectedRequest.status).toLowerCase() === 'pending' && (
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <button
                    onClick={() => handleApproveRequest(selectedRequest.id)}
                    style={{
                      flex: 1,
                      background: 'linear-gradient(to right, #10b981, #059669)',
                      color: 'white',
                      padding: '0.75rem 1rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '600',
                      transition: 'transform 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    Approve Service
                  </button>
                  <button
                    onClick={() => handleRejectRequest(selectedRequest.id)}
                    style={{
                      flex: 1,
                      background: 'linear-gradient(to right, #ef4444, #dc2626)',
                      color: 'white',
                      padding: '0.75rem 1rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '600',
                      transition: 'transform 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    Reject Service
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{
        background: '#1a2332',
        borderRadius: '0.75rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#0f1829' }}>
              <tr>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#9ca3af', textTransform: 'uppercase' }}>Service Name</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#9ca3af', textTransform: 'uppercase' }}>Spa Name</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#9ca3af', textTransform: 'uppercase' }}>Duration</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#9ca3af', textTransform: 'uppercase' }}>Price</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#9ca3af', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#9ca3af', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody style={{ background: '#1a2332' }}>
              {services.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '1rem 1.5rem', color: '#9ca3af', textAlign: 'center' }}>
                    No service requests
                  </td>
                </tr>
              ) : (
                services.map(request => (
                  <tr key={request.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', fontWeight: '500', color: '#e5e7eb' }}>
                      {request.name || request.serviceName}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', color: '#e5e7eb' }}>
                      {request.spaName || '-'}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', color: '#e5e7eb' }}>
                      <Clock size={16} color="#9ca3af" style={{ display: 'inline', marginRight: '0.25rem' }} />
                      {request.duration || '-'} mins
                    </td>
                    <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', fontWeight: '600', color: '#10b981' }}>
                      <IndianRupee size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                      {request.price ? `${request.price}` : '-'}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        background: request.status === 'approved' ? 'rgba(16, 185, 129, 0.2)' :
                                  request.status === 'rejected' ? 'rgba(239, 68, 68, 0.2)' :
                                  'rgba(251, 191, 36, 0.2)',
                        color: request.status === 'approved' ? '#10b981' :
                               request.status === 'rejected' ? '#ef4444' :
                               '#fbbf24',
                        border: `1px solid ${request.status === 'approved' ? '#10b981' :
                                            request.status === 'rejected' ? '#ef4444' :
                                            '#fbbf24'}`,
                      }}>
                        {request.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                      <button
                        onClick={() => setSelectedRequest(request)}
                        style={{
                          color: '#ec4899',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#9333ea'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#ec4899'}
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ServiceRequests;
