

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ServiceCard from './ServiceCard';
import './index1.css';

const API_BASE_URL = 'http://localhost:5000/api/customer';

const SpaDetail = () => {
  const { spaId, spaName } = useParams();
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/spas/${spaId}/services`);

        if (response.status === 403) {
          throw new Error('This spa is not yet approved for booking. Please check back later.');
        }

        if (response.status === 404) {
          throw new Error('No approved services found for this spa.');
        }

        if (!response.ok) {
          throw new Error('Failed to load services. Please try again.');
        }

        const data = await response.json();
        setServices(data);

      } catch (err) {
        console.error("Error fetching services:", err);
        setError(err.message);
        setServices([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, [spaId]);

  const handleToggleService = (service) => {
    setSelectedServices(prev => {
      if (prev.find(s => s.id === service.id)) {
        return prev.filter(s => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

  const handleCheckAvailability = () => {
    if (selectedServices.length === 0) {
      alert("Please select at least one service.");
      return;
    }

    navigate(`/spa/${spaId}/slots`, {
      state: {
        selectedServices,
        spaName
      }
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="spa-detail-page">
        <h2 className="page-title">Loading Services...</h2>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="spa-detail-page">
        <div className="error-container">
          <h2 className="page-title">⚠️ {spaName}</h2>
          <p className="error-message">{error}</p>
          <button 
            className="btn-accent" 
            onClick={() => navigate('/')}
            style={{ marginTop: '20px' }}
          >
            ← Back to Spas
          </button>
        </div>
      </div>
    );
  }

  // No services state
  if (services.length === 0) {
    return (
      <div className="spa-detail-page">
        <h2 className="page-title">{spaName}</h2>
        <p className="info-message">No approved services available at this time.</p>
        <button 
          className="btn-accent" 
          onClick={() => navigate('/')}
          style={{ marginTop: '20px' }}
        >
          ← Back to Spas
        </button>
      </div>
    );
  }

  // Main render
  return (
    <div className="spa-detail-page">
      <div className="spa-detail-header">
        <h1>✨ {spaName} Services</h1>
        <p>Select the services you want to book:</p>
      </div>

      <div className="spa-services-grid">
        {services.map(service => (
          <ServiceCard
            key={service.id}
            service={service}
            isSelected={selectedServices.some(s => s.id === service.id)}
            onToggleService={handleToggleService}
          />
        ))}
      </div>

      <div className="spa-detail-actions">
        <div className="spa-detail-actions-inner">
          <div className="spa-selected-summary">
            <span>
              <strong>{selectedServices.length}</strong> service(s) selected
            </span>
          </div>

          <button
            className="btn-check-availability"
            disabled={selectedServices.length === 0}
            onClick={handleCheckAvailability}
          >
            Check Availability ({selectedServices.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpaDetail;

