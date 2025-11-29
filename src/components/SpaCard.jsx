import React from "react";

/**
 * Props:
 *  - spa: object
 *  - onEdit: fn
 *  - onDelete: fn
 *  - onToggleAvailability: fn
 */
export default function SpaCard({ spa, onEdit, onDelete, onToggleAvailability }) {
  if (!spa) return null;
  const imgSrc = (spa.images && spa.images[0]) || "/mnt/data/17639612578352311144581381219381.jpg";

  return (
    <div className="card spa-card interactive" title={spa.name}>
      <div className="spa-top">
        <img src={imgSrc} alt={spa.name || "spa"} className="spa-card-image" />
        <div className={`availability-pill ${spa.available ? "on" : "off"}`}>
          <div
            className={`switch ${spa.available ? "on" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleAvailability && onToggleAvailability(spa.id);
            }}
            role="button"
            aria-label="toggle-availability"
          >
            <div className="knob" />
          </div>
        </div>
      </div>

      <div className="spa-card-body">
        <div className="spa-row">
          <h5 className="spa-name">{spa.name}</h5>
          <span className={`spa-status ${spa.status?.toLowerCase()}`}>{spa.status || "PENDING"}</span>
        </div>

        <p className="spa-desc">{spa.description}</p>
        <h6 className="spa-desc">Location : {spa.location}</h6>
        <h6 className="spa-desc">Phone Number : {spa.phoneNumber}</h6>

        <div className="spa-meta-row">
          <span className="spa-employees">Employees: {spa.employeesCount ?? 0}</span>
          


          <div className="card-actions">
            <button
              className="btn btn-sm btn-outline"
              onClick={(e) => {
                e.stopPropagation();
                onEdit && onEdit(spa);
              }}
            >
              Edit
            </button>
            <button
              className="btn btn-sm btn-danger"
              onClick={(e) => {
                e.stopPropagation();
                onDelete && onDelete(spa.id);
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

