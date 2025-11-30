import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './index1.css';

const API_BASE_URL = 'http://localhost:5000/api/customer';
const PAYMENT_API_URL = 'http://localhost:5000/api/payment/external';

const PaymentPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const isMembership = !!state?.membershipDetails;
  const bookingDetails = state?.bookingDetails || null;
  const membershipDetails = state?.membershipDetails || null;
  const storedUser = sessionStorage.getItem('user');
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  const [membershipStatus, setMembershipStatus] = useState(currentUser?.membership || null);
  const [membershipLoading, setMembershipLoading] = useState(!!(currentUser && !isMembership));
  const [isProcessing, setIsProcessing] = useState(false);

  const [customerUpiId, setCustomerUpiId] = useState('');
  const [upiPin, setUpiPin] = useState('');
  const [merchantUpiId] = useState('9791273986@bank'); // fixed merchant UPI

  useEffect(() => {
    if (!currentUser || isMembership) {
      setMembershipLoading(false);
      return;
    }

    const fetchMembershipStatus = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/membership/status/${currentUser.id}`);
        if (!res.ok) throw new Error('Failed to fetch membership status');
        const data = await res.json();
        setMembershipStatus(data);
      } catch (err) {
        console.error('Membership status fetch failed:', err);
      } finally {
        setMembershipLoading(false);
      }
    };

    fetchMembershipStatus();
  }, [currentUser, isMembership]);

  if (!bookingDetails && !membershipDetails) {
    return (
      <div className="spa-page-content error-message">
        <h2>Payment Error</h2>
        <p>No payment details found. Please retry.</p>
        <button className="btn-accent" onClick={() => navigate('/')}>Go Home</button>
      </div>
    );
  }

  const bookingId = bookingDetails?.bookingId;
  const spaName = bookingDetails?.spaName;
  const services = bookingDetails?.services || [];
  const bookingDate = bookingDetails?.date;
  const slot = bookingDetails?.slot;

  const basePrice = isMembership
    ? Number(membershipDetails.amount)
    : Number(bookingDetails.totalPrice);

  const hasActiveMembership = () => {
    const source = membershipStatus || currentUser?.membership;
    if (!source) return false;
    if (source.status !== 'active') return false;
    if (source.endDate) {
      const end = new Date(source.endDate);
      if (end < new Date()) return false;
    }
    return true;
  };

  const discountRate = !isMembership && hasActiveMembership() ? 0.3 : 0;
  const discountAmount = basePrice * discountRate;
  const totalPrice = basePrice - discountAmount;

  const membershipName = membershipDetails?.name || membershipDetails?.purpose || 'Spa Membership';

  // --- Process UPI Payment ---
  const processExternalPayment = async (amount, merchantUpi, customerUpi, customerPin, orderId, description) => {
    try {
      const response = await fetch(PAYMENT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount,
          merchant: {
            identifier: merchantUpi,
            identifierType: "upi_id",
            name: spaName || "Spa"
          },
          paymentMethod: {
            type: "upi",
            details: {
              upiId: customerUpi,
              pin: customerPin
            }
          },
          orderId: orderId,
          description: description
        })
      });

      const result = await response.json();

      if (!response.ok || result.status !== 'success') {
        throw new Error(result.message || 'Payment failed');
      }

      return result;
    } catch (error) {
      throw error;
    }
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (isProcessing) return;

    if (!customerUpiId || !upiPin) {
      alert("Please enter your UPI ID and PIN.");
      return;
    }

    setIsProcessing(true);

    // --- Membership Payment ---
    if (isMembership) {
      if (!currentUser) {
        alert("Please log in to activate membership.");
        navigate("/login");
        setIsProcessing(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/membership/activate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: currentUser.id,
            planName: membershipDetails?.name || membershipName
          })
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.message || "Failed to activate membership");
        }

        const result = await response.json();
        const updatedUser = { ...currentUser, membership: result.membership };
        sessionStorage.setItem("user", JSON.stringify(updatedUser));

        alert(`🎉 Membership Activated! Valid till ${new Date(result.membership.endDate).toLocaleDateString()}`);
        navigate("/membership");
      } catch (error) {
        console.error("Membership activation error:", error);
        alert(`Unable to activate membership: ${error.message}`);
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // --- Booking Payment ---
    try {
      const orderId = `BOOKING-${bookingId}`;
      const description = `Payment for ${spaName} - ${bookingDate} ${slot}`;

      const paymentResult = await processExternalPayment(
        totalPrice,
        merchantUpiId,
        customerUpiId,
        upiPin,
        orderId,
        description
      );

      const paymentDetails = {
        upiId: customerUpiId,
        transactionId: paymentResult.transactionId,
        merchantName: paymentResult.merchantName,
        merchantUpiId
      };

      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod: 'upi',
          paymentDetails,
          totalPrice,
          discountPrice: discountRate > 0 ? discountAmount : 0,
          paymentReference: paymentResult.transactionId,
          customerUpiId,
          merchantUpiId
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to complete booking");
      }

      const result = await response.json();
      alert(`✅ Payment Successful!\nTransaction ID: ${paymentResult.transactionId}\nAmount Paid: ₹${totalPrice.toFixed(2)}`);
      navigate(`/bookings/${currentUser.id}`);

    } catch (error) {
      console.error("Payment error:", error);
      alert(`Payment failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="payment-page">
      <h2>🔒 Secure Payment</h2>
      <div className="payment-container">

        {/* Summary */}
        <div className="payment-summary">
          <h3>Payment Summary</h3>
          {isMembership ? (
            <>
              <p><strong>Membership:</strong> {membershipName}</p>
              <h3>Total: ₹{totalPrice}</h3>
            </>
          ) : (
            <>
              <p><strong>Booking ID:</strong> #{bookingId}</p>
              <p><strong>Spa:</strong> {spaName}</p>
              <p><strong>Date:</strong> {bookingDate}</p>
              <p><strong>Slot:</strong> {slot}</p>
              <p><strong>Services:</strong>{" "}
                {services.map(s => (typeof s === "object" ? s.name : s)).join(", ")}
              </p>
              <p><strong>Subtotal:</strong> ₹{basePrice.toFixed(2)}</p>
              {membershipLoading && <p className="discount-line">Checking membership benefits...</p>}
              {!membershipLoading && discountRate > 0 && (
                <p className="discount-line">
                  <strong>Membership Discount (30%):</strong> -₹{discountAmount.toFixed(2)}
                </p>
              )}
              <h3>Total: ₹{totalPrice.toFixed(2)}</h3>
            </>
          )}
        </div>

        {/* UPI Payment Form */}
        <div className="payment-methods">
          <h3>UPI Payment</h3>
          <form onSubmit={handleSubmitPayment} className="payment-form">
            <div className="form-group">
              <label>Your UPI ID (Customer)</label>
              <input
                type="text"
                placeholder="9000090000@bank"
                value={customerUpiId}
                onChange={(e) => setCustomerUpiId(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Your UPI PIN</label>
              <input
                type="password"
                placeholder="Enter your 4-6 digit PIN"
                maxLength="6"
                value={upiPin}
                onChange={(e) => setUpiPin(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn-pay"
              disabled={isProcessing}
              style={{ opacity: isProcessing ? 0.6 : 1, cursor: isProcessing ? 'not-allowed' : 'pointer' }}
            >
              {isProcessing ? 'Processing...' : `Pay ₹${totalPrice.toFixed(2)}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
