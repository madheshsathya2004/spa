
import React from 'react';
import { Link } from 'react-router-dom';
import './index1.css';
const SpaCard = ({ spa }) => {
  const spaImage =
    spa.images && spa.images.length > 0
      ? spa.images[0]
      : "https://via.placeholder.com/300x200?text=No+Image";

  return (
    <div className="card-dark spa-card">
      
      <img
        src={spaImage}
        alt={spa.name}
        className="spa-card-image"
      />

      <h3>{spa.name}</h3>

      <p className="spa-card-details">
        {spa.description || "Relaxing wellness experience"}
      </p>

      <Link to={`/spa/${spa.id}/${spa.name}`}>
        <button className="btn-accent">View Spa</button>
      </Link>
    </div>
  );
};

export default SpaCard;