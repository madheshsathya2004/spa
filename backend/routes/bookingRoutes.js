const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "..", "data", "db.json");

// Load & Save DB
const loadDB = () => JSON.parse(fs.readFileSync(dbPath));
const saveDB = (data) =>
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

/*
 booking structure:
 {
    id: number,
    userId: number,
    spaId: number,
    ownerId: number,
    services: [
      { id, name, price, slots, ... }
    ],
    slot: "04:00 PM",
    date: "2025-11-29",
    booking_status: "PENDING | APPROVED | DECLINED",
    payment_status: "PENDING | PAID"
 }
*/

// ================================
// 1️⃣ GET BOOKINGS FOR OWNER
// ================================

// GET all bookings (with userName + spaName lookup)
router.get("/", (req, res) => {
  const db = JSON.parse(fs.readFileSync(dbPath));
  
  const bookings = db.bookings.map(b => {
    const user = db.users.find(u => u.id == b.userId);
    const spa = db.spas.find(s => s.id == b.spaId);

    return {
      ...b,
      userName: user ? user.name : "Unknown User",
      spaName: spa ? spa.name : "Unknown Spa"
    };
  });

  res.json(bookings);
});

router.get("/:ownerId", (req, res) => {
  const { ownerId } = req.params;
  const db = loadDB();

  const result = db.bookings.filter((b) => b.ownerId == ownerId);
  res.json(result);
});

// ================================
// 2️⃣ FILTER BY spaId + booking_status
// /bookings/filter?spaId=1764&status=PENDING
// ================================
router.get("/filter/bookings/list", (req, res) => {
  const { spaId, status } = req.query;
  const db = loadDB();

  let filtered = db.bookings;

  if (spaId) filtered = filtered.filter((b) => b.spaId == spaId);
  if (status && status !== "ALL")
    filtered = filtered.filter((b) => b.booking_status === status);

  res.json(filtered);
});

// ================================
// 3️⃣ UPDATE BOOKING STATUS
// ================================
router.put("/update/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const db = loadDB();
  const idx = db.bookings.findIndex((b) => b.id == id);

  if (idx === -1)
    return res.status(404).json({ message: "Booking not found" });

  
  db.bookings[idx].status = status;
  saveDB(db);

  res.json({
    message: "Booking updated",
    booking: db.bookings[idx],
  });
});

module.exports = router;