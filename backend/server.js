const express = require("express");
const cors = require("cors");
const fs = require("fs").promises;

const path = require("path");
const bodyParser = require('body-parser');


const spaRoutes = require("./routes/spaRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const profileRoute = require("./routes/profileRoute");
const bookingsRoutes = require("./routes/bookingRoutes");
const authRoutes = require('./routes/auth.routes');
const spaRoutesCustomer = require('./routes/spaRoutesCustomer');
const { timeStamp } = require('console');

const app = express(); 
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/customer', spaRoutesCustomer);
app.use("/spas", spaRoutes);
app.use("/services", serviceRoutes);
app.use("/profile", profileRoute);
app.use("/bookings",bookingsRoutes);

const DB_FILE = path.join(__dirname, "data", "db.json");
const initDatabase = async () => {
  try {
    await fs.access(DB_FILE);
  } catch {
    await fs.writeFile(DB_FILE, JSON.stringify({ users: [], spas: [], services: [], bookings: [] }, null, 2));
    console.log('Database file created');
  }
};

// Read database gloabally
app.locals.readDB = async () => {
  const data = await fs.readFile(DB_FILE, 'utf8');
  return JSON.parse(data);
};

// Write database globally
app.locals.writeDB = async (data) => {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
};







app.get("/", (req, res) => {
  res.send("Backend is running...");
});

const PORT = 5000;


//Use route




app.get('/hai', (req, res) =>{
  res.json({
    message : 'hai',
  });
});

//Health Check route
app.get('/api/health', (req, res) =>{
  res.json({
    success : true,
    message : 'server is running',
    timeStamp : new Date().toISOString()
  });
});

//404 handler
app.use((req, res) =>{
  res.status(404).json({
    success : false,
    message : 'Route not Found'
  });
});

//Error handler
app.use((err, req, res, next) =>{
  console.error('server error:', err);
  res.status(500).json({
    success : false,
    message : 'Internal Server Error'
  });
});

// Start server
const startServer = async () => {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Database file: ${DB_FILE}`);
    console.log('Routes available');
  });
};

startServer();





