// src/components/admin/Bookings.jsx
import React, { useEffect, useState } from 'react';
import { Clock, Calendar } from 'lucide-react';
import api from '../../admin_api';
import { useToast } from '../contexts/ToastContext';
import "../../styles/admin.css";

const thStyle = {
  textAlign: 'left',
  padding: '0.9rem 1rem',
  fontSize: '0.75rem',
  fontWeight: 600,
  color: '#9ca3af',
  textTransform: 'uppercase',
  borderBottom: '1px solid rgba(255,255,255,0.03)'
};

const tdStyle = {
  padding: '0.9rem 1rem',
  whiteSpace: 'nowrap',
  color: '#e5e7eb',
};

const tdStyleBold = {
  ...tdStyle,
  fontWeight: 700,
  color: '#e5e7eb',
};

const cardStyle = {
  background: '#1a2332',
  padding: '1.25rem',
  borderRadius: '0.75rem',
  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
  border: '1px solid rgba(255,255,255,0.06)',
};

const tableWrapStyle = {
  overflowX: 'auto',
  borderRadius: '0.5rem',
};

const headerStyle = {
  fontSize: '1.25rem',
  fontWeight: 700,
  color: '#fbbf24',
  marginBottom: '1rem',
};

function formatDateDDMMYYYY(isoOrYmd) {
  if (!isoOrYmd) return '-';
  // accept YYYY-MM-DD or ISO
  try {
    const d = new Date(isoOrYmd);
    if (!isNaN(d.getTime())) {
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${dd}-${mm}-${yyyy}`;
    }
  } catch (e) {}
  // fallback: try splitting YYYY-MM-DD
  const parts = String(isoOrYmd).split('T')[0].split('-');
  if (parts.length === 3) {
    return `${parts[2].padStart(2, '0')}-${parts[1].padStart(2, '0')}-${parts[0]}`;
  }
  return String(isoOrYmd);
}

function dateOnly(isoOrYmd) {
  if (!isoOrYmd) return null;
  const d = new Date(isoOrYmd);
  if (!isNaN(d.getTime())) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
  const parts = String(isoOrYmd).split('T')[0].split('-');
  if (parts.length === 3) return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return null;
}

const Bookings = () => {
  const toast = useToast();
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // load bookings + users
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        // fetch bookings and users in parallel
        const [bRes, uRes] = await Promise.all([
          api.get('/bookings'),
          api.get('/users'),
        ]);
        const bookingsData = Array.isArray(bRes.data) ? bRes.data : (bRes.data?.data || []);
        const usersData = Array.isArray(uRes.data) ? uRes.data : (uRes.data?.data || []);

        if (!mounted) return;

        setUsers(usersData);
        setBookings(bookingsData);
      } catch (err) {
        console.error('Failed to load bookings or users', err);
        toast?.show?.('Failed to load bookings', { type: 'error' });
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => { mounted = false; };
  }, [toast]);

  if (loading) return <div style={{ color: '#9ca3af' }}>Loading bookings...</div>;

  return (
    <div>
      <h2 style={headerStyle}>All Bookings</h2>

      <div style={cardStyle}>
        <div style={tableWrapStyle}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead>
              <tr style={{ background: '#0f1829' }}>
                <th style={thStyle}>Booking ID</th>
                <th style={thStyle}>Customer</th>
                <th style={thStyle}>Spa Name</th>
                <th style={thStyle}>Service</th>
                <th style={thStyle}>Appointment Date & Time</th>
                <th style={thStyle}>Price</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>

            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '1rem', textAlign: 'center', color: '#9ca3af' }}>
                    No bookings found
                  </td>
                </tr>
              ) : (
                bookings.map(booking => {
                  const bookingId = booking.bookingId || booking.id || '-';
                  // try to find customer name from users list
                  const userObj = users.find(u => String(u.id) === String(booking.userId) || String(u.id) === String(booking.userId));
                  const customerName = booking.customerName || userObj?.fullName || userObj?.name || booking.userId || '-';

                  // show first service name if services array exists
                  let serviceName = '-';
                  if (Array.isArray(booking.services) && booking.services.length) {
                    serviceName = booking.services[0].name || booking.services[0].serviceName || '-';
                  } else if (booking.service) {
                    serviceName = booking.service;
                  }

                  const appointmentDate = formatDateDDMMYYYY(booking.date);
                  const time = booking.slot || booking.time || (Array.isArray(booking.services) && booking.services[0]?.slots?.[0]) || '-';

                  const price = booking.totalPrice ?? booking.price ?? booking.total ?? '-';

                  const status = String(booking.status || '').toLowerCase();

                  // color mapping
                  const borderColor = status === 'completed' ? 'rgba(16,185,129,0.2)' :
                                      status === 'approved' ? 'rgba(59,130,246,0.2)' :
                                      'rgba(239,68,68,0.2)';
                  const bgColor = status === 'completed' ? 'rgba(16,185,129,0.08)' :
                                  status === 'approved' ? 'rgba(59,130,246,0.06)' :
                                  'rgba(239,68,68,0.06)';
                  const textColor = status === 'completed' ? '#10b981' :
                                    status === 'approved' ? '#3b82f6' :
                                    '#ef4444';

                  return (
                    <tr key={bookingId} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={tdStyleBold}>{bookingId}</td>
                      <td style={tdStyle}>{customerName}</td>
                      <td style={tdStyle}>{booking.spaName || booking.spa || '-'}</td>
                      <td style={tdStyle}>{serviceName}</td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ color: '#e5e7eb', fontWeight: 600 }}>{appointmentDate}</span>
                          <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
                            <Clock size={12} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                            {time}
                          </span>
                        </div>
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 700, color: '#10b981' }}>
                        ₹{price}
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.6rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          border: `1px solid ${borderColor}`,
                          background: bgColor,
                          color: textColor,
                        }}>
                          {status || '-'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Bookings;
