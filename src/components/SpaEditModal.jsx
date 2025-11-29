import React, { useEffect, useState } from "react";
import API from "../api";

export default function SpaEditModal({ spa, onClose, reload }) {
  const [form, setForm] = useState({
    id: spa?.id || null,
    name: spa?.name || "",
    description: spa?.description || "",
    employeesCount: spa?.employeesCount || 0,
    images: spa?.images?.slice() || [],
    available: spa?.available ?? true,
    status: spa?.status || "PENDING",
    ownerId: spa?.ownerId,
  });

  const [preview, setPreview] = useState(form.images?.[0] || null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      id: spa?.id || null,
      name: spa?.name || "",
      description: spa?.description || "",
      employeesCount: spa?.employeesCount || 0,
      images: spa?.images?.slice() || [],
      available: spa?.available ?? true,
      status: spa?.status || "PENDING",
      ownerId: spa?.ownerId,
    });
    setPreview(spa?.images?.[0] || null);
  }, [spa]);

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
      setForm((p) => ({ ...p, images: [reader.result] }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return alert("Please enter spa name");
    if (!form.description.trim()) return alert("Please enter description");
    if (form.employeesCount === "" || isNaN(Number(form.employeesCount))) return alert("Enter employees count");

    try {
      setSaving(true);
      const payload = {
        name: form.name,
        description: form.description,
        employeesCount: Number(form.employeesCount),
        images: form.images?.length ? form.images : [],
        available: form.available,
        status: form.status || "PENDING",
        ownerId: form.ownerId,
      };
      await API.put(`/spas/${form.id}`, payload);
      await reload();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to update spa");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.6)" }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content p-3">
          <div className="modal-header">
            <h5 className="modal-title fw-bold">Edit Spa</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSave} className="d-flex flex-column gap-3 mt-2">
            <div>
              <label className="form-label fw-bold">Spa Image</label>
              <input type="file" className="form-control" accept="image/*" onChange={handleImageChange} />
              {preview && <img src={preview} alt="preview" className="img-fluid rounded mt-2" />}
            </div>

            <div>
              <label className="form-label fw-bold">Spa Name</label>
              <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>

            <div>
              <label className="form-label fw-bold">Description</label>
              <textarea className="form-control" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>

            <div>
              <label className="form-label fw-bold">Employees Count</label>
              <input type="number" className="form-control" value={form.employeesCount} onChange={(e) => setForm({ ...form, employeesCount: e.target.value })} />
            </div>

            <div className="form-check form-switch">
              <input type="checkbox" className="form-check-input" checked={form.available} onChange={(e) => setForm({ ...form, available: e.target.checked })} />
              <label className="form-check-label fw-bold">Accepting Bookings</label>
            </div>

            <div className="modal-footer mt-3 justify-content-end gap-2">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={saving}>
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


