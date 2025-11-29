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
  //const [spaName, setSpaName] = useState('Loading...');

  useEffect(() => {

    const fetchServices = async () => {
      setIsLoading(true);

      try {
        const response = await fetch(`${API_BASE_URL}/spas/${spaId}/services`);

        if (!response.ok) {
          throw new Error('Spa or services not found.');
        }

        const data = await response.json();
        setServices(data);

      } catch (error) {
        console.error("Error fetching services:", error);
        setSpaName('Error Loading Spa');
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


  // Loading
  if (isLoading) {
    return <h2 className="page-title">Loading Services...</h2>;
  }

  // No services
  if (services.length === 0) {
    return <h2 className="page-title">{spaName} - No Services Found</h2>;
  }


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