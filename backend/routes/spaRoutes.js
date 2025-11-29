const express = require("express");
const router = express.Router();
const fs = require("fs");
const dbPath = "./data/db.json";

// Helper to read and write DB
const getDB = () => JSON.parse(fs.readFileSync(dbPath, "utf8"));
const saveDB = (db) => fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

router.get("/owner/:ownerId", (req, res) => {
  const db = getDB();
  const ownerSpas = db.spas.filter(s => s.ownerId == req.params.ownerId);
  res.json(ownerSpas);
});

// GET all spas
router.get("/", (req, res) => {
  const db = JSON.parse(fs.readFileSync(dbPath));
  res.json(db.spas || []);
});

router.post("/", (req, res) => {
  const db = getDB();
  const newSpa = { ...req.body, id: Date.now() };
  db.spas.push(newSpa);
  saveDB(db);
  res.json(newSpa);
});

router.put("/:id", (req, res) => {
  const db = getDB();
  const index = db.spas.findIndex(s => s.id == req.params.id);
  db.spas[index] = { ...db.spas[index], ...req.body };
  saveDB(db);
  res.json(db.spas[index]);
});

router.patch("/toggle/:id", (req, res) => {
  const db = getDB();
  const spa = db.spas.find(s => s.id == req.params.id);
  spa.available = !spa.available;
  saveDB(db);
  res.json(spa);
});

router.delete("/:id", (req, res) => {
  const db = getDB();
  db.spas = db.spas.filter(s => s.id != req.params.id);
  saveDB(db);
  res.json({ success: true });
});

module.exports = router;