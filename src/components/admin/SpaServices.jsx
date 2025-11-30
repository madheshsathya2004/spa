// src/components/admin/ApprovedServices.jsx
import React, { useState } from 'react';
import { Clock, DollarSign, X, Calendar } from 'lucide-react';
import "../../styles/admin.css";

const SpaServices = ({ approvedServices }) => {
  const [selectedService, setSelectedService] = useState(null);

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#fbbf24' }}>
        Approved Services
      </h2>

      {/* Modal */}
      {selectedService && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem',
        }}>
          <div style={{
            background: '#1a2332',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            maxWidth: '42rem',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#fbbf24' }}>Service Details</h3>
              <button 
                onClick={() => setSelectedService(null)} 
                style={{
                  color: '#9ca3af',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ 
                background: '#0f1829', 
                padding: '1rem', 
                borderRadius: '0.5rem',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}>
                <h4 style={{ color: '#ec4899', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem' }}>SERVICE INFORMATION</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Service Name</p>
                    <p style={{ fontWeight: '600', color: '#e5e7eb' }}>{selectedService.serviceName}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Category</p>
                    <p style={{ fontWeight: '600', color: '#e5e7eb' }}>{selectedService.category}</p>
                  </div>
                </div>
              </div>

              <div style={{ 
                background: '#0f1829', 
                padding: '1rem', 
                borderRadius: '0.5rem',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}>
                <h4 style={{ color: '#ec4899', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem' }}>SPA & PRICING</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Spa Name</p>
                    <p style={{ fontWeight: '600', color: '#e5e7eb' }}>{selectedService.spaName}</p>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Duration</p>
                      <p style={{ fontWeight: '600', color: '#e5e7eb' }}>{selectedService.duration}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Price</p>
                      <p style={{ fontWeight: '600', color: '#10b981', fontSize: '1.5rem' }}>${selectedService.price}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ 
                background: '#0f1829', 
                padding: '1rem', 
                borderRadius: '0.5rem',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}>
                <h4 style={{ color: '#ec4899', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem' }}>DESCRIPTION</h4>
                <p style={{ color: '#e5e7eb', lineHeight: '1.5' }}>{selectedService.description}</p>
              </div>

              <button
                onClick={() => setSelectedService(null)}
                style={{
                  width: '100%',
                  background: 'linear-gradient(to right, #9333ea, #ec4899)',
                  color: 'white',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Services Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {approvedServices.map(service => (
          <div 
            key={service.id} 
            style={{
              background: '#1a2332',
              padding: '1.5rem',
              borderRadius: '0.75rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(147, 51, 234, 0.3)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.3)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.25rem', color: '#e5e7eb' }}>
                  {service.serviceName}
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>{service.spaName}</p>
              </div>
              <span style={{
                background: 'rgba(147, 51, 234, 0.2)',
                color: '#9333ea',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: '500',
                border: '1px solid #9333ea',
              }}>
                {service.category}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <Clock size={16} color="#ec4899" />
                <span style={{ color: '#e5e7eb' }}>{service.duration}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <DollarSign size={16} color="#10b981" />
                <span style={{ color: '#10b981', fontWeight: '600', fontSize: '1.25rem' }}>${service.price}</span>
              </div>
            </div>

            <p style={{ 
              color: '#9ca3af', 
              fontSize: '0.875rem', 
              lineHeight: '1.5',
              marginBottom: '1rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}>
              {service.description}
            </p>

            <button 
              onClick={() => setSelectedService(service)}
              style={{
                width: '100%',
                background: 'linear-gradient(to right, #9333ea, #ec4899)',
                color: 'white',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpaServices;