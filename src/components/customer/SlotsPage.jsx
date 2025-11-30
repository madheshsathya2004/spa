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
    return <h2 className="page-title">Invalid Access — No Services Selected.</h2>;
  }

  const { selectedServices, spaName: initialSpaName, ownerId: initialOwnerId } = state;

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  
  const [spaDetails, setSpaDetails] = useState({
    spaName: initialSpaName || '',
    ownerId: initialOwnerId || null,
    loading: true
  });

  useEffect(() => {
    const fetchSpaDetails = async () => {
      if (initialOwnerId) {
        setSpaDetails({
          spaName: initialSpaName,
          ownerId: initialOwnerId,
          loading: false
        });
        return;
      }

      try {
        console.log(`Fetching spa details for spaId: ${spaId}`);
        
        const response = await fetch(`${API_BASE_URL}/spas/${spaId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch spa details');
        }

        const spa = await response.json();
        console.log('Fetched spa details:', spa);

        setSpaDetails({
          spaName: spa.name,
          ownerId: spa.ownerId,
          loading: false
        });

      } catch (error) {
        console.error('Error fetching spa details:', error);
        alert('Failed to load spa details. Please try again.');
        setSpaDetails(prev => ({ ...prev, loading: false }));
      }
    };

    fetchSpaDetails();
  }, [spaId, initialOwnerId, initialSpaName]);

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
        console.log('Fetched slots with availability:', data.slots);
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

  const handleSlotSelect = (slotTime) => {
    const slotObj = availableSlots.find(slot => slot.time === slotTime);
    
    if (slotObj && slotObj.isBooked) {
      alert("❌ This slot is already booked. Please select another available slot.");
      return;
    }
    
    setSelectedSlot(slotTime);
  };

  const handleBookNow = async () => {
    if (!selectedDate) {
      alert("Please select a date first.");
      return;
    }

    if (!selectedSlot) {
      alert("Please select a time slot.");
      return;
    }

    // Check if selected slot is booked
    const selectedSlotObj = availableSlots.find(slot => slot.time === selectedSlot);
    if (selectedSlotObj && selectedSlotObj.isBooked) {
      alert("❌ This slot is already booked. Please select another available slot.");
      setSelectedSlot(null);
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

    if (!spaDetails.ownerId) {
      alert("Unable to create booking: Spa owner information is missing. Please try again.");
      return;
    }

    setIsBooking(true);

    const bookingData = {
      userId: parseInt(userId),
      spaId: parseInt(spaId),
      spaName: spaDetails.spaName,
      ownerId: parseInt(spaDetails.ownerId),
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

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          alert(`❌ ${result.message}\n\nThis slot was just booked by another user. Please select a different time slot.`);
          setSelectedSlot(null);
          
          // Refresh slots to get updated availability
          const refreshResponse = await fetch(`${API_BASE_URL}/check-availability`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              spaId: parseInt(spaId),
              selectedServices: selectedServices,
              date: selectedDate
            }),
          });
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            setAvailableSlots(refreshData.slots || []);
          }
          return;
        }
        
        throw new Error(result.message || "Failed to create booking");
      }

      console.log("Booking created:", result.booking);

      alert(`✅ Booking created successfully!\n\nBooking ID: ${result.booking.id}\nStatus: ${result.booking.status}\n\nPlease wait for spa approval before making payment.`);

      navigate(`/bookings/${userId}`);

    } catch (error) {
      console.error("Error creating booking:", error);
      alert(`Failed to create booking: ${error.message}`);
    } finally {
      setIsBooking(false);
    }
  };

  if (spaDetails.loading) {
    return (
      <div className="slots-page">
        <h2 className="page-title">Loading spa details...</h2>
      </div>
    );
  }

  return (
    <div className="slots-page">
      <h2 className="page-title">📅 Book Your Appointment at {spaDetails.spaName}</h2>

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
            <li key={s.id}>{s.name} — ${s.price}</li>
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
              <div key={slot.time} className={`slot-item ${slot.isBooked ? 'booked' : ''}`}>
                <SlotButton
                  slot={slot.time}
                  isSelected={selectedSlot === slot.time}
                  onSelect={handleSlotSelect}
                  disabled={slot.isBooked}
                />
                {slot.isBooked && <span className="booked-label">Booked</span>}
              </div>
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
          disabled={!selectedSlot || !selectedDate || isBooking || !spaDetails.ownerId}
        >
          {isBooking ? 'Creating Booking...' : `Book Now ${selectedSlot ? `(${selectedSlot})` : ''}`}
        </button>
      </div>
    </div>
  );
};

export default SlotsPage;

