const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, '..', 'data', 'db.json');

function readData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading db.json', e);
    return { users: [], spas: [], services: [], bookings: [], membership: {}, wishlists: [] };
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function eqId(a, b) {
  return String(a) === String(b);
}

/* -------------------------------------------------------
   AUTO-UPDATE MEMBERSHIP STATUS
---------------------------------------------------------*/
function updateMembershipStatuses(db) {
  const now = new Date();

  db.users = db.users.map(user => {
    if (user.membership && user.membership.endDate) {
      const end = new Date(user.membership.endDate);
      if (now > end) {
        user.membership.status = "not-active";
      }
    }
    return user;
  });

  return db;
}

/* -------------------------------------------------------
   AUTO-UPDATE BOOKING STATUS (completed / upcoming)
---------------------------------------------------------*/

// convert YYYY-MM-DD or ISO → date-only object
function parseDateOnly(str) {
  if (!str) return null;

  try {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }
  } catch (e) {}

  const parts = String(str).split('T')[0].split('-');
  if (parts.length === 3) {
    const y = Number(parts[0]);
    const m = Number(parts[1]) - 1;
    const d = Number(parts[2]);
    return new Date(y, m, d);
  }
  return null;
}

// update booking statuses based on current date
function updateBookingStatuses(db) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  db.bookings = (db.bookings || []).map(b => {
    const d = parseDateOnly(b.date);
    if (!d) return b;

    const prev = String(b.status || '').toLowerCase();

    if (d < today && prev !== "completed") {
      b.status = "completed";
    } else if (d > today && prev !== "upcoming") {
      b.status = "upcoming";
    } else if (d.getTime() === today.getTime() && prev !== "upcoming") {
      b.status = "upcoming";
    }

    return b;
  });

  return db;
}

/* -------------------------------------------------------
   USERS
---------------------------------------------------------*/
router.get('/users', (req, res) => {
  let db = readData();
  db = updateMembershipStatuses(db);
  writeData(db);
  res.json(db.users || []);
});

/* -------------------------------------------------------
   SPAS
---------------------------------------------------------*/

// GET /api/spas - all spas or filter by ownerId or id
router.get('/spas', (req, res) => {
  const db = readData();
  let spas = db.spas || [];

  const { ownerId, id } = req.query;

  if (ownerId !== undefined) {
    spas = spas.filter(s => eqId(s.ownerId, ownerId));
  } else if (id !== undefined) {
    spas = spas.filter(s => eqId(s.id, id));
  }

  res.json(spas);
});

// GET PENDING SPA REQUESTS
router.get('/spa-requests', (req, res) => {
  const db = readData();
  const pending = (db.spas || []).filter(s => String(s.status).toUpperCase() === 'PENDING');
  res.json(pending);
});

// APPROVE SPA
router.post('/spas/:id/approve', (req, res) => {
  const id = req.params.id;
  const db = readData();
  const spa = (db.spas || []).find(s => eqId(s.id, id));
  if (!spa) return res.status(404).json({ error: 'Spa not found' });

  spa.status = 'APPROVED';
  spa.available = true;
  writeData(db);
  res.json(spa);
});

// UPDATE SPA (PATCH)
router.patch('/spas/:id', (req, res) => {
  const id = req.params.id;
  const db = readData();
  const spa = (db.spas || []).find(s => eqId(s.id, id));
  if (!spa) return res.status(404).json({ error: 'Spa not found' });

  Object.assign(spa, req.body);
  writeData(db);
  res.json(spa);
});

/* -------------------------------------------------------
   SPA OWNERS (LIST)
---------------------------------------------------------*/
router.get('/spa-owners', (req, res) => {
  const db = readData();
  const spaOwners = (db.users || []).filter(u => u.role === 'spa_owner');
  const spas = db.spas || [];

  const owners = spaOwners.map(owner => {
    const ownerSpas = spas.filter(s => eqId(s.ownerId, owner.id));
    return {
      id: owner.id,
      ownerName: owner.fullName || owner.ownerName || owner.name,
      email: owner.email,
      phone: owner.phone,
      createdAt: owner.createdAt || null,
      status: ownerSpas.some(s => String(s.status).toUpperCase() === 'APPROVED')
        ? 'approved'
        : 'pending'
    };
  });

  res.json(owners);
});

/* -------------------------------------------------------
   SERVICES
---------------------------------------------------------*/

router.get('/service-requests', (req, res) => {
  const db = readData();
  const pending = (db.services || []).filter(s => String(s.status).toUpperCase() === 'PENDING');
  res.json(pending);
});

router.get('/services', (req, res) => {
  const db = readData();
  res.json(db.services || []);
});

router.post('/services/:id/approve', (req, res) => {
  const id = req.params.id;
  const db = readData();
  const service = (db.services || []).find(s => eqId(s.id, id));
  if (!service) return res.status(404).json({ error: 'Service not found' });

  service.status = 'approved';
  writeData(db);
  res.json(service);
});

router.patch('/services/:id', (req, res) => {
  const id = req.params.id;
  const db = readData();
  const service = (db.services || []).find(s => eqId(s.id, id));
  if (!service) return res.status(404).json({ error: 'Service not found' });

  Object.assign(service, req.body);
  writeData(db);
  res.json(service);
});

/* -------------------------------------------------------
   BOOKINGS
---------------------------------------------------------*/
router.get('/bookings', (req, res) => {
  let db = readData();

  // auto-update booking statuses


  // persist changes to db.json
  writeData(db);

  res.json(db.bookings || []);
});

router.patch('/bookings/:id/status', (req, res) => {
  const id = req.params.id;
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Missing status' });

  const db = readData();
  const booking = (db.bookings || []).find(b => eqId(b.id, id) || eqId(b.bookingId, id));
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  booking.status = status;
  writeData(db);
  res.json(booking);
});

/* -------------------------------------------------------
   MEMBERSHIP / WISHLISTS
---------------------------------------------------------*/

router.get('/membership', (req, res) => {
  const db = readData();
  res.json(db.membership || {});
});

router.get('/wishlists', (req, res) => {
  const db = readData();
  res.json(db.wishlists || []);
});

/* -------------------------------------------------------
   CREATE SPA / SERVICE
---------------------------------------------------------*/
router.post('/spas', (req, res) => {
  const db = readData();
  const payload = req.body;
  const id = payload.id || uuidv4();
  const spa = { ...payload, id };

  db.spas = db.spas || [];
  db.spas.push(spa);
  writeData(db);

  res.status(201).json(spa);
});

router.post('/services', (req, res) => {
  const db = readData();
  const payload = req.body;
  const id = payload.id || uuidv4();
  const service = { ...payload, id };

  db.services = db.services || [];
  db.services.push(service);
  writeData(db);

  res.status(201).json(service);
});

module.exports = router;
