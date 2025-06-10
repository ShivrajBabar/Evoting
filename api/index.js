const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const fs = require('fs');

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

const photoDir = 'uploads/photos';
if (!fs.existsSync(photoDir)) {
  fs.mkdirSync(photoDir, { recursive: true });
}

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


const upload = multer({ storage, fileFilter });
// Middleware
app.use(cors({
  origin: 'http://localhost:3001', // allow frontend only
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads/photos', express.static('uploads/photos'));



// Utility query function
const query = async ({ query, values = [] }) => {
  const [results] = await pool.execute(query, values);
  return results;
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
    const {
      name,
      email,
      phone,
      password,
      dob,
      state_id,
      district_id,
      constituency_id
    } = req.body;

    console.log('Received DOB:', dob);

    const photo_name = req.file ? req.file.filename : null;

    // Validate required fields
    if (!name || !email || !phone || !password || !state_id || !district_id || !constituency_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if email already exists
    const [existingUser] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Start a transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Insert user into the users table
      const [userResult] = await connection.query(
        `INSERT INTO users 
        (role_id, name, email, phone, dob, password, photo_name, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`,
        [2, name, email, phone, dob || null, hashedPassword, photo_name]
      );

      const userId = userResult.insertId;

      // Insert admin into the admins table
      await connection.query(
        `INSERT INTO admins 
        (user_id, state_id, district_id, constituency_id) 
        VALUES (?, ?, ?, ?)`,
        [userId, state_id, district_id, constituency_id]
      );

      // Commit the transaction
      await connection.commit();
      connection.release();

      console.log("✅ Admin created successfully");
      res.status(201).json({
        message: 'Admin created successfully',
        userId: userId
      });

    } catch (error) {
      // Rollback the transaction if any error occurs
      await connection.rollback();
      connection.release();
      throw error;
    }

  } catch (error) {
    console.error('❌ Error saving admin:', error);

    // Delete uploaded file if registration failed
    if (req.file) {
      fs.unlink(path.join(photoDir, req.file.filename), (err) => {
        if (err) console.error('Error deleting uploaded file:', err);
      });
    }

    res.status(500).json({
      error: 'Failed to create admin',
      details: error.message
    });
  }
});


app.get('/api/admins', async (req, res) => {
  try {
    const admins = await query({
      query: `
        SELECT 
          u.id,
          u.role_id,
          u.name,
          u.email,
          u.phone,
          u.dob,
          u.status,
          a.constituency_id,
          a.state_id,
          a.district_id,
          vc.name AS vidhansabha_constituencies_name,
          s.name AS state_name,
          d.name AS district_name
        FROM admins a
        JOIN users u ON a.user_id = u.id
        LEFT JOIN vidhansabha_constituencies vc ON a.vidhansabha_constituencies_id = vc.id
        LEFT JOIN states s ON a.state_id = s.id
        LEFT JOIN districts d ON a.district_id = d.id
        ORDER BY u.name ASC
      `
    });

    res.status(200).json(admins);
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ error: 'Failed to fetch admins' });
  }
});

const safe = (value) => {
  return value === undefined || value === null || value === '' ? null : value;
};


// Create Candidate
app.post('/api/candidates', upload.fields([
  { name: 'photo' },
  { name: 'signature' },
  { name: 'income_photo' },
  { name: 'nationality_photo' },
  { name: 'education_photo' },
  { name: 'cast_photo' },
  { name: 'non_crime_photo' },
  { name: 'party_logo' },
]), async (req, res) => {
  try {
    const {
      name, email, aadhar, phone, dob, district_id, state_id,
      loksabha_id, vidhansabha_id, local_body_id, ward_id, booth_id, election_id,
      income, income_no, nationality, nationality_no,
      education, religion, cast, cast_no, non_crime_no,
      party, amount, method
    } = req.body;

    const files = req.files;
    const getFile = (key) => files[key]?.[0]?.filename || null;

    const result = await query({
      query: `
        INSERT INTO candidates (
          name, email, aadhar, phone, dob, district_id, state_id, loksabha_id,
          vidhansabha_id, local_body_id, ward_id, booth_id, election_id,
          income, income_no, income_photo, nationality, nationality_no, nationality_photo,
          education, education_photo, religion, cast, cast_no, cast_photo,
          non_crime_no, non_crime_photo, party, party_logo, photo, signature,
          amount, method, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Approved')
      `,
      values: [
        safe(name), safe(email), safe(aadhar), safe(phone), safe(dob), safe(district_id), safe(state_id), safe(loksabha_id),
        safe(vidhansabha_id), safe(local_body_id), safe(ward_id), safe(booth_id), safe(election_id),
        safe(income), safe(income_no), safe(getFile('income_photo')), safe(nationality), safe(nationality_no), safe(getFile('nationality_photo')),
        safe(education), safe(getFile('education_photo')), safe(religion), safe(cast), safe(cast_no), safe(getFile('cast_photo')),
        safe(non_crime_no), safe(getFile('non_crime_photo')), safe(party), safe(getFile('party_logo')), safe(getFile('photo')), safe(getFile('signature')),
        safe(amount), safe(method)
      ]
    });

    res.status(201).json({ message: 'Candidate registered successfully', candidateId: result.insertId });
  } catch (error) {
    console.error('Error creating candidate:', error);
    res.status(500).json({ error: 'Failed to register candidate', details: error.message });
  }
});



// Get all candidates
app.get('/api/candidates', async (req, res) => {
  try {
    const candidates = await query({
      query: `
        SELECT 
          c.id, c.name, c.dob, c.party, c.status, c.photo, c.party_logo, 
          c.election_id, c.vidhansabha_id,
          e.name AS election_name,
          vc.name AS constituency_name
        FROM candidates c
        LEFT JOIN elections e ON c.election_id = e.id
        LEFT JOIN vidhansabha_constituencies vc ON c.vidhansabha_id = vc.id
        ORDER BY c.id DESC
      `
    });

    // Utility function to get full file URL
    const getFileUrl = (fileName) =>
      fileName ? `http://localhost:${PORT}/uploads/photos/${fileName}` : null;

    // Format candidate data
    const formatted = candidates.map(candidate => ({
      id: candidate.id,
      name: candidate.name,
      party: candidate.party,
      status: candidate.status,
      dob: candidate.dob,
      photo: getFileUrl(candidate.photo),
      party_logo: getFileUrl(candidate.party_logo),
      election: candidate.election_name || 'Unknown Election',
      election_id: candidate.election_id, // ✅ Added election_id
      constituency: candidate.constituency_name || 'Unknown Constituency'
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ 
      error: 'Failed to fetch candidates', 
      details: error.message 
    });
  }
});



// Get single candidate by ID
app.get('/api/candidates/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [candidate] = await query({
      query: `
        SELECT 
          c.*,
          e.name AS election_name,
          vc.name AS vidhansabha_name,
          lc.name AS loksabha_name,
          d.name AS district_name,
          s.name AS state_name,
          lb.name AS local_body_name,
          w.name AS ward_name,
          b.name AS booth_name
        FROM candidates c
        LEFT JOIN elections e ON c.election_id = e.id
        LEFT JOIN vidhansabha_constituencies vc ON c.vidhansabha_id = vc.id
        LEFT JOIN loksabha_constituencies lc ON c.loksabha_id = lc.id
        LEFT JOIN districts d ON c.district_id = d.id
        LEFT JOIN states s ON c.state_id = s.id
        LEFT JOIN local_bodies lb ON c.local_body_id = lb.id
        LEFT JOIN wards w ON c.ward_id = w.id
        LEFT JOIN booths b ON c.booth_id = b.id
        WHERE c.id = ?
        LIMIT 1
      `,
      values: [id]
    });

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    // Utility function to get full file URL
    const getFileUrl = (fileName) =>
      fileName ? `http://localhost:${PORT}/uploads/photos/${fileName}` : null;

    const formatted = {
      ...candidate,
      photo: getFileUrl(candidate.photo),
      signature: getFileUrl(candidate.signature),
      income_photo: getFileUrl(candidate.income_photo),
      nationality_photo: getFileUrl(candidate.nationality_photo),
      education_photo: getFileUrl(candidate.education_photo),
      cast_photo: getFileUrl(candidate.cast_photo),
      non_crime_photo: getFileUrl(candidate.non_crime_photo),
      party_logo: getFileUrl(candidate.party_logo)
    };

    res.status(200).json(formatted);
  } catch (error) {
    console.error('Error fetching candidate:', error);
    res.status(500).json({ 
      error: 'Failed to fetch candidate', 
      details: error.message 
    });
  }
});



// Add this to your index.js file, preferably with other POST endpoints

// 9. Register Voter
app.post('/api/voters', upload.single('photo'), async (req, res) => {
  console.log("👉 Incoming request to /api/voters");

  try {
    console.log("📦 Request body:", req.body);
    console.log("🖼 Uploaded file:", req.file);

    // Destructure form data from req.body
    const {
      name,
      email,
      phone,
      dob,
      voter_id,
      password,
      state,
      district,
      loksabhaWard,
      vidhansabhaWard,
      localbody,
      ward,
      booth
    } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !voter_id || !password || !state || !district) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if email already exists
    const [existingUser] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Check if voter ID already exists
    const [existingVoter] = await pool.query(
      'SELECT id FROM voters WHERE voter_id = ?',
      [voter_id]
    );

    if (existingVoter.length > 0) {
      return res.status(400).json({ error: 'Voter ID already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    const photo_name = req.file ? req.file.filename : null;

    // Start a transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Insert user into the users table (role_id 3 for voter)
      const [userResult] = await connection.query(
        `INSERT INTO users 
        (role_id, name, email, phone, dob, password, photo_name, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`,
        [3, name, email, phone, dob || null, hashedPassword, photo_name]
      );

      const userId = userResult.insertId;

      // Insert voter into the voters table
      await connection.query(
        `INSERT INTO voters 
        (user_id, voter_id, state_id, district_id, loksabha_ward_id, 
         vidhansabha_ward_id, municipal_corp_id, municipal_corp_ward_id, booth_id, photo) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          voter_id,
          state,
          district,
          loksabhaWard || null,
          vidhansabhaWard || null,
          localbody || null,
          ward || null,
          booth || null,
          photo_name
        ]
      );

      // Commit the transaction
      await connection.commit();
      connection.release();

      console.log("✅ Voter registered successfully");
      res.status(201).json({
        message: 'Voter registered successfully',
        userId: userId
      });

    } catch (error) {
      // Rollback the transaction if any error occurs
      await connection.rollback();
      connection.release();

      // Delete uploaded file if registration failed
      if (req.file) {
        fs.unlink(path.join(photoDir, req.file.filename), (err) => {
          if (err) console.error('Error deleting uploaded file:', err);
        });
      }

      throw error;
    }

  } catch (error) {
    console.error('❌ Error registering voter:', error);
    res.status(500).json({
      error: 'Failed to register voter',
      details: error.message
    });
  }
});


// GET all voters
app.get('/api/voters', async (req, res) => {
  console.log("📥 GET request to /api/voters");

  try {
    const [voters] = await pool.query(`
      SELECT 
        v.id AS voter_id,
        u.id AS user_id,
        u.name,
        u.email,
        u.phone,
        u.dob,
        u.status,
        u.photo_name,
        v.voter_id AS voter_card_number,
        v.state_id,
        v.district_id,
        v.loksabha_ward_id,
        v.vidhansabha_ward_id,
        v.municipal_corp_id,
        v.municipal_corp_ward_id,
        v.booth_id
      FROM voters v
      JOIN users u ON v.user_id = u.id
      WHERE u.role_id = 3
    `);

    res.json(voters);
  } catch (error) {
    console.error("❌ Error fetching voters:", error);
    res.status(500).json({ error: 'Failed to fetch voters', details: error.message });
  }
});

// 10. Get admin by ID
app.get('/api/admins/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await query({
      query: `
        SELECT 
          u.id AS user_id,
          u.name,
          u.email,
          u.phone,
          u.dob,
          u.status,
          u.photo_name,
          a.state_id,
          a.district_id,
          a.constituency_id,
          s.name AS state,
          d.name AS district,
          vc.name AS constituency
        FROM admins a
        JOIN users u ON a.user_id = u.id
        LEFT JOIN states s ON a.state_id = s.id
        LEFT JOIN districts d ON a.district_id = d.id
        LEFT JOIN vidhansabha_constituencies vc ON a.constituency_id = vc.id
        WHERE a.id = ?
        LIMIT 1
      `,
      values: [id]
    });

    if (!result.length) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    const admin = result[0];
    admin.photo_url = admin.photo_name
      ? `http://localhost:3000/uploads/photos/${admin.photo_name}`
      : null;

    res.status(200).json(admin);
  } catch (err) {
    console.error('Error fetching admin by ID:', err);
    res.status(500).json({ error: 'Failed to fetch admin by ID' });
  }
});

app.post('/api/elections', async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.name || !req.body.type || !req.body.status || !req.body.date ||
      !req.body.applicationStartDate || !req.body.applicationEndDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await query({
      query: `INSERT INTO elections 
    (name, type, status, election_date, application_start_date, application_end_date, 
     result_date, state_id, district_id, loksabha_id, vidhansabha_id, local_body_id, description)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      values: [
        req.body.name,
        req.body.type,
        req.body.status,
        req.body.date,
        req.body.applicationStartDate,
        req.body.applicationEndDate,
        req.body.resultDate || null,
        req.body.state || null,
        req.body.district || null,
        req.body.loksabha || null,
        req.body.vidhansabha || null,
        req.body.localBody || null,
        req.body.description || null
      ]
    });


    res.status(201).json({ message: 'Election created successfully', id: result.insertId });
  } catch (error) {
    console.error('Error inserting election:', error);
    res.status(500).json({
      error: 'Failed to create election',
      details: error.message
    });
  }
});


app.get('/api/elections', async (req, res) => {
  try {
    const elections = await query({
      query: `
        SELECT 
          e.id, 
          e.name, 
          e.type, 
          e.status, 
          e.election_date AS date,
          e.application_start_date AS applicationStartDate,
          e.application_end_date AS applicationEndDate,
          e.result_date AS resultDate,
          e.state_id AS state,
          e.district_id AS district,
          e.loksabha_id AS loksabha,
          e.vidhansabha_id AS vidhansabha,
          e.local_body_id AS localBody,
          e.description,
          s.name AS stateName,
          d.name AS districtName
        FROM elections e
        LEFT JOIN states s ON e.state_id = s.id
        LEFT JOIN districts d ON e.district_id = d.id
      `,
      values: [] // No parameters needed
    });

    res.status(200).json(elections);
  } catch (error) {
    console.error('Error fetching elections:', error);
    res.status(500).json({
      error: 'Failed to fetch elections',
      details: error.message
    });
  }
});


app.post('/api/votes', async (req, res) => {
  const { voter_id, candidate_id, election_id } = req.body;

  if (!voter_id || !candidate_id || !election_id) {
    return res.status(400).json({ error: 'voter_id, candidate_id, and election_id are required' });
  }

  try {
    // Check if voter already voted in this election
    const existingVote = await query({
      query: `SELECT id FROM votes WHERE voter_id = ? AND election_id = ?`,
      values: [voter_id, election_id]
    });

    if (existingVote.length > 0) {
      return res.status(400).json({ error: 'Voter has already voted in this election' });
    }

    // Record the vote
    await query({
      query: `INSERT INTO votes (voter_id, candidate_id, election_id, vote_date) VALUES (?, ?, ?, NOW())`,
      values: [voter_id, candidate_id, election_id]
    });

    res.status(201).json({ message: 'Vote recorded successfully' });
  } catch (error) {
    console.error('Error recording vote:', error);
    res.status(500).json({ error: 'Failed to record vote', details: error.message });
  }
});

app.get('/api/votes/counts', async (req, res) => {
  const { election_id } = req.query;

  if (!election_id) {
    return res.status(400).json({ error: 'election_id is required' });
  }

  try {
    const results = await query({
      query: `
        SELECT 
          c.id AS candidate_id,
          c.name AS candidate_name,
          c.party,
          COUNT(v.id) AS vote_count
        FROM candidates c
        LEFT JOIN votes v ON c.id = v.candidate_id AND v.election_id = ?
        WHERE c.election_id = ?
        GROUP BY c.id, c.name, c.party
        ORDER BY vote_count DESC
      `,
      values: [election_id, election_id]
    });

    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching vote counts:', error);
    res.status(500).json({ error: 'Failed to fetch vote counts', details: error.message });
  }
});






// ========== START SERVER ==========
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
