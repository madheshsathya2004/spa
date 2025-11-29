import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import SlotButton from './SlotButton';

import './index1.css';

const API_BASE_URL = 'http://localhost:5000/api/customer';

const SlotsPage = () => {
  const { spaId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state || !state.selectedServices) {
    return <h2 className="page-title">Invalid Access – No Services Selected.</h2>;
  }

  const { selectedServices, spaName, ownerId } = state;

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    if (!selectedDate) return;

    const fetchSlots = async () => {
      setIsFetchingSlots(true);

      try {
        const response = await fetch(`${API_BASE_URL}/check-availability`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            spaId: parseInt(spaId),
            selectedServices: selectedServices,
            date: selectedDate
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to get slots.");
        }

        const data = await response.json();
        setAvailableSlots(data.slots || []);
        setSelectedSlot(null);

      } catch (error) {
        console.error("Error fetching slots:", error);
        setAvailableSlots([]);
      } finally {
        setIsFetchingSlots(false);
      }
    };

    fetchSlots();
  }, [spaId, selectedServices, selectedDate]);

  const handleBookNow = async () => {
    if (!selectedDate) {
      alert("Please select a date first.");
      return;
    }

    if (!selectedSlot) {
      alert("Please select a time slot.");
      return;
    }

    const user = sessionStorage.getItem('user');
    
    if (!user) {
      alert("Please login to book an appointment.");
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(user);
    const userId = parsedUser.id;

    setIsBooking(true);

    const bookingData = {
      userId: parseInt(userId),
      spaId: parseInt(spaId),
      spaName: spaName,
      ownerId: parseInt(ownerId),
      services: selectedServices,
      slot: selectedSlot,
      date: selectedDate,
      totalPrice: selectedServices.reduce((acc, s) => acc + parseFloat(s.price), 0)
    };

    console.log("Sending booking data:", bookingData);

    try {
      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create booking");
      }

      const result = await response.json();
      console.log("Booking created:", result.booking);

      alert(`✅ Booking created successfully!\nBooking ID: ${result.booking.id}\nStatus: ${result.booking.status}\n\nPlease wait for spa approval before making payment.`);

      // Navigate to user's bookings page
      navigate(`/bookings/${userId}`);

    } catch (error) {
      console.error("Error creating booking:", error);
      alert(`Failed to create booking: ${error.message}`);
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="slots-page">
      <h2 className="page-title">📅 Book Your Appointment at {spaName}</h2>

      <div className="date-picker-container">
        <label className="date-label">Select Date:</label>
        <input
          type="date"
          className="date-input"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      <div className="slots-summary">
        <h3>🛁 Selected Services:</h3>
        <ul>
          {selectedServices.map(s => (
            <li key={s.id}>{s.name} – ${s.price}</li>
          ))}
        </ul>
        <p><strong>Total: ${selectedServices.reduce((acc, s) => acc + parseFloat(s.price), 0)}</strong></p>
      </div>

      <h3>⏰ Choose a Time Slot:</h3>

      {!selectedDate ? (
        <p className="info-message">Please select a date to view available time slots.</p>
      ) : isFetchingSlots ? (
        <p className="info-message">Checking available slots...</p>
      ) : (
        <div className="slot-grid">
          {availableSlots.length > 0 ? (
            availableSlots.map(slot => (
              <SlotButton
                key={slot}
                slot={slot}
                isSelected={selectedSlot === slot}
                onSelect={setSelectedSlot}
              />
            ))
          ) : (
            <p className="info-message">No slots available for this date.</p>
          )}
        </div>
      )}

      <div className="book-now-container">
        <button
          className="btn-book-now"
          onClick={handleBookNow}
          disabled={!selectedSlot || !selectedDate || isBooking}
        >
          {isBooking ? 'Creating Booking...' : `Book Now ${selectedSlot ? `(${selectedSlot})` : ''}`}
        </button>
      </div>
    </div>
  );
};

export default SlotsPage;