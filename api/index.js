const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const fs = require('fs');
const upload = multer({ dest: 'uploads/' });

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Create pool for MySQL
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ballet_evoting_schema',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads/photos', express.static('uploads/photos'));

// Ensure uploads folder exists
const photoDir = 'uploads/photos';
if (!fs.existsSync(photoDir)) {
  fs.mkdirSync(photoDir, { recursive: true });
}

// Utility query function
const query = async ({ query, values = [] }) => {
  const [results] = await pool.execute(query, values);
  return results;
};

// Configure Multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, photoDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = Date.now() + ext;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// const upload = multer({ storage, fileFilter });


// ========== API ROUTES ==========

// Root
app.get('/', (req, res) => {
  res.send('Hello from Node.js backend with MySQL! 🚀');
});

// 1. Get States
app.get('/api/states', async (req, res) => {
  try {
    const states = await query({ query: 'SELECT id, name FROM states ORDER BY name' });
    res.status(200).json(states);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch states' });
  }
});

// 2. Get Districts
app.get('/api/districts', async (req, res) => {
  const { state_id } = req.query;
  if (!state_id) return res.status(400).json({ message: 'state_id is required' });

  try {
    const districts = await query({
      query: 'SELECT id, name FROM districts WHERE state_id = ? ORDER BY name',
      values: [state_id]
    });
    res.status(200).json(districts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch districts' });
  }
});

// 3. Get Local Bodies
app.get('/api/local-bodies', async (req, res) => {
  const { district_id } = req.query;
  if (!district_id) return res.status(400).json({ message: 'district_id is required' });

  try {
    const localBodies = await query({
      query: 'SELECT id, name FROM local_bodies WHERE district_id = ? ORDER BY name',
      values: [district_id]
    });
    res.status(200).json(localBodies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch local bodies' });
  }
});

// 4. Get Constituencies
app.get('/api/constituencies', async (req, res) => {
  const { state_id, district_id, type } = req.query;

  try {
    let constituencies;

    if (type === 'loksabha' && state_id) {
      constituencies = await query({
        query: 'SELECT id, name FROM loksabha_constituencies WHERE state_id = ? ORDER BY name',
        values: [state_id]
      });
    } else if (type === 'vidhansabha' && district_id) {
      constituencies = await query({
        query: 'SELECT id, name FROM vidhansabha_constituencies WHERE district_id = ? ORDER BY name',
        values: [district_id]
      });
    } else {
      return res.status(400).json({ message: 'Provide correct type and id' });
    }

    res.status(200).json(constituencies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch constituencies' });
  }
});

// 5. Get Wards
app.get('/api/wards', async (req, res) => {
  const { local_body_id } = req.query;
  if (!local_body_id) return res.status(400).json({ message: 'local_body_id is required' });

  try {
    const wards = await query({
      query: 'SELECT id, name FROM wards WHERE local_body_id = ? ORDER BY name',
      values: [local_body_id]
    });
    res.status(200).json(wards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch wards' });
  }
});

// 6. Get Booths
app.get('/api/booths', async (req, res) => {
  const { ward_id } = req.query;
  if (!ward_id) return res.status(400).json({ message: 'ward_id is required' });

  try {
    const booths = await query({
      query: 'SELECT id, name FROM booths WHERE ward_id = ? ORDER BY name',
      values: [ward_id]
    });
    res.status(200).json(booths);
  } catch (error) {
    console.error('Error fetching booths:', error);
    res.status(500).json({ error: 'Failed to fetch booths' });
  }
});

// 7. Get Admins
app.get('/api/admins', async (req, res) => {
  try {
    const admins = await query({
      query: `
        SELECT a.*, u.name, u.email, u.phone, s.name as state_name, d.name as district_name
        FROM admins a
        JOIN users u ON a.user_id = u.id
        JOIN states s ON a.state_id = s.id
        JOIN districts d ON a.district_id = d.id
      `
    });
    res.status(200).json(admins);
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ error: 'Failed to fetch admins' });
  }
});

// 8. Create Admin
app.post('/api/admins', upload.single('photo'), async (req, res) => {
  console.log("👉 Incoming request to /api/admins");

  try {
    console.log("📦 Request body:", req.body);
    console.log("🖼 Uploaded file:", req.file);

    // Destructure form data from req.body and req.file (for photo)
    const { name, email, phone, password, state_id, district_id, constituency_id } = req.body;
    const photo_name = req.file ? req.file.filename : null;

    if (!name || !email || !phone || !password || !state_id || !district_id || !constituency_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("🔐 Hashed password:", hashedPassword);
    console.log("📝 Saving user...");

    // Insert user into the database
    const result = await pool.query(`
      INSERT INTO users (role_id, name, email, phone, password, photo_name, status)
      VALUES (?, ?, ?, ?, ?, ?, 'active')
    `, [2, name, email, phone, hashedPassword, photo_name]);

    console.log("✅ User insert result:", result);

    const userId = result[0]?.insertId || result.insertId;

    console.log("🆔 Inserted userId:", userId);
    console.log("🗳 Saving admin...");

    // Insert the admin into the database
    await pool.query(`
      INSERT INTO admins (user_id, state_id, district_id, constituency_id)
      VALUES (?, ?, ?, ?)
    `, [userId, state_id, district_id, constituency_id]);

    console.log("✅ Admin created");
    res.status(201).json({ message: 'Admin created successfully' });

  } catch (error) {
    console.error('❌ Error saving admin:', error);
    res.status(500).json({ error: 'Failed to create admin', details: error.message });
  }
});
  

// ========== START SERVER ==========
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
