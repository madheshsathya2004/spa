const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { hashPassword } = require("../utils/hashPassword");

// Load DB
const dbPath = path.join(__dirname, "../data/db.json");
let rawData = fs.readFileSync(dbPath);
let db = JSON.parse(rawData);
let users = db.users;

// GET all users
router.get("/", (req, res) => {
  const db = JSON.parse(fs.readFileSync(dbPath));
  res.json(db.users || []);
});

router.get("/:id", (req, res) => {
  const user = users.find(u => u.id == req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

// UPDATE Profile
router.put("/:id", async (req, res) => {
  const { fullName, email, phone, password } = req.body;
  const index = users.findIndex(u => u.id == req.params.id);
  if (index === -1) return res.status(404).json({ message: "User not found" });

  // Duplicate email check
  const exists = users.find(u => u.email === email && u.id != req.params.id);
  if (exists) return res.status(400).json({ message: "Email already in use" });

  // Update fields
  if (fullName) users[index].fullName = fullName;
  if (email) users[index].email = email;
  if (phone) users[index].phone = phone;
  if (password && password.trim() !== "") {
    users[index].password = await hashPassword(password); // hash new password
  }

  // Save back to db.json
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

  res.json({ message: "Profile updated", user: users[index] });
});

module.exports = router;