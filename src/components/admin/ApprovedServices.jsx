// src/components/admin/ApprovedServices.jsx
import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import api from '../../admin_api';
import {useToast} from '../contexts/ToastContext';
import "../../styles/admin.css";

const eqId = (a, b) => String(a) === String(b);

const ApprovedServices = () => {
  const [services, setServices] = useState([]);
  const [spas, setSpas] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);

        const [spasRes, servicesRes] = await Promise.all([
          api.get('/spas'),
          api.get('/services'),
        ]);

        const spasData = Array.isArray(spasRes.data) ? spasRes.data : spasRes.data?.data || [];
        const servicesData = Array.isArray(servicesRes.data) ? servicesRes.data : servicesRes.data?.data || [];

        if (!mounted) return;

        const approved = servicesData.filter(
          s => s && String(s.status || "").toUpperCase() === "APPROVED"
        );

        const enriched = approved.map(s => {
          const spaMatch = spasData.find(sp => eqId(sp.id, s.spaId));
          return {
            id: s.id,
            serviceName: s.name || s.serviceName || "-",
            spaName: spaMatch?.name || "-",
            price: s.price || "-",
            duration: s.duration || "-",
            description: s.description || "-",
          };
        });

        setServices(enriched);
      } catch (err) {
        console.error(err);
        toast?.show?.("Failed to load approved services", { type: "error" });
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => (mounted = false);
  }, [toast]);


  if (loading) return <div style={{ color: "#9ca3af" }}>Loading approved services...</div>;


  return (
    <div>
      <h2
        style={{
          fontSize: "1.7rem",
          fontWeight: "800",
          marginBottom: "2rem",
          color: "#fbbf24",
          textShadow: "0 2px 8px rgba(251,191,36,0.3)"
        }}
      >
        Approved Services
      </h2>

      {services.length === 0 ? (
        <div
          style={{
            padding: "1rem",
            color: "#9ca3af",
            background: "rgba(15,24,41,0.6)",
            borderRadius: 10,
            backdropFilter: "blur(6px)",
            textAlign: "center",
            border: "1px solid rgba(255,255,255,0.08)"
          }}
        >
          No approved services
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))",
            gap: "1.8rem"
          }}
        >
          {services.map(service => (
            <div
              key={service.id}
              style={{
                background: "rgba(26,35,50,0.75)",
                borderRadius: "1rem",
                padding: "1.7rem",
                border: "1px solid rgba(255,255,255,0.15)",
                boxShadow: "0 8px 25px rgba(0,0,0,0.4)",
                backdropFilter: "blur(6px)",
                transition: "0.3s ease",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 15px 30px rgba(147,51,234,0.35)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.4)";
              }}
            >
              {/* Top Gradient Bar */}
              <div
                style={{
                  height: "4px",
                  width: "100%",
                  background: "linear-gradient(to right, #9333EA, #EC4899)",
                  borderRadius: "6px",
                  marginBottom: "1.2rem"
                }}
              ></div>

              {/* LINE BY LINE INFO */}
              <p style={{ color: "#9ca3af", fontSize: "0.85rem", marginBottom: "4px" }}>
                Service Name
              </p>
              <h3 style={{ color: "#fff", marginTop: 0, marginBottom: "12px", fontSize: "1.25rem" }}>
                {service.serviceName}
              </h3>

              <p style={{ color: "#9ca3af", fontSize: "0.85rem", marginBottom: "4px" }}>
                Spa Name
              </p>
              <p style={{ color: "#e5e7eb", marginBottom: "12px", fontWeight: 600 }}>
                {service.spaName}
              </p>

              <p style={{ color: "#9ca3af", fontSize: "0.85rem", marginBottom: "4px" }}>
                Duration
              </p>
              <p style={{ color: "#e5e7eb", marginBottom: "12px", display: "flex", alignItems: "center", gap: 8 }}>
                <Clock size={16} color="#ec4899" />
                {service.duration}
              </p>

              <p style={{ color: "#9ca3af", fontSize: "0.85rem", marginBottom: "4px" }}>
                Price
              </p>
              <p style={{ color: "#10b981", fontWeight: "700", marginBottom: "12px", fontSize: "1.3rem" }}>
                ₹{service.price}
              </p>

              <p style={{ color: "#9ca3af", fontSize: "0.85rem", marginBottom: "4px" }}>
                Description
              </p>
              <p style={{ color: "#b5c0d0", lineHeight: "1.5" }}>
                {service.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApprovedServices;
