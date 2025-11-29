import React from "react";

export default function BookingCard({ booking, onAction }) {
  const getStatusColor = () => {
    switch (booking.status) {
      case "PENDING":
        return "#facc15"; // yellow
      case "APPROVED":
        return "#10b981"; // green
      case "COMPLETED":
        return "#0ea5e9"; // blue
      case "DECLINED":
        return "#ef4444"; // red
      default:
        return "#6b7280"; // gray
    }
  };

  return (
    <div
      className="card card-dark p-3 rounded-4 d-flex justify-content-between align-items-start"
      style={{ color: "#ffffff" }} // make text visible
    >
      <div>
        <div className="fw-semibold" style={{ color: "#ffffff" }}>
          UserName : {booking.userName}
        </div>
        <div className="small text-light">{booking.date}</div>
        <div className="small text-light">Spa: {booking.spaName}</div>

        <div className="mt-2" style={{ color: "#e5e7eb" }}>
          <strong>Services:</strong>
          <br />
          {booking.serviceNames}
        </div>

        <div className="mt-1 small" style={{ color: "#cbd5e1" }}>
          Slot: {booking.slot}
        </div>
      </div>
      <br></br>
      <div >
        <div
          className="badge rounded-pill px-3 py-2"
          style={{
            backgroundColor: getStatusColor(),
            color: "#fff",
            fontWeight: "600"
          }}
        >
          {booking.status}
        </div>
        
       {booking.status === "PENDING" && (
          <div className="mt-2 d-flex gap-2">
            <button
              className="btn btn-sm"
              style={{
                backgroundColor: "#0d6efd", // blue
                color: "white",
                border: "none"
              }}
              onClick={() => onAction(booking.id, "APPROVED")}
            >
              Approve
            </button>
            <button
              className="btn btn-sm"
              style={{
                backgroundColor: "#0d6efd", // blue
                color: "white",
                border: "none"
              }}
              onClick={() => onAction(booking.id, "DECLINED")}
            >
              Decline
            </button>
          </div>
        )}
      </div>
    </div>
  );
}