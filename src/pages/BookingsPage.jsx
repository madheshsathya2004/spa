import React, { useEffect, useState } from "react";
import BookingCard from "../components/BookingCard";

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [spas, setSpas] = useState([]);
  const [filter, setFilter] = useState("ALL");

  const ownerId = 6;

  useEffect(() => {
    Promise.all([
      fetch(`http://localhost:5000/bookings/${ownerId}`).then((r) => r.json()),
      fetch("http://localhost:5000/profile/").then((r) => r.json()),
      fetch("http://localhost:5000/spas/").then((r) => r.json())
    ])
      .then(([bookingData, userData, spaData]) => {
        setUsers(userData);
        setSpas(spaData);

        const mappedBookings = bookingData.map((b) => {
          const user = userData.find((u) => u.id === b.userId);
          const spa = spaData.find((s) => s.id === b.spaId);

          return {
            ...b,
            userName: user ? user.fullName : "Guest",
            spaName: spa ? spa.name : "",
            serviceNames: Array.isArray(b.services)
              ? b.services.map((s) => s.name).join(", ")
              : "",
            status: b.status || "PENDING"
          };
        });

        setBookings(mappedBookings);
      })
      .catch((err) => console.error("Fetch Error:", err));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await fetch(`http://localhost:5000/bookings/update/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });

      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status } : b))
      );
    } catch (err) {
      console.error("Update Error:", err);
    }
  };

  const shownBookings =
    filter === "ALL"
      ? bookings
      : bookings.filter((b) => b.status === filter.toLowerCase());

  return (
    <div className="container mt-4">
      {/* Header + Filters */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold">Bookings</h3>

        <div className="btn-group">
          {["ALL", "PENDING", "APPROVED", "COMPLETED", "DECLINED"].map((f) => (
            <button
              key={f}
              className={`btn btn-sm ${
                filter === f ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="row g-4">
        {shownBookings.length === 0 ? (
          <div className="text-center text-muted fs-4 mt-5">
            No bookings found
          </div>
        ) : (
          shownBookings.map((b) => (
            <div className="col-md-3" key={b.id}>
              <BookingCard booking={b} onAction={updateStatus} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

