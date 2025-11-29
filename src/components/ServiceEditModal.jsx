import React, { useState, useEffect } from "react";
import API from "../api";

export default function ServiceEditModal({ service, reload, onClose }) {
  const [form, setForm] = useState({
    id: service?.id || null,
    spaId: service?.spaId || null,
    name: service?.name || "",
    price: service?.price || "",
    duration: service?.duration || "",
    description: service?.description || "",
    slot: service?.slots || "",
    image: service?.image || "",
    status: service?.status || "PENDING",
    available: service?.available ?? true,
  });

  const [preview, setPreview] = useState(service?.image || null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      id: service?.id || null,
      spaId: service?.spaId || null,
      name: service?.name || "",
      price: service?.price || "",
      duration: service?.duration || "",
      description: service?.description || "",
      slot: service?.slots || "",
      image: service?.image || "",
      status: service?.status || "PENDING",
      available: service?.available ?? true,
    });
    setPreview(service?.image || null);
  }, [service]);

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      setForm((prev) => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) return alert("Please enter service name");
    if (!form.price || isNaN(Number(form.price))) return alert("Please enter valid price");
    if (!form.duration.trim()) return alert("Please enter duration");
    if (!form.description.trim()) return alert("Please enter description");
    if (!form.slot) return alert("Please select a slot");

    try {
      setSaving(true);
      const payload = { ...form };
      await API.put(`/services/${form.id}`, payload);
      await reload();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to update service");
    } finally {
      setSaving(false);
    }
  };

  const slots = ["10:00 AM", "12:00 PM", "02:00 PM", "04:00 PM", "06:00 PM"];

  return (
    <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.6)" }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content p-3">
          <div className="modal-header">
            <h5 className="modal-title fw-bold">Edit Service</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit} className="d-flex flex-column gap-3 mt-2">
            {/* Image */}
            <div>
              <label className="form-label fw-bold">Service Image</label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={handleImageChange}
              />
              {preview && <img src={preview} className="img-fluid rounded mt-2" alt="preview" />}
            </div>

            {/* Name */}
            <div>
              <label className="form-label fw-bold">Name</label>
              <input
                type="text"
                className="form-control"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            {/* Price */}
            <div>
              <label className="form-label fw-bold">Price</label>
              <input
                type="number"
                className="form-control"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>

            {/* Duration */}
            <div>
              <label className="form-label fw-bold">Duration</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g., 30 mins"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
              />
            </div>

            {/* Description */}
            <div>
              <label className="form-label fw-bold">Description</label>
              <textarea
                className="form-control"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            {/* Slot selection as radio buttons */}
            <div>
              <label className="form-label fw-bold">Select Slot</label>
              <div className="d-flex gap-3 flex-wrap">
                {slots.map((s) => (
                  <div className="form-check" key={s}>
                    <input
                      className="form-check-input"
                      type="radio"
                      name="slot"
                      value={s}
                      checked={form.slot === s}
                      onChange={(e) => setForm({ ...form, slot: e.target.value })}
                    />
                    <label className="form-check-label">{s}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Available */}
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                checked={form.available}
                onChange={(e) => setForm({ ...form, available: e.target.checked })}
              />
              <label className="form-check-label fw-bold">Available</label>
            </div>

            <div className="modal-footer mt-3 justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-success" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}