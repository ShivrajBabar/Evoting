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
    cb(new Error('Only image files are allowed'), true);
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
            vc.name AS constituency,
            s.name AS state_name,
            d.name AS district_name
            FROM admins a
            JOIN users u ON a.user_id = u.id
            LEFT JOIN vidhansabha_constituencies vc ON a.constituency_id = vc.id
            LEFT JOIN states s ON a.state_id = s.id
            LEFT JOIN districts d ON a.district_id = d.id
            ORDER BY u.name ASC;
      `
    });

    res.status(200).json(admins);
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ error: 'Failed to fetch admins' });
  }
});

app.get('/api/admins/users/:id', async (req, res) => {
  const userId = req.params.id;
  console.log(`👉 Incoming request to get admin with user ID ${userId}`);

  try {
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Fetch admin details by joining users and admins tables only
    const [rows] = await pool.query(
      `SELECT u.id AS user_id, u.name, u.email, u.phone, u.dob, u.photo_name, u.status,
              a.state_id, a.district_id, a.constituency_id
       FROM users u
       INNER JOIN admins a ON u.id = a.user_id
       WHERE u.id = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    const admin = rows[0];

    res.json({
      userId: admin.user_id,
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      dob: admin.dob,
      photo_name: admin.photo_name,
      status: admin.status,
      state_id: admin.state_id,
      district_id: admin.district_id,
      constituency_id: admin.constituency_id
    });

  } catch (error) {
    console.error('❌ Error fetching admin:', error);
    res.status(500).json({ error: 'Failed to fetch admin', details: error.message });
  }
});

app.put('/api/admins/:id', upload.single('photo'), async (req, res) => {
  const userId = req.params.id;
  console.log("✏️ Updating admin:", userId);

  try {
    const {
      name,
      email,
      phone,
      dob,
      state_id,
      district_id,
      constituency_id
    } = req.body;

    const newPhoto = req.file ? req.file.filename : null;

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Fetch existing photo to delete if replaced
      const [[existingUser]] = await connection.query(
        'SELECT photo_name FROM users WHERE id = ?',
        [userId]
      );

      if (!existingUser) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({ error: 'User not found' });
      }

      // Update user info
      await connection.query(
        `UPDATE users 
         SET name = ?, email = ?, phone = ?, dob = ?, photo_name = COALESCE(?, photo_name) 
         WHERE id = ?`,
        [name, email, phone, dob || null, newPhoto, userId]
      );

      // Update admin info
      await connection.query(
        `UPDATE admins 
         SET state_id = ?, district_id = ?, constituency_id = ? 
         WHERE user_id = ?`,
        [state_id, district_id, constituency_id, userId]
      );

      await connection.commit();
      connection.release();

      // Delete old photo if a new one was uploaded
      if (newPhoto && existingUser.photo_name && existingUser.photo_name !== newPhoto) {
        const oldPath = path.join(photoDir, existingUser.photo_name);
        fs.unlink(oldPath, (err) => {
          if (err) console.error("🧨 Failed to delete old photo:", err);
        });
      }

      console.log("✅ Admin updated successfully");
      res.status(200).json({ message: "Admin updated successfully" });

    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }

  } catch (error) {
    console.error("❌ Error updating admin:", error);

    // Delete new photo if update fails
    if (req.file) {
      fs.unlink(path.join(photoDir, req.file.filename), (err) => {
        if (err) console.error("Failed to clean up new photo:", err);
      });
    }

    res.status(500).json({
      error: "Failed to update admin",
      details: error.message
    });
  }
});

app.delete('/api/admins/:id', async (req, res) => {
  const adminId = req.params.id;

  console.log('➡️ DELETE /api/admins/:id');
  console.log('🧾 Admin ID:', adminId);

  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    // Get user_id and photo_name from the admin record
    const [adminRows] = await connection.query(
      `SELECT u.id AS user_id, u.photo_name
       FROM admins a
       JOIN users u ON a.user_id = u.id
       WHERE a.id = ?`,
      [adminId]
    );

    if (!adminRows || adminRows.length === 0) {
      console.warn('❌ Admin not found for ID:', adminId);
      connection.release();
      return res.status(404).json({ error: 'Admin not found' });
    }

    const { user_id, photo_name } = adminRows[0];
    console.log('🆔 Found user_id:', user_id);
    console.log('🖼️ Found photo_name:', photo_name);

    // Delete from admins table
    await connection.query('DELETE FROM admins WHERE id = ?', [adminId]);

    // Delete from users table
    await connection.query('DELETE FROM users WHERE id = ?', [user_id]);

    await connection.commit();
    connection.release();

    // Delete uploaded photo from disk if exists
    if (photo_name) {
      const photoPath = path.join(photoDir, photo_name);
      fs.unlink(photoPath, (err) => {
        if (err) {
          console.error('⚠️ Error deleting photo file:', err);
        } else {
          console.log('🗑️ Photo file deleted:', photo_name);
        }
      });
    }

    res.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting admin:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});









// PATCH /api/admins/:id/status
app.patch('/api/admins/:id/status', async (req, res) => {
  const userId = req.params.id; // Get id from URL params
  const { status } = req.body;

  console.log('➡️ PATCH /api/admins/:id/status');
  console.log('🧾 userId:', userId);
  console.log('🟢 Requested new status:', status);

  // Validate status
  const validStatuses = ['active', 'inactive', 'suspended'];
  if (!validStatuses.includes(status)) {
    console.warn('⚠️ Invalid status:', status);
    return res.status(400).json({ error: 'Invalid status value' });
  }

  try {
    // Check if user exists
    const [existingUser] = await pool.query('SELECT id FROM users WHERE id = ?', [userId]);
    console.log('📦 Existing user lookup result:', existingUser);

    if (!existingUser || existingUser.length === 0) {
      console.warn('❌ User not found for ID:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    // Update status
    const [updateResult] = await pool.query('UPDATE users SET status = ? WHERE id = ?', [status, userId]);
    console.log('✅ Status update result:', updateResult);

    res.json({ message: `User status updated to ${status}` });
  } catch (error) {
    console.error('❌ Error updating user status:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
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

app.delete('/api/candidates/:id', async (req, res) => {
  const candidateId = req.params.id;

  try {
    // Delete votes for this candidate
    await query({
      query: 'DELETE FROM votes WHERE candidate_id = ?',
      values: [candidateId],
    });

    // Now delete the candidate
    await query({
      query: 'DELETE FROM candidates WHERE id = ?',
      values: [candidateId],
    });

    res.json({ message: `Candidate with ID ${candidateId} and related votes deleted.` });
  } catch (error) {
    console.error('Error deleting candidate:', error);
    res.status(500).json({ error: 'Failed to delete candidate', details: error.message });
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
      dob: candidate.dob,
      party: candidate.party,
      status: candidate.status,
      photo_url: getFileUrl(candidate.photo),        // Updated key name to match frontend usage
      party_logo_url: getFileUrl(candidate.party_logo),
      election_type: candidate.election_name || 'Unknown Election', // Assuming this is what you expect
      election_id: candidate.election_id,
      vidhansabha_id: candidate.vidhansabha_id,     // ✅ Include vidhansabha_id as constituency_id
      constituency_name: candidate.constituency_name || 'Unknown Constituency'
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

app.patch('/api/candidates/:id/status', async (req, res) => {
  const candidateId = req.params.id;
  const { status } = req.body;

  if (!['Approved', 'Pending', 'Rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  try {
    const result = await query({
      query: `UPDATE candidates SET status = ? WHERE id = ?`,
      values: [status, candidateId]
    });

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    res.status(200).json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error updating candidate status:', error);
    res.status(500).json({ error: 'Failed to update status', details: error.message });
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

app.patch('/api/voters/:id/status', async (req, res) => {
  const voterId = req.params.id;
  const { status } = req.body;

  if (!['Active', 'Inactive'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  try {
    // Step 1: Find the user_id from the voters table
    const [voterRows] = await pool.query(
      'SELECT user_id FROM voters WHERE id = ?',
      [voterId]
    );

    if (voterRows.length === 0) {
      return res.status(404).json({ error: 'Voter not found' });
    }

    const userId = voterRows[0].user_id;

    // Step 2: Update the users table
    const [result] = await pool.query(
      'UPDATE users SET status = ? WHERE id = ?',
      [status, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found or status not changed' });
    }

    res.status(200).json({ message: 'Voter status updated successfully' });

  } catch (error) {
    console.error('❌ Error updating voter status:', error);
    res.status(500).json({ error: 'Failed to update voter status', details: error.message });
  }
});

app.post('/api/voters/update/:id', upload.single('photo'), async (req, res) => {
  const voterId = req.params.id;
  console.log(`🔄 POST /api/voters/update/${voterId}`);
  console.log("📦 Request body:", req.body);

  const {
    name,
    email,
    phone,
    dob,
    voter_id,
    state,
    district,
    loksabhaWard,
    vidhansabhaWard,
    localbody,
    ward,
    booth,
    status
  } = req.body;

  const photo_name = req.file ? req.file.filename : null;

  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // 1. Get user_id from the voters table
      const [voterRows] = await connection.query('SELECT user_id, photo FROM voters WHERE id = ?', [voterId]);

      if (voterRows.length === 0) {
        return res.status(404).json({ error: 'Voter not found' });
      }

      const userId = voterRows[0].user_id;
      const oldPhoto = voterRows[0].photo;

      // 2. Update users table
      const updateUserSql = `
        UPDATE users 
        SET name = ?, email = ?, phone = ?, dob = ?, ${photo_name ? 'photo_name = ?,' : ''} status = ? 
        WHERE id = ?
      `;
      const userParams = photo_name
        ? [name, email, phone, dob || null, photo_name, status || 'active', userId]
        : [name, email, phone, dob || null, status || 'active', userId];

      await connection.query(updateUserSql, userParams);

      // 3. Update voters table
      const updateVoterSql = `
        UPDATE voters 
        SET voter_id = ?, state_id = ?, district_id = ?, loksabha_ward_id = ?, 
            vidhansabha_ward_id = ?, municipal_corp_id = ?, municipal_corp_ward_id = ?, booth_id = ?
            ${photo_name ? ', photo = ?' : ''} 
        WHERE id = ?
      `;
      const voterParams = photo_name
        ? [voter_id, state, district, loksabhaWard || null, vidhansabhaWard || null, localbody || null, ward || null, booth || null, photo_name, voterId]
        : [voter_id, state, district, loksabhaWard || null, vidhansabhaWard || null, localbody || null, ward || null, booth || null, voterId];

      await connection.query(updateVoterSql, voterParams);

      await connection.commit();
      connection.release();

      // Optionally delete old photo
      if (photo_name && oldPhoto && oldPhoto !== photo_name) {
        const oldPath = path.join(photoDir, oldPhoto);
        fs.unlink(oldPath, (err) => {
          if (err) console.warn('⚠️ Failed to delete old photo:', err);
        });
      }

      res.json({ message: 'Voter updated successfully' });

    } catch (err) {
      await connection.rollback();
      connection.release();

      if (photo_name) {
        fs.unlink(path.join(photoDir, photo_name), () => { });
      }

      console.error('❌ Error during update:', err);
      res.status(500).json({ error: 'Failed to update voter', details: err.message });
    }

  } catch (err) {
    console.error('❌ Error opening DB connection:', err);
    res.status(500).json({ error: 'Failed to process update request' });
  }
});






app.get('/api/voters/photo/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).send('Image not found');
    }

    res.sendFile(filePath);
  });
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

app.get('/api/voters/:id', async (req, res) => {
  const id = req.params.id;
  console.log(`📥 GET /api/voters/${id}`); // fixed log message too

  try {
    const [voter] = await pool.query(`
      SELECT 
        u.id AS user_id,
        u.name,
        u.email,
        u.phone,
        u.dob,
        u.status,
        u.photo_name,

        v.id AS voter_id,
        v.voter_id AS voter_card_number,

        v.state_id, v.district_id, v.loksabha_ward_id, v.vidhansabha_ward_id,
        v.municipal_corp_id, v.municipal_corp_ward_id, v.booth_id,

        s.name AS state_name,
        d.name AS district_name,
        ls.name AS loksabha_name,
        vs.name AS vidhansabha_name,
        mc.name AS municipal_corp_name,
        mw.name AS ward_name,
        b.name AS booth_name

      FROM users u
      JOIN voters v ON v.user_id = u.id

      LEFT JOIN states s ON v.state_id = s.id
      LEFT JOIN districts d ON v.district_id = d.id
      LEFT JOIN loksabha_constituencies ls ON v.loksabha_ward_id = ls.id
      LEFT JOIN vidhansabha_constituencies vs ON v.vidhansabha_ward_id = vs.id
      LEFT JOIN local_bodies mc ON v.municipal_corp_id = mc.id
      LEFT JOIN wards mw ON v.municipal_corp_ward_id = mw.id
      LEFT JOIN booths b ON v.booth_id = b.id

      WHERE v.id = ?
      LIMIT 1
    `, [id]);

    if (!voter || voter.length === 0) {
      return res.status(404).json({ error: 'Voter not found' });
    }

    res.json(voter[0]);
  } catch (error) {
    console.error("❌ Error fetching voter by id:", error);
    res.status(500).json({ error: 'Failed to fetch voter', details: error.message });
  }
});

app.get('/api/voters/users/:id', async (req, res) => {
  const id = req.params.id;
  console.log(`📥 GET /api/voters/${id}`); // fixed log message too

  try {
    const [voter] = await pool.query(`
      SELECT 
        u.id AS user_id,
        u.name,
        u.email,
        u.phone,
        u.dob,
        u.status,
        u.photo_name,

        v.id AS voter_id,
        v.voter_id AS voter_card_number,

        v.state_id, v.district_id, v.loksabha_ward_id, v.vidhansabha_ward_id,
        v.municipal_corp_id, v.municipal_corp_ward_id, v.booth_id,

        s.name AS state_name,
        d.name AS district_name,
        ls.name AS loksabha_name,
        vs.name AS vidhansabha_name,
        mc.name AS municipal_corp_name,
        mw.name AS ward_name,
        b.name AS booth_name

      FROM users u
      JOIN voters v ON v.user_id = u.id

      LEFT JOIN states s ON v.state_id = s.id
      LEFT JOIN districts d ON v.district_id = d.id
      LEFT JOIN loksabha_constituencies ls ON v.loksabha_ward_id = ls.id
      LEFT JOIN vidhansabha_constituencies vs ON v.vidhansabha_ward_id = vs.id
      LEFT JOIN local_bodies mc ON v.municipal_corp_id = mc.id
      LEFT JOIN wards mw ON v.municipal_corp_ward_id = mw.id
      LEFT JOIN booths b ON v.booth_id = b.id

      WHERE v.user_id = ?
      LIMIT 1
    `, [id]);

    if (!voter || voter.length === 0) {
      return res.status(404).json({ error: 'Voter not found' });
    }

    res.json(voter[0]);
  } catch (error) {
    console.error("❌ Error fetching voter by id:", error);
    res.status(500).json({ error: 'Failed to fetch voter', details: error.message });
  }
});






// 10. Get admin by ID
app.get('/api/admins/user/:user_id', async (req, res) => {
  const { user_id } = req.params;

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
        WHERE a.user_id = ?
        LIMIT 1
      `,
      values: [user_id]
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
    console.error('Error fetching admin by user_id:', err);
    res.status(500).json({ error: 'Failed to fetch admin by user_id' });
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
      query: `
        INSERT INTO elections 
          (name, type, status, election_date, application_start_date, application_end_date, 
           result_date, state_id, district_id, loksabha_id, vidhansabha_id, local_body_id, 
           description, result)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        req.body.description || null,
        "No"  // ✅ Set default value for result
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

app.delete('/api/elections/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Validate the ID
    if (!id) {
      return res.status(400).json({ error: 'Election ID is required' });
    }

    // Delete the election
    const result = await query({
      query: `DELETE FROM elections WHERE id = ?`,
      values: [id]
    });

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Election not found' });
    }

    res.status(200).json({ message: 'Election deleted successfully' });
  } catch (error) {
    console.error('Error deleting election:', error);
    res.status(500).json({
      error: 'Failed to delete election',
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
          e.result,
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

app.get('/api/elections/:id', async (req, res) => {
  try {
    const id = req.params.id;

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
          e.result,
          s.name AS stateName,
          d.name AS districtName
        FROM elections e
        LEFT JOIN states s ON e.state_id = s.id
        LEFT JOIN districts d ON e.district_id = d.id
        WHERE e.id = ?
      `,
      values: [id]
    });

    if (elections.length === 0) {
      return res.status(404).json({ error: 'Election not found' });
    }

    res.status(200).json(elections[0]);
  } catch (error) {
    console.error('Error fetching election by ID:', error);
    res.status(500).json({
      error: 'Failed to fetch election',
      details: error.message
    });
  }
});


app.put('/api/elections/:id', async (req, res) => {
  try {
    const id = req.params.id;

    // Validate required fields (optional: you can also allow partial updates by skipping this)
    if (
      !req.body.name ||
      !req.body.type ||
      !req.body.status ||
      !req.body.date ||
      !req.body.applicationStartDate ||
      !req.body.applicationEndDate
    ) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await query({
      query: `
        UPDATE elections SET
          name = ?, type = ?, status = ?, election_date = ?, application_start_date = ?, application_end_date = ?,
          result_date = ?, state_id = ?, district_id = ?, loksabha_id = ?, vidhansabha_id = ?, local_body_id = ?,
          description = ?, result = ?
        WHERE id = ?`,
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
        req.body.description || null,
        req.body.result || "No",  // You can update the result field here or keep default "No"
        id
      ]
    });

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Election not found' });
    }

    res.json({ message: 'Election updated successfully' });
  } catch (error) {
    console.error('Error updating election:', error);
    res.status(500).json({
      error: 'Failed to update election',
      details: error.message
    });
  }
});




app.post('/api/votes', async (req, res) => {
  console.log("📥 Request body:", req.body);

  const { email, candidate_id, election_id } = req.body;

  if (!email || !candidate_id || !election_id) {
    console.log("❌ Missing fields:", { email, candidate_id, election_id });
    return res.status(400).json({ error: 'email, candidate_id, and election_id are required' });
  }

  try {
    // 1. Get user_id from users table
    const [userResult] = await pool.query(
      `SELECT id FROM users WHERE email = ?`,
      [email]
    );

    if (userResult.length === 0) {
      return res.status(404).json({ error: 'User not found with this email' });
    }

    const user_id = userResult[0].id;

    // 2. Get voter_id from voters table using user_id
    const [voterResult] = await pool.query(
      `SELECT id FROM voters WHERE user_id = ?`,
      [user_id]
    );

    if (voterResult.length === 0) {
      return res.status(404).json({ error: 'Voter record not found for this user' });
    }

    const voter_id = voterResult[0].id;

    // 3. Check if already voted
    const [existingVote] = await pool.query(
      `SELECT id FROM votes WHERE voter_id = ? AND election_id = ?`,
      [voter_id, election_id]
    );

    if (existingVote.length > 0) {
      return res.status(400).json({ error: 'You have already voted in this election' });
    }

    // 4. Insert vote
    await pool.query(
      `INSERT INTO votes (voter_id, candidate_id, election_id, vote_date) 
       VALUES (?, ?, ?, NOW())`,
      [voter_id, candidate_id, election_id]
    );

    res.status(201).json({ message: 'Vote recorded successfully ✅' });
  } catch (error) {
    console.error("❌ Error in /api/votes:", error);
    res.status(500).json({ error: 'Failed to record vote', details: error.message });
  }
});

app.put('/api/candidates/:id', upload.fields([
  { name: 'photo' },
  { name: 'signature' },
  { name: 'income_photo' },
  { name: 'nationality_photo' },
  { name: 'education_photo' },
  { name: 'cast_photo' },
  { name: 'non_crime_photo' },
  { name: 'party_logo' },
]), async (req, res) => {
  const candidateId = req.params.id;

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

    // Build query dynamically to avoid overwriting files with NULL
    const fields = [];
    const values = [];

    const pushField = (key, value) => {
      fields.push(`${key} = ?`);
      values.push(safe(value));
    };

    pushField('name', name);
    pushField('email', email);
    pushField('aadhar', aadhar);
    pushField('phone', phone);
    pushField('dob', dob);
    pushField('district_id', district_id);
    pushField('state_id', state_id);
    pushField('loksabha_id', loksabha_id);
    pushField('vidhansabha_id', vidhansabha_id);
    pushField('local_body_id', local_body_id);
    pushField('ward_id', ward_id);
    pushField('booth_id', booth_id);
    pushField('election_id', election_id);
    pushField('income', income);
    pushField('income_no', income_no);
    pushField('nationality', nationality);
    pushField('nationality_no', nationality_no);
    pushField('education', education);
    pushField('religion', religion);
    pushField('cast', cast);
    pushField('cast_no', cast_no);
    pushField('non_crime_no', non_crime_no);
    pushField('party', party);
    pushField('amount', amount);
    pushField('method', method);

    // Only update file fields if a new file is uploaded
    if (getFile('photo')) pushField('photo', getFile('photo'));
    if (getFile('signature')) pushField('signature', getFile('signature'));
    if (getFile('income_photo')) pushField('income_photo', getFile('income_photo'));
    if (getFile('nationality_photo')) pushField('nationality_photo', getFile('nationality_photo'));
    if (getFile('education_photo')) pushField('education_photo', getFile('education_photo'));
    if (getFile('cast_photo')) pushField('cast_photo', getFile('cast_photo'));
    if (getFile('non_crime_photo')) pushField('non_crime_photo', getFile('non_crime_photo'));
    if (getFile('party_logo')) pushField('party_logo', getFile('party_logo'));

    const result = await query({
      query: `UPDATE candidates SET ${fields.join(', ')} WHERE id = ?`,
      values: [...values, candidateId]
    });

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    res.status(200).json({ message: 'Candidate updated successfully' });
  } catch (error) {
    console.error('Error updating candidate:', error);
    res.status(500).json({ error: 'Failed to update candidate', details: error.message });
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

// app.post('/api/login', async (req, res) => {
//   const { email, password, role } = req.body;

//   if (!email || !password || !role) {
//     return res.status(400).json({ error: 'Email, password, and role are required' });
//   }

//   try {
//     // 1. Static Super Admin Check
//     if (role.toLowerCase() === 'superadmin') {
//       const dummyEmail = 'superadmin@example.com';
//       const dummyPasswordHash = await bcrypt.hash('password123', 10);

//       const isEmailMatch = email.toLowerCase() === dummyEmail;
//       const isPasswordMatch = await bcrypt.compare(password, dummyPasswordHash);

//       if (!isEmailMatch || !isPasswordMatch) {
//         return res.status(401).json({ error: 'Invalid superadmin credentials' });
//       }

//       return res.status(200).json({
//         message: 'Login successful',
//         user: {
//           id: 0,
//           name: 'Super Admin',
//           email: dummyEmail,
//           phone: 'N/A',
//           role: 'superadmin',
//           photo: null
//         }
//       });
//     }

//     // Dynamically build the query based on role
//     let queryStr = `
//       SELECT 
//         u.id, u.name, u.email, u.phone, u.password, u.photo_name, r.role_name AS role_name
//     `;
//     let joins = `
//       FROM users u
//       JOIN roles r ON u.role_id = r.id
//     `;
//     let extraFields = {};

//     if (role.toLowerCase() === 'voter') {
//       queryStr += `,
//         v.loksabha_ward_id, 
//         v.vidhansabha_ward_id, 
//         v.municipal_corp_id
//       `;
//       joins += ` LEFT JOIN voters v ON u.id = v.user_id`;
//     }

//     if (role.toLowerCase() === 'admin') {
//       queryStr += `,
//         a.constituency_id,
//         a.district_id,
//         a.state_id
//       `;
//       joins += ` LEFT JOIN admins a ON u.id = a.user_id`;
//     }

//     queryStr += joins + ` WHERE u.email = ? LIMIT 1`;

//     const [user] = await pool.query(queryStr, [email]);

//     if (!user || user.length === 0) {
//       return res.status(404).json({ error: 'Invalid email or password' });
//     }

//     const foundUser = user[0];

//     if (foundUser.role_name.toLowerCase() !== role.toLowerCase()) {
//       return res.status(403).json({ error: `Access denied for role: ${role}` });
//     }

//     const isMatch = await bcrypt.compare(password, foundUser.password);
//     if (!isMatch) {
//       return res.status(401).json({ error: 'Invalid email or password' });
//     }

//     // Prepare additional fields
//     if (role.toLowerCase() === 'voter') {
//       extraFields = {
//         loksabha_id: foundUser.loksabha_ward_id || null,
//         vidhansabha_id: foundUser.vidhansabha_ward_id || null,
//         local_body_id: foundUser.municipal_corp_id || null
//       };
//     } else if (role.toLowerCase() === 'admin') {
//       extraFields = {
//         vidhansabha_id: foundUser.constituency_id || null,
//         district_id: foundUser.district_id || null,
//         state_id: foundUser.state_id || null
//       };
//     }

//     res.status(200).json({
//       message: 'Login successful',
//       user: {
//         id: foundUser.id,
//         name: foundUser.name,
//         email: foundUser.email,
//         phone: foundUser.phone,
//         role: foundUser.role_name,
//         photo: foundUser.photo_name
//           ? `http://localhost:${PORT}/uploads/photos/${foundUser.photo_name}`
//           : null,
//         ...extraFields
//       }
//     });

//   } catch (error) {
//     console.error('Login error:', error);
//     res.status(500).json({ error: 'Internal server error', details: error.message });
//   }
// });

app.post('/api/login', async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Email, password, and role are required' });
  }

  try {
    // 1. Static Super Admin Check
    if (role.toLowerCase() === 'superadmin') {
      const dummyEmail = 'superadmin@example.com';
      const dummyPasswordHash = await bcrypt.hash('password123', 10);

      const isEmailMatch = email.toLowerCase() === dummyEmail;
      const isPasswordMatch = await bcrypt.compare(password, dummyPasswordHash);

      if (!isEmailMatch || !isPasswordMatch) {
        return res.status(401).json({ error: 'Invalid superadmin credentials' });
      }

      return res.status(200).json({
        message: 'Login successful',
        user: {
          id: 0,
          name: 'Super Admin',
          email: dummyEmail,
          phone: 'N/A',
          role: 'superadmin',
          photo: null
        }
      });
    }

    // Dynamically build the query based on role
    let queryStr = `
      SELECT 
        u.id, u.name, u.email, u.phone, u.password, u.photo_name, u.status, r.role_name AS role_name
    `;
    let joins = `
      FROM users u
      JOIN roles r ON u.role_id = r.id
    `;
    let extraFields = {};

    if (role.toLowerCase() === 'voter') {
      queryStr += `,
        v.loksabha_ward_id, 
        v.vidhansabha_ward_id, 
        v.municipal_corp_id
      `;
      joins += ` LEFT JOIN voters v ON u.id = v.user_id`;
    }

    if (role.toLowerCase() === 'admin') {
      queryStr += `,
        a.constituency_id,
        a.district_id,
        a.state_id
      `;
      joins += ` LEFT JOIN admins a ON u.id = a.user_id`;
    }

    queryStr += joins + ` WHERE u.email = ? LIMIT 1`;

    const [user] = await pool.query(queryStr, [email]);

    if (!user || user.length === 0) {
      return res.status(404).json({ error: 'Invalid email or password' });
    }

    const foundUser = user[0];

    // Check role match
    if (foundUser.role_name.toLowerCase() !== role.toLowerCase()) {
      return res.status(403).json({ error: `Access denied for role: ${role}` });
    }

    // Check password match
    const isMatch = await bcrypt.compare(password, foundUser.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check status
    if (foundUser.status.toLowerCase() !== 'active') {
      return res.status(403).json({ error: 'User status is not active. Please contact support.' });
    }

    // Prepare additional fields
    if (role.toLowerCase() === 'voter') {
      extraFields = {
        loksabha_id: foundUser.loksabha_ward_id || null,
        vidhansabha_id: foundUser.vidhansabha_ward_id || null,
        local_body_id: foundUser.municipal_corp_id || null
      };
    } else if (role.toLowerCase() === 'admin') {
      extraFields = {
        vidhansabha_id: foundUser.constituency_id || null,
        district_id: foundUser.district_id || null,
        state_id: foundUser.state_id || null
      };
    }

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        phone: foundUser.phone,
        role: foundUser.role_name,
        photo: foundUser.photo_name
          ? `http://localhost:${PORT}/uploads/photos/${foundUser.photo_name}`
          : null,
        ...extraFields
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

app.post('/api/results/generate', async (req, res) => {
  const {
    election_id,
    election_name,
    result_date,
    vidhansabha_id,
    loksabha_id,
    winner_id,
    winner_name,
    winner_party,
    total_votes,
    candidates
  } = req.body;

  if (!election_id || !election_name) {
    return res.status(400).json({ error: 'Missing required election data' });
  }

  try {
    // If winner data is provided in the request, use it
    const winner = winner_name ? {
      candidate_name: winner_name,
      party: winner_party
    } : await query({
      query: `
        SELECT 
          c.name AS candidate_name,
          c.party,
          COUNT(v.id) AS vote_count
        FROM candidates c
        LEFT JOIN votes v ON c.id = v.candidate_id AND v.election_id = ?
        WHERE c.election_id = ?
        GROUP BY c.id, c.name, c.party
        ORDER BY vote_count DESC
        LIMIT 1
      `,
      values: [election_id, election_id]
    });

    if (!winner || !winner.candidate_name) {
      return res.status(400).json({ error: 'No winner determined for this election' });
    }

    // Calculate total votes if not provided
    const totalVotes = total_votes || (await query({
      query: `SELECT COUNT(*) AS total_votes FROM votes WHERE election_id = ?`,
      values: [election_id]
    }))[0].total_votes;

    const now = new Date().toISOString().split('T')[0];

    // Insert result with published = true (1)
    await query({
      query: `
        INSERT INTO results (
          election_id, election_name, winner, winner_party, total_votes, published, date,
          vidhansabha_id, loksabha_id, winner_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      values: [
        election_id,
        election_name,
        winner.candidate_name,
        winner.party,
        totalVotes,
        0,         // ✅ published = true (1)
        result_date || now,
        vidhansabha_id || null,
        loksabha_id || null,
        winner_id || null
      ]
    });

    // Update election result status
    await query({
      query: `UPDATE elections SET result = 'Yes' WHERE id = ?`,
      values: [election_id]
    });

    res.status(201).json({
      success: true,
      message: 'Result generated successfully',
      data: {
        election_id,
        election_name,
        winner: winner.candidate_name,
        winner_party: winner.party,
        total_votes: totalVotes,
        published: false,
        date: result_date || now
      }
    });

  } catch (error) {
    console.error('❌ Error generating result:', error);
    res.status(500).json({
      error: 'Failed to generate result',
      details: error.message
    });
  }
});


app.get('/api/results', async (req, res) => {
  const { election_id, vidhansabha_id, loksabha_id } = req.query;

  let queryStr = `
    SELECT 
      r.id,
      r.election_id,
      r.election_name,
      r.winner,
      r.winner_party,
      r.total_votes,
      r.published,
      r.date,
      r.vidhansabha_id,
      r.loksabha_id,
      r.winner_id,
      vs.name AS vidhansabha_name,
      ls.name AS loksabha_name
    FROM results r
    LEFT JOIN vidhansabha_constituencies vs ON r.vidhansabha_id = vs.id
    LEFT JOIN loksabha_constituencies ls ON r.loksabha_id = ls.id
    WHERE 1=1
  `;

  const values = [];

  if (election_id) {
    queryStr += ' AND r.election_id = ?';
    values.push(election_id);
  }

  if (vidhansabha_id) {
    queryStr += ' AND r.vidhansabha_id = ?';
    values.push(vidhansabha_id);
  }

  if (loksabha_id) {
    queryStr += ' AND r.loksabha_id = ?';
    values.push(loksabha_id);
  }

  try {
    const results = await query({ query: queryStr, values });

    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('❌ Error fetching results:', error);
    res.status(500).json({
      error: 'Failed to fetch results',
      details: error.message
    });
  }
});

app.patch('/api/results/:id/publish', async (req, res) => {
  const { id } = req.params;
  const { published } = req.body;

  // Validate input
  if (typeof published === 'undefined') {
    return res.status(400).json({
      success: false,
      error: 'Published status is required'
    });
  }

  try {
    // Convert boolean to number (1/0)
    const publishStatus = published ? 1 : 0;

    // Update only the published field
    const result = await query({
      query: `UPDATE results SET published = ? WHERE id = ?`,
      values: [publishStatus, id]
    });

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Result not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: `Result ${publishStatus ? 'published' : 'unpublished'} successfully`
    });

  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({
      success: false,
      error: 'Database operation failed',
      details: error.message
    });
  }
});

app.delete('/api/results/:id', async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'Result ID is required' });
  }

  try {
    // 1. First get the result to find its associated election_id
    const existingResult = await query({
      query: `SELECT * FROM results WHERE id = ?`,
      values: [id]
    });

    if (existingResult.length === 0) {
      return res.status(404).json({ error: 'Result not found' });
    }

    const electionId = existingResult[0].election_id;

    // 2. Delete the result
    await query({
      query: `DELETE FROM results WHERE id = ?`,
      values: [id]
    });

    // 3. Update the election status
    await query({
      query: `UPDATE elections SET result = 'No' WHERE id = ?`,
      values: [electionId]
    });

    res.status(200).json({
      success: true,
      message: 'Result deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting result:', error);
    res.status(500).json({
      error: 'Failed to delete result',
      details: error.message
    });
  }
});













// ========== START SERVER ==========
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
