// frontend/src/components/admin/SpaRequests.jsx
import React, { useEffect, useState } from 'react';
import { X, Eye } from 'lucide-react';
import api from '../../api';
import { useToast } from '../../contexts/ToastContext';

const SpaRequests = () => {
  const [spaRequests, setSpaRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [processing, setProcessing] = useState(false);
  const toast = useToast();

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        // fetch spa entries with status PENDING
        const spaRes = await api.get('/spa-requests');
        // fetch users to map owner info
        const usersRes = await api.get('/users');

        const spas = Array.isArray(spaRes.data) ? spaRes.data : (spaRes.data?.data || []);
        const users = Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data?.data || []);

        const userById = {};
        users.forEach(u => { userById[String(u.id)] = u; });

        // normalize each spa into a "request" object expected by UI
        const requests = spas.map(spa => {
          const owner = userById[String(spa.ownerId)] || {};
          return {
            id: spa.id,
            spaName: spa.name || spa.spaName || 'Unnamed Spa',
            ownerName: owner.fullName || owner.ownerName || owner.name || 'Unknown Owner',
            email: owner.email || spa.email || '',
            phone: owner.phone || spa.phone || '',
            location: spa.location || owner.location || '',
            registrationDate: spa.createdAt || spa.registeredAt || owner.createdAt || '',
            documents: spa.documents || owner.documents || [],
            status: (spa.status || 'pending').toLowerCase(),
            rawSpa: spa,
            rawOwner: owner,
          };
        });

        if (!mounted) return;
        setSpaRequests(requests);
      } catch (err) {
        console.error('Failed loading spa requests', err);
        toast?.show?.('Failed to load spa requests', { type: 'error' });
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [toast]);

  const refresh = async () => {
    setLoading(true);
    try {
      const spaRes = await api.get('/spa-requests');
      const usersRes = await api.get('/users');

      const spas = Array.isArray(spaRes.data) ? spaRes.data : (spaRes.data?.data || []);
      const users = Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data?.data || []);
      const userById = {};
      users.forEach(u => { userById[String(u.id)] = u; });

      const requests = spas.map(spa => {
        const owner = userById[String(spa.ownerId)] || {};
        return {
          id: spa.id,
          spaName: spa.name || spa.spaName || 'Unnamed Spa',
          ownerName: owner.fullName || owner.ownerName || owner.name || 'Unknown Owner',
          email: owner.email || spa.email || '',
          phone: owner.phone || spa.phone || '',
          location: spa.location || owner.location || '',
          registrationDate: spa.createdAt || spa.registeredAt || owner.createdAt || '',
          documents: spa.documents || owner.documents || [],
          status: (spa.status || 'pending').toLowerCase(),
          rawSpa: spa,
          rawOwner: owner,
        };
      });

      setSpaRequests(requests);
    } catch (err) {
      console.error('Failed refreshing spa requests', err);
      toast?.show?.('Failed to refresh spa requests', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (id) => {
    if (processing) return;
    setProcessing(true);
    try {
      // call backend approve endpoint
      await api.post(`/spas/${id}/approve`);
      toast?.show?.('Spa approved', { type: 'success' });
      // update local list (remove or mark)
      setSpaRequests(prev => prev.map(r => String(r.id) === String(id) ? { ...r, status: 'approved' } : r));
      setSelectedRequest(null);
      // optionally refresh to sync
      await refresh();
    } catch (err) {
      console.error('Approve failed', err);
      toast?.show?.('Failed to approve spa', { type: 'error' });
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectRequest = async (id) => {
    if (processing) return;
    setProcessing(true);
    try {
      // mark spa as rejected
      await api.patch(`/spas/${id}`, { status: 'REJECTED', available: false });
      toast?.show?.('Spa rejected', { type: 'success' });
      setSpaRequests(prev => prev.map(r => String(r.id) === String(id) ? { ...r, status: 'rejected' } : r));
      setSelectedRequest(null);
      await refresh();
    } catch (err) {
      console.error('Reject failed', err);
      toast?.show?.('Failed to reject spa', { type: 'error' });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div style={{ color: '#9ca3af' }}>Loading spa requests...</div>;

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#fbbf24' }}>
        Spa Owner Registration Requests
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
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#fbbf24' }}>Request Details</h3>
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Spa Name</p>
                  <p style={{ fontWeight: '600', color: '#e5e7eb' }}>{selectedRequest.spaName}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Owner Name</p>
                  <p style={{ fontWeight: '600', color: '#e5e7eb' }}>{selectedRequest.ownerName}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Email</p>
                  <p style={{ fontWeight: '600', color: '#e5e7eb' }}>{selectedRequest.email}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Phone</p>
                  <p style={{ fontWeight: '600', color: '#e5e7eb' }}>{selectedRequest.phone}</p>
                </div>
              </div>

              <div>
                <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Location</p>
                <p style={{ fontWeight: '600', color: '#e5e7eb' }}>{selectedRequest.location}</p>
              </div>

              <div>
                <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Registration Date</p>
                <p style={{ fontWeight: '600', color: '#e5e7eb' }}>{selectedRequest.registrationDate?.split('T')[0] || '-'}</p>

              </div>

              <div>
                <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.5rem' }}>Submitted Documents</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {(selectedRequest.documents || []).length === 0 && (
                    <div style={{ color: '#9ca3af' }}>No documents submitted</div>
                  )}
                  {(selectedRequest.documents || []).map((doc, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem',
                      background: '#0f1829',
                      borderRadius: '0.5rem',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                    }}>
                      <span style={{ fontSize: '0.875rem', color: '#e5e7eb' }}>{doc}</span>
                      <button style={{
                        color: '#ec4899',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                      }}>
                        View
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {selectedRequest.status === 'pending' && (
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <button
                    onClick={() => handleApproveRequest(selectedRequest.id)}
                    disabled={processing}
                    style={{
                      flex: 1,
                      background: 'linear-gradient(to right, #10b981, #059669)',
                      color: 'white',
                      padding: '0.75rem 1rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      cursor: processing ? 'not-allowed' : 'pointer',
                      fontWeight: '600',
                      transition: 'transform 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    {processing ? 'Processing...' : 'Approve Request'}
                  </button>
                  <button
                    onClick={() => handleRejectRequest(selectedRequest.id)}
                    disabled={processing}
                    style={{
                      flex: 1,
                      background: 'linear-gradient(to right, #ef4444, #dc2626)',
                      color: 'white',
                      padding: '0.75rem 1rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      cursor: processing ? 'not-allowed' : 'pointer',
                      fontWeight: '600',
                      transition: 'transform 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    {processing ? 'Processing...' : 'Reject Request'}
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
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Spa Name</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Owner</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
              </tr>
            </thead>
            <tbody style={{ background: '#1a2332' }}>
              {spaRequests.map(request => (
                <tr key={request.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', fontWeight: '500', color: '#e5e7eb' }}>{request.spaName}</td>
                  <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', color: '#e5e7eb' }}>{request.ownerName}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ fontSize: '0.875rem', color: '#e5e7eb' }}>{request.email}</div>
                    <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>{request.phone}</div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', color: '#e5e7eb' }}>{request.location}</td>
                  <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', color: '#e5e7eb' }}>
                  {request.registrationDate ? request.registrationDate.split('T')[0] : '-'}
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
              ))}
              {spaRequests.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '1rem 1.5rem', color: '#9ca3af', textAlign: 'center' }}>No spa requests</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SpaRequests;
