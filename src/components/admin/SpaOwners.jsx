import React, { useEffect, useState } from 'react';
import { Mail, Phone, X } from 'lucide-react';
import api from '../../admin_api';
import { useToast } from '../contexts/ToastContext';
import "../../styles/admin.css";

const SpaOwners = () => {
  const [owners, setOwners] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [ownerSpas, setOwnerSpas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSpas, setLoadingSpas] = useState(false);
  const toast = useToast();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get('/spa-owners');
        if (!mounted) return;
        setOwners(Array.isArray(res.data) ? res.data : (res.data?.data || []));
      } catch (err) {
        console.error(err);
        toast?.show?.('Failed to load spa owners', { type: 'error' });
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [toast]);

  const openDetails = async (owner) => {
    setSelectedOwner(owner);
    await fetchSpasForOwner(owner.id);
  };

  const closeModal = () => {
    setSelectedOwner(null);
    setOwnerSpas([]);
  };

  const fetchSpasForOwner = async (ownerId) => {
    try {
      setLoadingSpas(true);
      const res = await api.get(`/spas?ownerId=${ownerId}`);
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setOwnerSpas(data);
    } catch (err) {
      console.error(err);
      toast?.show?.('Failed to load spas for this owner', { type: 'error' });
      setOwnerSpas([]);
    } finally {
      setLoadingSpas(false);
    }
  };

  if (loading) return <div style={{ color: '#9ca3af' }}>Loading spa owners...</div>;

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: '#fbbf24' }}>
        Approved Spa Owners
      </h2>

      {/* Modal */}
      {selectedOwner && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '0.75rem',
        }}>
          <div style={{
            background: '#1a2332',
            borderRadius: '0.5rem',
            padding: '1rem',
            maxWidth: '32rem',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#fbbf24' }}>Spa Owner Details</h3>
              <button onClick={closeModal} style={{ color: '#9ca3af', background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.25rem' }} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Owner Info */}
              <div style={{ background: '#0f1829', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <h4 style={{ color: '#ec4899', fontSize: '0.78rem', fontWeight: '600', marginBottom: '0.5rem' }}>OWNER INFORMATION</h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: '0.15rem' }}>Name</p>
                    <p style={{ fontWeight: '600', color: '#e5e7eb', fontSize: '0.95rem' }}>{selectedOwner.ownerName}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: '0.15rem' }}>Email</p>
                    <p style={{ fontWeight: '600', color: '#e5e7eb', fontSize: '0.95rem' }}>{selectedOwner.email}</p>
                  </div>
                </div>

                <div style={{ marginTop: 8 }}>
                  <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: '0.15rem' }}>Phone</p>
                  <p style={{ fontWeight: '600', color: '#e5e7eb', fontSize: '0.95rem' }}>{selectedOwner.phone}</p>
                </div>

                {selectedOwner.createdAt && (
                  <div style={{ marginTop: 8 }}>
                    <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: '0.15rem' }}>Joined</p>
                    <p style={{ fontWeight: '600', color: '#e5e7eb', fontSize: '0.95rem' }}>{selectedOwner.createdAt.split('T')[0]}</p>
                  </div>
                )}
              </div>

              {/* Spas list */}
              <div style={{ background: '#0f1829', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <h4 style={{ color: '#ec4899', fontSize: '0.78rem', fontWeight: '600', marginBottom: '0.5rem' }}>SPAS (Owned)</h4>

                {loadingSpas ? (
                  <div style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Loading spas...</div>
                ) : ownerSpas.length === 0 ? (
                  <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>No spas found for this owner.</p>
                ) : (
                  <div style={{ display: 'grid', gap: '0.5rem' }}>
                    {ownerSpas.map(spa => (
                      <div key={spa.id} style={{ padding: '0.5rem', background: '#1a2332', borderRadius: '0.375rem', border: '1px solid rgba(255,255,255,0.03)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                          <div>
                            <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#e5e7eb', marginBottom: 2 }}>{spa.name}</p>
                            {spa.description && <p style={{ color: '#9ca3af', fontSize: '0.82rem', marginTop: 2 }}>{spa.description}</p>}
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.82rem', color: spa.available ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                              {spa.available ? 'Available' : 'Closed'}
                            </div>
                            {spa.status && <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>{spa.status}</div>}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: 8, marginTop: 6, fontSize: '0.82rem', color: '#9ca3af' }}>
                          <div>Employees: <span style={{ color: '#e5e7eb', fontWeight: 600 }}>{spa.employeesCount ?? '-'}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={closeModal} style={{ width: '100%', background: 'linear-gradient(to right, #9333ea, #ec4899)', color: 'white', padding: '0.6rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cards Grid (front page) - show only owner name, phone and email */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
        {owners.map(owner => (
          <div key={owner.id} style={{ background: '#1a2332', padding: '0.9rem', borderRadius: '0.5rem', boxShadow: '0 6px 10px -3px rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e5e7eb', marginBottom: 2 }}>{owner.ownerName}</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem', color: '#9ca3af' }}>
                <Mail size={14} color="#ec4899" />
                <span style={{ color: '#e5e7eb' }}>{owner.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem', color: '#9ca3af' }}>
                <Phone size={14} color="#ec4899" />
                <span style={{ color: '#e5e7eb' }}>{owner.phone}</span>
              </div>
            </div>

            <div style={{ paddingTop: '0.6rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }} />

            <button onClick={() => openDetails(owner)} style={{ width: '100%', marginTop: '0.6rem', background: 'linear-gradient(to right, #9333ea, #ec4899)', color: 'white', padding: '0.55rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.92rem' }}>
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpaOwners;
