const express = require("express");
const router = express.Router();
const fs = require("fs");
const dbPath = "./data/db.json";
const { v4: uuidv4 } = require("uuid");

// helper functions
const db = () => JSON.parse(fs.readFileSync(dbPath, "utf8"));
const saveDB = (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));


// Get all services for a specific spa
router.get("/:spaId", (req, res) => {
  const spaId = req.params.spaId;
  const database = db();

  const services = database.services.filter((s) => s.spaId === spaId);
  res.json(services);
});


// Add service
router.post("/", (req, res) => {
  const database = db();

  const newService = {
    id: uuidv4(),
    spaId: String(req.body.spaId),
    name: req.body.name,
    price: req.body.price,
    description:req.body.description,
    duration:req.body.duration,
    slots: req.body.slot,
    status: "PENDING",
    image: req.body.image || "",
    available: req.body.available ?? true
  };

  database.services.push(newService);
  saveDB(database);

  res.status(201).json(newService);
});


// Update service
router.put("/:id", (req, res) => {
  const id = req.params.id;
  const database = db();

  const index = database.services.findIndex((s) => s.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Service Not Found" });
  }

  database.services[index] = { ...database.services[index], ...req.body };
  saveDB(database);

  res.json(database.services[index]);
});


// Delete service
router.delete("/:id", (req, res) => {
  const id = req.params.id;
  const database = db();

  database.services = database.services.filter((s) => s.id !== id);
  saveDB(database);

  res.json({ message: "Service deleted" });
});


router.patch("/toggle/:id", (req, res) => {

  const id = req.params.id;
  const database = db();
  const services = database.services.find(s => s.id == id);
  services.available = !services.available;
  saveDB(database);
  res.json(services);
});

module.exports = router;