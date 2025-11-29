import React, { useEffect, useState } from "react";
import API from "../api";
import { FaUser, FaEnvelope, FaPhone, FaLock } from "react-icons/fa";

const OWNER = sessionStorage.getItem("user");

const currentUser = OWNER ? JSON.parse(OWNER) : null

const USER_ID = currentUser?.id || null;
if(currentUser==null)
{
  
  console.log("NO OWNER EXISTS");
}

export default function ProfilePage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    contact: "",
    password: "",
  });

  const [editMode, setEditMode] = useState(false);

  const fetchUser = async () => {
    try {
      const res = await API.get(`/profile/${USER_ID}`);
      setForm({
        name: res.data?.fullName ?? "",
        email: res.data?.email ?? "",
        contact: res.data?.phone ?? "",
        password: "",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const updateProfile = async () => {
    try {
      const payload = {
        fullName: form.name,
        email: form.email,
        phone: form.contact,
      };
      if (form.password.trim()) payload.password = form.password;

      await API.put(`/profile/${USER_ID}`, payload);

      alert("Profile updated successfully");

      fetchUser();
      setEditMode(false);
      setForm((prev) => ({ ...prev, password: "" }));
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <div className="container mt-4 page-fade" style={{ maxWidth: "620px" }}>
      <h2 className="fw-bold mb-4 text-center">My Profile</h2>

      {/* Profile Photo */}
      <div className="text-center mb-4">
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKMvO4ydq3DuBwMUTliFGqGm641axT0vrKaQ&s"
          alt="profile"
          className="rounded-circle shadow"
          style={{ width: "120px", height: "120px", objectFit: "cover" }}
        />
      </div>

      {/* Profile Card */}
      <div className="card-dark p-4">

        {/* NAME */}
        <div className="mb-3">
          <label className="form-label fw-semibold">
            <FaUser className="me-2" />
            Full Name
          </label>
          <input
            className="form-control"
            placeholder="Full Name"
            value={form.name}
            disabled={!editMode}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        {/* EMAIL */}
        <div className="mb-3">
          <label className="form-label fw-semibold">
            <FaEnvelope className="me-2" />
            Email
          </label>
          <input
            className="form-control"
            type="email"
            placeholder="Email"
            disabled={!editMode}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        {/* PHONE */}
        <div className="mb-3">
          <label className="form-label fw-semibold">
            <FaPhone className="me-2" />
            Contact
          </label>
          <input
            className="form-control"
            placeholder="Phone Number"
            disabled={!editMode}
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
          />
        </div>

        {/* PASSWORD — SHOW ONLY IN EDIT MODE */}
        {editMode && (
          <div className="mb-3">
            <label className="form-label fw-semibold">
              <FaLock className="me-2" />
              New Password (Optional)
            </label>
            <input
              className="form-control"
              type="password"
              placeholder="Enter new password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
        )}

        {/* BUTTONS */}
        <div className="mt-3">
          {!editMode ? (
            <button
              className="btn-accent w-100"
              onClick={() => setEditMode(true)}
            >
              Edit
            </button>
          ) : (
            <button className="btn-accent w-100" onClick={updateProfile}>
              Save Changes
            </button>
          )}
        </div>
      </div>
    </div>
  );
}