import React from "react";

export default function ServiceCard({ service, onToggle, onEdit, onDelete }) {
  if (!service) return null;

  return (
    <div
      className="card spa-card interactive"
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
            className="spa-card-image"
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
      <div className="spa-card-body" style={{ padding: "16px" }}>
        <div className="spa-row" style={{ fontSize: "14px", display: "flex", justifyContent: "space-between" }}>
          <h6 className="spa-name m-0">{service.name}</h6>
          <span className={`spa-status ${service.status?.toLowerCase()}`} style={{ fontSize: "11px" }}>
            {service.status || "PENDING"}
          </span>
        </div>

        <p className="fw-bold mb-1" style={{ fontSize: "13px" }}>₹ {service.price}</p>
        <p className="fw-bold mb-1" style={{ fontSize: "13px" }}>{service.description}</p>
        <p className="fw-bold mb-1" style={{ fontSize: "13px" }}>Duration : {service.duration} mins</p>
        <p className="small mb-1" style={{ fontSize: "12px" }}>
          Slots: {service.slots||"No slots"}
        </p>

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