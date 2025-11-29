// src/pages/SpaPage.jsx
import React, { useEffect, useState } from "react";
import API from "../api";
import SpaAddModal from "../components/SpaAddModal";
import SpaEditModal from "../components/SpaEditModal";
import SpaCard from "../components/SpaCard";

const OWNER = sessionStorage.getItem("user");

const currentUser = OWNER ? JSON.parse(OWNER) : null

const OWNER_ID = currentUser?.id || null;
if(currentUser==null)
{
  
  console.log("NO OWNER EXISTS");
}
export default function SpaPage() {
  const [spas, setSpas] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editSpa, setEditSpa] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadSpas = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/spas/owner/${OWNER_ID}`);
      setSpas(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load spas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSpas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleAvailability = async (id) => {
    try {
      await API.patch(`/spas/toggle/${id}`);
      await loadSpas();
    } catch (err) {
      console.error(err);
      alert("Failed to toggle availability");
    }
  };

  const deleteSpa = async (id) => {
    if (!confirm("Delete this spa?")) return;
    try {
      await API.delete(`/spas/${id}`);
      await loadSpas();
    } catch (err) {
      console.error(err);
      alert("Failed to delete spa");
    }
  };

  return (
    <div className="spa-page container">
      <div className="spa-header">
        <h2 className="spa-title">My Spas</h2>
        <button className="btn btn-accent" onClick={() => setShowAdd(true)}>
          + Add Spa
        </button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="spa-grid">
          {spas.map((spa) => (
            <div key={spa.id} className="spa-col">
              <SpaCard
                spa={spa}
                onEdit={() => setEditSpa(spa)}
                onDelete={() => deleteSpa(spa.id)}
                onToggleAvailability={() => toggleAvailability(spa.id)}
              />
            </div>
          ))}
        </div>
      )}

      {showAdd && <SpaAddModal onClose={() => setShowAdd(false)} reload={loadSpas} />}
      {editSpa && <SpaEditModal spa={editSpa} onClose={() => setEditSpa(null)} reload={loadSpas} />}
    </div>
  );
}