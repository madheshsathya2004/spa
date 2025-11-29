import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './index1.css';

const API_BASE_URL = 'http://localhost:5000/api/customer';

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

  // --- Booking Fields ---
  const bookingId = bookingDetails?.bookingId;
  const spaId = bookingDetails?.spaId;
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

  // --- Payment State ---
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
  });

  const [upiId, setUpiId] = useState('');
  const [selectedUpiApp, setSelectedUpiApp] = useState('');

  const handleCardChange = (e) => {
    setCardDetails({ ...cardDetails, [e.target.name]: e.target.value });
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();

    if (paymentMethod === 'card' && cardDetails.cardNumber.length < 16) {
      alert("Invalid card number");
      return;
    }

    if (paymentMethod === 'upi' && !upiId && !selectedUpiApp) {
      alert("Please select a UPI app or enter your UPI ID.");
      return;
    }

    // Handle membership payment
    if (isMembership) {
      if (!currentUser) {
        alert("Please log in to activate membership.");
        navigate("/login");
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
        setMembershipStatus(result.membership);

        alert(`🎉 Membership Activated! Valid till ${new Date(result.membership.endDate).toLocaleDateString()}`);
        navigate("/membership");
      } catch (error) {
        console.error("Membership activation error:", error);
        alert(`Unable to activate membership: ${error.message}`);
      }
      return;
    }

    // Handle booking payment
    try {
      const paymentDetails =
        paymentMethod === 'card'
          ? { cardNumber: cardDetails.cardNumber, cardHolder: cardDetails.cardHolder }
          : { upiApp: selectedUpiApp, upiId };

      console.log("Completing payment for booking ID:", bookingId);

      // Complete the payment using PATCH endpoint
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod,
          paymentDetails,
          totalPrice: totalPrice,
          discountPrice: discountRate > 0 ? discountAmount : 0
        })
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to complete payment");
      }

      const result = await response.json();
      console.log("Payment completed:", result.booking);

      alert(`✅ Payment Successful!\nPayment Reference: ${result.booking.paymentReference}\nAmount Paid: ₹${totalPrice.toFixed(2)}`);
      navigate(`/bookings/${currentUser.id}`);

    } catch (error) {
      console.error("Payment error:", error);
      alert(`Payment failed: ${error.message}`);
    }
  };

  return (
    <div className="payment-page">
      <h2>🔒 Secure Payment</h2>
      <div className="payment-container">
        {/* Summary Box */}
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
              {membershipLoading && (
                <p className="discount-line">Checking membership benefits...</p>
              )}
              {!membershipLoading && discountRate > 0 && (
                <p className="discount-line">
                  <strong>Membership Discount (30%):</strong> -₹{discountAmount.toFixed(2)}
                </p>
              )}
              <h3>Total: ₹{totalPrice.toFixed(2)}</h3>
            </>
          )}
        </div>

        {/* Payment Methods */}
        <div className="payment-methods">
          <h3>Choose Payment Method</h3>
          <div className="payment-method-tabs">
            <div
              className={`payment-tab ${paymentMethod === 'card' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('card')}
            >
              <span className="payment-tab-icon">💳</span>
              Card
            </div>
            <div
              className={`payment-tab ${paymentMethod === 'upi' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('upi')}
            >
              <span className="payment-tab-icon">📱</span>
              UPI
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmitPayment} className="payment-form">
          {/* CARD PAYMENT */}
          {paymentMethod === 'card' && (
            <>
              <h3>Card Details</h3>
              <div className="form-group">
                <label>Card Number</label>
                <input
                  type="text"
                  maxLength="16"
                  name="cardNumber"
                  value={cardDetails.cardNumber}
                  onChange={handleCardChange}
                  placeholder="1234 5678 9012 3456"
                  required
                />
              </div>
              <div className="form-group">
                <label>Card Holder</label>
                <input
                  type="text"
                  name="cardHolder"
                  value={cardDetails.cardHolder}
                  onChange={handleCardChange}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Expiry</label>
                  <input
                    type="text"
                    name="expiryDate"
                    placeholder="MM/YY"
                    maxLength="5"
                    value={cardDetails.expiryDate}
                    onChange={handleCardChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>CVV</label>
                  <input
                    type="text"
                    name="cvv"
                    maxLength="4"
                    placeholder="123"
                    value={cardDetails.cvv}
                    onChange={handleCardChange}
                    required
                  />
                </div>
              </div>
            </>
          )}

          {/* UPI PAYMENT */}
          {paymentMethod === 'upi' && (
            <div className="upi-payment">
              <h3>UPI Payment</h3>
              <div className="form-group">
                <label>Enter UPI ID</label>
                <input
                  type="text"
                  placeholder="yourname@upi"
                  value={upiId}
                  onChange={(e) => {
                    setUpiId(e.target.value);
                    setSelectedUpiApp('');
                  }}
                />
              </div>
            </div>
          )}

          <button type="submit" className="btn-pay">
            Pay ₹{totalPrice.toFixed(2)}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentPage;