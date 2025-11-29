import React, { useEffect, useState } from "react";
import BookingCard from "../components/BookingCard";

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [spas, setSpas] = useState([]);
  const [filter, setFilter] = useState("ALL");
const OWNER = sessionStorage.getItem("user");

const currentUser = OWNER ? JSON.parse(OWNER) : null

const ownerId = currentUser?.id || null;
if(currentUser==null)
{
  
  console.log("NO OWNER EXISTS");
}

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
      : bookings.filter((b) => b.status === filter);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Bookings</h4>

        <div className="btn-group">
          {["ALL", "PENDING", "APPROVED", "COMPLETED", "DECLINED"].map((f) => (
            <button
              key={f}
              className={`btn btn-sm ${
                filter === f ? "btn-accent" : "btn-outline-light"
              }`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="d-grid gap-3">
        {shownBookings.map((b) => (
          <BookingCard key={b.id} booking={b} onAction={updateStatus} />
        ))}
      </div>
    </>
  );
}