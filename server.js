const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const app = express();
const port = process.env.PORT;
const ProcessHandler = require('./process');
require('dotenv').config();

// Middleware for common headers
app.use((req, res, next) => {
  // Set desired headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Continue to the next middleware
  next();
});

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL');
  }
});

// Configure multer to handle FormData
const upload = multer();

// Enable CORS
app.use(cors());

// Middleware to parse JSON
app.use(bodyParser.json({ encoding: 'utf-8' }));
app.use(bodyParser.urlencoded({ extended: true, encoding: 'utf-8' }));

const processHandler = new ProcessHandler(db);

// GET endpoint
app.get('/api/get', (req, res) => {
  processHandler.handleGetRequest(req, res);
});

// POST endpoint
app.post('/api/post', upload.none(), (req, res) => {
  processHandler.handlePostRequest(req, res);
});

// PUT endpoint
app.put('/api/put/:id', upload.none(), (req, res) => {
  processHandler.handleUpdateRequest(req, res);
});

// DELETE endpoint
app.delete('/api/delete/:id', (req, res) => {
  processHandler.handleDeleteRequest(req, res);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
