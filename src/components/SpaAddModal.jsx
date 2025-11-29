import React, { useState } from "react";
import API from "../api";

const OWNER = sessionStorage.getItem("user");

const currentUser = OWNER ? JSON.parse(OWNER) : null

const OWNER_ID = currentUser?.id || null;
if(currentUser==null)
{
  
  console.log("NO OWNER EXISTS");
}

export default function SpaAddModal({ onClose, reload }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    employeesCount: "",
    images: [],
    available: true,
    status: "PENDING",
  });
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name?.trim()) return alert("Please enter spa name");
    if (!form.description?.trim()) return alert("Please enter description");
    if (form.employeesCount === "" || isNaN(Number(form.employeesCount)))
      return alert("Please enter employees count");

    try {
      setSaving(true);
      const payload = {
        name: form.name,
        description: form.description,
        employeesCount: Number(form.employeesCount),
        images: form.images?.length ? form.images : [],
        available: form.available,
        status: form.status || "PENDING",
        location:form.location,
        phoneNumber:form.phoneNumber,
        ownerId: OWNER_ID,
      };
      await API.post("/spas", payload);
      await reload();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to add spa");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.6)" }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content p-3">
          <div className="modal-header">
            <h5 className="modal-title fw-bold">Add Spa</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit} className="d-flex flex-column gap-3 mt-2">
            <div>
              <label className="form-label fw-bold">Spa Image</label>
              <input type="file" className="form-control" onChange={handleImageChange} accept="image/*" />
              {preview && <img src={preview} className="img-fluid rounded mt-2" alt="preview" />}
            </div>

            <div>
              <label className="form-label fw-bold">Name</label>
              <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>

            <div>
              <label className="form-label fw-bold">Description</label>
              <textarea className="form-control" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>

            <div>
              <label className="form-label fw-bold">Employees Count</label>
              <input
                className="form-control"
                type="number"
                min="0"
                value={form.employeesCount}
                onChange={(e) => setForm({ ...form, employeesCount: e.target.value })}
              />
            </div>

            <div>
              <label className="form-label fw-bold">Location</label>
              <input
                className="form-control"
                type="text"
                reqyuired
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>

            <div>
              <label className="form-label fw-bold">Phone Number</label>
              <input
                className="form-control"
                type="text"
                value={form.phoneNumber}
                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
              />
            </div>

            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                checked={form.available}
                onChange={(e) => setForm({ ...form, available: e.target.checked })}
              />
              <label className="form-check-label fw-bold">Accepting Bookings</label>
            </div>

            <div className="modal-footer mt-3 justify-content-end gap-2">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={saving}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving..." : "Add"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


