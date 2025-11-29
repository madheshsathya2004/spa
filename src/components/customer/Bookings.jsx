import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Bookings.css';

const API_BASE_URL = 'http://localhost:5000/api/customer';

const Bookings = () => {
  const { bookingId } = useParams();
  const user = sessionStorage.getItem('user');
  const parsedUser = JSON.parse(user);
  const userId = parsedUser.id;
  const navigate = useNavigate();
  
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [membershipStatus, setMembershipStatus] = useState(parsedUser?.membership || null);
  const [membershipLoading, setMembershipLoading] = useState(true);

  useEffect(() => {
    fetchUserBookings();
    fetchMembershipStatus();
  }, [userId]);

  const fetchMembershipStatus = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/membership/status/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch membership status');
      const data = await res.json();
      setMembershipStatus(data);
    } catch (err) {
      console.error('Membership status fetch failed:', err);
    } finally {
      setMembershipLoading(false);
    }
  };

  const fetchUserBookings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/user/${userId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setBookings([]);
          setLoading(false);
          return;
        }
        throw new Error("Failed to fetch bookings");
      }

      const data = await response.json();
      const sortedBookings = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setBookings(sortedBookings);
      console.log("Bookings fetched:", sortedBookings);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const hasActiveMembership = () => {
    const source = membershipStatus || parsedUser?.membership;
    if (!source) return false;
    if (source.status !== 'active') return false;
    if (source.endDate) {
      const end = new Date(source.endDate);
      if (end < new Date()) return false;
    }
    return true;
  };

  const calculatePrice = (booking) => {
    const basePrice = Number(booking.totalPrice);
    
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return {
        basePrice: basePrice,
        discountRate: booking.discountPrice > 0 ? 0.3 : 0,
        discountAmount: booking.discountPrice || 0,
        finalPrice: basePrice
      };
    }

    const discountRate = hasActiveMembership() ? 0.3 : 0;
    const discountAmount = basePrice * discountRate;
    const finalPrice = basePrice - discountAmount;

    return {
      basePrice,
      discountRate,
      discountAmount,
      finalPrice
    };
  };

  const handlePayNow = (booking) => {
    if (booking.status !== 'approved') {
      alert("Booking must be approved before payment.");
      return;
    }

    const bookingDetails = {
      bookingId: booking.id,
      spaId: booking.spaId,
      spaName: booking.spaName,
      ownerId: booking.ownerId,
      services: booking.services,
      slot: booking.slot,
      date: booking.date,
      totalPrice: booking.totalPrice
    };

    navigate(`/payment`, { state: { bookingDetails } });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { className: 'status-pending', text: '⏳ Pending Approval', color: '#ffc107' },
      approved: { className: 'status-approved', text: '✅ Approved', color: '#17a2b8' },
      completed: { className: 'status-completed', text: '🎉 Completed', color: '#28a745' },
      cancelled: { className: 'status-cancelled', text: '❌ Cancelled', color: '#dc3545' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span 
        className={`status-badge ${config.className}`}
        style={{ backgroundColor: config.color }}
      >
        {config.text}
      </span>
    );
  };

  const handleApproveBooking = async (bookingId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/approve`, {
        method: 'PATCH'
      });

      if (!response.ok) {
        throw new Error('Failed to approve booking');
      }

      const result = await response.json();
      alert('✅ Booking approved successfully!');
      fetchUserBookings();
    } catch (err) {
      console.error('Error approving booking:', err);
      alert('Failed to approve booking');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel and refund this booking?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Refund failed');
      }
      const result = await response.json();
      alert('✅ Refund Successful! ' + (result.refund ? `Refund: $${result.refund.refundAmount}` : ''));
      fetchUserBookings();
    } catch (err) {
      console.error('Refund/cancellation failed:', err);
      alert('Refund/cancellation failed: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="booking-details-page">
        <div className="loading-container">
          <p>Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="booking-details-page">
        <div className="error-container">
          <p className="error-message">❌ Error: {error}</p>
          <button onClick={() => navigate('/')} className="btn-secondary">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="booking-details-page">
        <h2 className="page-title">📋 My Bookings</h2>
        <div className="no-bookings-container">
          <div className="no-bookings-icon">📅</div>
          <h3 className="no-bookings-title">No Bookings Yet</h3>
          <p className="no-bookings-text">You haven't made any bookings yet. Start exploring our spa services!</p>
          <button onClick={() => navigate('/customer')} className="btn-primary">
            Browse Spas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-details-page">
      <h2 className="page-title">📋 My Bookings</h2>

      {bookings.map((booking) => {
        const priceDetails = calculatePrice(booking);

        return (
          <div key={booking.id} className="booking-card">
            <div className="booking-header">
              <div>
                <h3>Booking ID: #{booking.id}</h3>
                <p className="booking-created">Created: {new Date(booking.createdAt).toLocaleString()}</p>
              </div>
              {getStatusBadge(booking.status)}
            </div>

            <div className="booking-section">
              <h4>🏨 Spa Information</h4>
              <div className="info-row">
                <span className="info-label">Spa Name:</span>
                <span className="info-value">{booking.spaName}</span>
              </div>
            </div>

            <div className="booking-section">
              <h4>📅 Appointment Details</h4>
              <div className="info-row">
                <span className="info-label">Date:</span>
                <span className="info-value">{new Date(booking.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Time Slot:</span>
                <span className="info-value">{booking.slot}</span>
              </div>
            </div>

            <div className="booking-section">
              <h4>🛁 Services Booked</h4>
              <div className="services-table">
                {booking.services.map((service, index) => (
                  <div key={index} className="service-row">
                    <span className="service-name">{service.name}</span>
                    <span className="service-price">${service.price}</span>
                  </div>
                ))}
                <div className="service-row">
                  <span className="service-name">Subtotal</span>
                  <span className="service-price">${priceDetails.basePrice.toFixed(2)}</span>
                </div>
                {membershipLoading && booking.status !== 'completed' && booking.status !== 'cancelled' && (
                  <div className="service-row">
                    <span className="service-name" style={{ fontSize: '0.9em', color: '#666' }}>
                      Checking membership benefits...
                    </span>
                    <span className="service-price"></span>
                  </div>
                )}
                {!membershipLoading && priceDetails.discountRate > 0 && (
                  <div className="service-row" style={{ color: '#28a745' }}>
                    <span className="service-name">
                      <strong>Membership Discount (30%)</strong>
                    </span>
                    <span className="service-price">
                      <strong>-${priceDetails.discountAmount.toFixed(2)}</strong>
                    </span>
                  </div>
                )}
                <div className="service-row total-row">
                  <span className="service-name"><strong>Total Amount</strong></span>
                  <span className="service-price total-price">
                    <strong>${priceDetails.finalPrice.toFixed(2)}</strong>
                  </span>
                </div>
              </div>
            </div>

            {booking.status === 'completed' && (
              <div className="booking-section">
                <h4>💰 Payment Information</h4>
                <div className="info-row">
                  <span className="info-label">Payment Method:</span>
                  <span className="info-value">{booking.paymentMethod}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Payment Reference:</span>
                  <span className="info-value">{booking.paymentReference}</span>
                </div>
                {booking.paidAt && (
                  <div className="info-row">
                    <span className="info-label">Paid At:</span>
                    <span className="info-value">{new Date(booking.paidAt).toLocaleString()}</span>
                  </div>
                )}
              </div>
            )}

            {booking.status === 'pending' && (
              <div className="info-box pending-info">
                <h4>⏳ Booking Pending Approval</h4>
                <p>Your booking has been received and is awaiting approval from the spa. You will be able to make payment once it's approved.</p>
                <p><strong>Note:</strong> Pay Now button is disabled until approval.</p>
              </div>
            )}

            {booking.status === 'approved' && (
              <div className="info-box approved-info">
                <h4>✅ Booking Approved!</h4>
                <p>Great news! Your booking has been approved. You can now proceed with payment to confirm your appointment.</p>
                {priceDetails.discountRate > 0 && (
                  <p><strong>💎 Membership Benefit:</strong> You're saving ${priceDetails.discountAmount.toFixed(2)} (30% off) with your active membership!</p>
                )}
                <p><strong>Note:</strong> Click "Pay Now" button below to complete payment.</p>
              </div>
            )}

            {booking.status === 'completed' && !booking.refund && (
              <div className="info-box completed-info">
                <h4>🎉 Booking Confirmed!</h4>
                <p>Payment completed successfully! Your appointment is confirmed. We look forward to seeing you.</p>
                {priceDetails.discountAmount > 0 && (
                  <p><strong>💎 You saved ${priceDetails.discountAmount.toFixed(2)} with your membership!</strong></p>
                )}
              </div>
            )}

            {booking.status === 'cancelled' && booking.refund && (
              <div className="info-box" style={{ borderLeftColor: '#d9534f', background: 'rgba(220,53,69,0.08)' }}>
                <h4 style={{ color: '#d9534f' }}>❌ Refunded & Cancelled</h4>
                <p><strong>Refund Status:</strong> {booking.refund.refundStatus}</p>
                <p><strong>Refund Amount:</strong> ${booking.refund.refundAmount}</p>
                {booking.refund.deductedAmount > 0 && (
                  <p><strong>Deducted (Non-Member Fee):</strong> ${booking.refund.deductedAmount}</p>
                )}
                <p><strong>Refund Date:</strong> {new Date(booking.refund.refundDate).toLocaleString()}</p>
                <p><strong>Membership at Cancellation:</strong> {booking.refund.membershipStatusAtCancel}</p>
              </div>
            )}

            <div className="booking-actions">
              <button 
                onClick={() => handlePayNow(booking)}
                className={`btn-pay-now ${booking.status !== 'approved' ? 'disabled' : ''}`}
                disabled={booking.status !== 'approved'}
                title={
                  booking.status === 'pending' 
                    ? 'Waiting for approval' 
                    : booking.status === 'completed' 
                    ? 'Payment already completed' 
                    : booking.status === 'cancelled'
                    ? 'Booking cancelled'
                    : 'Proceed to payment'
                }
              >
                {booking.status === 'pending' && '🔒 Pay Now (Pending Approval)'}
                {booking.status === 'approved' && `💳 Pay Now $${priceDetails.finalPrice.toFixed(2)}`}
                {booking.status === 'completed' && '✓ Payment Completed'}
                {booking.status === 'cancelled' && '❌ Cancelled'}
              </button>

              {booking.status === 'pending' && (
                <button 
                  onClick={() => handleApproveBooking(booking.id)}
                  className="btn-approve-test"
                  title="Test button to approve booking"
                >
                  🧪 Approve Booking (Test)
                </button>
              )}

              {booking.status === 'completed' && !booking.refund && (
                <button
                  onClick={() => handleCancelBooking(booking.id)}
                  className="btn-cancel-booking"
                  title="Cancel and refund booking"
                >
                  ❌ Cancel & Refund
                </button>
              )}
            </div>
          </div>
        );
      })}

      <button 
        onClick={() => navigate('/')}
        className="btn-secondary"
      >
        ← Back to Home
      </button>
    </div>
  );
};

export default Bookings;