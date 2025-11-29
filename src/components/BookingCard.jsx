export default function BookingCard({ booking, onAction }) {
  const getStatusColor = () => {
    switch (booking.status) {
      case "pending" : return "#facc15";   // yellow
      case "approved": return "#22c55e"; // green
      case "completed": return "#0ea5e9"; // blue
      case  "declined": return "#ef4444";  // red
      default: return "#6b7280";         // gray
    }
  };

  return (
    <div
      className="card shadow-sm p-3 rounded-4 booking-card"
      style={{
        backgroundColor: "#0d1b2a",     // deep blue background
        color: "#ffffff",
        minHeight: "260px",
        border: "1px solid #1b263b",
        transition: "all 0.3s ease",
        cursor: "pointer"
      }}
    >
      <div className="text-center">
        {/* User Name */}
        <div className="fw-bold fs-5">{booking.userName}</div>

        {/* Date */}
        <div className="small text-light mt-1">
          Booking Date: <span className="fw-semibold">{booking.date}</span>
        </div>

        {/* Spa */}
        <div className="small text-light">
          Spa: <span className="fw-semibold">{booking.spaName}</span>
        </div>

        {/* Services */}
        <div className="mt-3">
          <div className="fw-bold">Services</div>
          <div className="small">{booking.serviceNames}</div>
        </div>

        {/* Slot */}
        <div className="mt-2 small">
          Slot: <span className="fw-semibold">{booking.slot}</span>
        </div>

        {/* STATUS BADGE */}
        <div
          className="badge rounded-pill px-4 py-2 mt-3"
          style={{
            backgroundColor: getStatusColor(),
            color: "white",
            fontWeight: "700",
            fontSize: "0.9rem"
          }}
        >
          {String(booking.status).toUpperCase()}
        </div>

        {/* ACTION BUTTONS */}
        {booking.status === "PENDING" || booking.status === "pending" && (
          <div className="mt-3 d-flex gap-2 justify-content-center">
            <button
              className="btn btn-sm btn-primary"
              onClick={() => onAction(booking.id, "approved")}
            >
              APPROVE
            </button>

            <button
              className="btn btn-sm btn-primary"
              onClick={() => onAction(booking.id, "declined")}
            >
              DECLINE
            </button>
          </div>
        )}
      </div>

      {/* Hover Effect Styles */}
      <style>
        {`
          .booking-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 8px 20px rgba(0, 123, 255, 0.4);
            background-color: #102a43 !important; /* lighter bluish */
            border-color: #243b53;
          }
        `}
      </style>
    </div>
  );
}

