import React, { useEffect, useState } from "react";
import API from "../api";
import ServiceCard from "../components/ServiceCard";
import ServiceAddModal from "../components/ServiceAddModal";
import ServiceEditModal from "../components/ServiceEditModal";

const OWNER = sessionStorage.getItem("user");

const currentUser = OWNER ? JSON.parse(OWNER) : null

const OWNER_ID = currentUser?.id || null;
if(currentUser==null)
{
  
  console.log("NO OWNER EXISTS");
}

export default function ServicesPage() {
  const [spas, setSpas] = useState([]);
  const [spaId, setSpaId] = useState("");
  const [services, setServices] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editService, setEditService] = useState(null);

  const fetchSpas = async () => {
    try {
      const res = await API.get(`/spas/owner/${OWNER_ID}`);
      setSpas(res.data);
      if (!spaId && res.data.length > 0) setSpaId(res.data[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchServices = async () => {
    if (!spaId) return;
    try {
      const res = await API.get(`/services/${spaId}`);
      setServices(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchSpas(); }, []);
  useEffect(() => { fetchServices(); }, [spaId]);

  const toggleAvailability = async (id) => {
    await API.patch(`/services/toggle/${id}`);
    fetchServices();
  };

  const deleteService = async (id) => {
    if (!confirm("Delete service?")) return;
    await API.delete(`/services/${id}`);
    fetchServices();
  };

  return (
    <div className="container mt-4">
      <h2 className="fw-bold mb-3">Manage Services</h2>

      <label className="fw-semibold">Select Spa</label>
      <select
  className="form-select mb-3 spa-select"
  value={spaId}
  onChange={(e) => setSpaId(e.target.value)}
  disabled={spas.length === 0}
>
  {spas.length === 0 ? (
    <option>No Spas Available</option>
  ) : (
    spas.map((spa) => (
      <option key={spa.id} value={spa.id}>
        {spa.name}
      </option>
    ))
  )}
</select>
      <button className="btn btn-success mb-3" onClick={() => setShowAdd(true)}>
        + Add Service
      </button>

      <div className="row">
        {services.length === 0 ? (
          <p className="text-muted">No services found for selected spa</p>
        ) : (
          services.map((srv) => (
            <ServiceCard
              key={srv.id}
              service={srv}
              onToggle={toggleAvailability}
              onDelete={deleteService}
              onEdit={() => setEditService(srv)}
            />
          ))
        )}
      </div>

      {/* Modals rendered outside the container/grid */}
      {showAdd && (
        <ServiceAddModal
          spaId={spaId}
          reload={fetchServices}
          onClose={() => setShowAdd(false)}
        />
      )}

      {editService && (
        <ServiceEditModal
          service={editService}
          reload={fetchServices}
          onClose={() => setEditService(null)}
        />
      )}
    </div>
  );
}