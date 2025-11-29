import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import './index1.css';

const ServiceCard = ({ service, onToggleService, isSelected }) => {
  const [added, setAdded] = useState(false);
  const [error, setError] = useState('');
  const navigate=useNavigate()

  const addToWishlist = async () => {
    const user = sessionStorage.getItem('user');
    if (!user) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(user);

    try {
      const response = await fetch("http://localhost:5000/api/customer/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceId: service.id,
          name: service.name,
          price: service.price,
          userId: parsedUser.id,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to add to wishlist");
      }

      setAdded(true);
      setError('');
      setTimeout(() => setAdded(false), 1500);
    } catch (err) {
      console.error("Add to wishlist failed:", err);
      setError(err.message);
    }
  };

  return (
    <div className="service-card">
      <div className="service-info">
        <h4>{service.name}</h4>

        <p>
          Duration: {Number(service.duration)} mins | 
          Price: ₹{Number(service.price)}
        </p>

        <button
          className={`btn-wishlist ${added ? "added" : ""}`}
          onClick={addToWishlist}
          disabled={added}
        >
          {added ? "✓ Added to Wishlist" : "Add to Wishlist"}
        </button>
        {error && <p style={{ color: 'red', marginTop: '4px' }}>{error}</p>}
      </div>

      <button
        onClick={() => onToggleService(service)}
        className="btn-select-service"
        style={{
          background: isSelected
            ? "linear-gradient(90deg, #10b981, #059669)"
            : "linear-gradient(90deg, #8b5cf6, #fbbf24)",
          color: "#071026",
          transition: "0.2s",
        }}
      >
        {isSelected ? "✓ Added" : "Add"}
      </button>
    </div>
  );
};

export default ServiceCard;