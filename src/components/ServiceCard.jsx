import React from "react";


export default function ServiceCard({ service, onToggle, onEdit, onDelete }) {
  if (!service) return null;

  return (
    <div
      className="card spa-card-client interactive"
      style={{
        width: "270px",
        margin: "5px",
        borderRadius: "10px",
        padding: "5px",
        cursor: "pointer",
      }}
      title={service.name}
    >
      {/* Image + availability toggle */}
      <div className="spa-top" style={{ height: "120px", position: "relative" }}>
        {service.image && (
          <img
            src={service.image}
            alt="service"
            className="spa-card-client-image"
            style={{
              width: "100%",
              height: "120px",
              objectFit: "cover",
              borderRadius: "8px",
            }}
          />
        )}

        {/* Availability toggle */}
        <div className={`availability-pill ${service.available ? "on" : "off"}`}>
          <div
            className={`switch ${service.available ? "on" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggle && onToggle(service.id);
            }}
            role="button"
          >
            <div className="knob" />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="spa-card-client-body" style={{ padding: "16px" }}>
        <div className="spa-row" style={{ fontSize: "14px", display: "flex", justifyContent: "space-between" }}>
          <h6 className="spa-name m-0">{service.name}</h6>
          <span className={`spa-status ${service.status?.toLowerCase()}`} style={{ fontSize: "11px" }}>
            {service.status || "PENDING"}
          </span>
        </div>

        <p className="fw-bold mb-1" style={{ fontSize: "13px" }}>Price : ₹ {service.price}</p>
        <p className="fw-bold mb-1" style={{ fontSize: "13px" }}>{service.description}</p>
        <p className="fw-bold mb-1" style={{ fontSize: "13px" }}>Duration : {service.duration} mins</p>
{/* Slots */}
<div style={{ marginTop: "6px" }}>
  <span className="fw-bold" style={{ fontSize: "12px" }}>Slots:</span>
  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
    {service.slots && service.slots.length > 0 ? (
      service.slots.map((slot, index) => (
        <span
          key={index}
          style={{
            background: "#8b5cf6",
            color: "white",
            padding: "3px 8px",
            borderRadius: "8px",
            fontSize: "11px",
            fontWeight: "500",
          }}
        >
          {slot}
        </span>
      ))
    ) : (
      <span style={{ fontSize: "11px", color: "#999" }}>No Slots</span>
    )}
  </div>
</div>


        <div className="spa-meta-row" style={{ fontSize: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          
          <div className="card-actions d-flex gap-1">
            <button
              className="btn btn-sm btn-outline"
              style={{ padding: "2px 6px", fontSize: "11px" }}
              onClick={(e) => {
                e.stopPropagation();
                onEdit && onEdit(service);
              }}
            >
              Edit
            </button>

            <button
              className="btn btn-sm btn-danger"
              style={{ padding: "2px 6px", fontSize: "11px" }}
              onClick={(e) => {
                e.stopPropagation();
                onDelete && onDelete(service.id);
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}